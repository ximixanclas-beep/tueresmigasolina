# Tueresmigasolina — Rutas en moto

Web app instalable (PWA) para publicar y compartir rutas en moto con mapa, datos del track y descarga en GPX.

- **En vivo:** https://tueresmigasolina.vercel.app
- **Stack:** Next.js 16 (App Router) + TypeScript + Leaflet/OpenStreetMap
- **Datos:** Supabase (producción) o archivo local `.data/routes.json` (desarrollo)
- **SEO:** metadata dinámica, sitemap, robots, JSON-LD, Open Graph e imagen OG generada
- **PWA:** manifest, service worker, instalación desde el navegador
- **Alertas:** propuestas "Tu mandas" vía ntfy.sh (app instalada) + WhatsApp personal vía CallMeBot (ver `docs/alertas-propuestas.md`)

## Arrancar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. La app arranca con una ruta de ejemplo para que veas el flujo completo.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint |

## Publicar una ruta

1. Entra en `/nueva`.
2. Sube un GPX (máx. 8 MB). La app calcula distancia, desnivel y puntos.
3. Rellena título, resumen, región, duración, dificultad y firme.
4. Introduce el `ADMIN_CODE` y publica.

La ruta aparece en `/rutas` y en su URL `/rutas/<slug>`, con mapa y botón de descarga GPX.

## Configuración

Copia `.env.example` a `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://tudominio.com
NEXT_PUBLIC_CHANNEL_NAME=Tueresmigasolina
NEXT_PUBLIC_YOUTUBE_URL=https://www.youtube.com/@Tueresmigasolina
ADMIN_CODE=un-codigo-largo-y-secreto
```

`ADMIN_CODE` es obligatorio en producción. Sin él, cualquiera podría publicar rutas.

### Supabase (opcional en local, recomendado en producción)

1. Crea un proyecto en https://supabase.com.
2. Abre el SQL Editor y ejecuta `supabase/schema.sql`.
3. Copia en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo servidor; nunca la expongas en el cliente)
4. Si estas variables no existen, la app usa `.data/routes.json` automáticamente.

La tabla tiene RLS activado: lectura pública solo de rutas publicadas; las escrituras se hacen desde el servidor con la service role key.

## Desplegar

La opción más rápida es Vercel:

1. Sube el proyecto a un repositorio de GitHub.
2. Importa el repo en Vercel.
3. Añade las variables de entorno del apartado anterior.
4. Define el dominio (por ejemplo `tueresmigasolina.com`) y configura `NEXT_PUBLIC_SITE_URL` con la URL final.
5. Tras el despliegue, envía `https://tudominio.com/sitemap.xml` en Google Search Console.

## Estructura

```
src/app/            Páginas, API, sitemap, robots, manifest, iconos y OG image
src/components/     Mapa Leaflet, subida de GPX, instalación PWA
src/lib/            Tipos, parseo GPX, acceso a datos, SEO y formato
supabase/schema.sql Tabla routes + RLS
public/sw.js        Service worker
docs/seo-youtube.md Plan de posicionamiento del canal
```

## Notas

- Los mapas usan tiles públicos de OpenStreetMap: para mucho tráfico, considera un proveedor de tiles o Mapbox.
- El service worker solo se registra en producción (`npm run build && npm run start`).
- Las rutas de ejemplo están marcadas con la etiqueta `ejemplo`; bórralas cuando publiques las tuyas.
