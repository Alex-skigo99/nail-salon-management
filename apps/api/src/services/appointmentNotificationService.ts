import { Appointment, Master } from "../types/dbSchemaTypes";
import { getMasterById } from "../services/masterService";
import { sendEmailSafe } from "../utils/sesUtils";
import {
  AppointmentEmailData,
  newAppointmentEmail,
  deletedAppointmentEmail,
  updatedAppointmentEmail,
  userCommentAppointmentEmail,
  rescheduledAppointmentEmail,
} from "../email_templates/appointmentEmails";
import { getUserNameById } from "./userService";
import { EMAIL_NOTIFICATIONS, EmailNotificationType } from "../constants/emailNotifications";

async function buildEmailData(master: Master, appt: Appointment): Promise<AppointmentEmailData> {
  let clientName = appt.guest_name || "Unknown";

  if (appt.user_id && !appt.guest_name) {
    const userName = await getUserNameById(appt.user_id as string);
    if (userName) {
      clientName = userName;
    }
  }

  return {
    masterName: master.name,
    clientName,
    clientPhone: appt.guest_phone,
    date: new Date(appt.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    time: appt.time,
    durationMinutes: appt.duration_minutes,
    services: appt.services,
    comments: appt.comments,
  };
}

const emailTemplateMap = {
  [EMAIL_NOTIFICATIONS.NEW_APPOINTMENT]: newAppointmentEmail,
  [EMAIL_NOTIFICATIONS.DELETE_APPOINTMENT]: deletedAppointmentEmail,
  [EMAIL_NOTIFICATIONS.UPDATE_APPOINTMENT]: updatedAppointmentEmail,
  [EMAIL_NOTIFICATIONS.USER_COMMENT]: userCommentAppointmentEmail,
  [EMAIL_NOTIFICATIONS.RESCHEDULE_APPOINTMENT]: rescheduledAppointmentEmail,
} as const;

export async function notifyMasterAppointment(
  appt: Appointment,
  notificationType: EmailNotificationType
): Promise<void> {
  const master = await getMasterById(appt.master_id);
  if (!master?.email) return;

  if (!master[notificationType as keyof Master]) return;

  const emailTemplate = emailTemplateMap[notificationType];
  const emailData = await buildEmailData(master, appt);
  const { subject, htmlBody } = emailTemplate(emailData);

  await sendEmailSafe({ to: master.email, subject, htmlBody });
}
