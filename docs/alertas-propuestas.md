# Cómo enterarte de las propuestas de ruta (Tu mandas)

Ahora mismo el formulario guarda/envía por email/WhatsApp desde el navegador. Para que te llegue automáticamente sin tener que mirar la web:

## Opción 1: Email (recomendada, gratis)
1. Copia `.env.example` a `.env.local`
2. Añade:
   ```
   NEXT_PUBLIC_CONTACT_EMAIL=tu-email@gmail.com
   ```
3. Despliega en Vercel y añade la variable al proyecto. Al pulsar "Proponer mi ruta", se abrirá el cliente de correo con todos los datos.

## Opción 2: Formspree (gratis, sin backend)
1. Crear cuenta en https://formspree.io
2. Crear formulario, copiar endpoint
3. Puedo cambiar `RouteProposal.tsx` para enviar POST directo al endpoint y recibir email al instante sin abrir cliente de correo.

## Opción 3: Webhook a Discord/Telegram (inmediato)
1. Crear webhook de Discord o bot de Telegram
2. Poner `PROPOSALS_WEBHOOK_URL` en `.env.local` + Vercel
3. Crear `src/app/api/proposals/route.ts` para recibir y reenviar el webhook. Te llega notificación push al móvil en segundos.

## Mi recomendación
**Opción 3 (webhook)**: recibes notificación instantánea, sin depender del cliente de correo, funciona desde cualquier dispositivo.

Dime cuál quieres activar y configuro ahora mismo.
