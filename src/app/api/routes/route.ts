import { NextResponse } from "next/server";
import { createRoute, listRoutes } from "@/lib/store";
import type { Difficulty, RouteInput, RoutePoint, Surface } from "@/lib/types";

export const dynamic = "force-dynamic";

const difficulties: Difficulty[] = ["facil", "media", "alta"];
const surfaces: Surface[] = ["asfalto", "mixto", "tierra"];

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function asString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parsePoints(value: unknown): RoutePoint[] {
  if (!Array.isArray(value)) return [];
  const points: RoutePoint[] = [];
  for (const item of value.slice(0, 12000)) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const lat = Number(record.lat);
    const lng = Number(record.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
    const ele = Number(record.ele);
    points.push(Number.isFinite(ele) ? { lat, lng, ele } : { lat, lng });
  }
  return points;
}

export async function GET() {
  try {
    const routes = await listRoutes();
    return NextResponse.json({ routes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error cargando rutas." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const adminCode = process.env.ADMIN_CODE;
  if (!adminCode) {
    if (process.env.NODE_ENV === "production") {
      return badRequest("Falta configurar ADMIN_CODE en el servidor.", 503);
    }
  } else {
    const provided = request.headers.get("x-admin-code") ?? "";
    if (provided !== adminCode) {
      return badRequest("Código de publicación incorrecto.", 401);
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("El cuerpo de la petición no es JSON válido.");
  }

  if (!body || typeof body !== "object") {
    return badRequest("Faltan datos de la ruta.");
  }

  const raw = body as Record<string, unknown>;
  const title = asString(raw.title, 140);
  const points = parsePoints(raw.points);

  if (!title) return badRequest("El título es obligatorio.");
  if (points.length < 2) return badRequest("La ruta necesita al menos 2 puntos.");

  const difficulty = difficulties.includes(raw.difficulty as Difficulty)
    ? (raw.difficulty as Difficulty)
    : "media";
  const surface = surfaces.includes(raw.surface as Surface)
    ? (raw.surface as Surface)
    : "asfalto";

  const input: RouteInput = {
    title,
    summary: asString(raw.summary, 180),
    description: asString(raw.description, 4000),
    region: asString(raw.region, 120),
    distanceKm: Math.round(asNumber(raw.distanceKm) * 10) / 10,
    durationMin: Math.round(asNumber(raw.durationMin)),
    elevationGainM: Math.round(asNumber(raw.elevationGainM)),
    difficulty,
    surface,
    tags: Array.isArray(raw.tags)
      ? raw.tags
          .map((tag) => asString(tag, 32).toLowerCase())
          .filter(Boolean)
          .slice(0, 12)
      : [],
    startName: asString(raw.startName, 120),
    points,
    youtubeUrl: asString(raw.youtubeUrl, 300) || undefined,
    published: raw.published !== false,
  };

  try {
    const route = await createRoute(input);
    return NextResponse.json({ slug: route.slug, id: route.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creando la ruta." },
      { status: 500 },
    );
  }
}
