# INCOS — Sistema de Gestión Académica

Sistema de gestión académica y administrativa del **Instituto Comercial Superior de la Nación INCOS Santa Cruz** (Bolivia): configuración académica, oferta y horarios, docentes, estudiantes y matrícula, calificaciones, pagos, titulación y reportes, con control de acceso por roles (RBAC).

## Estructura del monorepo

| Carpeta | Contenido |
|---------|-----------|
| `backend/` | API REST: Express + Sequelize + MySQL/MariaDB, Clean Architecture. Incluye `database/` (esquemas, seeders, vistas, migraciones). |
| `frontend/` | SPA: React + Vite + Ant Design v6, Atomic Design, Motion para animación. |
| `docs/` | Guías, referencia permanente y planes de trabajo. Índice en [`docs/README.md`](docs/README.md). |
| `CLAUDE.md` | Contexto raíz del proyecto para Claude Code (reglas siempre activas, skills y agentes). |

## Arquitectura en una pantalla

- **Backend (capas, dependencias hacia adentro):** `routes → controllers → use-cases → repositories → Sequelize/BD`. El negocio vive en los use cases; los repositorios se inyectan; el contrato de respuesta es estable y cada endpoint se protege con `verificarPermiso`.
- **Frontend:** un módulo por ítem de menú, con hooks por capa (`api` / `features` / `state` / `context`), providers y rutas con carga diferida. La lógica de estado va en `hooks/state/`, no en `pages/`. Componentes clasificados en Atomic Design.
- **UI:** una sola fuente de verdad de estilo (theme de Ant Design v6 + tokens globales). Consistencia visual como requisito.
- **RBAC coherente en 3 capas:** la misma acción en ruta del frontend, controles de UI y backend. Matriz en [`docs/referencia/matriz-permisos-sistema.md`](docs/referencia/matriz-permisos-sistema.md).
- **Datos:** esquemas en `backend/database/01-schemas`, seeders en `02-seeders`, vistas de lectura en `03-views`, semillas de prueba en `04-test-seeds` y migraciones del servidor en `05-migrations`.

### Cadena de negocio (oferta y horarios)

Orden operativo: Configuración → Académico (plan, materias, periodos) → Institucional → Oferta académica → Asignación docente → Gestión de horarios. Cadena de datos:

`paralelos_gestion` → `oferta_cursos` → `asignaciones_docentes` → `asignacion_horarios` → `horarios`

Detalle y smoke de punta a punta en [`docs/referencia/flujo-operativo-gestion-academica.md`](docs/referencia/flujo-operativo-gestion-academica.md).

## Requisitos

- Node.js 22 (la versión que usa el CI) y npm.
- MySQL/MariaDB (el CI usa MariaDB 10.11).

## Cómo levantar cada parte

### Backend

```bash
cd backend
npm ci
cp .env.example .env     # completar credenciales de BD y secretos
npm run dev              # desarrollo con nodemon (npm start: producción; npm run dev:debug: con inspector)
```

La BD se crea con los SQL de `backend/database/` en orden numérico (`00-config`, `01-schemas`, `02-seeders`, `03-views`). Para una BD descartable de pruebas existe `backend/scripts/ci-cargar-bd.sh` (solo opera sobre BD cuyo nombre termina en `_test`). Más detalle en [`backend/README.md`](backend/README.md).

### Frontend

```bash
cd frontend
npm ci
cp .env.example .env     # VITE_API_URL / VITE_API_BASE_URL apuntan al backend
npm run dev              # servidor de desarrollo Vite
npm run build            # build de producción (npm run preview para servirlo)
```

Más detalle en [`frontend/README.md`](frontend/README.md).

## Pruebas y CI

| Parte | Comando | Qué corre |
|-------|---------|-----------|
| Backend | `cd backend && npm run test:unit` | Jest, use cases con repositorios simulados (sin BD) |
| Backend | `cd backend && npm run test:integration` | Jest + supertest contra BD real efímera (`_test`) |
| Frontend | `cd frontend && npm test` | Vitest + Testing Library (`npm run test:watch` para vigilar) |
| Ambos | `npm run lint` (`lint:fix` para corregir) | ESLint |

Toda lógica nueva o modificada lleva su prueba en el mismo PR; un bug corregido lleva la prueba que lo reproduce. Guía completa: [`docs/guias/pruebas.md`](docs/guias/pruebas.md).

El workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) corre en cada PR y push a `master`, `develop` y `design`:

1. **Frontend:** `npm run lint`, `npm test`, `npm run build`.
2. **Backend:** `npm run lint`, verificación de sintaxis de `src` y `npm run test:unit`.
3. **Integración:** carga una MariaDB efímera con `scripts/ci-cargar-bd.sh` y corre `npm run test:integration`.
4. **Auto-merge a `develop`** cuando todo pasa, para PR no borrador del autor autorizado; si el PR toca `.github/workflows` se fusiona a mano.

## Flujo de ramas y PR

- `master` y `develop` son **protegidas**: nunca se edita ni se hace commit directo; solo reciben cambios por PR.
- Se trabaja en una rama creada desde `develop` (`feature/<nombre>`, `bugfix/<...>`, `fix/<...>`, `docs/<...>`) y se abre el **PR hacia `develop`**.
- El CI debe pasar en verde antes de fusionar.

## Documentación

- [`docs/README.md`](docs/README.md): índice de la documentación.
- [`docs/guias/`](docs/guias/): cómo implementar listados, fichas y pruebas.
- [`docs/referencia/`](docs/referencia/): matriz de permisos, flujo operativo, estilo de textos.
- [`docs/plan/`](docs/plan/): planes de desarrollo y estado de avance ([`estado-avance-y-proximos-pasos.md`](docs/plan/estado-avance-y-proximos-pasos.md)).
- [`CLAUDE.md`](CLAUDE.md): reglas, skills y agentes para trabajar con Claude Code.

## Licencia

Ver [`LICENSE`](LICENSE).
