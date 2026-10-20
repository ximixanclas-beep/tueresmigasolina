# Cómo enterarte de las propuestas de ruta (Tu mandas)

Tienes varios canales de alerta, de más fiable a más opcional:

1. **Email** (Gmail directo) — recomendado, gratis, llega con notificación push de Gmail al móvil.
2. **Web Push** — notificación de la app PWA instalada (entra a `/panel` y actívala).
3. **ntfy.sh** — app ntfy suscrita a tu tema privado.
4. **Slack** — webhook a tu workspace (gratis).
5. **WhatsApp** — Meta Cloud API / WhatsAble / CallMeBot (requiere trámites).

> El **canal público de WhatsApp** es de solo lectura para los fans: Meta no
> permite enviar mensajes automáticos a un canal. Por eso WhatsApp automático
> requiere Meta Cloud API o un proveedor puente.

## Email (recomendado)

### Opción A — Gmail directo (gratis, sin intermediarios)

1. En tu cuenta Google, activa la **verificación en 2 pasos**:
   https://myaccount.google.com/security
2. Crea una **contraseña de aplicación**: https://myaccount.google.com/apppasswords
   (elige "Otra aplicación" → copia los 16 caracteres).
3. Configúrala con el script:

```powershell
.\scripts\email-activar.ps1 -Gmail "tucorreo@gmail.com" -AppPassword "abcd efgh ijkl mnop"
vercel --prod
```

Variables equivalentes en Vercel:

```
GMAIL_USER=tucorreo@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop    # 16 caracteres, sin espacios
NOTIFY_EMAIL=tucorreo@gmail.com        # dónde quieres recibir los avisos
```

### Opción B — Brevo (gratis 300/día, sin tarjeta)

```
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=tucorreo@gmail.com
NOTIFY_EMAIL=tucorreo@gmail.com
```

### Probar el email

```
https://tueresmigasolina.vercel.app/api/email/test?code=TU_CODIGO
```

Respuesta esperada: `{"provider":"gmail","sent":true}` y un email en tu bandeja.

## WhatsApp al móvil (tu número ya configurado: +34 604442172)

El código detecta automáticamente el proveedor en este orden:
**Meta Cloud API** → **WhatsAble** → **CallMeBot**.

### Opción A — Meta WhatsApp Cloud API (recomendado, oficial)

Gratis hasta 1.000 conversaciones/mes. Es la única vía oficial y fiable.

#### Alta de Meta (una sola vez, ~20-30 min, requiere paciencia)

1. Entra en https://developers.facebook.com y crea una **app** (tipo "Business").
2. Añade el producto **WhatsApp** ("Add Product → WhatsApp → Set Up").
3. En **WhatsApp → API Setup** tendrás:
   - Un **número de prueba** de Meta (y su *Phone number ID*).
   - Un **token temporal** para probar.
4. Copia el **Phone number ID** y el token temporal.
5. **Prueba ya** (lo más importante): en esa misma pantalla "Send and receive
   messages", añade tu número personal +34 604442172 como destinatario de prueba
   y pulsa *Send message*. Debe llegarte un WhatsApp de Meta.

#### Configurar en la web

```
WHATSAPP_PHONE=34604442172        # ya configurado
WHATSAPP_META_PHONE_ID=123456789012345
WHATSAPP_META_TOKEN=EAAG...       # temporal (24h) o permanente
```

O automáticamente desde el PC:

```powershell
.\scripts\whatsapp-activar.ps1 -Token "EAAG..." -PhoneId "123456789012345"
vercel --prod
```

#### Token permanente (para producción, no caduca)

El token temporal dura 24h. Para uno permanente:

1. En Meta for Developers → tu app → **Business Settings** (o Meta Business Suite).
2. Crea un **System User** (rol Admin).
3. Asígnale la app y el permiso `whatsapp_business_messaging`.
4. **Generate New Token** → copia ese token permanente.
5. Vuelve a ejecutar el script con ese token.

> Nota: para enviar mensajes **fuera de la ventana de 24h** (que es tu caso, avisos
> que tú no has iniciado), WhatsApp exige **plantillas aprobadas**. Con el número de
> prueba puedes escribirte a ti mismo libremente; en producción quizá necesites crear
> una plantilla "utility" de notificación y aprobarla (Meta la aprueba en minutos).

### Opción B — WhatsAble

1. Crea cuenta en https://dashboard.whatsable.app/register
2. Verifica tu número en el dashboard.
3. Copia tu API key desde la sección API del dashboard.
4. Configura `WHATSABLE_API_KEY`.

### Opción C — CallMeBot (gratis, si tiene plazas)

1. Mira el número del bot en https://www.callmebot.com/?ae_global_templates=setup-whatsapp
   (avisa "bot full" cuando no hay plazas; reintenta en unos días).
2. Guarda el número y envíale: `I allow callmebot to send me messages`
3. El bot responde con tu APIKEY → `WHATSAPP_CALLMEBOT_APIKEY`.

### Probar que funciona

Abre en tu navegador (sustituye TU_CODIGO por tu ADMIN_CODE):

```
https://tueresmigasolina.vercel.app/api/whatsapp/test?code=TU_CODIGO
```

Respuesta esperada: `{"provider":"meta","sent":true}` y un WhatsApp de prueba.

### Enviar un aviso manual (para procesos que terminan)

```powershell
.\scripts\whatsapp-notify.ps1 "Proceso X terminado correctamente"
```

## 2) ntfy.sh (notificación de la app instalada)
Tu tema ntfy (privado):

```
tueresmigasolina-dqupm4acy1er8vkw5hf7
```

URL completa del webhook (ya configurada en Vercel):
```
https://ntfy.sh/tueresmigasolina-dqupm4acy1er8vkw5hf7
```

### Cómo recibir las notificaciones en el móvil

1. Instala la app **ntfy.sh**:
   - Android: https://play.google.com/store/apps/details?id=io.heckel.ntfy
   - iOS: https://apps.apple.com/app/ntfy/id1625396347
2. Abre la app → **+** → **Subscribe to topic**
3. Escribe exactamente: `tueresmigasolina-dqupm4acy1er8vkw5hf7`
4. En iOS además: instala la PWA de tueresmigasolina, abrela y acepta las
   notificaciones (Settings de la app → Notificaciones). Las notificaciones
   push solo llegan con la app instalada.

> En iOS, si la app no está instalada (añadida a inicio), NO llegan
> notificaciones push. Esa es la razón más habitual de "no me llega nada".

## Alternativas (si prefieres)

- **Discord:** crea un webhook en tu servidor y reemplaza `PROPOSALS_WEBHOOK_URL` en Vercel.
- **Email:** añade `NEXT_PUBLIC_CONTACT_EMAIL` en Vercel; el formulario ofrecerá enviar por correo.

## Seguridad

- No compartas el APIKEY de CallMeBot ni la URL del tema ntfy: cualquiera que los tenga puede enviarte o leer notificaciones.
- Si lo compartes por error, puedes crear otro tema ntfy gratis en https://ntfy.sh y actualizar la variable en Vercel; para CallMeBot, contacta con soporte desde su web.
