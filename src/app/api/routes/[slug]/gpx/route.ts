import { getRouteBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);

  if (!route) {
    return new Response("Ruta no encontrada", { status: 404 });
  }

  const trackPoints = route.points
    .map(
      (point) =>
        `      <trkpt lat="${point.lat}" lon="${point.lng}">${
          typeof point.ele === "number" ? `<ele>${point.ele}</ele>` : ""
        }</trkpt>`,
    )
    .join("\n");

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Tueresmigasolina" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(route.title)}</name>
    <desc>${escapeXml(route.summary)}</desc>
  </metadata>
  <trk>
    <name>${escapeXml(route.title)}</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>
`;

  return new Response(gpx, {
    headers: {
      "Content-Type": "application/gpx+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${route.slug}.gpx"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
