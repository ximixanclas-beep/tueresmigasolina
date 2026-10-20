import { ImageResponse } from "next/og";

export const alt = "Tueresmigasolina — Rutas en moto con mapa y GPX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(circle at 20% 0%, #2a1a0e 0%, #0b0d10 55%, #0b0d10 100%)",
          color: "#f2f5f8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "linear-gradient(135deg, #ff7a1a, #ffb347)",
            }}
          />
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>
            Tueresmigasolina
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 26,
              color: "#ffb347",
              textTransform: "uppercase",
              letterSpacing: 6,
            }}
          >
            Rutas en moto · GPX
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Las mejores rutas en moto, con mapa y track descargable
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#9aa7b4" }}>
          <div>Carreteras con curvas · Puertos de montaña</div>
          <div style={{ color: "#ff7a1a", fontWeight: 700 }}>tueresmigasolina.com</div>
        </div>
      </div>
    ),
    size,
  );
}
