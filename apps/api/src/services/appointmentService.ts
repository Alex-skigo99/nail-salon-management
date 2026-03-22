import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { Appointment, AppointmentRetrieve, WorkingHours, Slot, SlotStatus, Master } from "../types/dbSchemaTypes";
import { SETTINGS_KEYS } from "../constants/settings";
import type { IWithPagination } from "knex-paginate";
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  RescheduleInput,
  AvailabilityResult,
  SlotSuggestion,
  MasterSuggestions,
  DaySlots,
} from "../types/appointmentTypes";

// ─────────────────────────────────────────────
// Constants and types
// ─────────────────────────────────────────────
const userDataSelect = `CASE WHEN u.id IS NULL THEN NULL
              ELSE json_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email,
                'phone', u.phone,
                'image', u.image
              )
         END AS user_data`;

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────

/** Convert "HH:MM" or "HH:MM:SS" to total minutes from midnight */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Convert total minutes from midnight to "HH:MM" string */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Format a Date object to YYYY-MM-DD */
function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Add N days to YYYY-MM-DD string */
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + n);
  return formatDate(d);
}

// ─────────────────────────────────────────────
// Settings helpers
// ─────────────────────────────────────────────

export async function getSettingValue(key: string, defaultValue: number): Promise<number> {
  const row = await knex(DB_TABLES.SETTINGS).where({ key }).first();
  if (!row) return defaultValue;
  const parsed = parseInt(row.value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ─────────────────────────────────────────────
// Core helpers
// ─────────────────────────────────────────────

/**
 * Check whether a master has no conflicting (non-rejected) appointments for
 * the requested date/time window.  Also verifies the slot falls within the
 * master's working hours for that day.
 */
async function isSlotAvailable(
  masterId: number,
  date: string,
  time: string,
  durationMinutes: number,
  excludeAppointmentId?: number
): Promise<boolean> {
  const dayOfWeek = new Date(date).getUTCDay();
  const wh: WorkingHours | undefined = await knex(DB_TABLES.WORKING_HOURS)
    .where({ master_id: masterId, day_of_week: dayOfWeek })
    .first();

  if (!wh) return false;

  const reqStart = timeToMinutes(time);
  const reqEnd = reqStart + durationMinutes;

  if (reqStart < timeToMinutes(wh.start_time) || reqEnd > timeToMinutes(wh.end_time)) {
    return false;
  }

  let query = knex(DB_TABLES.APPOINTMENTS).where({ master_id: masterId, date }).whereNot({ status: "rejected" });

  if (excludeAppointmentId !== undefined) {
    query = query.whereNot({ id: excludeAppointmentId });
  }

  const existing: Appointment[] = await query;

  return !existing.some((a) => {
    const aStart = timeToMinutes(a.time);
    const aEnd = aStart + a.duration_minutes;
    return aStart < reqEnd && aEnd > reqStart;
  });
}

/** Return all empty slot start-times for a given day */
async function getEmptySlotsForDay(
  masterId: number,
  date: string,
  slotDuration: number,
  durationMinutes: number
): Promise<string[]> {
  const dayOfWeek = new Date(date).getUTCDay();
  const wh: WorkingHours | undefined = await knex(DB_TABLES.WORKING_HOURS)
    .where({ master_id: masterId, day_of_week: dayOfWeek })
    .first();

  if (!wh) return [];

  const startMin = timeToMinutes(wh.start_time);
  const endMin = timeToMinutes(wh.end_time);

  const appointments: Appointment[] = await knex(DB_TABLES.APPOINTMENTS)
    .where({ master_id: masterId, date })
    .whereNot({ status: "rejected" });

  const emptyTimes: string[] = [];

  for (let t = startMin; t + slotDuration <= endMin; t += slotDuration) {
    const needed = Math.ceil(durationMinutes / slotDuration) * slotDuration;
    const reqEnd = t + needed;
    if (reqEnd > endMin) continue;

    const overlaps = appointments.some((a) => {
      const aStart = timeToMinutes(a.time);
      const aEnd = aStart + a.duration_minutes;
      return aStart < reqEnd && aEnd > t;
    });

    if (!overlaps) emptyTimes.push(minutesToTime(t));
  }

  return emptyTimes;
}

// ─────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────

export async function createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
  const available = await isSlotAvailable(data.master_id, data.date, data.time, data.duration_minutes);
  if (!available) {
    throw new Error("SLOT_UNAVAILABLE");
  }

  const result = await knex.transaction(async (trx) => {
    const { need_store_phone, ...appointmentData } = data;

    const [appt] = await trx(DB_TABLES.APPOINTMENTS)
      .insert({ ...appointmentData, status: appointmentData.status ?? "new" })
      .returning("*");

    if (appointmentData.user_id && appointmentData.guest_phone && need_store_phone) {
      await trx(DB_TABLES.USERS).where({ id: appointmentData.user_id }).update({ phone: appointmentData.guest_phone });
    }

    return appt;
  });

  return result;
}

export async function updateAppointment(id: number, data: UpdateAppointmentInput): Promise<Appointment | null> {
  const [appt] = await knex(DB_TABLES.APPOINTMENTS)
    .where({ id })
    .update({ ...data, updated_at: knex.fn.now() })
    .returning("*");
  return appt ?? null;
}

/**
 * Move an appointment to a new date/time after checking availability.
 */
export async function rescheduleAppointment(id: number, data: RescheduleInput): Promise<Appointment> {
  const existing: Appointment | undefined = await knex(DB_TABLES.APPOINTMENTS).where({ id }).first();
  if (!existing) throw new Error("APPOINTMENT_NOT_FOUND");

  const masterId = data.master_id ?? existing.master_id;
  const duration = data.duration_minutes ?? existing.duration_minutes;
  const excludeId = masterId === existing.master_id ? id : undefined;

  const available = await isSlotAvailable(masterId, data.date, data.time, duration, excludeId);
  if (!available) throw new Error("SLOT_UNAVAILABLE");

  const updateData: Record<string, unknown> = {
    master_id: masterId,
    date: data.date,
    time: data.time,
    duration_minutes: duration,
    updated_at: knex.fn.now(),
  };

  if (data.services !== undefined) {
    updateData.services = data.services;
  }

  const [appt] = await knex(DB_TABLES.APPOINTMENTS).where({ id }).update(updateData).returning("*");
  return appt;
}

export async function deleteAppointment(id: number): Promise<boolean> {
  const deleted = await knex(DB_TABLES.APPOINTMENTS).where({ id }).delete();
  return deleted > 0;
}

// ─────────────────────────────────────────────
// Query: appointments for a master in a period
// ─────────────────────────────────────────────

export async function getAppointmentsForMaster(
  masterId: number,
  from: string,
  to: string
): Promise<AppointmentRetrieve[]> {
  return knex({ a: DB_TABLES.APPOINTMENTS })
    .where({ "a.master_id": masterId })
    .whereBetween("a.date", [from, to])
    .leftJoin(`${DB_TABLES.USERS} as u`, `a.user_id`, "u.id")
    .select("a.*", knex.raw(userDataSelect))
    .orderBy("a.date", "asc")
    .orderBy("a.time", "asc");
}

// ─────────────────────────────────────────────
// Query: appointments for a user with pagination
// ─────────────────────────────────────────────

export interface GetUserAppointmentsParams {
  userId: string;
  from?: string;
  to?: string;
  page: number;
  perPage: number;
}

export async function getAppointmentsByUserId(
  params: GetUserAppointmentsParams
): Promise<IWithPagination<AppointmentRetrieve>> {
  const { userId, from, to, page, perPage } = params;
  let query = knex({ a: DB_TABLES.APPOINTMENTS })
    .where({ "a.user_id": userId })
    .leftJoin(`${DB_TABLES.USERS} as u`, "a.user_id", "u.id")
    .select("a.*", knex.raw(userDataSelect))
    .orderBy("a.date", "desc")
    .orderBy("a.time", "desc");

  if (from) query = query.where("a.date", ">=", from);
  if (to) query = query.where("a.date", "<=", to);

  return query.paginate({ currentPage: page, perPage, isLengthAware: true });
}

// ─────────────────────────────────────────────
// Update appointment comment
// ─────────────────────────────────────────────

export async function updateAppointmentComment(id: number, comments: string | null): Promise<Appointment | null> {
  const [appt] = await knex(DB_TABLES.APPOINTMENTS)
    .where({ id })
    .update({ comments, updated_at: knex.fn.now() })
    .returning("*");
  return appt ?? null;
}

// ─────────────────────────────────────────────
// Query: slots map for a master in a period
// ─────────────────────────────────────────────

export async function getSlotsMap(
  masterId: number,
  from: string,
  to: string,
  slotStatusFilter?: SlotStatus
): Promise<DaySlots[]> {
  const slotDuration = await getSettingValue(SETTINGS_KEYS.SLOT_DURATION, 30);

  const workingHours: WorkingHours[] = await knex(DB_TABLES.WORKING_HOURS).where({
    master_id: masterId,
  });

  // Build map: day_of_week -> working hours row
  const whByDay = new Map(workingHours.map((wh) => [wh.day_of_week, wh]));

  const appointments: AppointmentRetrieve[] = await knex({ a: DB_TABLES.APPOINTMENTS })
    .where({ "a.master_id": masterId })
    .whereBetween("a.date", [from, to])
    .whereNot({ "a.status": "rejected" })
    .leftJoin(`${DB_TABLES.USERS} as u`, "a.user_id", "u.id")
    .select("a.*", knex.raw(userDataSelect));

  // Group appointments by date string
  const apptByDate = new Map<string, AppointmentRetrieve[]>();
  for (const appt of appointments) {
    const utcDate = new Date(appt.date);
    const d = utcDate.toLocaleDateString("en-CA"); // normalize from DB date type
    if (!apptByDate.has(d)) apptByDate.set(d, []);
    apptByDate.get(d)!.push(appt);
  }

  const result: DaySlots[] = [];
  const cursor = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");

  while (cursor <= end) {
    const dateStr = formatDate(cursor);
    const dayOfWeek = cursor.getUTCDay();
    const wh = whByDay.get(dayOfWeek);

    if (!wh) {
      result.push({
        date: dateStr,
        start_time: null,
        end_time: null,
        slot_duration: slotDuration,
        slots_count: 0,
        slots: [],
      });
    } else {
      const startMin = timeToMinutes(wh.start_time);
      const endMin = timeToMinutes(wh.end_time);
      const dayAppts = apptByDate.get(dateStr) ?? [];
      const slots: Slot[] = [];

      for (let t = startMin; t + slotDuration <= endMin; t += slotDuration) {
        const slotStartStr = minutesToTime(t);
        const slotEndStr = minutesToTime(t + slotDuration);

        // Find the first non-rejected appointment that overlaps this slot
        const overlapping = dayAppts.find((a) => {
          const aStart = timeToMinutes(a.time);
          const aEnd = aStart + a.duration_minutes;
          return aStart < t + slotDuration && aEnd > t;
        });

        let status: SlotStatus = "empty";
        if (overlapping) {
          const aStart = timeToMinutes(overlapping.time);
          if (aStart === t) {
            status = overlapping.status === "reserved" ? "reserved" : "book";
          } else {
            status = "part_book";
          }
        }

        if (!slotStatusFilter || status === slotStatusFilter) {
          slots.push({
            start_time: slotStartStr,
            end_time: slotEndStr,
            status,
            appointment_data: overlapping ?? null,
          });
        }
      }

      result.push({
        date: dateStr,
        start_time: wh.start_time,
        end_time: wh.end_time,
        slot_duration: slotDuration,
        slots_count: slots.length,
        slots,
      });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}

// ─────────────────────────────────────────────
// Query: check availability with suggestions
// ─────────────────────────────────────────────

export async function checkAvailability(
  masterId: number,
  date: string,
  time: string,
  durationMinutes: number
): Promise<AvailabilityResult> {
  const slotDuration = await getSettingValue(SETTINGS_KEYS.SLOT_DURATION, 30);

  const available = await isSlotAvailable(masterId, date, time, durationMinutes);

  if (available) {
    return { available: true, slot: { date, time } };
  }

  // ── Same day suggestions ── one slot before and one after ──
  const sameDay = await getEmptySlotsForDay(masterId, date, slotDuration, durationMinutes);
  const reqMin = timeToMinutes(time);

  const before = [...sameDay].reverse().find((t) => timeToMinutes(t) < reqMin);
  const after = sameDay.find((t) => timeToMinutes(t) > reqMin);

  // ── Same time on other days ── search up to 30 days in each direction ──
  let sameTimeBefore: { date: string; time: string } | null = null;
  let sameTimeAfter: { date: string; time: string } | null = null;

  for (let i = 1; i <= 30; i++) {
    const d = addDays(date, -i);
    if (!sameTimeBefore) {
      const ok = await isSlotAvailable(masterId, d, time, durationMinutes);
      if (ok) sameTimeBefore = { date: d, time };
    }

    const da = addDays(date, i);
    if (!sameTimeAfter) {
      const ok = await isSlotAvailable(masterId, da, time, durationMinutes);
      if (ok) sameTimeAfter = { date: da, time };
    }

    if (sameTimeBefore && sameTimeAfter) break;
  }

  return {
    available: false,
    suggestions: {
      same_day: {
        before: before ? { date, time: before } : null,
        after: after ? { date, time: after } : null,
      },
      same_time: {
        before: sameTimeBefore,
        after: sameTimeAfter,
      },
    },
  };
}

// ─────────────────────────────────────────────
// Query: home-page suggestions (up to 6 slots)
// ─────────────────────────────────────────────

/**
 * Returns up to 6 appointment slot suggestions starting from today.
 * Strategy per day: take the 2 earliest empty slots + 1 closest to end of day.
 * Continues to next day until 6 total suggestions are collected.
 */
export async function getHomeSuggestions(masterId: number): Promise<SlotSuggestion[]> {
  const slotDuration = await getSettingValue(SETTINGS_KEYS.SLOT_DURATION, 30);

  const todayStr = formatDate(new Date());
  const suggestions: SlotSuggestion[] = [];
  let day = 0;

  while (suggestions.length < 6 && day < 30) {
    const date = addDays(todayStr, day);
    const emptyTimes = await getEmptySlotsForDay(masterId, date, slotDuration, slotDuration);

    if (emptyTimes.length > 0) {
      const needed = Math.min(3, 6 - suggestions.length);

      if (emptyTimes.length <= needed) {
        suggestions.push(...emptyTimes.map((t) => ({ date, time: t })));
      } else {
        // 2 nearest (earliest) + 1 closest to end of day
        const picked: string[] = [emptyTimes[0]];
        if (needed >= 2) picked.push(emptyTimes[1]);

        const last = emptyTimes[emptyTimes.length - 1];
        if (needed >= 3 && last !== emptyTimes[1] && last !== emptyTimes[0]) {
          picked.push(last);
        }

        suggestions.push(...picked.slice(0, needed).map((t) => ({ date, time: t })));
      }
    }

    day++;
  }

  return suggestions.slice(0, 6);
}

export async function getSuggestionsByMaster(masterId?: number): Promise<MasterSuggestions[]> {
  const mastersQuery = knex(DB_TABLES.MASTERS).select<Master[]>("id", "name", "description").orderBy("id", "asc");

  if (masterId) {
    mastersQuery.where({ id: masterId });
  }

  const masters = await mastersQuery;

  if (masters.length === 0) {
    return [];
  }

  const result = await Promise.all(
    masters.map(async (master) => {
      const slots = await getHomeSuggestions(master.id);
      return {
        master,
        slots,
      };
    })
  );

  return result;
}
