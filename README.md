# Gestor de tareas

Aplicación web para crear, completar y borrar tareas con prioridad (alta, media, baja).

## Stack

- SvelteKit 2 y Svelte 5, TypeScript
- Prisma 6 con SQLite
- Form actions con mejora progresiva (`use:enhance`): funciona también sin JavaScript
- Vitest para la validación

## Cómo correrlo

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Abre http://localhost:5173.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas de validación |
| `npm run check` | Revisión de tipos con svelte-check |
| `npm run build` | Build de producción con adapter-node |

## Estructura

- `src/lib/tareas.ts`: validación del formulario, sin dependencias, con pruebas.
- `src/routes/+page.server.ts`: carga y acciones `crear`, `alternar` y `borrar`.
- `src/routes/+page.svelte`: interfaz.
- `prisma/schema.prisma`: modelo `Tarea`.

## Siguientes pasos

- Autenticación (Auth0) y tareas por usuario.
- Edición del título y filtros por prioridad.
