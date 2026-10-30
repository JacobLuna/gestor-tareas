# Gestor de tareas familiar

App web para organizar las tareas de una familia: tablero Kanban, rutinas que se repiten y una agenda semanal. Cada integrante entra con su perfil y un PIN, y un administrador gestiona a la familia.

## Funcionalidades

- **Tablero Kanban** (Pendiente, En curso, Hecha) con tareas asignadas a integrantes, prioridades y filtro «Mis tareas».
- **Acceso por perfil y PIN** de 4 dígitos. El primer arranque crea al administrador.
- **Roles:** `admin` (todo), `miembro` (crea tareas y mueve las suyas) e `hijo` (solo atiende tareas). Los permisos se validan en el servidor.
- **Fotos de perfil** (JPG, PNG o WebP, hasta 400 KB).
- **Tareas recurrentes** por días de la semana, con varios horarios al día y rango de fechas. Las tarjetas del día se generan al abrir el tablero.
- **Agenda semanal** con eventos únicos o que se repiten (por ejemplo, el horario escolar), por integrante o para toda la familia.

## Stack

- SvelteKit 2 y Svelte 5, TypeScript, form actions con mejora progresiva
- Prisma 6 con SQLite
- Vitest y GitHub Actions (`check`, `test` y `build` en cada push)
- Docker

## Instalarlo en casa (red local)

Necesitas un equipo que quede encendido (una PC, un mini PC o una Raspberry Pi) con [Docker](https://docs.docker.com/get-docker/).

```bash
git clone https://github.com/JacobLuna/gestor-tareas.git
cd gestor-tareas
docker compose up -d --build
```

1. Abre `http://IP-DEL-EQUIPO:3000` desde cualquier celular o PC de la misma red. La IP es la del equipo donde corre (`ipconfig` en Windows, `ip a` en Linux).
2. Crea el perfil de administrador y agrega al resto de la familia desde **Familia**.
3. Reserva esa IP para el equipo en tu router, para que no cambie.

Detalles:

- **Datos:** viven en el volumen `datos` de Docker (SQLite). Respáldalo con `docker compose cp gestor-tareas:/data/dev.db ./respaldo.db`.
- **Zona horaria:** `America/Merida`, configurada en `compose.yaml`. Cámbiala si vives en otra; de ella depende en qué momento cambia el día de las tareas recurrentes.
- **Actualizar:** `git pull && docker compose up -d --build`. Las migraciones se aplican solas al arrancar.
- **Seguridad:** funciona por HTTP, pensada solo para la red de casa. No abras el puerto 3000 en el router hacia internet; para eso haría falta HTTPS y endurecer la autenticación.

## Desarrollo

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Abre http://localhost:5173.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas (validación, permisos, PIN, fechas y agenda) |
| `npm run check` | Revisión de tipos con svelte-check |
| `npm run build` | Build de producción con adapter-node |

## Estructura

- `src/lib/`: lógica pura con pruebas (`tareas`, `miembros`, `fechas`, `agenda`, `foto`) y utilidades de servidor en `src/lib/server/`.
- `src/hooks.server.ts`: sesión y protección de rutas.
- `src/routes/`: tablero, `entrar`, `configurar`, `familia`, `perfil`, `agenda` y `recurrentes`.
- `prisma/`: esquema y migraciones.

## Límites conocidos

- No se pueden editar las plantillas recurrentes ni los eventos; se borran y se vuelven a crear.
- Sin recordatorios ni notificaciones.
- Sin HTTPS: pensada para la red local.
