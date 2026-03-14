export type AppointmentStatus = "new" | "confirmed" | "reserved" | "pending" | "rejected";

export type SlotStatus = "empty" | "reserved" | "none" | "part_book" | "book";

export type Appointment = {
  id: number;
  master_id: number;
  user_id: number | null;
  user_name: string | null;
  whatsapp_phone: string | null;
  date: string;
  time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  services: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentCreate = {
  master_id: number;
  user_id?: number | null;
  user_name?: string | null;
  whatsapp_phone?: string | null;
  need_store_phone?: boolean;
  date: string;
  time: string;
  duration_minutes: number;
  services?: string | null;
  comments?: string | null;
  status?: AppointmentStatus;
};

export type TimeSlot = {
  date: string;
  time: string;
};

export type MasterSuggestion = {
  master: {
    id: number;
    name: string;
    description?: string | null;
  };
  slots: TimeSlot[];
};

export type AppointmentUpdate = {
  user_name?: string | null;
  whatsapp_phone?: string | null;
  services?: string | null;
  comments?: string | null;
  status?: AppointmentStatus;
};

export type AppointmentReschedule = {
  date: string;
  time: string;
  duration_minutes?: number | null;
};

export type Slot = {
  start_time: string;
  end_time: string;
  status: SlotStatus;
  appointment_data: Appointment | null;
};

export type DaySlots = {
  date: string;
  start_time: string | null;
  end_time: string | null;
  slot_duration: number;
  slots_count: number;
  slots: Slot[];
};

export type ViewMode = "week" | "month";
export type DisplayMode = "table" | "graph";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = ["new", "confirmed", "reserved", "pending", "rejected"];

export const STATUS_COLORS: Record<SlotStatus | AppointmentStatus, string> = {
  empty: "bg-gray-100 text-blue-500",
  reserved: "bg-amber-100 text-amber-700",
  none: "bg-gray-50 text-gray-400",
  part_book: "bg-gray-100 text-gray-500",
  book: "bg-green-100 text-green-700",
  new: "bg-sky-100 text-sky-700",
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

export const STATUS_DOT_COLORS: Record<SlotStatus, string> = {
  empty: "bg-gray-300",
  reserved: "bg-amber-500",
  none: "bg-gray-200",
  part_book: "bg-blue-500",
  book: "bg-green-500",
};
