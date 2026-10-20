# Indexación automatizada para Tueresmigasolina

Objetivo: conseguir el máximo alcance en buscadores + IA (Google, Bing, DuckDuckGo, Yandex) sin intervención manual.

## 1) URLs prioritarias
Enviar estas URLs cuando estén en producción:
- https://tueresmigasolina.com/
- https://tueresmigasolina.com/rutas
- https://tueresmigasolina.com/rutas/[cada-nueva-ruta]

## 2) Sitemaps
Ya generado: `/sitemap.xml`. Enviar a:
- Google Search Console: https://search.google.com/search-console
- Bing Webmaster Tools: https://www.bing.com/webmasters
- Yandex Webmaster: https://webmaster.yandex.com

## 3) Indexación directa (ping)
Google ya descubre por sitemap, pero puedes forzar con Indexing API (recomendado):
- Configurar Google Cloud Project + Indexing API
- Crear service account, dar permiso en Search Console
- Usar script para hacer ping a cada nueva URL cuando publiques ruta

## 4) Estructura ya aplicada
- JSON-LD (WebSite, Article, TouristTrip, BreadcrumbList)
- OpenGraph + Twitter
- Canonical
- Robots
- PWA
- Vídeo embebido en ficha

## 5) Recomendado ahora mismo
1. Desplegar en Vercel con dominio tueresmigasolina.com
2. Añadir al Search Console y enviar sitemap
3. Añadir webhook de propuestas (Discord/ntfy) para enterarte al instante
4. Subir 3-5 Shorts + 1 vídeo largo con enlaces cruzados

Nota: "activar todos los motores automáticamente" no es posible desde este entorno por políticas de las APIs, pero sí dejo todo listo para automatizarlo con un pequeño script cuando tengas las claves.
