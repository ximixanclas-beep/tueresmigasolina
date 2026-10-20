import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RouteMap from "@/components/RouteMap";
import { getRouteBySlug } from "@/lib/store";
import {
  difficultyLabels,
  formatDate,
  formatDuration,
  formatKm,
  surfaceLabels,
} from "@/lib/format";
import { siteUrl, toJsonLd, youtubeUrl as channelUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function getYoutubeId(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v") ?? "";
    }
    const parts = parsed.pathname.split("/");
    return parts[parts.length - 1] ?? "";
  } catch {
    return "";
  }
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) {
    return { title: "Ruta no encontrada", robots: { index: false, follow: false } };
  }

  const description =
    route.summary ||
    `${route.title}: ruta en moto de ${formatKm(route.distanceKm)} en ${route.region}. Mapa y track GPX descargable.`;

  return {
    title: `${route.title} — ruta en moto`,
    description,
    alternates: { canonical: `/rutas/${route.slug}` },
    openGraph: {
      type: "article",
      title: `${route.title} — ruta en moto`,
      description,
      url: `/rutas/${route.slug}`,
      publishedTime: route.createdAt,
      modifiedTime: route.updatedAt,
      tags: route.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: `${route.title} — ruta en moto`,
      description,
    },
  };
}

export default async function RouteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${route.title} — ruta en moto`,
        description: route.summary,
        inLanguage: "es",
        datePublished: route.createdAt,
        dateModified: route.updatedAt,
        keywords: route.tags.join(", "),
        articleSection: "Rutas en moto",
        author: {
          "@type": "Person",
          name: "Tueresmigasolina",
          url: channelUrl,
        },
        mainEntityOfPage: `${siteUrl}/rutas/${route.slug}`,
        about: {
          "@type": "TouristTrip",
          name: route.title,
          description: route.summary,
          touristType: "Motociclistas",
          itinerary: {
            "@type": "ItemList",
            numberOfItems: route.points.length,
            itemListElement: route.points.slice(0, 50).map((point, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Place",
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: point.lat,
                  longitude: point.lng,
                },
              },
            })),
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Rutas", item: `${siteUrl}/rutas` },
          {
            "@type": "ListItem",
            position: 3,
            name: route.title,
            item: `${siteUrl}/rutas/${route.slug}`,
          },
        ],
      },
    ],
  };

  const videoUrl = route.youtubeUrl || channelUrl;

  return (
    <div className="container section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />

      <nav className="meta" aria-label="Migas de pan" style={{ marginBottom: "1rem" }}>
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rutas">Rutas</Link>
        <span aria-hidden="true">/</span>
        <span>{route.title}</span>
      </nav>

      <h1>{route.title}</h1>
      <div className="meta" style={{ marginBottom: "1.2rem" }}>
        <span className="chip accent">{difficultyLabels[route.difficulty]}</span>
        <span className="chip">{surfaceLabels[route.surface]}</span>
        <span className="chip">{formatKm(route.distanceKm)}</span>
        <span className="chip">{formatDuration(route.durationMin)}</span>
        {route.elevationGainM > 0 && (
          <span className="chip">+{route.elevationGainM} m</span>
        )}
      </div>

      <RouteMap points={route.points} title={route.title} />

      <div className="route-layout" style={{ marginTop: "1.5rem" }}>
        <article className="panel">
          <h2>Sobre esta ruta en moto</h2>
          <p className="prose">{route.description || route.summary}</p>
          {route.tags.length > 0 && (
            <div className="meta" style={{ marginTop: "1rem" }}>
              {route.tags.map((tag) => (
                <span className="chip" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        <aside className="panel">
          <h2>Datos del track</h2>
          <dl className="kv">
            <dt>Salida</dt>
            <dd>{route.startName || "—"}</dd>
            <dt>Región</dt>
            <dd>{route.region || "—"}</dd>
            <dt>Distancia</dt>
            <dd>{formatKm(route.distanceKm)}</dd>
            <dt>Duración estimada</dt>
            <dd>{formatDuration(route.durationMin)}</dd>
            <dt>Desnivel positivo</dt>
            <dd>{route.elevationGainM ? `${route.elevationGainM} m` : "—"}</dd>
            <dt>Dificultad</dt>
            <dd>{difficultyLabels[route.difficulty]}</dd>
            <dt>Firme</dt>
            <dd>{surfaceLabels[route.surface]}</dd>
            <dt>Publicada</dt>
            <dd>{formatDate(route.createdAt)}</dd>
          </dl>

          <div className="actions">
            <a className="btn primary" href={`/api/routes/${route.slug}/gpx`} download>
              Descargar GPX
            </a>
            {videoUrl && (
              <a className="btn ghost" href={videoUrl} target="_blank" rel="noopener">
                Ver vídeo
              </a>
            )}
          </div>
        </aside>
      </div>

      {videoUrl && (
        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h2>Ver el vídeo de esta ruta</h2>
          <p style={{ color: "var(--muted)" }}>
            La ruta completa grabada por Tueresmigasolina en el canal.
          </p>
          <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: "12px", overflow: "hidden" }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(videoUrl)}`}
              title={`Vídeo de ${route.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
