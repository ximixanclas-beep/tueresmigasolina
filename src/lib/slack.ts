const WEBHOOK = process.env.SLACK_WEBHOOK_URL ?? "";

export function isSlackConfigured(): boolean {
  return Boolean(WEBHOOK);
}

export async function sendSlackAlert(payload: {
  title: string;
  fields: Array<{ label: string; value: string }>;
  url?: string;
}): Promise<boolean> {
  if (!WEBHOOK) return false;

  const lines = payload.fields
    .filter((f) => f.value)
    .map((f) => `*${f.label}:* ${f.value}`)
    .join("\n");

  const text = `🏍️ *${payload.title}*\n${lines}${
    payload.url ? `\n<${payload.url}|Abrir panel>` : ""
  }`;

  try {
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: `🏍️ ${payload.title}` },
          },
          {
            type: "section",
            fields: payload.fields
              .filter((f) => f.value)
              .map((f) => ({ type: "mrkdwn", text: `*${f.label}:*\n${f.value}` })),
          },
          ...(payload.url
            ? [
                {
                  type: "actions",
                  elements: [
                    {
                      type: "button",
                      text: { type: "plain_text", text: "Abrir panel" },
                      url: payload.url,
                      style: "primary",
                    },
                  ],
                },
              ]
            : []),
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
