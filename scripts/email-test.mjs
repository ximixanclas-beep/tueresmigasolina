// Prueba de envio de email via Gmail SMTP (nodemailer).
// Lee GMAIL_USER, GMAIL_APP_PASSWORD y NOTIFY_EMAIL de .env.local o del entorno.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv(key) {
  if (process.env[key]) return process.env[key];
  const envFile = path.join(root, ".env.local");
  if (!fs.existsSync(envFile)) return undefined;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)\\s*$`));
    if (m) return m[1].trim().replace(/^"|"$/g, "");
  }
  return undefined;
}

const user = loadEnv("GMAIL_USER");
const pass = loadEnv("GMAIL_APP_PASSWORD");
const to = loadEnv("NOTIFY_EMAIL") || user;

if (!user || !pass) {
  console.error("Faltan GMAIL_USER o GMAIL_APP_PASSWORD en .env.local");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

try {
  const info = await transporter.sendMail({
    from: `"Tueresmigasolina" <${user}>`,
    to,
    subject: "[Tu mandas] Prueba de alertas por email",
    html: `<h2>🏍️ Tueresmigasolina</h2>
<p>Si ves este email, las alertas de propuestas funcionan correctamente.</p>
<p style="color:#9ca3af;font-size:12px">Alerta automática de Tueresmigasolina</p>`,
  });
  console.log("OK: email enviado ->", info.response);
} catch (err) {
  console.error("Error enviando email:", err.message);
  process.exit(1);
}
