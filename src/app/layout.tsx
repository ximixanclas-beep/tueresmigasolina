import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import InstallPWA from "@/components/InstallPWA";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const channelName = process.env.NEXT_PUBLIC_CHANNEL_NAME ?? "Tueresmigasolina";
const youtubeUrl =
  process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@Tueresmigasolina";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
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
              <a href={youtubeUrl} rel="me noopener" target="_blank">
                Canal de YouTube
              </a>
              <Link href="/nueva">Publicar ruta</Link>
              <a href="/sitemap.xml">Sitemap</a>
            </div>
          </div>
        </footer>
        <InstallPWA />
      </body>
    </html>
  );
}
