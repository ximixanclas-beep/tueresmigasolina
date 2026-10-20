# AGENTS.md — tueresmigasolina

Reglas permanentes para trabajar en este proyecto.

## Git y GitHub (automático, siempre)

Después de **cada cambio** en el proyecto, sin esperar a que el usuario lo pida:

1. Ejecuta `npm run typecheck` y `npm run lint`; corrige lo que falle.
2. Haz `git add -A`.
3. Haz `git commit` con mensaje en español, estilo del repo (`feat:` / `fix:` + descripción breve).
4. Haz `git push origin main`.

No hace falta pedir confirmación para commit ni push en este proyecto: el usuario
quiere que **todo se vuelque automáticamente en GitHub** (repo
`ximixanclas-beep/tueresmigasolina`, rama `main`).

Nunca subir secretos: `.env.local` no debe trackearse (solo `.env.example`).

## Deploy

Tras los cambios y antes del push (o justo después), desplegar a producción con:

```
vercel --prod --yes
```

Proyecto Vercel: `hilito/tueresmigasolina` → `https://tueresmigasolina.vercel.app`.

## Comandos

- `npm run dev` / `npm run build` / `npm run start`
- `npm run typecheck` (tsc --noEmit)
- `npm run lint` (eslint)
