import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { RouteCard, RouteInput, RouteRecord } from "./types";
import { getSupabaseAdmin, hasSupabase } from "./supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "routes.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function toCard(route: RouteRecord): RouteCard {
  const card: RouteCard = { ...route };
  delete (card as Partial<RouteRecord>).points;
  return card;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function rowToRoute(row: Record<string, unknown>): RouteRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary ?? ""),
    description: String(row.description ?? ""),
    region: String(row.region ?? ""),
    distanceKm: Number(row.distance_km ?? 0),
    durationMin: Number(row.duration_min ?? 0),
    elevationGainM: Number(row.elevation_gain_m ?? 0),
    difficulty: (row.difficulty as RouteRecord["difficulty"]) ?? "media",
    surface: (row.surface as RouteRecord["surface"]) ?? "asfalto",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    startName: String(row.start_name ?? ""),
    points: Array.isArray(row.points) ? (row.points as RouteRecord["points"]) : [],
    youtubeUrl: row.youtube_url ? String(row.youtube_url) : undefined,
    published: Boolean(row.published),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function readLocal(): Promise<RouteRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RouteRecord[]) : [];
  } catch {
    return seedRoutes();
  }
}

async function writeLocal(routes: RouteRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(routes, null, 2), "utf8");
}

export async function listRoutes(): Promise<RouteCard[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("routes")
      .select(
        "id,slug,title,summary,description,region,distance_km,duration_min,elevation_gain_m,difficulty,surface,tags,start_name,youtube_url,published,created_at,updated_at",
      )
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase: ${error.message}`);
    return (data ?? []).map((row) => toCard(rowToRoute({ ...row, points: [] })));
  }

  const routes = await readLocal();
  return routes
    .filter((route) => route.published)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toCard);
}

export async function getRouteBySlug(slug: string): Promise<RouteRecord | null> {
  if (hasSupabase()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data ? rowToRoute(data) : null;
  }

  const routes = await readLocal();
  return routes.find((route) => route.slug === slug && route.published) ?? null;
}

export async function createRoute(input: RouteInput): Promise<RouteRecord> {
  const now = new Date().toISOString();
  const baseSlug = slugify(input.title) || `ruta-${Date.now()}`;
  const route: RouteRecord = {
    ...input,
    id: randomUUID(),
    slug: baseSlug,
    createdAt: now,
    updatedAt: now,
  };

  if (hasSupabase()) {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("routes")
      .select("slug")
      .eq("slug", baseSlug)
      .maybeSingle();
    if (existing) route.slug = `${baseSlug}-${route.id.slice(0, 6)}`;

    const { data, error } = await supabase
      .from("routes")
      .insert({
        id: route.id,
        slug: route.slug,
        title: route.title,
        summary: route.summary,
        description: route.description,
        region: route.region,
        distance_km: route.distanceKm,
        duration_min: route.durationMin,
        elevation_gain_m: route.elevationGainM,
        difficulty: route.difficulty,
        surface: route.surface,
        tags: route.tags,
        start_name: route.startName,
        points: route.points,
        youtube_url: route.youtubeUrl ?? null,
        published: route.published,
        created_at: route.createdAt,
        updated_at: route.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return rowToRoute(data);
  }

  const result = writeQueue.then(async () => {
    const routes = await readLocal();
    if (routes.some((item) => item.slug === route.slug)) {
      route.slug = `${baseSlug}-${route.id.slice(0, 6)}`;
    }
    routes.push(route);
    await writeLocal(routes);
    return route;
  });
  writeQueue = result.catch(() => undefined);
  return result;
}

export async function seedIfEmpty(): Promise<void> {
  if (hasSupabase()) return;
  const routes = await readLocal();
  if (routes.length === 0) await writeLocal(seedRoutes());
}

function seedRoutes(): RouteRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: "ruta-ejemplo-madrid-navacerrada-segovia",
      slug: "madrid-navacerrada-segovia",
      title: "Madrid – Navacerrada – Segovia",
      summary:
        "Ruta de ejemplo por la sierra de Guadarrama: puertos de montaña, curvas y llegada a Segovia por La Granja.",
      description:
        "Ruta de ejemplo para probar la app. Sale de Madrid, sube por Collado Villalba hasta Navacerrada y corona el puerto antes de bajar a La Granja y terminar en Segovia. Ideal para una mañana de moto con paradas en miradores. Sustituye esta ruta por las tuyas subiendo un GPX.",
      region: "Comunidad de Madrid / Castilla y León",
      distanceKm: 92.4,
      durationMin: 120,
      elevationGainM: 1180,
      difficulty: "media",
      surface: "asfalto",
      tags: ["ejemplo", "sierra", "puerto de montaña"],
      startName: "Madrid",
      youtubeUrl: "",
      published: true,
      createdAt: now,
      updatedAt: now,
      points: [
        { lat: 40.4168, lng: -3.7038, ele: 650 },
        { lat: 40.4521, lng: -3.7522, ele: 690 },
        { lat: 40.4897, lng: -3.8012, ele: 720 },
        { lat: 40.5275, lng: -3.8584, ele: 760 },
        { lat: 40.5704, lng: -3.9187, ele: 800 },
        { lat: 40.6083, lng: -3.9622, ele: 830 },
        { lat: 40.6415, lng: -4.0068, ele: 860 },
        { lat: 40.6762, lng: -4.0129, ele: 920 },
        { lat: 40.7048, lng: -4.0142, ele: 1000 },
        { lat: 40.7294, lng: -4.0153, ele: 1100 },
        { lat: 40.7521, lng: -4.0117, ele: 1300 },
        { lat: 40.7742, lng: -4.0071, ele: 1600 },
        { lat: 40.7889, lng: -4.0032, ele: 1860 },
        { lat: 40.8072, lng: -4.0038, ele: 1750 },
        { lat: 40.8275, lng: -4.0021, ele: 1500 },
        { lat: 40.8489, lng: -3.9994, ele: 1250 },
        { lat: 40.8698, lng: -4.0028, ele: 1180 },
        { lat: 40.8891, lng: -4.0041, ele: 1150 },
        { lat: 40.9020, lng: -4.0050, ele: 1190 },
        { lat: 40.9167, lng: -4.0334, ele: 1050 },
        { lat: 40.9302, lng: -4.0699, ele: 950 },
        { lat: 40.9429, lng: -4.1088, ele: 1005 },
      ],
    },
  ];
}
