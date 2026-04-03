export type Master = {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  is_booking_available: boolean;
  sorting: number;
  email: string | null;
  is_new_appt_email_notification: boolean;
  is_del_appt_email_notification: boolean;
  is_update_appt_email_notification: boolean;
  is_user_comment_appt_email_notification: boolean;
  is_reschedule_appt_email_notification: boolean;
};

export type CreateMasterInput = Omit<Master, "id">;

export type UpdateMasterInput = Partial<CreateMasterInput>;
