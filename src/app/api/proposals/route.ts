import { NextResponse } from "next/server";
import { sendPushToAll } from "@/lib/push";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function asString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function saveToGist(entry: Record<string, unknown>): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const gistId = process.env.PROPOSALS_GIST_ID;
  if (!token || !gistId) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const res = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
  if (!res.ok) return;
  const gist = (await res.json()) as {
    files: Record<string, { content: string; filename: string }>;
  };
  const fileKey = Object.keys(gist.files)[0];
  if (!fileKey) return;

  let list: unknown[] = [];
  try {
    const parsed = JSON.parse(gist.files[fileKey].content);
    if (Array.isArray(parsed)) list = parsed;
  } catch {
    list = [];
  }
  list.unshift(entry);
  const content = JSON.stringify(list.slice(0, 500), null, 2);

  await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      files: { [fileKey]: { content, filename: gist.files[fileKey].filename } },
    }),
  });
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

  const entry = {
    id: crypto.randomUUID(),
    name,
    contact,
    route,
    message,
    receivedAt: new Date().toISOString(),
  };

  await saveToGist(entry);

  const webhook = process.env.PROPOSALS_WEBHOOK_URL;
  if (webhook) {
    try {
      if (webhook.includes("ntfy.sh")) {
        await fetch(webhook, {
          method: "POST",
          headers: {
            Title: `TU MANDAS: ${route}`,
            Priority: "high",
            Tags: "motorcycle,mega",
            Click: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tueresmigasolina.vercel.app"}/panel`,
            Actions: `view, Abrir panel, ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tueresmigasolina.vercel.app"}/panel`,
          },
          body: text,
        });
      } else {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: `**TU MANDAS - Nueva propuesta**\n\n${text}` }),
        });
      }
    } catch {
      // webhook failed but proposal is saved
    }
  }

  await sendPushToAll({
    title: "TU MANDAS - Nueva propuesta",
    body: `${route} — de ${name || "Sin nombre"}`,
    url: "/panel",
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const adminCode = process.env.ADMIN_CODE;
  if (!adminCode || code !== adminCode) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  const gistId = process.env.PROPOSALS_GIST_ID;
  if (!token || !gistId) {
    return NextResponse.json({ proposals: [] });
  }

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ proposals: [] });
  }
  const gist = (await res.json()) as {
    files: Record<string, { content: string }>;
  };
  const fileKey = Object.keys(gist.files)[0];
  if (!fileKey) return NextResponse.json({ proposals: [] });

  try {
    const parsed = JSON.parse(gist.files[fileKey].content);
    return NextResponse.json({ proposals: Array.isArray(parsed) ? parsed : [] });
  } catch {
    return NextResponse.json({ proposals: [] });
  }
}
