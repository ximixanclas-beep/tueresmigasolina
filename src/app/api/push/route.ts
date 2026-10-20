import { NextResponse } from "next/server";
import { getVapidPublicKey, savePushSub } from "@/lib/push";

export async function GET() {
  return NextResponse.json({ publicKey: getVapidPublicKey() });
}

export async function POST(request: Request) {
  if (!getVapidPublicKey()) {
    return NextResponse.json({ error: "Push no configurado." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });
  }

  const subscription = body as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return NextResponse.json({ error: "Subscription invalida." }, { status: 400 });
  }

  await savePushSub(subscription as Parameters<typeof savePushSub>[0]);
  return NextResponse.json({ ok: true });
}
