# Cómo enterarte de las propuestas de ruta (Tu mandas) — ACTIVADO

Las alertas ya están activas con **ntfy.sh** (gratis, instantáneo al móvil).

## Tu tema ntfy (privado)

```
tueresmigasolina-dqupm4acy1er8vkw5hf7
```

URL completa del webhook (ya configurada en Vercel):
```
https://ntfy.sh/tueresmigasolina-dqupm4acy1er8vkw5hf7
```

## Cómo recibir las notificaciones en el móvil

1. Instala la app **ntfy**:
   - Android: https://play.google.com/store/apps/details?id=io.heckel.ntfy
   - iOS: https://apps.apple.com/app/ntfy/id1625396347
2. Abre la app → **+** → **Subscribe to topic**
3. Escribe exactamente: `tueresmigasolina-dqupm4acy1er8vkw5hf7`
4. Listo. Cada vez que alguien proponga una ruta, te llegará una notificación al móvil al instante.

## Alternativas (si prefieres)

- **Discord:** crea un webhook en tu servidor y reemplaza `PROPOSALS_WEBHOOK_URL` en Vercel.
- **Email:** añade `NEXT_PUBLIC_CONTACT_EMAIL` en Vercel; el formulario ofrecerá enviar por correo.

## Seguridad

- No compartas el enlace del tema: cualquiera que lo tenga puede enviarte notificaciones o leerlas si se suscribe.
- Si lo compartes por error, puedes crear otro tema gratis en https://ntfy.sh y actualizar la variable en Vercel.
