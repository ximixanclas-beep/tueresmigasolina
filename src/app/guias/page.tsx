import Link from "next/link";
import type { Metadata } from "next";
import { toJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guía GPX para moto: cómo descargar, cargar y seguir tracks",
  description:
    "Aprende a descargar tracks GPX de rutas en moto, cargarlos en Calimoto, Garmin, TomTom u OsmAnd y seguirlos en carretera. Guía práctica gratis.",
  alternates: { canonical: "/guias" },
  openGraph: {
    title: "Guía GPX para moto | Tueresmigasolina",
    description:
      "Cómo descargar y usar tracks GPX en tu navegador o app de navegación.",
    url: "/guias",
  },
};

const guides = [
  {
    title: "1. Descarga el GPX",
    body: "En la ficha de cada ruta encontrarás el botón «Descargar GPX». El archivo pesa muy poco (normalmente menos de 1 MB) y se guarda en tu móvil u ordenador.",
  },
  {
    title: "2. Transfiérelo a tu dispositivo de navegación",
    body: "Conéctalo por USB o envíalo por email/WhatsApp a ti mismo. En el navegador Garmin o TomTom, busca la opción «Importar ruta» o «Cargar archivo GPX».",
  },
  {
    title: "3. Cárgalo en tu app favorita",
    body: "Calimoto, Kurviger, OsmAnd y Google Earth abren GPX directamente. En iOS, toca el archivo y elige la app. En Android, ábrelo desde el gestor de archivos.",
  },
  {
    title: "4. Síguelo en carretera",
    body: "Activa la navegación con el track cargado. Las apps te irán guiando punto a punto. Si el track tiene curvas cerradas, usa el modo «curvas» o «moto» de tu app.",
  },
  {
    title: "5. Comparte tu experiencia",
    body: "Si has rodado la ruta, deja un comentario en el vídeo del canal o propón la siguiente en Tu mandas. ¡Tú eres mi gasolina!",
  },
];

const tips = [
  "Descarga el GPX antes de salir: en montaña a veces no hay cobertura.",
  "Si tu navegador no acepta el archivo, prueba a abrirlo en el móvil y reenviarlo.",
  "Para rutas largas, divide el track en tramos en tu app.",
  "Comprueba el sentido de la ruta: algunos tracks son de ida y vuelta.",
  "Lleva siempre un respaldo en papel o captura de pantalla del mapa.",
];

export default function GuiasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Cómo usar un track GPX en moto",
    description:
      "Guía paso a paso para descargar y seguir tracks GPX de rutas en moto.",
    totalTime: "PT5M",
    step: guides.map((g, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: g.title,
      text: g.body,
    })),
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
        <span>Guías</span>
      </nav>

      <h1>Guía GPX para moto</h1>
      <p className="lead" style={{ maxWidth: "42rem" }}>
        Cómo descargar un track GPX, cargarlo en tu navegador o app y seguirlo en
        carretera. Cinco pasos y listo.
      </p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        {guides.map((g) => (
          <div className="panel" key={g.title} style={{ padding: "1.2rem 1.4rem" }}>
            <h2 style={{ fontSize: "1.2rem" }}>{g.title}</h2>
            <p style={{ color: "var(--muted)", marginBottom: 0 }}>{g.body}</p>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: "2rem" }}>
        <h2>Consejos de riders</h2>
        <ul style={{ color: "var(--muted)", paddingLeft: "1.2rem" }}>
          {tips.map((tip) => (
            <li key={tip} style={{ marginBottom: "0.4rem" }}>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="actions" style={{ marginTop: "1.5rem" }}>
        <Link className="btn primary" href="/rutas">
          Ver rutas con GPX
        </Link>
        <Link className="btn ghost" href="/faq">
          Preguntas frecuentes
        </Link>
      </div>
    </div>
  );
}
