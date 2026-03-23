export type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "USER";
  last_login: string;
  password: string | null;
  google_id: string | null;
  image: string | null;
  created_at: string;
};

export type Service = {
  id: number;
  name: string;
  description?: string | null;
  category: "manicure" | "pedicure" | "other";
  price: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
};

export type Master = {
  id: number;
  name: string;
  description?: string | null;
};

export type WorkingHours = {
  id: number;
  master_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type AppointmentStatus = "new" | "confirmed" | "reserved" | "pending" | "rejected";

export type Appointment = {
  id: number;
  master_id: number;
  user_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
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

/**
 * @openapi
 * components:
 *   schemas:
 *     UserData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         master_id:
 *           type: integer
 *         user_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         guest_name:
 *           type: string
 *           nullable: true
 *         guest_phone:
 *           type: string
 *           nullable: true
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *           format: time
 *         duration_minutes:
 *           type: integer
 *         status:
 *           type: string
 *           enum: ["new", "confirmed", "reserved", "pending", "rejected"]
 *         services:
 *           type: string
 *           nullable: true
 *         comments:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AppointmentRetrieve:
 *       allOf:
 *         - $ref: '#/components/schemas/Appointment'
 *         - type: object
 *           properties:
 *             user_data:
 *               nullable: true
 *               oneOf:
 *                 - $ref: '#/components/schemas/UserData'
 *                 - type: 'null'
 *     AppointmentRetrieveOfUser:
 *       allOf:
 *         - $ref: '#/components/schemas/Appointment'
 *         - type: object
 *           required:
 *             - master_data
 *           properties:
 *             master_data:
 *               $ref: '#/components/schemas/Master'
 */

export type Setting = {
  id: number;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type SlotStatus = "empty" | "reserved" | "none" | "part_book" | "book";

export type Slot = {
  start_time: string;
  end_time: string;
  status: SlotStatus;
  appointment_data: AppointmentRetrieve | null;
};

/**
 * @openapi
 * components:
 *   schemas:
 *     Slot:
 *       type: object
 *       properties:
 *         start_time:
 *           type: string
 *           format: time
 *         end_time:
 *           type: string
 *           format: time
 *         status:
 *           type: string
 *           enum: ["empty", "reserved", "none", "part_book", "book"]
 *         appointment_data:
 *           oneOf:
 *             - $ref: '#/components/schemas/AppointmentRetrieve'
 *             - type: 'null'
 */

export type DaySlots = {
  date: string;
  start_time: string | null;
  end_time: string | null;
  slot_duration: number;
  slots_count: number;
  slots: Slot[];
};

/**
 * @openapi
 * components:
 *   schemas:
 *     DaySlots:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         start_time:
 *           type: string
 *           format: time
 *           nullable: true
 *         end_time:
 *           type: string
 *           format: time
 *           nullable: true
 *         slot_duration:
 *           type: integer
 *         slots_count:
 *           type: integer
 *         slots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Slot'
 */
