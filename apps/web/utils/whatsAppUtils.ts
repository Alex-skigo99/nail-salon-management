import { getAppointmentDateString } from "./dateUtils";

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
}): string {
  const servicesPart = data.services ? `\nServices: ${data.services}` : "";
  const apptDateStr = getAppointmentDateString(data.date);
  return `Hi! Your appointment has been booked for ${apptDateStr} at ${data.time} (${data.duration} min).${servicesPart}`;
}

export function buildSetApptStatusMessage(data: { date: string; time: string; status: string }): string {
  const apptDateStr = getAppointmentDateString(data.date);
  return `Hi! Your appointment on ${apptDateStr} at ${data.time} status has been updated to: ${data.status}.`;
}

export function buildDeleteApptMessage(data: { date: string; time: string }): string {
  const apptDateStr = getAppointmentDateString(data.date);
  return `Hi! Your appointment on ${apptDateStr} at ${data.time} has been cancelled.`;
}

export function buildRescheduleApptMessage(data: {
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
}): string {
  const oldApptDateStr = getAppointmentDateString(data.oldDate);
  const newApptDateStr = getAppointmentDateString(data.newDate);
  return `Hi! Your appointment has been rescheduled from ${oldApptDateStr} at ${data.oldTime} to ${newApptDateStr} at ${data.newTime}.`;
}
