export const SETTING_KEYS = {
  SLOT_DURATION: "slot_duration",
  BOOKING_PERIOD: "booking_period",
};

export const SETTING_LABELS: Record<string, { label: string; description?: string; type: "text" | "number" }> = {
  [SETTING_KEYS.SLOT_DURATION]: {
    label: "Slot Duration (minutes)",
    description: "Duration of each appointment slot in minutes", //replace with actual description from DB if available
    type: "number",
  },
  [SETTING_KEYS.BOOKING_PERIOD]: {
    label: "Booking Period (days)",
    description: "Number of days forward clients can schedule appts",
    type: "number",
  },
};
