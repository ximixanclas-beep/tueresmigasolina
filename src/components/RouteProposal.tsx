"use client";

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
const youtubeUrl =
  process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@Tueresmigasolina";

export default function RouteProposal() {
  const subject = encodeURIComponent("Tu mandas: propuesta de ruta");
  const body = encodeURIComponent(
    [
      "Nombre:",
      "Contacto:",
      "Lugar de inicio:",
      "Días de la ruta (fin de semana o puente):",
      "",
      "Cuéntame más:",
    ].join("\n"),
  );
  const mailto = `mailto:${email}?subject=${subject}&body=${body}`;

  return (
    <div className="about" id="propuesta">
      <div>
        <h3>¿Cómo funciona?</h3>
        <ul>
          <li>Cuéntame el lugar de inicio y si la quieres de fin de semana o de puente.</li>
          <li>Tu contacto es privado: solo lo uso yo para responderte.</li>
          <li>La rodamos juntos y la publico aquí y en el canal con tu nombre.</li>
          <li>Apareces como protagonista en la sección <strong>&ldquo;Tu mandas&rdquo;</strong>.</li>
        </ul>

        <div className="panel" style={{ marginTop: "1rem", padding: "1rem 1.2rem" }}>
          <strong style={{ display: "block", marginBottom: "0.4rem" }}>
            Envíame tu propuesta por email
          </strong>
          <p style={{ color: "var(--muted)", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
            Escríbeme un email indicando el <strong>lugar de inicio</strong> y los
            <strong> días de la ruta</strong>. Las rutas son siempre de fin de semana,
            salvo puentes por festivo nacional (Día de la Hispanidad, la Pilarica,
            Navidades…).
          </p>
          {email ? (
            <a
              className="btn primary"
              href={mailto}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span aria-hidden="true">✉️</span> Enviar un email a {email}
            </a>
          ) : (
            <p style={{ margin: 0 }}>
              <span className="chip">Email por completar</span>
            </p>
          )}
          <div className="actions" style={{ marginTop: "0.7rem" }}>
            <a className="btn ghost" href={youtubeUrl} target="_blank" rel="noopener">
              Comentario en YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
