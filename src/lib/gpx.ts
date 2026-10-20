import type { RoutePoint } from "./types";

const EARTH_RADIUS_KM = 6371;

function haversineKm(a: RoutePoint, b: RoutePoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export interface GpxResult {
  name: string;
  points: RoutePoint[];
  distanceKm: number;
  elevationGainM: number;
}

export function parseGpx(xml: string): GpxResult {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("El archivo GPX no es valido.");
  }

  const name =
    doc.querySelector("trk > name, rte > name, metadata > name")?.textContent?.trim() ??
    "";

  const nodes = Array.from(doc.querySelectorAll("trkpt, rtept"));
  if (nodes.length < 2) {
    throw new Error("El GPX no contiene suficientes puntos de ruta.");
  }

  const points: RoutePoint[] = [];
  for (const node of nodes) {
    const lat = Number.parseFloat(node.getAttribute("lat") ?? "");
    const lng = Number.parseFloat(node.getAttribute("lon") ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const eleText = node.querySelector("ele")?.textContent;
    const ele = eleText ? Number.parseFloat(eleText) : undefined;
    points.push(Number.isFinite(ele) ? { lat, lng, ele } : { lat, lng });
  }

  if (points.length < 2) {
    throw new Error("No se han podido leer coordenadas del GPX.");
  }

  const simplified = simplify(points, 4000);

  let distanceKm = 0;
  let elevationGainM = 0;
  for (let i = 1; i < points.length; i += 1) {
    distanceKm += haversineKm(points[i - 1], points[i]);
    const prevEle = points[i - 1].ele;
    const ele = points[i].ele;
    if (typeof prevEle === "number" && typeof ele === "number" && ele > prevEle) {
      elevationGainM += ele - prevEle;
    }
  }

  return {
    name,
    points: simplified,
    distanceKm: Math.round(distanceKm * 10) / 10,
    elevationGainM: Math.round(elevationGainM),
  };
}

function simplify(points: RoutePoint[], maxPoints: number): RoutePoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const result = points.filter((_, index) => index % step === 0);
  const last = points[points.length - 1];
  if (result[result.length - 1] !== last) result.push(last);
  return result;
}
