import { NextResponse } from "next/server";
import {
  isWhatsAppConfigured,
  sendWhatsAppAlert,
  whatsAppProvider,
} from "@/lib/whatsapp";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const adminCode = process.env.ADMIN_CODE;
  if (!adminCode || code !== adminCode) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const provider = whatsAppProvider();
  if (!isWhatsAppConfigured()) {
    return NextResponse.json(
      {
        provider,
        error:
          "Falta configurar WHATSAPP_PHONE y un proveedor: WHATSAPP_META_TOKEN + WHATSAPP_META_PHONE_ID (Meta), WHATSABLE_API_KEY o WHATSAPP_CALLMEBOT_APIKEY.",
      },
      { status: 400 },
    );
  }

  const custom = url.searchParams.get("text")?.slice(0, 500);
  const sent = await sendWhatsAppAlert(
    custom ?? "🏍️ Tueresmigasolina: prueba de alertas WhatsApp OK",
  );

  return NextResponse.json({ provider, sent });
}
