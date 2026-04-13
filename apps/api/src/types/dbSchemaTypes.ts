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
  master_id: number | null;
  email_subscribed: boolean;
  language: string;
  created_at: string;
};

export type UserRetrieve = Omit<User, "password" | "google_id"> & {
  master_data: Master | null;
  is_google_auth: boolean;
  appts_count: number;
  last_appts: string | null;
};

export type UserListItem = Omit<User, "password" | "google_id"> & {
  appts_count: number;
  last_appts: string | null;
  is_google_auth: boolean;
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
  description: string | null;
  image: string | null;
  is_booking_available: boolean;
  sorting: number;
  email: string | null;
  is_new_appt_email_notification: boolean;
  is_del_appt_email_notification: boolean;
  is_update_appt_email_notification: boolean;
  is_user_comment_appt_email_notification: boolean;
  is_reschedule_appt_email_notification: boolean;
};

export type MasterCreate = Partial<Omit<Master, "id">>;

export type MasterUpdate = MasterCreate;

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

export type AppointmentRetrieveFull = Appointment & {
  user_data: UserData | null;
  master_data: { id: number; name: string; description: string | null };
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
 *     AppointmentRetrieveFull:
 *       allOf:
 *         - $ref: '#/components/schemas/Appointment'
 *         - type: object
 *           properties:
 *             user_data:
 *               nullable: true
 *               oneOf:
 *                 - $ref: '#/components/schemas/UserData'
 *                 - type: 'null'
 *             master_data:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                   nullable: true
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

// ─── Products ─────────────────────────────────────────────────────────────────

export type Product = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  discount: string | null;
  type: string | null;
  quantity: number;
  image: string | null;
  is_available: boolean;
  is_home_display: boolean;
  home_sorting: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductCreate = Omit<Product, "id" | "created_at" | "updated_at">;

export type ProductUpdate = Partial<ProductCreate>;

/** Product returned from public /product/home (no comment field) */
export type ProductHome = Omit<Product, "comment" | "quantity">;

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         price:
 *           type: string
 *           example: "29.99"
 *         discount:
 *           type: string
 *           nullable: true
 *           example: "24.99"
 *         type:
 *           type: string
 *         quantity:
 *           type: integer
 *         image:
 *           type: string
 *           nullable: true
 *         is_available:
 *           type: boolean
 *         is_home_display:
 *           type: boolean
 *         home_sorting:
 *           type: integer
 *         comment:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ProductHome:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         price:
 *           type: string
 *         discount:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *         image:
 *           type: string
 *           nullable: true
 *         is_available:
 *           type: boolean
 *         is_home_display:
 *           type: boolean
 *         home_sorting:
 *           type: integer
 *     ProductCreate:
 *       type: object
 *       required:
 *         - title
 *         - price
 *         - type
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         price:
 *           type: string
 *         discount:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *         quantity:
 *           type: integer
 *         image:
 *           type: string
 *           nullable: true
 *         is_available:
 *           type: boolean
 *         is_home_display:
 *           type: boolean
 *         home_sorting:
 *           type: integer
 *         comment:
 *           type: string
 *           nullable: true
 *     ProductUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         price:
 *           type: string
 *         discount:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *         quantity:
 *           type: integer
 *         image:
 *           type: string
 *           nullable: true
 *         is_available:
 *           type: boolean
 *         is_home_display:
 *           type: boolean
 *         home_sorting:
 *           type: integer
 *         comment:
 *           type: string
 *           nullable: true
 */
