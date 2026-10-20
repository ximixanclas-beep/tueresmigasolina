"use client";

import { useState, type FormEvent } from "react";

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
const youtubeUrl =
  process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@Tueresmigasolina";
const whatsappChannelUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL ??
  "https://whatsapp.com/channel/0029VbECTyCGJP8BlsvjVk2m";

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
          <li>Tu contacto es privado: solo lo uso yo para responderte.</li>
          <li>La rodamos juntos y la publico aquí y en el canal con tu nombre.</li>
          <li>Apareces como protagonista en la sección <strong>&ldquo;Tu mandas&rdquo;</strong>.</li>
        </ul>

        <div className="panel" style={{ marginTop: "1rem", padding: "1rem 1.2rem" }}>
          <strong style={{ display: "block", marginBottom: "0.4rem" }}>
            ¿Prefieres el chat?
          </strong>
          <p style={{ color: "var(--muted)", marginBottom: "0.7rem", fontSize: "0.95rem" }}>
            Sigue el canal de WhatsApp y escríbeme por privado. Es la vía más directa y
            sin formularios.
          </p>
          <a
            className="btn ghost"
            href={whatsappChannelUrl}
            target="_blank"
            rel="noopener"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <span aria-hidden="true">💬</span> Abrir canal de WhatsApp
          </a>
        </div>
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
              placeholder="Email, WhatsApp o @usuario"
              required
              autoComplete="off"
            />
            <small style={{ color: "var(--muted)", display: "block", marginTop: "0.25rem" }}>
              Privado: solo lo veo yo para responderte. No se publica en ningún sitio.
            </small>
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
                  <a
                    className="btn primary"
                    href={whatsappChannelUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    Escribir por WhatsApp
                  </a>
                  {email && (
                    <a className="btn ghost" href={mailto}>
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
                      WhatsApp directo
                    </a>
                  )}
                  <a className="btn ghost" href={youtubeUrl} target="_blank" rel="noopener">
                    Comentario en YouTube
                  </a>
                </div>
                {!email && !whatsappUrl && (
                  <p style={{ marginTop: "0.6rem" }}>
                    Escríbeme por el canal de WhatsApp con estos datos y te contacto en
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
