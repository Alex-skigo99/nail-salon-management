export interface AppointmentEmailData {
  masterName: string;
  clientName: string;
  clientPhone: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  services: string | null;
  comments: string | null;
}

function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 560px; margin: 24px auto; background: #fff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; }
    .header { background: #18181b; color: #fff; padding: 20px 24px; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 600; }
    .body { padding: 24px; }
    .field { margin-bottom: 12px; }
    .label { font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .value { font-size: 14px; color: #18181b; }
    .footer { padding: 16px 24px; border-top: 1px solid #e4e4e7; font-size: 12px; color: #a1a1aa; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${title}</h1></div>
    <div class="body">${content}</div>
    <div class="footer">Nail Salon Management System</div>
  </div>
</body>
</html>`;
}

function appointmentFields(data: AppointmentEmailData): string {
  const fields = [
    { label: "Client", value: data.clientName },
    ...(data.clientPhone ? [{ label: "Phone", value: data.clientPhone }] : []),
    { label: "Date", value: data.date },
    { label: "Time", value: data.time },
    { label: "Duration", value: `${data.durationMinutes} min` },
    ...(data.services ? [{ label: "Services", value: data.services }] : []),
    ...(data.comments ? [{ label: "Comments", value: data.comments }] : []),
  ];

  return fields
    .map((f) => `<div class="field"><div class="label">${f.label}</div><div class="value">${f.value}</div></div>`)
    .join("");
}

export function newAppointmentEmail(data: AppointmentEmailData): { subject: string; htmlBody: string } {
  return {
    subject: `New Appointment — ${data.clientName} on ${data.date}`,
    htmlBody: baseLayout(
      "New Appointment",
      `<p style="margin:0 0 16px;font-size:14px;color:#18181b;">Hi ${data.masterName}, a new appointment has been booked for you.</p>${appointmentFields(data)}`
    ),
  };
}

export function deletedAppointmentEmail(data: AppointmentEmailData): { subject: string; htmlBody: string } {
  return {
    subject: `Appointment Cancelled — ${data.clientName} on ${data.date}`,
    htmlBody: baseLayout(
      "Appointment Cancelled",
      `<p style="margin:0 0 16px;font-size:14px;color:#18181b;">Hi ${data.masterName}, an appointment has been cancelled.</p>${appointmentFields(data)}`
    ),
  };
}

export function updatedAppointmentEmail(data: AppointmentEmailData): { subject: string; htmlBody: string } {
  return {
    subject: `Appointment Updated — ${data.clientName} on ${data.date}`,
    htmlBody: baseLayout(
      "Appointment Updated",
      `<p style="margin:0 0 16px;font-size:14px;color:#18181b;">Hi ${data.masterName}, an appointment has been updated.</p>${appointmentFields(data)}`
    ),
  };
}

export function userCommentAppointmentEmail(data: AppointmentEmailData): { subject: string; htmlBody: string } {
  return {
    subject: `New Comment on Appointment — ${data.clientName} on ${data.date}`,
    htmlBody: baseLayout(
      "Appointment Comment Updated",
      `<p style="margin:0 0 16px;font-size:14px;color:#18181b;">Hi ${data.masterName}, a client has updated their comment on an appointment.</p>${appointmentFields(data)}`
    ),
  };
}

export function rescheduledAppointmentEmail(data: AppointmentEmailData): { subject: string; htmlBody: string } {
  return {
    subject: `Appointment Rescheduled — ${data.clientName} on ${data.date}`,
    htmlBody: baseLayout(
      "Appointment Rescheduled",
      `<p style="margin:0 0 16px;font-size:14px;color:#18181b;">Hi ${data.masterName}, an appointment has been rescheduled.</p>${appointmentFields(data)}`
    ),
  };
}
