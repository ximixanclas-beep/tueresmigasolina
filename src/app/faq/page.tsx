import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl, toJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Preguntas frecuentes sobre rutas en moto y GPX",
  description:
    "Todo sobre cómo descargar tracks GPX, usarlos en tu navegador, publicar rutas y la sección Tu mandas de Tueresmigasolina.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — Rutas en moto y GPX | Tueresmigasolina",
    description:
      "Cómo descargar y usar tracks GPX, publicar rutas y proponer rutas para Tu mandas.",
    url: "/faq",
  },
};

const faqs = [
  {
    q: "¿Qué es un track GPX?",
    a: "Un archivo GPX es un registro de un recorrido con puntos GPS (latitud, longitud y altitude). Se puede cargar en navegadores de moto (TomTom, Garmin), apps (Calimoto, OsmAnd, Kurviger) o visualizadores web para seguir la ruta en tiempo real.",
  },
  {
    q: "¿Cómo descargo el GPX de una ruta?",
    a: "Entra en la ficha de la ruta, pulsa el botón «Descargar GPX» y el archivo se guardará en tu dispositivo. Después impórtalo en tu navegador o app favorita.",
  },
  {
    q: "¿Las rutas son gratuitas?",
    a: "Sí. Todos los tracks publicados en Tueresmigasolina son gratuitos. Solo pedimos que menciones el canal si compartes la ruta.",
  },
  {
    q: "¿Cómo propongo una ruta para Tu mandas?",
    a: "Rellena el formulario de la home indicando el lugar de inicio, los días de la ruta y tu contacto. Las rutas son siempre de fin de semana, salvo puentes por festivo nacional (Día de la Hispanidad, la Pilarica, Navidades…). Si la elegimos, te contactamos para rodarla juntos y publicarla con tu nombre.",
  },
  {
    q: "¿Qué apps funcionan con estos GPX?",
    a: "Cualquier app que lea GPX: Calimoto, Kurviger, OsmAnd, Google Earth, Garmin BaseCamp, TomTom MyDrive, Wikiloc y navegadores de moto con soporte GPX.",
  },
  {
    q: "¿Cada ruta tiene vídeo en YouTube?",
    a: "Cuando la ruta se graba para el canal, el vídeo se incrusta en la ficha. Puedes ver todos los vídeos en el canal de YouTube de Tueresmigasolina.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
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
        <span>FAQ</span>
      </nav>

      <h1>Preguntas frecuentes</h1>
      <p className="lead" style={{ maxWidth: "42rem" }}>
        Todo lo que necesitas saber sobre rutas en moto, tracks GPX y la sección Tu
        mandas de {siteUrl.replace("https://", "")}.
      </p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        {faqs.map((faq) => (
          <details key={faq.q} className="panel" style={{ padding: "1.1rem 1.3rem" }}>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "1.05rem",
                listStyle: "none",
              }}
            >
              {faq.q}
            </summary>
            <p style={{ marginTop: "0.8rem", color: "var(--muted)" }}>{faq.a}</p>
          </details>
        ))}
      </div>

      <div className="panel" style={{ marginTop: "2rem" }}>
        <h2>¿No encuentras tu respuesta?</h2>
        <p style={{ color: "var(--muted)" }}>
          Escríbeme por el canal de YouTube o propón tu ruta desde la home en la sección
          Tu mandas.
        </p>
        <div className="actions">
          <Link className="btn primary" href="/#contacto">
            Proponer mi ruta
          </Link>
          <Link className="btn ghost" href="/guias">
            Guías de GPX
          </Link>
        </div>
      </div>
    </div>
  );
}
