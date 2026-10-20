import type { Difficulty, Surface } from "./types";

export const difficultyLabels: Record<Difficulty, string> = {
  facil: "Fácil",
  media: "Media",
  alta: "Alta",
};

export const surfaceLabels: Record<Surface, string> = {
  asfalto: "Asfalto",
  mixto: "Mixto",
  tierra: "Tierra",
};

export function formatDuration(minutes: number): string {
  if (!minutes) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(km)} km`;
}
