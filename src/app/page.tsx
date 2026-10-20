import Link from "next/link";
import HeroMotorbike from "@/components/HeroMotorbike";
import RouteProposal from "@/components/RouteProposal";
import { listRoutes } from "@/lib/store";
import { difficultyLabels, formatKm } from "@/lib/format";
import { siteUrl, toJsonLd, youtubeUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const routes = await listRoutes();
  const totalKm = routes.reduce((sum, route) => sum + route.distanceKm, 0);
  const totalRoutes = routes.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Tueresmigasolina",
        alternateName: "Tu eres mi gasolina",
        url: siteUrl,
        inLanguage: "es",
        description:
          "Rutas en moto con mapa, track GPX descargable y las mejores carreteras con curvas.",
        publisher: { "@id": `${siteUrl}/#canal` },
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#canal`,
        name: "Tueresmigasolina",
        url: youtubeUrl,
        sameAs: [youtubeUrl],
        description:
          "Canal de rutas en moto: carreteras con curvas, puertos de montaña y trackes GPX.",
      },
      {
        "@type": "ItemList",
        name: "Rutas en moto publicadas",
        numberOfItems: routes.length,
        itemListElement: routes.slice(0, 20).map((route, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: route.title,
          url: `${siteUrl}/rutas/${route.slug}`,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />

      <section className="container hero">
        <div>
          <span className="eyebrow">Rutas en moto · GPX · YouTube</span>
          <h1>Las mejores rutas en moto, con mapa y GPX descargable</h1>
          <p className="lead">
            Soy <strong>Tueresmigasolina</strong>. Aquí reúno las rutas que grabo en el
            canal: carreteras con curvas, puertos de montaña y paradas que merecen la
            pena. Abre el mapa, descarga el track y sal a rodar.
          </p>
          <div className="actions">
            <Link className="btn primary" href="/rutas">
              Ver rutas publicadas
            </Link>
            <a className="btn ghost" href={youtubeUrl} target="_blank" rel="noopener">
              Ver el canal en YouTube
            </a>
            <Link className="btn ghost" href="/nueva">
              Publicar una ruta
            </Link>
          </div>
          <div className="stats">
            <div className="stat">
              <strong>{totalRoutes}</strong>
              <span>rutas publicadas</span>
            </div>
            <div className="stat">
              <strong>{Math.round(totalKm)} km</strong>
              <span>de curvas acumuladas</span>
            </div>
            <div className="stat">
              <strong>GPX</strong>
              <span>listo para tu navegador</span>
            </div>
          </div>
        </div>

        <HeroMotorbike />
      </section>

      <section className="container section" id="rutas">
        <div className="section-head">
          <div>
            <h2>Últimas rutas en moto</h2>
            <p>Aquí abajo agréganos tus rutas preferidas y pronto nos pondremos en contacto contigo.</p>
          </div>
          <Link href="/rutas">Ver todas →</Link>
        </div>

        {routes.length === 0 ? (
          <div className="empty">
            Todavía no hay rutas publicadas. Sube tu primer GPX desde{" "}
            <Link href="/nueva">Publicar ruta</Link>.
          </div>
        ) : (
          <div className="grid">
            {routes.slice(0, 6).map((route) => (
              <Link className="card" href={`/rutas/${route.slug}`} key={route.id}>
                <div className="meta">
                  <span className="chip accent">{difficultyLabels[route.difficulty]}</span>
                  <span className="chip">{formatKm(route.distanceKm)}</span>
                  <span className="chip">{route.region || "Sin región"}</span>
                </div>
                <h3>{route.title}</h3>
                <p>{route.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container section" id="contacto">
        <div className="tu-mandas">
          <div className="tu-mandas-head">
            <span className="chip accent">Tu mandas</span>
            <h2>Agrega tu ruta aquí</h2>
            <p>
              Propones la ruta, tú eres el protagonista. Aquí abajo agréganos tus rutas
              preferidas y pronto nos pondremos en contacto contigo para rodarla juntos y
              publicarla con tu nombre y tu track. <strong>¡Tú eres mi gasolina!</strong>
            </p>
          </div>

          <RouteProposal />
        </div>
      </section>

      <section className="container section prose">
        <h2>Rutas en moto por España: carreteras con curvas y GPX</h2>
        <p>
          Buscar rutas en moto que merezcan la pena no siempre es fácil. Entre mapas
          genéricos, tracks sin datos y vídeos que no dicen dónde empieza la carretera,
          acabas perdiendo más tiempo planeando que rodando. Esta web nace para lo
          contrario: cada ruta en moto viene con su mapa, su track GPX, su desnivel y una
          descripción honesta de lo que te vas a encontrar.
        </p>
        <p>
          Aquí encontrarás rutas moteras por la sierra, puertos de montaña, carreteras
          secundarias con buen asfalto y rutas mixtas para cuando apetece salir del
          asfalto. Puedes filtrar por dificultad y por tipo de firme, abrir el recorrido
          en el mapa y descargar el GPX para tu TomTom, Garmin, Calimoto o la app que
          uses.
        </p>
        <p>
          Si sigues el canal <strong>Tueresmigasolina</strong> en YouTube, reconocerás
          muchas de estas carreteras: son las mismas que aparecen en los vídeos, con los
          mismos miradores y las mismas paradas. La diferencia es que aquí puedes
          llevártelas contigo.
        </p>
      </section>
    </>
  );
}
