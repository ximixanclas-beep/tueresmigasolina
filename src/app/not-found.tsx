import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container section">
      <div className="panel" style={{ textAlign: "center", padding: "3rem" }}>
        <h1>Ruta no encontrada</h1>
        <p style={{ color: "var(--muted)" }}>
          La página que buscas no existe o la ruta ya no está publicada.
        </p>
        <div className="actions" style={{ justifyContent: "center" }}>
          <Link className="btn primary" href="/rutas">
            Ver todas las rutas
          </Link>
          <Link className="btn ghost" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
