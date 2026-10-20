"use client";

import { useCallback, useState } from "react";

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
  const [autoTried, setAutoTried] = useState(false);

  const load = useCallback(async (adminCode: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proposals?code=${encodeURIComponent(adminCode)}`);
      if (res.status === 401) {
        setError("Código incorrecto.");
        setUnlocked(false);
        return;
      }
      const data = (await res.json()) as { proposals: Proposal[] };
      setProposals(data.proposals ?? []);
      setUnlocked(true);
    } catch {
      setError("Error al cargar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  function tryAutoUnlock() {
    if (!autoTried && code) {
      setAutoTried(true);
      load(code);
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
        Acceso privado para ver todas las propuestas de Tu mandas.
      </p>

      {!unlocked && (
        <form onSubmit={onSubmit} className="panel" style={{ marginTop: "1rem", maxWidth: "28rem" }}>
          <div className="field">
            <label htmlFor="admin-code">Código de administrador</label>
            <input
              id="admin-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ADMIN_CODE"
              required
              autoComplete="off"
            />
          </div>
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          <div className="actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Abriendo..." : "Entrar"}
            </button>
            {code && !autoTried && (
              <button
                className="btn ghost"
                type="button"
                onClick={tryAutoUnlock}
                disabled={loading}
              >
                Entrar con código guardado
              </button>
            )}
          </div>
        </form>
      )}

      {unlocked && (
        <>
          <div className="actions" style={{ marginTop: "1rem" }}>
            <button className="btn ghost" onClick={() => load(code)} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                sessionStorage.removeItem("panel-code");
                setUnlocked(false);
                setProposals([]);
                setCode("");
                setAutoTried(false);
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
