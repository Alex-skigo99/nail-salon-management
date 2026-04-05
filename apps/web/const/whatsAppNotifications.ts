export const WA_NOTIFICATION_FLAGS = {
  CREATE_APPT: "create_appt",
  SET_APPT_STATUS: "set_appt_status",
  DELETE_APPT: "delete_appt",
  RESCHEDULE_APPT: "reschedule_appt",
} as const;

export type WaNotificationFlag = (typeof WA_NOTIFICATION_FLAGS)[keyof typeof WA_NOTIFICATION_FLAGS];
