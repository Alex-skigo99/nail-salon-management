import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { promises as fs } from "fs";
import path from "path";

const SES_UNAVAILABLE = process.env.SES_UNAVAILABLE === "true";

const ses = new SESClient({
  ...(process.env.AWS_ENDPOINT_URL
    ? {
        endpoint: process.env.AWS_ENDPOINT_URL,
        region: process.env.AWS_REGION || "us-east-1",
        credentials: { accessKeyId: "test", secretAccessKey: "test" },
      }
    : {}),
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "noreply@example.com";
const DEV_MODE = process.env.NODE_ENV === "development";
const DEV_EMAIL_DIR = path.join(process.cwd(), "_temp", "send_email_to_master");

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
}

async function saveEmailToFile({ to, subject, htmlBody }: SendEmailParams): Promise<void> {
  try {
    // Ensure directory exists
    await fs.mkdir(DEV_EMAIL_DIR, { recursive: true });

    // Create a filename based on timestamp and recipient
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${timestamp}_${to.replace(/[@.]/g, "_")}.html`;
    const filepath = path.join(DEV_EMAIL_DIR, filename);

    // Save with metadata in a comment
    const content = `<!-- Email Metadata
To: ${to}
Subject: ${subject}
Sent at: ${new Date().toISOString()}
-->
${htmlBody}`;

    await fs.writeFile(filepath, content, "utf-8");
    console.log(`[DEV] Email saved to ${filepath}`);
  } catch (err) {
    console.error(`Failed to save email to file:`, err);
  }
}

export async function sendEmail({ to, subject, htmlBody }: SendEmailParams): Promise<void> {
  if (DEV_MODE) {
    await saveEmailToFile({ to, subject, htmlBody });
    return;
  }

  if (SES_UNAVAILABLE) {
    console.log(
      `[SES_UNAVAILABLE] Email not sent (SES not configured)\nTo: ${to}\nSubject: ${subject}\n---\n${htmlBody}`
    );
    return;
  }

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: htmlBody, Charset: "UTF-8" },
      },
    },
  });

  await ses.send(command);
}

export async function sendEmailSafe(params: SendEmailParams): Promise<void> {
  try {
    await sendEmail(params);
  } catch (err) {
    console.error(`Failed to send email to ${params.to}:`, err);
  }
}
