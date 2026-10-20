"use client";

import { useState, type FormEvent } from "react";

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
const youtubeUrl =
  process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@Tueresmigasolina";

export default function RouteProposal() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [route, setRoute] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [viaWebhook, setViaWebhook] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, route, message }),
      });
      const data = (await res.json()) as { ok?: boolean; needsWebhook?: boolean };
      if (data.ok) {
        setViaWebhook(true);
      }
    } catch {
      // fallback to mail/wa
    } finally {
      setSending(false);
      setSent(true);
    }
  }

  const subject = encodeURIComponent(
    `Tu mandas: propuesta de ruta${name ? ` de ${name}` : ""}`,
  );
  const body = encodeURIComponent(
    [
      `Nombre: ${name}`,
      `Contacto: ${contact}`,
      `Ruta: ${route}`,
      "",
      message,
    ].join("\n"),
  );

  const mailto = `mailto:${email}?subject=${subject}&body=${body}`;
  const waText = encodeURIComponent(
    `Hola, soy ${name || "un motero"}. Quiero proponer una ruta para "Tu mandas": ${route}. ${message}`,
  );
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}?text=${waText}`
    : "";

  return (
    <div className="about" id="propuesta">
      <div>
        <h3>¿Cómo funciona?</h3>
        <ul>
          <li>Cuéntame la carretera, el punto de salida y por qué merece un vídeo.</li>
          <li>Me quedo con tu contacto y te aviso cuando sea el momento idóneo.</li>
          <li>La rodamos juntos y la publico aquí y en el canal con tu nombre.</li>
          <li>Apareces como protagonista en la sección <strong>&ldquo;Tu mandas&rdquo;</strong>.</li>
        </ul>
      </div>

      <form className="form panel" onSubmit={onSubmit}>
        <div className="row-2">
          <div className="field">
            <label htmlFor="prop-name">Tu nombre</label>
            <input
              id="prop-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Cómo te llamas o tu apodo motero"
            />
          </div>
          <div className="field">
            <label htmlFor="prop-contact">Tu contacto *</label>
            <input
              id="prop-contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="Email, teléfono o @usuario"
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="prop-route">Ruta que propones *</label>
          <input
            id="prop-route"
            value={route}
            onChange={(event) => setRoute(event.target.value)}
            placeholder="Ej: Puerto de la Quesera desde Riaza"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="prop-message">Cuéntame más</label>
          <textarea
            id="prop-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            placeholder="Kilómetros, tipo de carretera, mejores meses para rodarla…"
          />
        </div>

        {sent ? (
          <div className="notice ok">
            {viaWebhook ? (
              <>
                ¡Propuesta enviada! Te aviso en cuanto sea el momento idóneo para rodarla
                juntos.
              </>
            ) : (
              <>
                ¡Recibido! Mándame la propuesta para que me llegue tu contacto:
                <div className="actions" style={{ marginTop: "0.6rem" }}>
                  {email && (
                    <a className="btn primary" href={mailto}>
                      Enviar por email
                    </a>
                  )}
                  {whatsappUrl && (
                    <a
                      className="btn ghost"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      Enviar por WhatsApp
                    </a>
                  )}
                  <a className="btn ghost" href={youtubeUrl} target="_blank" rel="noopener">
                    Comentario en el canal
                  </a>
                </div>
                {!email && !whatsappUrl && (
                  <p style={{ marginTop: "0.6rem" }}>
                    Escríbeme por el canal de YouTube con estos datos y te contacto en
                    cuanto pueda.
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="actions">
            <button className="btn primary" type="submit" disabled={sending}>
              {sending ? "Enviando..." : "Proponer mi ruta"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
