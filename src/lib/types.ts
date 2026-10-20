export type Difficulty = "facil" | "media" | "alta";
export type Surface = "asfalto" | "mixto" | "tierra";

export type LngLat = [number, number];

export interface RoutePoint {
  lat: number;
  lng: number;
  ele?: number;
}

export interface RouteRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  region: string;
  distanceKm: number;
  durationMin: number;
  elevationGainM: number;
  difficulty: Difficulty;
  surface: Surface;
  tags: string[];
  startName: string;
  points: RoutePoint[];
  youtubeUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteInput {
  title: string;
  summary: string;
  description: string;
  region: string;
  distanceKm: number;
  durationMin: number;
  elevationGainM: number;
  difficulty: Difficulty;
  surface: Surface;
  tags: string[];
  startName: string;
  points: RoutePoint[];
  youtubeUrl?: string;
  published: boolean;
}

export type RouteCard = Omit<RouteRecord, "points">;
