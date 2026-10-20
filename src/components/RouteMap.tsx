"use client";

import dynamic from "next/dynamic";
import type { RoutePoint } from "@/lib/types";

const RouteMapInner = dynamic(() => import("./RouteMapInner"), {
  ssr: false,
  loading: () => (
    <div className="map-wrap" aria-hidden="true">
      <div
        style={{
          height: "100%",
          display: "grid",
          placeItems: "center",
          color: "var(--muted)",
        }}
      >
        Cargando mapa…
      </div>
    </div>
  ),
});

export default function RouteMap({
  points,
  title,
}: {
  points: RoutePoint[];
  title: string;
}) {
  return <RouteMapInner points={points} title={title} />;
}
