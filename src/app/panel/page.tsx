"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Proposal = {
  id: string;
  name: string;
  contact: string;
  route: string;
  message: string;
  receivedAt: string;
};

function readSavedCode(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("panel-code") ?? "";
}

export default function PanelPage() {
  const [code, setCode] = useState(readSavedCode);
  const [unlocked, setUnlocked] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notifyOn, setNotifyOn] = useState(false);
  const [notifyError, setNotifyError] = useState("");
  const lastIdsRef = useRef<Set<string>>(new Set());

  const load = useCallback(
    async (adminCode: string, silent = false) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/proposals?code=${encodeURIComponent(adminCode)}`);
        if (res.status === 401) {
          setError("Código incorrecto.");
          setUnlocked(false);
          return;
        }
        const data = (await res.json()) as { proposals: Proposal[] };
        const list = data.proposals ?? [];

        if (silent && lastIdsRef.current.size > 0 && "Notification" in window) {
          const fresh = list.filter((p) => !lastIdsRef.current.has(p.id));
          if (fresh.length > 0 && Notification.permission === "granted") {
            for (const p of fresh) {
              new Notification("TU MANDAS - Nueva propuesta", {
                body: `${p.route} — de ${p.name || "Sin nombre"}`,
                icon: "/icons/icon-192.png",
                tag: p.id,
              });
            }
          }
        }

        lastIdsRef.current = new Set(list.map((p) => p.id));
        setProposals(list);
        setUnlocked(true);
      } catch {
        if (!silent) setError("Error al cargar. Inténtalo de nuevo.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!unlocked || !code) return;
    const interval = setInterval(() => {
      load(code, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [unlocked, code, load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setNotifyOn(Boolean(sub)))
        .catch(() => undefined);
    }
  }, []);

  function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const buffer = new ArrayBuffer(raw.length);
    const output = new Uint8Array(buffer);
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return buffer;
  }

  async function enableNotifications() {
    setNotifyError("");
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setNotifyError("Este navegador no soporta notificaciones. En iPhone, instala la app (Compartir > Añadir a pantalla de inicio) y ábrela desde el icono.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setNotifyError("Permiso de notificaciones denegado. Actívalo en los ajustes del navegador/sistema para este sitio.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const keyRes = await fetch("/api/push");
      const { publicKey } = (await keyRes.json()) as { publicKey: string };
      if (!publicKey) {
        setNotifyError("Push no configurado en el servidor (falta VAPID_PUBLIC_KEY).");
        return;
      }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const save = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!save.ok) {
        setNotifyError("No se pudo guardar la suscripción. Inténtalo de nuevo.");
        return;
      }

      setNotifyOn(true);
      new Notification("Tueresmigasolina", {
        body: "Alertas activadas en este dispositivo. Te avisaré de cada propuesta.",
        icon: "/icons/icon-192.png",
      });
    } catch (err) {
      setNotifyError(`Error al activar: ${err instanceof Error ? err.message : "desconocido"}`);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("panel-code", code);
    load(code);
  }

  return (
    <div className="container section">
      <h1>Panel de propuestas</h1>
      <p style={{ color: "var(--muted)" }}>
        Acceso privado para ver todas las propuestas de Tu mandas. Se actualiza solo cada
        15 segundos.
      </p>

      {!unlocked && (
        <form onSubmit={onSubmit} className="panel" style={{ marginTop: "1rem", maxWidth: "32rem" }}>
          <p style={{ color: "var(--muted)", marginBottom: "0.8rem" }}>
            Introduce el código de administrador que te dio el sistema. Es una cadena
            larga de letras y números.
          </p>
          <div className="field">
            <label htmlFor="admin-code">Código de administrador</label>
            <input
              id="admin-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Pega aquí el código"
              required
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              style={{ fontFamily: "monospace", fontSize: "0.95rem" }}
            />
          </div>
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          <div className="actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Abriendo..." : "Entrar al panel"}
            </button>
          </div>
        </form>
      )}

      <div className="panel" style={{ marginTop: "1rem", maxWidth: "36rem" }}>
        <strong style={{ display: "block", marginBottom: "0.4rem" }}>
          🔔 Alertas en este dispositivo
        </strong>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: "0.7rem" }}>
          Actívalas para que te llegue una notificación al móvil cada vez que alguien
          proponga una ruta. Solo hay que hacerlo una vez en cada dispositivo.
        </p>
        {notifyOn ? (
          <span className="chip accent">Alertas activas en este dispositivo</span>
        ) : (
          <button className="btn primary" type="button" onClick={enableNotifications}>
            Activar alertas en este dispositivo
          </button>
        )}
        {notifyError && (
          <p style={{ color: "#ff6b6b", marginTop: "0.6rem", fontSize: "0.9rem" }}>
            {notifyError}
          </p>
        )}
      </div>

      {unlocked && (
        <>
          <div className="actions" style={{ marginTop: "1rem", flexWrap: "wrap" }}>
            <button className="btn ghost" onClick={() => load(code)} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar ahora"}
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                sessionStorage.removeItem("panel-code");
                setUnlocked(false);
                setProposals([]);
                setCode("");
              }}
            >
              Cerrar sesión
            </button>
          </div>

          <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
            {proposals.length} propuesta{proposals.length === 1 ? "" : "s"}
          </p>

          {proposals.length === 0 ? (
            <div className="empty panel" style={{ marginTop: "1rem" }}>
              No hay propuestas todavía.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.8rem", marginTop: "1rem" }}>
              {proposals.map((p) => (
                <div className="panel" key={p.id} style={{ padding: "1rem 1.2rem" }}>
                  <div className="meta" style={{ marginBottom: "0.5rem" }}>
                    <span className="chip accent">{p.route}</span>
                    <span className="chip">
                      {new Date(p.receivedAt).toLocaleString("es-ES")}
                    </span>
                  </div>
                  <strong>{p.name || "Sin nombre"}</strong>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                    Contacto: {p.contact}
                  </div>
                  {p.message && (
                    <p style={{ marginTop: "0.5rem", marginBottom: 0 }}>{p.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
