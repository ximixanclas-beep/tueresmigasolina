import { NextResponse } from "next/server";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function asString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("El cuerpo de la petición no es JSON válido.");
  }

  if (!body || typeof body !== "object") {
    return badRequest("Faltan datos.");
  }

  const raw = body as Record<string, unknown>;
  const name = asString(raw.name, 80);
  const contact = asString(raw.contact, 160);
  const route = asString(raw.route, 160);
  const message = asString(raw.message, 2000);

  if (!contact) return badRequest("El contacto es obligatorio.");
  if (!route) return badRequest("La ruta propuesta es obligatoria.");

  const lines = [
    `Nombre: ${name || "Sin nombre"}`,
    `Contacto: ${contact}`,
    `Ruta: ${route}`,
    message ? `Mensaje: ${message}` : null,
  ].filter(Boolean) as string[];

  const text = lines.join("\n");
  const webhook = process.env.PROPOSALS_WEBHOOK_URL;

  if (!webhook) {
    return NextResponse.json({ ok: false, needsWebhook: true }, { status: 200 });
  }

  try {
    let res: Response;

    if (webhook.includes("ntfy.sh")) {
      res = await fetch(webhook, {
        method: "POST",
        headers: {
          Title: "TU MANDAS - Nueva propuesta",
          Priority: "high",
          Tags: "motorcycle,mega",
        },
        body: text,
      });
    } else {
      const content = ["**TU MANDAS - Nueva propuesta**", text]
        .join("\n\n")
        .replace(/\n/g, "\n");
      res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    }

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Webhook error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 },
    );
  }
}
