"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { parseGpx, type GpxResult } from "@/lib/gpx";
import type { Difficulty, Surface } from "@/lib/types";

interface FormState {
  title: string;
  summary: string;
  description: string;
  region: string;
  startName: string;
  durationMin: string;
  difficulty: Difficulty;
  surface: Surface;
  tags: string;
  youtubeUrl: string;
  adminCode: string;
  published: boolean;
}

const initialState: FormState = {
  title: "",
  summary: "",
  description: "",
  region: "",
  startName: "",
  durationMin: "",
  difficulty: "media",
  surface: "asfalto",
  tags: "",
  youtubeUrl: "",
  adminCode: "",
  published: true,
};

export default function RouteUploader() {
  const [form, setForm] = useState<FormState>(initialState);
  const [gpx, setGpx] = useState<GpxResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ slug: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setGpx(null);
    setFileName("");
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("El GPX es demasiado grande (máximo 8 MB).");
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseGpx(text);
      setGpx(parsed);
      setFileName(file.name);
      if (!form.title) update("title", parsed.name || file.name.replace(/\.gpx$/i, ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido leer el GPX.");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!gpx) {
      setError("Sube un archivo GPX para crear la ruta.");
      return;
    }
    if (!form.title.trim()) {
      setError("Pon un título a la ruta.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": form.adminCode,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          summary: form.summary.trim(),
          description: form.description.trim(),
          region: form.region.trim(),
          startName: form.startName.trim(),
          durationMin: Number(form.durationMin) || 0,
          difficulty: form.difficulty,
          surface: form.surface,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          youtubeUrl: form.youtubeUrl.trim() || undefined,
          published: form.published,
          distanceKm: gpx.distanceKm,
          elevationGainM: gpx.elevationGainM,
          points: gpx.points,
        }),
      });

      const data = (await response.json()) as { slug?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "No se ha podido publicar la ruta.");
      }
      setSuccess({ slug: data.slug ?? "" });
      setForm(initialState);
      setGpx(null);
      setFileName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error publicando la ruta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form panel" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="gpx">Archivo GPX *</label>
        <input
          id="gpx"
          type="file"
          accept=".gpx,application/gpx+xml,application/xml,text/xml"
          onChange={onFile}
        />
        {gpx && (
          <div className="notice ok">
            <strong>{fileName}</strong> · {gpx.points.length} puntos ·{" "}
            {gpx.distanceKm} km · +{gpx.elevationGainM} m de desnivel
          </div>
        )}
      </div>

      <div className="row-2">
        <div className="field">
          <label htmlFor="title">Título *</label>
          <input
            id="title"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Puerto de Navacerrada desde Madrid"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="region">Región</label>
          <input
            id="region"
            value={form.region}
            onChange={(event) => update("region", event.target.value)}
            placeholder="Comunidad de Madrid"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="summary">Resumen corto</label>
        <input
          id="summary"
          value={form.summary}
          onChange={(event) => update("summary", event.target.value)}
          placeholder="Curvas, puerto de montaña y llegada a Segovia"
          maxLength={180}
        />
      </div>

      <div className="field">
        <label htmlFor="description">Descripción de la ruta</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          rows={5}
          placeholder="Cuenta el recorrido, el estado del asfalto, las paradas recomendadas…"
        />
      </div>

      <div className="row-3">
        <div className="field">
          <label htmlFor="startName">Punto de salida</label>
          <input
            id="startName"
            value={form.startName}
            onChange={(event) => update("startName", event.target.value)}
            placeholder="Madrid"
          />
        </div>
        <div className="field">
          <label htmlFor="durationMin">Duración (min)</label>
          <input
            id="durationMin"
            type="number"
            min={0}
            step={5}
            value={form.durationMin}
            onChange={(event) => update("durationMin", event.target.value)}
            placeholder="120"
          />
        </div>
        <div className="field">
          <label htmlFor="difficulty">Dificultad</label>
          <select
            id="difficulty"
            value={form.difficulty}
            onChange={(event) => update("difficulty", event.target.value as Difficulty)}
          >
            <option value="facil">Fácil</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      <div className="row-2">
        <div className="field">
          <label htmlFor="surface">Firme</label>
          <select
            id="surface"
            value={form.surface}
            onChange={(event) => update("surface", event.target.value as Surface)}
          >
            <option value="asfalto">Asfalto</option>
            <option value="mixto">Mixto</option>
            <option value="tierra">Tierra</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="tags">Etiquetas (separadas por comas)</label>
          <input
            id="tags"
            value={form.tags}
            onChange={(event) => update("tags", event.target.value)}
            placeholder="sierra, curvas, puerto de montaña"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="youtubeUrl">Enlace al vídeo de YouTube (opcional)</label>
        <input
          id="youtubeUrl"
          type="url"
          value={form.youtubeUrl}
          onChange={(event) => update("youtubeUrl", event.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </div>

      <div className="field">
        <label htmlFor="adminCode">Código de publicación *</label>
        <input
          id="adminCode"
          type="password"
          value={form.adminCode}
          onChange={(event) => update("adminCode", event.target.value)}
          placeholder="Código de administración"
          required
        />
      </div>

      <label className="meta" style={{ gap: "0.5rem", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={form.published}
          onChange={(event) => update("published", event.target.checked)}
          style={{ width: "auto" }}
        />
        Publicar inmediatamente
      </label>

      {error && <div className="notice error">{error}</div>}
      {success && (
        <div className="notice ok">
          Ruta publicada.{" "}
          {success.slug ? (
            <Link href={`/rutas/${success.slug}`}>Ver la ruta →</Link>
          ) : (
            <Link href="/rutas">Ver todas las rutas →</Link>
          )}
        </div>
      )}

      <div className="actions">
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Publicando…" : "Publicar ruta"}
        </button>
        <Link className="btn ghost" href="/rutas">
          Ver rutas
        </Link>
      </div>
    </form>
  );
}
