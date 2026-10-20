import { NextResponse } from "next/server";
import { isSlackConfigured, sendSlackAlert } from "@/lib/slack";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const adminCode = process.env.ADMIN_CODE;
  if (!adminCode || code !== adminCode) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!isSlackConfigured()) {
    return NextResponse.json(
      { error: "Falta configurar SLACK_WEBHOOK_URL en Vercel." },
      { status: 400 },
    );
  }

  const text = url.searchParams.get("text")?.slice(0, 500);
  const sent = await sendSlackAlert({
    title: "Prueba de alertas Slack",
    fields: [
      { label: "Estado", value: "Conexión OK" },
      { label: "Mensaje", value: text ?? "Si ves esto, las alertas de propuestas llegan al movil." },
    ],
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tueresmigasolina.vercel.app"}/panel`,
  });

  return NextResponse.json({ sent });
}
