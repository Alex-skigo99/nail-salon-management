import dotenv from "dotenv";
import ical from "node-ical";
import { db } from "./db.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const ICLOUD_EMAIL = process.env.ICLOUD_EMAIL;
const ICLOUD_APP_PASSWORD = process.env.ICLOUD_APP_PASSWORD;
const ICLOUD_CALENDAR_NAME = process.env.ICLOUD_CALENDAR_NAME ?? "Work";
const ICLOUD_DAYS_TO_SYNC = parseInt(process.env.ICLOUD_DAYS_TO_SYNC ?? "60", 10);
// master_id to assign to all synced appointments (configure per your setup)
const ICLOUD_DEFAULT_MASTER_ID = parseInt(process.env.ICLOUD_DEFAULT_MASTER_ID ?? "1", 10);

const Tables = {
  USERS: "users",
  APPOINTMENTS: "appointments",
  SETTINGS: "settings",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a UTC Date to Israel local date/time strings using the Intl API (no extra deps). */
function toIsraelDateTime(date: Date): { dateStr: string; timeStr: string } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const p: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    p[type] = value;
  });
  return {
    dateStr: `${p.year}-${p.month}-${p.day}`,
    timeStr: `${p.hour}:${p.minute}:${p.second}`,
  };
}

/** Today as "YYYY-MM-DD" in Israel local time. */
function todayIsraelDateStr(): string {
  return toIsraelDateTime(new Date()).dateStr;
}

/** Add N days to a Date (UTC). */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Parse client name and raw phone number from an iCloud appointment title.
 *
 * Supported formats:
 *   "Maria Koehn-0512564673"       → name="Maria Koehn",  phone="0512564673"
 *   "Vera Shmidt -4673"            → name="Vera Shmidt",  phone="4673"
 *   "Sasha - 972512564673"         → name="Sasha",         phone="972512564673"
 */
function parseNameAndPhone(title: string): { name: string; rawPhone: string | null } {
  // Match everything before the last hyphen as name, digits-only part as phone
  const match = title.match(/^(.+?)\s*[-–]\s*(\d+)\s*$/);
  if (!match) return { name: title.trim(), rawPhone: null };
  return { name: match[1].trim(), rawPhone: match[2] };
}

/**
 * Normalize a raw phone string to "972XXXXXXXXX" format (12 digits, no +).
 * Returns null if the resulting number is not a valid Israeli mobile/landline.
 */
function normalizePhone(rawPhone: string | null): string | null {
  if (!rawPhone) return null;
  let digits = rawPhone.replace(/\D/g, "");
  // Strip leading zeros (e.g. "0512..." → "512...")
  digits = digits.replace(/^0+/, "");
  if (!digits.startsWith("972")) {
    digits = "972" + digits;
  }
  // Must be "972" + exactly 9 digits = 12 chars total
  if (!/^972\d{9}$/.test(digits)) return null;
  return digits;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lambda handler
// ─────────────────────────────────────────────────────────────────────────────

export const handler = async (): Promise<void> => {
  console.log("[SyncCalendar] Lambda invoked");

  if (!ICLOUD_EMAIL || !ICLOUD_APP_PASSWORD) {
    console.error("[SyncCalendar] ICLOUD_EMAIL and ICLOUD_APP_PASSWORD are required");
    return;
  }

  try {
    // ── 1. Check active_calendar setting ─────────────────────────────────
    const activeCalendarRow = await db(Tables.SETTINGS).where({ key: "active_calendar" }).first<{ value: string }>();

    if (activeCalendarRow?.value !== "icloud") {
      console.log(`[SyncCalendar] active_calendar="${activeCalendarRow?.value}" — skipping sync`);
      return;
    }

    // ── 2. Connect to iCloud CalDAV ───────────────────────────────────────
    // tsdav v2 is ESM-only; load via dynamic import from this CJS context
    const { createDAVClient } = await import("tsdav");

    const client = await createDAVClient({
      serverUrl: "https://caldav.icloud.com",
      credentials: {
        username: ICLOUD_EMAIL,
        password: ICLOUD_APP_PASSWORD,
      },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });

    // ── 3. Discover calendars ─────────────────────────────────────────────
    const calendars = await client.fetchCalendars();
    const targetCalendar = calendars.find((cal) => cal.displayName === ICLOUD_CALENDAR_NAME);

    if (!targetCalendar) {
      const available = calendars.map((c) => c.displayName).join(", ");
      console.error(`[SyncCalendar] Calendar "${ICLOUD_CALENDAR_NAME}" not found. Available: ${available}`);
      return;
    }

    // ── 4. Build date range ───────────────────────────────────────────────
    const now = new Date();
    // Start of today in UTC (we filter DB by Israel date, but CalDAV uses UTC)
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endDate = addDays(startOfToday, ICLOUD_DAYS_TO_SYNC);

    // ── 5. Fetch calendar objects ─────────────────────────────────────────
    const calObjects = await client.fetchCalendarObjects({
      calendar: targetCalendar,
      timeRange: {
        start: startOfToday.toISOString(),
        end: endDate.toISOString(),
      },
    });

    console.log(`[SyncCalendar] Fetched ${calObjects.length} calendar object(s) from iCloud`);

    // ── 6 & 7. Parse events, then atomically replace appointments ────────
    type ICalDuration = {
      weeks?: number;
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
    };
    type VEventWithDuration = ical.VEvent & { duration?: ICalDuration };

    let inserted = 0;
    let skipped = 0;

    // Pre-parse all events before touching the DB so a parse error never
    // leaves the database in a partially-deleted state.
    interface AppointmentRow {
      master_id: number;
      user_id: string | null;
      guest_name: string | null;
      guest_phone: string | null;
      date: string;
      time: string;
      duration_minutes: number;
      status: string;
      comments: string | null;
    }

    const rows: AppointmentRow[] = [];

    for (const calObj of calObjects) {
      if (!calObj.data) continue;

      const parsed = ical.parseICS(calObj.data);

      for (const [, event] of Object.entries(parsed)) {
        if (event.type !== "VEVENT") continue;
        if (!event.start || !event.summary) {
          skipped++;
          continue;
        }

        const startDate = event.start instanceof Date ? event.start : new Date(String(event.start));
        const eventWithDuration = event as VEventWithDuration;

        // Resolve end date: prefer explicit end, fall back to duration, then 60 min default
        let endDateEvt: Date;
        if (event.end instanceof Date) {
          endDateEvt = event.end;
        } else if (event.end) {
          endDateEvt = new Date(String(event.end));
        } else if (eventWithDuration.duration) {
          const dur = eventWithDuration.duration;
          const ms =
            ((dur.weeks ?? 0) * 7 * 24 * 60 +
              (dur.days ?? 0) * 24 * 60 +
              (dur.hours ?? 0) * 60 +
              (dur.minutes ?? 0) +
              (dur.seconds ?? 0) / 60) *
            60000;
          endDateEvt = new Date(startDate.getTime() + ms);
        } else {
          endDateEvt = new Date(startDate.getTime() + 60 * 60000); // 60 min default
        }

        const durationMinutes = Math.round((endDateEvt.getTime() - startDate.getTime()) / 60000);
        if (durationMinutes <= 0) {
          skipped++;
          continue;
        }

        const { dateStr, timeStr } = toIsraelDateTime(startDate);

        // ── Resolve user / guest from title ──────────────────────────────
        const { name, rawPhone } = parseNameAndPhone(event.summary);
        const normalizedPhone = normalizePhone(rawPhone);

        let userId: string | null = null;
        let guestName: string | null = null;
        let guestPhone: string | null = null;

        if (normalizedPhone) {
          // Look up user by phone — stored as "972..." or "+972..." in DB
          const user = await db(Tables.USERS)
            .where({ phone: normalizedPhone })
            .orWhere({ phone: `+${normalizedPhone}` })
            .orWhere({ phone: normalizedPhone.replace(/^972/, "0") }) // also try local format "0..."
            .first<{ id: string }>();

          if (user) {
            userId = user.id;
          } else {
            // Full valid phone but no matching user → save as guest
            guestName = name;
            guestPhone = normalizedPhone;
          }
        } else {
          // Phone is missing or too short → save name only as guest
          guestName = name || null;
        }

        rows.push({
          master_id: ICLOUD_DEFAULT_MASTER_ID,
          user_id: userId,
          guest_name: guestName,
          guest_phone: guestPhone,
          date: dateStr,
          time: timeStr,
          duration_minutes: durationMinutes,
          status: "new",
          comments: event.description ?? null,
        });
      }
    }

    // ── Atomically replace appointments within the sync window ────────────
    const todayStr = todayIsraelDateStr();

    await db.transaction(async (trx) => {
      const deletedCount = await trx(Tables.APPOINTMENTS).where("date", ">=", todayStr).delete();
      console.log(`[SyncCalendar] Deleted ${deletedCount} existing appointment(s) from ${todayStr}`);

      if (rows.length > 0) {
        await trx(Tables.APPOINTMENTS).insert(
          rows.map((row) => ({
            ...row,
            created_at: trx.fn.now(),
            updated_at: trx.fn.now(),
          }))
        );
      }

      inserted = rows.length;
    });

    console.log(`[SyncCalendar] Done. Inserted: ${inserted}, Skipped: ${skipped}`);
  } finally {
    await db.destroy();
  }
};

if (process.env.NODE_ENV === "development") {
  handler().catch((err) => {
    console.error("[SyncCalendar] Error:", err);
    process.exit(1);
  });
}
