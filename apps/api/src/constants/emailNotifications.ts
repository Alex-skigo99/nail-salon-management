export const EMAIL_NOTIFICATIONS = {
  NEW_APPOINTMENT: "is_new_appt_email_notification",
  DELETE_APPOINTMENT: "is_del_appt_email_notification",
  UPDATE_APPOINTMENT: "is_update_appt_email_notification",
  USER_COMMENT: "is_user_comment_appt_email_notification",
  RESCHEDULE_APPOINTMENT: "is_reschedule_appt_email_notification",
} as const;

export type EmailNotificationType = (typeof EMAIL_NOTIFICATIONS)[keyof typeof EMAIL_NOTIFICATIONS];
