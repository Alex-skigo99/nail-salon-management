import { EditableFieldType } from "@/types/editableFieldType";

export const SETTING_KEYS = {
  SLOT_DURATION: "slot_duration",
  BOOKING_PERIOD: "booking_period",
  REMINDING_BEFORE: "reminding_before", // 0 means disabled, otherwise must be between 1 and 10
  REMINDING_TIME: "reminding_time", // Time of day to send reminders, in HH:mm 24-hour format (e.g. "09:00" or "18:30")
};

type SettingLabel = {
  label: string;
  description?: string;
  type: EditableFieldType;
  validation?: (value: string | number) => string | null; // returns error message if invalid, otherwise null
};

export const SETTING_LABELS: Record<string, SettingLabel> = {
  [SETTING_KEYS.SLOT_DURATION]: {
    label: "Slot Duration (minutes)",
    description: "Duration of each appointment slot in minutes", //replace with actual description from DB if available
    type: "number",
    validation: (value) => {
      const parsedValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (typeof parsedValue === "number") {
        if (parsedValue < 10) return "Slot duration must be at least 10 minutes";
        if (parsedValue > 240) return "Slot duration must be less than 4 hours";
        return null;
      }
      return "Slot duration must be a number";
    },
  },
  [SETTING_KEYS.BOOKING_PERIOD]: {
    label: "Booking Period (days)",
    description: "Number of days forward clients can schedule appts",
    type: "number",
    validation: (value) => {
      const parsedValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (typeof parsedValue === "number") {
        if (parsedValue < 1) return "Booking period must be at least 1 day";
        if (parsedValue > 365) return "Booking period must be less than 1 year";
        return null;
      }
      return "Booking period must be a number";
    },
  },
  [SETTING_KEYS.REMINDING_BEFORE]: {
    label: "Reminding Before (days)",
    type: "number",
    validation: (value) => {
      const parsedValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (typeof parsedValue === "number") {
        if (parsedValue < 0) return "Reminding before must be 0 or more days";
        if (parsedValue > 10) return "Reminding before must be less than 10 days";
        return null;
      }
      return "Reminding before must be a number";
    },
  },
  [SETTING_KEYS.REMINDING_TIME]: {
    label: "Reminding Time",
    type: "text",
    validation: (value) => {
      if (typeof value === "string") {
        if (!/^\d{2}:\d{2}$/.test(value)) return "Reminding time must be in HH:mm format";
        const [hours, minutes] = value.split(":").map(Number);
        if (hours < 0 || hours > 23) return "Hours must be between 00 and 23";
        if (minutes < 0 || minutes > 59) return "Minutes must be between 00 and 59";
        return null;
      }
      return "Reminding time must be a string in HH:mm format";
    },
  },
};
