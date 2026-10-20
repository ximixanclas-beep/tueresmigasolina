import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER ?? "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? "";

const BREVO_KEY = process.env.BREVO_API_KEY ?? "";

const TO = process.env.NOTIFY_EMAIL ?? GMAIL_USER;
const FROM_NAME = process.env.NOTIFY_FROM_NAME ?? "Tueresmigasolina";

export type EmailProvider = "gmail" | "brevo" | "none";

export function emailProvider(): EmailProvider {
  if (GMAIL_USER && GMAIL_APP_PASSWORD && TO) return "gmail";
  if (BREVO_KEY && TO) return "brevo";
  return "none";
}

export function isEmailConfigured(): boolean {
  return emailProvider() !== "none";
}

export async function sendEmailAlert(payload: {
  subject: string;
  fields: Array<{ label: string; value: string }>;
  url?: string;
}): Promise<boolean> {
  const provider = emailProvider();
  if (provider === "none") return false;

  const rows = payload.fields
    .filter((f) => f.value)
    .map(
      (f) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#111827;vertical-align:top">${escapeHtml(
          f.label,
        )}</td><td style="padding:6px 12px;color:#374151">${escapeHtml(f.value)}</td></tr>`,
    )
    .join("");

  const link = payload.url
    ? `<p style="margin-top:16px"><a href="${payload.url}" style="background:#f97316;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">Abrir panel</a></p>`
    : "";

  const html = `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto">
<h2 style="color:#111827">🏍️ ${escapeHtml(payload.subject)}</h2>
<table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px">${rows}</table>
${link}
<p style="color:#9ca3af;font-size:12px;margin-top:24px">Tueresmigasolina · alerta automática</p>
</div>`;

  const subject = `[Tu mandas] ${payload.subject}`;

  if (provider === "gmail") return sendViaGmail(subject, html);
  return sendViaBrevo(subject, html);
}

async function sendViaGmail(subject: string, html: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${GMAIL_USER}>`,
      to: TO,
      subject,
      html,
    });
    return true;
  } catch {
    return false;
  }
}

async function sendViaBrevo(subject: string, html: string): Promise<boolean> {
  const FROM = process.env.BREVO_SENDER_EMAIL ?? "no-reply@tueresmigasolina.com";
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM },
        to: [{ email: TO }],
        subject,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
