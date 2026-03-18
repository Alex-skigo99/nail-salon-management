import { AppointmentStatus, Slot, SlotStatus, DaySlots } from "./dbSchemaTypes";

// ─────────────────────────────────────────────
// CRUD Input Types
// ─────────────────────────────────────────────

export type CreateAppointmentInput = {
  master_id: number;
  user_id?: string | null;
  guest_name?: string | null;
  guest_phone?: string | null;
  need_store_phone?: boolean;
  date: string;
  time: string;
  duration_minutes: number;
  services?: string | null;
  comments?: string | null;
  status?: AppointmentStatus;
};

export type UpdateAppointmentInput = {
  guest_name?: string | null;
  guest_phone?: string | null;
  services?: string | null;
  comments?: string | null;
  status?: AppointmentStatus;
};

export type RescheduleInput = {
  master_id?: number;
  date: string;
  time: string;
  duration_minutes?: number;
  services?: string | null;
};

// ─────────────────────────────────────────────
// Re-export from dbSchemaTypes (for convenience)
// ─────────────────────────────────────────────

export type { Slot, SlotStatus, DaySlots };

// ─────────────────────────────────────────────
// Availability & Suggestions
// ─────────────────────────────────────────────

export type TimeSlot = {
  date: string;
  time: string;
};

export type AvailabilityResult =
  | { available: true; slot: TimeSlot }
  | {
      available: false;
      suggestions: {
        same_day: {
          before: TimeSlot | null;
          after: TimeSlot | null;
        };
        same_time: {
          before: TimeSlot | null;
          after: TimeSlot | null;
        };
      };
    };

export type SlotSuggestion = {
  date: string;
  time: string;
};

export type MasterSuggestions = {
  master: {
    id: number;
    name: string;
    description?: string | null;
  };
  slots: SlotSuggestion[];
};
