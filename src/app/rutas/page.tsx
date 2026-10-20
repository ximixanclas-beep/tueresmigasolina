import type { Metadata } from "next";
import Link from "next/link";
import { listRoutes } from "@/lib/store";
import { difficultyLabels, formatKm, surfaceLabels } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Todas las rutas en moto",
  description:
    "Listado completo de rutas en moto con mapa, dificultad, desnivel y track GPX descargable. Carreteras con curvas y puertos de montaña.",
  alternates: { canonical: "/rutas" },
};

export default async function RoutesPage() {
  const routes = await listRoutes();

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <h1>Todas las rutas en moto</h1>
          <p>
            {routes.length} {routes.length === 1 ? "ruta publicada" : "rutas publicadas"} con
            mapa y GPX descargable.
          </p>
        </div>
        <Link className="btn ghost" href="/nueva">
          + Publicar ruta
        </Link>
      </div>

      {routes.length === 0 ? (
        <div className="empty">
          Aún no hay rutas. Publica la primera desde <Link href="/nueva">aquí</Link>.
        </div>
      ) : (
        <div className="grid">
          {routes.map((route) => (
            <Link className="card" href={`/rutas/${route.slug}`} key={route.id}>
              <div className="meta">
                <span className="chip accent">{difficultyLabels[route.difficulty]}</span>
                <span className="chip">{surfaceLabels[route.surface]}</span>
                <span className="chip">{formatKm(route.distanceKm)}</span>
              </div>
              <h3>{route.title}</h3>
              <p>{route.summary}</p>
              <div className="meta">
                <span>{route.region || "Sin región"}</span>
                {route.elevationGainM > 0 && (
                  <span>· +{route.elevationGainM} m desnivel</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
