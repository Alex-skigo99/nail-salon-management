/* reminder scheduler settings: */
export const REMINDER_LAMBDA_ARN =
  "arn:aws:lambda:us-east-1:214745598862:function:NailSalonStack-ReminderLambda6F7B5CD5-5r2Wh23yOf27";
export const REMINDER_SCHEDULER_ROLE_ARN =
  "arn:aws:iam::214745598862:role/NailSalonStack-ReminderSchedulerRole2B55116C-e23g8oMLnPSN";
export const REMINDER_SCHEDULER_NAME = "NailSalonReminderScheduler"; // + _NODE_ENV for dev/prod

/* syncCalendar scheduler settings: */
export const SYNC_CALENDAR_LAMBDA_ARN =
  "arn:aws:lambda:us-east-1:214745598862:function:NailSalonStack-SyncCalendarLambdaB9F3C8B7-1n2XoVh5sKjP"; //fake
export const SYNC_CALENDAR_SCHEDULER_ROLE_ARN =
  "arn:aws:iam::214745598862:role/NailSalonStack-SyncCalendarSchedulerRoleC0E4A9B6-1mLhHqjvXo2e"; //fake
export const SYNC_CALENDAR_SCHEDULER_NAME = "NailSalonSyncCalendarScheduler"; // + _NODE_ENV for dev/prod

/* iCloud calendar sync settings: */
export const ICLOUD_CALENDAR_NAME = "Work";
export const ICLOUD_DAYS_TO_SYNC = 60;
