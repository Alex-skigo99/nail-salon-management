import { Master } from "./masterTypes";
import { Pagination } from "@/types/paginationTypes";

export type AppointmentStatus = "new" | "confirmed" | "reserved" | "pending" | "rejected";

export type SlotStatus = "empty" | "reserved" | "none" | "part_book" | "book";

export type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
};

export type Appointment = {
  id: number;
  master_id: number;
  user_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  date: string;
  time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  services: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentRetrieve = Appointment & {
  user_data: UserData | null;
};

export type AppointmentRetrieveOfUser = Appointment & {
  master_data: Master;
};

export type PaginatedAppointmentsOfUser = {
  data: AppointmentRetrieveOfUser[];
  pagination?: Pagination;
};

export type AppointmentCreate = {
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
  user_id?: string | null;
  guest_name?: string | null;
  guest_phone?: string | null;
  services?: string | null;
  comments?: string | null;
  status?: AppointmentStatus;
};

export type AppointmentReschedule = {
  master_id?: number;
  date: string;
  time: string;
  duration_minutes?: number | null;
  services?: string | null;
};

export type Slot = {
  start_time: string;
  end_time: string;
  status: SlotStatus;
  appointment_data: AppointmentRetrieve | null;
};

export type DaySlots = {
  date: string;
  start_time: string | null;
  end_time: string | null;
  slot_duration: number;
  slots_count: number;
  slots: Slot[];
};

export type SelectedSlot = {
  id: string;
  master: MasterSuggestion["master"];
  date: string;
  time: string;
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
