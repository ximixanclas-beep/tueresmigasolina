import type { Metadata } from "next";
import RouteUploader from "@/components/RouteUploader";

export const metadata: Metadata = {
  title: "Publicar una ruta en moto",
  description:
    "Sube un archivo GPX y publica tu ruta en moto con mapa, datos del track y descarga para la comunidad.",
  robots: { index: false, follow: false },
};

export default function NewRoutePage() {
  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <h1>Publicar una ruta</h1>
          <p>
            Sube el GPX, revisa los datos que se calculan solos y publica. La ruta
            aparecerá en el listado con su mapa y su track descargable.
          </p>
        </div>
      </div>
      <RouteUploader />
    </div>
  );
}
