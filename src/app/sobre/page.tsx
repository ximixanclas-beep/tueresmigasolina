import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl, toJsonLd, youtubeUrl } from "@/lib/seo";

const channelName = process.env.NEXT_PUBLIC_CHANNEL_NAME ?? "Tueresmigasolina";

export const metadata: Metadata = {
  title: `Sobre ${channelName}: rutas en moto, GPX y comunidad`,
  description:
    "Quién está detrás de Tueresmigasolina: canal de YouTube de rutas en moto, web con tracks GPX gratis y la sección Tu mandas donde tú propones la próxima ruta.",
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: `Sobre ${channelName}`,
    description: "Canal de rutas en moto + web con GPX gratis. Conoce el proyecto.",
    url: "/sobre",
  },
};

export default function SobrePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `Sobre ${channelName}`,
    url: `${siteUrl}/sobre`,
    mainEntity: {
      "@type": "Person",
      name: channelName,
      url: youtubeUrl,
      sameAs: [youtubeUrl],
      description:
        "Creador de contenido de rutas en moto: carreteras con curvas, puertos de montaña y tracks GPX.",
    },
  };

  return (
    <div className="container section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <nav className="meta" aria-label="Migas de pan" style={{ marginBottom: "1rem" }}>
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <span>Sobre</span>
      </nav>

      <h1>Sobre Tueresmigasolina</h1>

      <div className="route-layout" style={{ marginTop: "1.5rem" }}>
        <article className="panel">
          <h2>¿Qué es esto?</h2>
          <p>
            <strong>Tueresmigasolina</strong> es un proyecto de rutas en moto. Nació en
            YouTube compartiendo carreteras con curvas, puertos de montaña y paradas que
            merecen la pena. Esta web es el complemento perfecto: aquí encuentras el mapa,
            el track GPX y todos los datos de cada ruta que grabo.
          </p>
          <p>
            La filosofía es simple: cada ruta en moto debe venir con su mapa, su GPX y una
            descripción honesta de lo que te vas a encontrar. Nada de tracks sin contexto
            ni vídeos que no dicen dónde empieza la carretera.
          </p>

          <h2 style={{ marginTop: "1.5rem" }}>Tu mandas</h2>
          <p>
            La sección <strong>Tu mandas</strong> es la protagonista. Tú propones la ruta,
            yo la grabo y la publico aquí y en el canal con tu nombre. Es la forma de que
            la comunidad decida qué carreteras merecen un vídeo.
          </p>
          <p>
            Si tienes una ruta que crees que merece aparecer,{" "}
            <Link href="/#contacto">propónla desde aquí</Link>.
          </p>

          <h2 style={{ marginTop: "1.5rem" }}>Licencia y uso</h2>
          <p>
            El contenido de esta web está bajo licencia{" "}
            <strong>CC BY-NC 4.0</strong>: puedes compartirlo y usarlo para uso personal,
            siempre que menciones la fuente. No se permite uso comercial sin permiso.
          </p>
        </article>

        <aside className="panel">
          <h2>Enlaces</h2>
          <ul style={{ paddingLeft: "1.1rem", color: "var(--muted)" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <a href={youtubeUrl} target="_blank" rel="noopener">
                Canal de YouTube
              </a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link href="/rutas">Rutas publicadas</Link>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link href="/guias">Guía GPX</Link>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link href="/faq">Preguntas frecuentes</Link>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link href="/nueva">Publicar una ruta</Link>
            </li>
          </ul>

          <div className="actions" style={{ marginTop: "1.2rem" }}>
            <a className="btn primary" href={youtubeUrl} target="_blank" rel="noopener">
              Suscribirse en YouTube
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
