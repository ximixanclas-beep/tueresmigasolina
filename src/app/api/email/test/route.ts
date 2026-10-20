import { NextResponse } from "next/server";
import { emailProvider, isEmailConfigured, sendEmailAlert } from "@/lib/email";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const adminCode = process.env.ADMIN_CODE;
  if (!adminCode || code !== adminCode) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const provider = emailProvider();
  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        provider,
        error:
          "Falta configurar GMAIL_USER + GMAIL_APP_PASSWORD + NOTIFY_EMAIL (o BREVO_API_KEY).",
      },
      { status: 400 },
    );
  }

  const text = url.searchParams.get("text")?.slice(0, 500);
  const sent = await sendEmailAlert({
    subject: "Prueba de alertas por email",
    fields: [
      { label: "Estado", value: "Conexión OK" },
      {
        label: "Mensaje",
        value: text ?? "Si ves este email, las alertas de propuestas funcionan.",
      },
      { label: "Destino", value: process.env.NOTIFY_EMAIL ?? process.env.GMAIL_USER ?? "" },
    ],
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tueresmigasolina.vercel.app"}/panel`,
  });

  return NextResponse.json({ provider, sent });
}
