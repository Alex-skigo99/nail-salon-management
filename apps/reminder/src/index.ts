import twilio from "twilio";
import { db } from "./db.js";

// ─────────────────────────────────────────────────────────────────────────────
// Env
// ─────────────────────────────────────────────────────────────────────────────

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// WhatsApp-enabled Twilio number, e.g. "whatsapp:+14155238886"
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
// Twilio Content SID for the pre-approved Appointment Reminders template
// Sandbox default: HXb5b62575e6e4ff6129ad7c8efe1f983e
// Template: "Your appointment is coming up on {{1}} at {{2}}"
const TWILIO_CONTENT_SID = process.env.TWILIO_CONTENT_SID;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AppointmentRow {
  id: number;
  date: string;
  time: string;
  guest_name: string | null;
  guest_phone: string | null;
  user_name: string | null;
  user_phone: string | null;
}

const Tables = {
  USERS: "users",
  SERVICES: "services",
  MASTERS: "masters",
  WORKING_HOURS: "working_hours",
  APPOINTMENTS: "appointments",
  SETTINGS: "settings",
  PRODUCTS: "products",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digits
  let sanitized = phone.replace(/\D/g, "");
  // Remove leading zeros
  sanitized = sanitized.replace(/^0+/, "");
  // Add 972 prefix if not present
  if (!sanitized.startsWith("972")) {
    sanitized = "972" + sanitized;
  }
  // Final check: must be 12 digits starting with "972"
  if (!/^972\d{9}$/.test(sanitized)) {
    return null;
  }

  return "+" + sanitized;
}

/** Return today's date in UTC as "YYYY-MM-DD". */
function todayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

/** Add N calendar days to a "YYYY-MM-DD" string and return a new one. */
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split("T")[0];
}

/**
 * Format "YYYY-MM-DD" → "YYYY/M/D" for the Twilio template placeholder {{1}}.
 */
function formatDateForTemplate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}/${parseInt(month, 10)}/${parseInt(day, 10)}`;
}

/**
 * Format "HH:MM:SS" or "HH:MM" → "HH:MM" for the Twilio template
 * placeholder {{2}}.
 */
function formatTimeForTemplate(timeStr: string): string {
  const parts = timeStr.split(":");
  return `${parts[0]}:${parts[1]}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lambda handler
// ─────────────────────────────────────────────────────────────────────────────

export const handler = async (): Promise<void> => {
  console.log("[Reminder] Lambda invoked");
  let isTwilioConfigValid = true;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !TWILIO_CONTENT_SID) {
    console.log(
      "Missing required Twilio environment variables: " +
        "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_CONTENT_SID"
    );
    isTwilioConfigValid = false;
  }

  try {
    // ── 1. Read reminding_before setting ──────────────────────────────────
    const settingRow = await db(Tables.SETTINGS).where({ key: "reminding_before" }).first<{ value: string }>();
    const rawDays = parseInt(settingRow?.value, 10);
    if (isNaN(rawDays) || rawDays < 1 || rawDays > 10) {
      throw new Error(`Invalid reminding_before value "${settingRow?.value}" in settings. `);
    }
    const remindingBefore = rawDays;
    console.log(`[Reminder] reminding_before = ${remindingBefore} day(s)`);

    // ── 2. Calculate target date ──────────────────────────────────────────
    const targetDate = addDays(todayUTC(), remindingBefore);
    console.log(`Target date: ${targetDate}`);

    // ── 3. Fetch appointments ─────────────────────────────────────────────
    const appointments: AppointmentRow[] = await db(`${Tables.APPOINTMENTS} as a`)
      .leftJoin(`${Tables.USERS} as u`, "a.user_id", "u.id")
      .whereIn("a.status", ["new", "confirmed"])
      .where("a.date", targetDate)
      .select(
        "a.id",
        "a.date",
        "a.time",
        "a.guest_name",
        "a.guest_phone",
        "u.name as user_name",
        "u.phone as user_phone"
      );

    console.log(`Found ${appointments.length} appointment(s) for ${targetDate}`);

    if (appointments.length === 0) {
      console.log("No appointments to remind. Done.");
      return;
    }

    // ── 4. Send reminders ─────────────────────────────────────────────────
    let twilioClient: twilio.Twilio | null = null;
    if (isTwilioConfigValid) {
      twilioClient = twilio(TWILIO_ACCOUNT_SID!, TWILIO_AUTH_TOKEN!);
    }
    const formattedDate = formatDateForTemplate(targetDate);

    let sent = 0;
    let skipped = 0;

    for (const appt of appointments) {
      const phone = normalizePhone(appt.guest_phone) ?? normalizePhone(appt.user_phone);

      if (!phone) {
        const name = appt.guest_name ?? appt.user_name ?? "unknown";
        console.warn(`Skipped appt #${appt.id} (${name}) — no valid E.164 phone number found`);
        skipped++;
        continue;
      }

      const formattedTime = formatTimeForTemplate(appt.time);

      try {
        if (!twilioClient) {
          console.warn(
            `Skipped appt #${appt.id} → ${phone} | date: ${formattedDate} | time: ${formattedTime} | SID: N/A`
          );
          skipped++;
          continue;
        }
        const message = await twilioClient.messages.create({
          from: TWILIO_WHATSAPP_FROM,
          to: `whatsapp:${phone}`,
          contentSid: TWILIO_CONTENT_SID,
          contentVariables: JSON.stringify({ "1": formattedDate, "2": formattedTime }),
        });
        console.log(
          `Sent appt #${appt.id} → ${phone} | date: ${formattedDate} | time: ${formattedTime} | SID: ${message.sid}`
        );
        sent++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`Failed to send for appt #${appt.id} → ${phone}: ${errMsg}`);
        skipped++;
      }
    }

    console.log(`Done. Sent: ${sent}, Skipped/failed: ${skipped}`);
  } finally {
    await db.destroy();
  }
};

console.log(process.env.NODE_ENV); // DEBUG
if (process.env.NODE_ENV === "development") {
  handler().catch((err) => {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Reminder] Unhandled error in Lambda: ${errMsg}`);
    process.exit(1);
  });
}
