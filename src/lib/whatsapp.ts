const PHONE = process.env.WHATSAPP_PHONE ?? process.env.WHATSAPP_CALLMEBOT_PHONE ?? "";

const META_TOKEN = process.env.WHATSAPP_META_TOKEN ?? "";
const META_PHONE_ID = process.env.WHATSAPP_META_PHONE_ID ?? "";
const META_VERSION = process.env.WHATSAPP_META_VERSION ?? "v23.0";

const WHATSABLE_KEY = process.env.WHATSABLE_API_KEY ?? "";
const WHATSABLE_URL =
  "https://dashboard.whatsable.app/api/whatsapp/messages/v2.0.0/send";

const CALLMEBOT_APIKEY = process.env.WHATSAPP_CALLMEBOT_APIKEY ?? "";

export type WhatsAppProvider = "meta" | "whatsable" | "callmebot" | "none";

export function whatsAppProvider(): WhatsAppProvider {
  if (META_TOKEN && META_PHONE_ID && PHONE) return "meta";
  if (WHATSABLE_KEY && PHONE) return "whatsable";
  if (CALLMEBOT_APIKEY && PHONE) return "callmebot";
  return "none";
}

export function isWhatsAppConfigured(): boolean {
  return whatsAppProvider() !== "none";
}

async function sendViaMeta(text: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_VERSION}/${META_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: `+${PHONE}`,
          type: "text",
          text: { preview_url: false, body: text },
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { messages?: Array<{ id?: string }> };
    return Boolean(data.messages?.length);
  } catch {
    return false;
  }
}

async function sendViaWhatsAble(text: string): Promise<boolean> {
  try {
    const res = await fetch(WHATSABLE_URL, {
      method: "POST",
      headers: {
        Authorization: WHATSABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: `+${PHONE}`, text }),
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.text();
    if (!res.ok) return false;
    try {
      const data = JSON.parse(body) as { success?: boolean };
      return data.success === true;
    } catch {
      return /success|accepted|sent/i.test(body);
    }
  } catch {
    return false;
  }
}

async function sendViaCallMeBot(text: string): Promise<boolean> {
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", PHONE);
  url.searchParams.set("text", text);
  url.searchParams.set("apikey", CALLMEBOT_APIKEY);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const body = await res.text();
    return /queued|sent/i.test(body);
  } catch {
    return false;
  }
}

export async function sendWhatsAppAlert(text: string): Promise<boolean> {
  switch (whatsAppProvider()) {
    case "meta":
      return sendViaMeta(text);
    case "whatsable":
      return sendViaWhatsAble(text);
    case "callmebot":
      return sendViaCallMeBot(text);
    default:
      return false;
  }
}
