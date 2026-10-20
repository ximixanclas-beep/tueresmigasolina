import { NextResponse } from "next/server";
import { readPushSubs, sendPushToAll, getVapidPublicKey } from "@/lib/push";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const adminCode = process.env.ADMIN_CODE;
  if (!adminCode || code !== adminCode) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!getVapidPublicKey()) {
    return NextResponse.json(
      { error: "Push no configurado: falta VAPID_PUBLIC_KEY." },
      { status: 400 },
    );
  }

  const subs = await readPushSubs();

  if (url.searchParams.get("send") === "1") {
    const text = url.searchParams.get("text")?.slice(0, 200);
    await sendPushToAll({
      title: "TU MANDAS - Prueba",
      body: text ?? "Si ves esto, las notificaciones llegan al móvil correctamente.",
      url: "/panel",
    });
    const after = await readPushSubs();
    return NextResponse.json({
      sent: true,
      subscribersBefore: subs.length,
      subscribersAfter: after.length,
    });
  }

  return NextResponse.json({ subscribers: subs.length });
}
