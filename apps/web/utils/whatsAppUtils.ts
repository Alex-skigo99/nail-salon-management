import { getAppointmentDateString } from "./dateUtils";
import type { Language } from "@/types/userTypes";

function sanitizePhone(phone: string): string {
  // Remove all non-digits
  let sanitized = phone.replace(/\D/g, "");
  // Remove leading zeros
  sanitized = sanitized.replace(/^0+/, "");
  // Add 972 prefix if not present
  if (!sanitized.startsWith("972")) {
    sanitized = "972" + sanitized;
  }
  return sanitized;
}

export function openWhatsApp(phone: string, message: string): void {
  const sanitized = sanitizePhone(phone);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${sanitized}?text=${encoded}`, "_blank");
}

export function buildCreateApptMessage(data: {
  date: string;
  time: string;
  duration: number;
  services?: string | null;
  lang: Language;
}): string {
  const apptDateStr = getAppointmentDateString(data.date);
  const servicesPart = data.services ? `${data.services}` : "";

  switch (data.lang) {
    case "ru":
      return `Здравствуйте! Ваша запись создана на ${apptDateStr} в ${data.time} (${data.duration} мин).${servicesPart ? `\nУслуги: ${servicesPart}` : ""}`;
    case "he":
      return `שלום! התור שלך נקבע ל-${apptDateStr} בשעה ${data.time} (${data.duration} דקות).${servicesPart ? `\nשירותים: ${servicesPart}` : ""}`;
    default:
      return `Hi! Your appointment has been booked for ${apptDateStr} at ${data.time} (${data.duration} min).${servicesPart ? `\nServices: ${servicesPart}` : ""}`;
  }
}

export function buildSetApptStatusMessage(data: {
  date: string;
  time: string;
  status: string;
  lang: Language;
}): string {
  const apptDateStr = getAppointmentDateString(data.date);

  switch (data.lang) {
    case "ru":
      return `Здравствуйте! Статус вашей записи на ${apptDateStr} в ${data.time} изменён на: ${data.status}.`;
    case "he":
      return `שלום! סטטוס התור שלך ב-${apptDateStr} בשעה ${data.time} עודכן ל: ${data.status}.`;
    default:
      return `Hi! Your appointment on ${apptDateStr} at ${data.time} status has been updated to: ${data.status}.`;
  }
}

export function buildDeleteApptMessage(data: { date: string; time: string; lang: Language }): string {
  const apptDateStr = getAppointmentDateString(data.date);

  switch (data.lang) {
    case "ru":
      return `Здравствуйте! Ваша запись на ${apptDateStr} в ${data.time} была отменена.`;
    case "he":
      return `שלום! התור שלך ב-${apptDateStr} בשעה ${data.time} בוטל.`;
    default:
      return `Hi! Your appointment on ${apptDateStr} at ${data.time} has been cancelled.`;
  }
}

export function buildRescheduleApptMessage(data: {
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  lang: Language;
}): string {
  const oldApptDateStr = getAppointmentDateString(data.oldDate);
  const newApptDateStr = getAppointmentDateString(data.newDate);

  switch (data.lang) {
    case "ru":
      return `Здравствуйте! Ваша запись перенесена с ${oldApptDateStr} в ${data.oldTime} на ${newApptDateStr} в ${data.newTime}.`;
    case "he":
      return `שלום! התור שלך הוזז מ-${oldApptDateStr} בשעה ${data.oldTime} ל-${newApptDateStr} בשעה ${data.newTime}.`;
    default:
      return `Hi! Your appointment has been rescheduled from ${oldApptDateStr} at ${data.oldTime} to ${newApptDateStr} at ${data.newTime}.`;
  }
}
