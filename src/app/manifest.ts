import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tueresmigasolina — Rutas en moto",
    short_name: "Migasolina",
    description:
      "Rutas en moto con mapa y track GPX descargable. Carreteras con curvas y puertos de montaña.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0b0d10",
    theme_color: "#0b0d10",
    lang: "es",
    categories: ["travel", "navigation", "sports"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Ver rutas",
        short_name: "Rutas",
        url: "/rutas",
        description: "Listado de rutas en moto con GPX",
      },
      {
        name: "Publicar ruta",
        short_name: "Publicar",
        url: "/nueva",
        description: "Sube un GPX y publica una ruta",
      },
    ],
  };
}
