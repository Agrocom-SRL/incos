# Proyecto INCOS — contexto raíz

Monorepo con `backend/` (Express + Sequelize + MySQL, Clean Architecture) y
`frontend/` (React + Ant Design v6, Atomic Design). Objetivo del repo: UI
homogénea y arquitectura por capas con SOLID. Principal deuda histórica: la
interfaz inconsistente — tratar la consistencia visual como requisito, no extra.

> Migrado desde `.cursor` (2026-06-09). Las reglas "siempre activas" viven aquí; las reglas
> por área y los skills se invocan bajo demanda desde `.claude/skills/` (ver índice abajo).
> Prompt maestro de referencia: `.claude/prompt_maestro.md`.

## Skills disponibles (`.claude/skills/`) — Claude los invoca por su descripción

| Skill | Cuándo se activa |
|-------|------------------|
| `incos-ui-system` | Componente, página, tabla, ficha, estilo, color, tipografía, `.css`. **Prioridad** (la mayoría de bugs son de UI inconsistente). |
| `incos-frontend-module` | Estructura de un módulo frontend, hooks, providers, connectors, rutas. |
| `incos-backend-module` | Endpoint, repositorio, use case, controller, router, seeder. |
| `incos-rbac` | Permisos, rutas protegidas, `verificarPermiso`, `ActionButton`/`TableActions`, seeds 54/55/56, landingStack/viewStack. |
| `incos-antd5-api` | API de Ant Design 6 (`Alert title`, `Space direction`, `Modal open`, evitar `<List>` nuevo). |
| `incos-modulo-listado` | Pantallas de listado / tablas en tabs / endpoints GET de listado. |
| `incos-modulo-detalle` | Fichas / detalle, `GET /:id`, permiso DETALLE. |
| `incos-permisos-rbac` | Alinear RBAC con `matriz-permisos-sistema.md` (seeds 54/55/56). |
| `incos-vistas-y-evolucion` | Vistas SQL `03-views/`, evitar duplicados y etiquetas V2/beta. |
| `clean-architecture-refactor` | Refactors por capas (sacar lógica de pages/controllers). |
| `react-ui-ux-designer` | Pulido visual de UI React sin romper arquitectura. |

Para forzar uno manualmente: `/incos-rbac`, `/incos-ui-system`, etc.

## Principios que aplican a todo

1. **Clean Architecture:** dependencias hacia adentro; negocio en use cases /
   hooks de estado, no en controllers ni en `pages/`.
2. **SOLID:** una responsabilidad por archivo/capa; extiende, no modifiques bases.
3. **Atomic Design:** clasifica todo componente (átomo/molécula/organismo/template/página).
4. **Una fuente de verdad de estilo:** el theme de Ant Design v5.
5. **RBAC coherente:** la misma acción en ruta, UI y backend.

## Reglas de proceso (lo que evita "pasos volando")

- Al crear un listado o ficha completa, sigue el checklist del skill
  correspondiente **hasta el final**, incluyendo seeds y prueba con rol sin permiso.
- Si una tarea cruza frontend y backend (lo normal), aplica AMBOS skills de
  módulo + `incos-rbac`, y verifica que `dataKey` (front) = `dataFieldName` (back).
- Si dudas entre dos ubicaciones de carpeta o niveles atómicos, elige la que
  ya use un módulo de referencia (Docentes para ABM, CFG Académico para tabs).
- **Ant Design 6:** `Alert` → `title` (no `message`); `Space` → `direction`
  (no `orientation`); modales → `open` (no `visible`); evitar `<List>` nuevo (ver `incos-ui-system` y `incos-antd5-api`).

---

# INCOS — evolución en curso (no "versiones")

El sistema **no está terminado**. Faltan módulos y pantallas. Por tanto:

## No usar como etiquetas de entrega

- "V2", "V3", "beta", "alpha", "nueva versión del esquema", "migración V2".
- Documentos o carpetas con sufijos `_v2`, `_beta`, `SCHEMA_*_BETA`.
- Scripts `deploy-*-beta-*` que dupliquen grupos de vistas ya planificados.

Describir cambios como **ajuste de proceso**, **nuevo grano de lectura** o **alineación con oferta/docente**, no como release versionado.

## Vistas SQL (`backend/database/03-views/`) — **todas las vistas**

Aplica a **cualquier** vista del proyecto (académico, docentes, estudiantes, pagos, horarios, calificaciones, dashboards, fichas), no solo grilla o tablero de horarios.

Antes de crear o duplicar una vista:

1. **Buscar** en `03-views/` y `grep` en el repo por nombre lógico y por tabla base.
2. **Identificar consumidor** (repositorio `*ViewRepository`, `ParallelRepository`, use case, pantalla).
3. Preferir, en este orden:
   - Reutilizar vista existente con `JOIN` / columnas adicionales.
   - Ajustar `GROUP BY` o filtro en la vista base ya usada por una vista final.
   - Vista final **delgada** que solo una 2–4 vistas base (patrón de `87`, no monolitos de 100+ líneas).
4. **No copiar** la misma agregación en otro grano (p. ej. `paralelo_id` vs `paralelo_gestion_id`) sin justificar consumidor distinto.
5. Tras cambiar SQL: recrear vista en BD y alinear mapper / `dataFieldName` / `dataKey` en frontend.

Ejemplos por dominio (reutilizar, no repetir):

| Dominio | Vistas / patrón |
|---------|------------------|
| Horarios armado | `122`–`126`, `123`, `54`; API `grilla-horario` |
| Horarios tablero | `87` + bases `70`–`79`, `86` (alinear grano si hace falta) |
| Docentes ficha | `50`–`52` |
| Estudiantes / matrícula | `04`, `17`, `99`–`101` |
| Calificaciones | `108`, `116`, `119`, `110` |

Referencia horarios: `docs/plan/MIGRACION_CODIGO.md` §2 y §3.4.

## Flujo operativo Institucional (menú)

Orden de negocio (mismos recursos del sistema, distintas pantallas):

1. **Configuración → Académico:** plan de estudio, materias, periodos (horas semanales por asignatura del plan).
2. **Institucional → Oferta académica:** gestión vigente, planes habilitados, **paralelos en gestión** (turno, aula), **oferta de cursos** por paralelo.
3. **Institucional → Asignación docente:** docente vigente por **oferta** (`asignaciones_docentes`), color y carga horaria.
4. **Institucional → Gestión de horarios:** armado de **bloques** (`asignacion_horarios`) en la grilla semanal, cubriendo la carga de cada asignación; conflictos y publicación del `paralelo_gestion`.

Cadena de datos (no negociable):

`paralelos_gestion` → `oferta_cursos` → `asignaciones_docentes` → `asignacion_horarios` → `horarios`

- Actor principal en armado: **asignación docente** (docente + materia + horas a cubrir según plan).
- `cursoId` en payloads legacy = **`oferta_curso_id`**.

## Frontend

- Hooks en `hooks/state/` por pantalla (`incos-frontend-module`); no lógica pesada en `pages/`.
- Consumir APIs ya expuestas antes de hooks legacy (`GET/PUT schedule`) salvo persistencia transitoria en `MIGRACION_CODIGO.md`.
