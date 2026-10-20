"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RoutePoint } from "@/lib/types";

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, bounds]);
  return null;
}

export default function RouteMapInner({
  points,
  title,
}: {
  points: RoutePoint[];
  title: string;
}) {
  const latLngs = points.map((point) => [point.lat, point.lng] as [number, number]);
  const start = latLngs[0];
  const end = latLngs[latLngs.length - 1];
  const bounds: LatLngBoundsExpression = latLngs;
  const center: [number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
  ];

  return (
    <div className="map-wrap">
      <MapContainer center={center} zoom={9} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        <Polyline
          positions={latLngs}
          pathOptions={{ color: "#ff7a1a", weight: 4, opacity: 0.95 }}
        />
        <CircleMarker
          center={start}
          radius={8}
          pathOptions={{ color: "#0b0d10", fillColor: "#43d17c", fillOpacity: 1, weight: 2 }}
        >
          <Popup>Salida: {title}</Popup>
        </CircleMarker>
        <CircleMarker
          center={end}
          radius={8}
          pathOptions={{ color: "#0b0d10", fillColor: "#ff5a5a", fillOpacity: 1, weight: 2 }}
        >
          <Popup>Llegada</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
