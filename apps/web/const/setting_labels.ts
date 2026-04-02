export const SETTING_LABELS: Record<string, { label: string; description?: string; type: "text" | "number" }> = {
  slot_duration: {
    label: "Slot Duration (minutes)",
    description: "Duration of each appointment slot in minutes", //replace with actual description from DB if available
    type: "number",
  },
  booking_period: {
    label: "Booking Period (days)",
    description: "Number of days forward clients can schedule appts",
    type: "number",
  },
};
