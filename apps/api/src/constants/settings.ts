export const SETTINGS_KEYS = {
  SLOT_DURATION: "slot_duration",
  BOOKING_PERIOD: "booking_period",
  REMINDING_BEFORE: "reminding_before", // 0 means disabled, otherwise must be between 1 and 10
  REMINDING_TIME: "reminding_time", // Time of day to send reminders, in HH:mm 24-hour format (e.g. "09:00" or "18:30")
  ACTIVE_CALENDAR: "active_calendar", // "internal" or "icloud"
  CALENDAR_SYNC_EXP: "calendar_sync_exp", // EventBridge Scheduler expression, e.g. "rate(1 day)" or "cron(0 3 * * ? *)"
};
