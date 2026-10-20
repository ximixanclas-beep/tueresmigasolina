import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import InstallPWA from "@/components/InstallPWA";
import { siteUrl, toJsonLd, youtubeUrl, contactEmail } from "@/lib/seo";

const channelName = process.env.NEXT_PUBLIC_CHANNEL_NAME ?? "Tueresmigasolina";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${channelName} — Rutas en moto, GPX y carreteras con curvas`,
    template: `%s | ${channelName}`,
  },
  description:
    "Rutas en moto compartidas por Tueresmigasolina: trackes GPX, mapas, puertos de montaña y las mejores carreteras para disfrutar de la moto. Descarga el GPX y sigue la ruta.",
  keywords: [
    "rutas en moto",
    "rutas moteras",
    "rutas en moto por España",
    "compartir rutas GPX",
    "track GPX moto",
    "carreteras con curvas",
    "puertos de montaña en moto",
    "Tueresmigasolina",
  ],
  authors: [{ name: channelName, url: youtubeUrl }],
  creator: channelName,
  publisher: channelName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: channelName,
    title: `${channelName} — Rutas en moto y GPX`,
    description:
      "Mapas, trackes GPX y las mejores carreteras para rutas en moto. Comparte tus rutas con la comunidad.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${channelName} — Rutas en moto y GPX`,
    description: "Rutas en moto con mapa y GPX descargable.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "travel",
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  width: "device-width",
  initialScale: 1,
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: channelName,
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
      name: channelName,
      url: youtubeUrl,
            sameAs: [youtubeUrl, ...(contactEmail ? [`mailto:${contactEmail}`] : [])],
      description:
        "Canal de rutas en moto: carreteras con curvas, puertos de montaña y trackes GPX.",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(siteJsonLd) }}
        />
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container inner">
            <div>
              <strong>{channelName}</strong> — rutas en moto, GPX y buenas curvas.
              <br />
              <span>Hecho para riders. Contenido bajo licencia CC BY-NC 4.0.</span>
            </div>
            <div className="footer-links">
              <Link href="/rutas">Todas las rutas</Link>
              <Link href="/guias">Guías</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/sobre">Sobre</Link>
              <a href={youtubeUrl} rel="me noopener" target="_blank">
                YouTube
              </a>
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} rel="me">Email</a>
              )}
              <Link href="/nueva">Publicar ruta</Link>
              <Link href="/panel">Panel</Link>
              <a href="/sitemap.xml">Sitemap</a>
            </div>
          </div>
        </footer>
        <InstallPWA />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
