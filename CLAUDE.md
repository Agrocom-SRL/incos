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
| `incos-rbac` | Permisos, rutas protegidas, `verificarPermiso`, `ActionButton`/`TableActions`, seeds RBAC por módulo (58-67, sin ids, refs por código), landingStack/viewStack. |
| `incos-antd5-api` | API de Ant Design 6 (`Alert title`, `Space orientation`, `Modal open`, evitar `<List>` nuevo). |
| `incos-modulo-listado` | Pantallas de listado / tablas en tabs / endpoints GET de listado. |
| `incos-modulo-detalle` | Fichas / detalle, `GET /:id`, permiso DETALLE. |
| `incos-permisos-rbac` | Alinear RBAC con `matriz-permisos-sistema.md` (seeds RBAC por módulo, 58-67). |
| `incos-vistas-y-evolucion` | Vistas SQL `03-views/`, evitar duplicados y etiquetas V2/beta. |
| `incos-testing` | Crear/modificar use case, hook, util o componente; corregir un bug. Pruebas Jest (backend) y Vitest (frontend) que corre el CI. |
| `clean-architecture-refactor` | Refactors por capas (sacar lógica de pages/controllers). |
| `react-ui-ux-designer` | Pulido visual de UI React sin romper arquitectura. |

Para forzar uno manualmente: `/incos-rbac`, `/incos-ui-system`, etc.

## Skills globales de diseño (`~/.claude/skills/`) — modernización 2026

Instaladas a nivel usuario (no versionadas en el repo). Complementan a las skills
del proyecto para subir el listón visual sin abandonar Ant Design. Úsalas como
**guía de principios**, no por su stack literal.

| Skill | Cuándo se invoca |
|-------|------------------|
| `emil-design-eng` | Núcleo de animación/interacción (Emil Kowalski): decidir si algo debe animar, easing, springs, transforms, `clip-path`, gestos, perceived performance. Recomienda **Motion (framer-motion)**, no GSAP. |
| `impeccable` | Auditar/pulir UI: jerarquía, accesibilidad, estados vacío/carga/error, detector de antipatrones por CLI, iteración en vivo. |
| `design-taste-frontend` | Dirección de diseño anti-genérico (paletas, tipografía, "motion motivado"). Asume Tailwind+Next; tomar solo los **principios**. |
| `caveman` | Modo de respuesta ultracomprimido (a petición). |
| `find-skills` | Descubrir/instalar nuevas skills cuando falte una capacidad. |

## Subagentes del proyecto (`.claude/agents/`) — orquestación de la migración

| Agente | Rol |
|--------|-----|
| `orquestador` | Coordina tareas multi-capa, delega en los demás, integra y verifica coherencia. No escribe código de producción. |
| `arquitecto` | Decide capas/ubicación/SOLID/Atomic y reutilización de vistas SQL (solo lectura). |
| `planificador` | Convierte requisitos en checklist paso a paso antes de codear. |
| `frontend` | Implementa UI React + Ant Design 6 + Motion, apoyado en las skills de diseño. |
| `backend` | Implementa endpoints Express/Sequelize por capas, RBAC y vistas sin duplicar. |
| `revisor-ui` | Audita diseño (emil/impeccable/taste): plano vs con vida, tokens, motion, estados, contraste. Opus, no edita. |
| `verificador` | Compuerta de calidad: lint/build, dataKey==dataFieldName, RBAC, estados. Sonnet, no edita. |

> Migración/refactor/automatización se trabajan en la rama **`studio`** (antes `revamp`),
> aislada de `master`/`develop`. Automatización: **Claude orquesta
> (agentes + Workflows), n8n solo dispara** (cron de runs, CI/PRs, notificaciones).

## Principios que aplican a todo

1. **Clean Architecture:** dependencias hacia adentro; negocio en use cases /
   hooks de estado, no en controllers ni en `pages/`.
2. **SOLID:** una responsabilidad por archivo/capa; extiende, no modifiques bases.
3. **Atomic Design:** clasifica todo componente (átomo/molécula/organismo/template/página).
4. **Una fuente de verdad de estilo:** el theme de Ant Design v6 + tokens
   globales. Hoy el theme vive en `frontend/src/infrastructure/config/theme/`; `presentation/styles/` solo tiene CSS.
5. **RBAC coherente:** la misma acción en ruta, UI y backend.
6. **Diseño con vida (2026)** (política: `motion` aún no está instalado en `frontend/package.json`; añadirlo al usar la primera animación): Ant Design 6 como base, **Motion (`motion/react`,
   ex framer-motion)** para animación, Material Design como *lenguaje* (elevación,
   motion, jerarquía) — **no** se migra a MUI/Tailwind. "Motion motivado": cada
   animación necesita una razón (jerarquía, feedback, estado, narrativa).

## Reglas de proceso (lo que evita "pasos volando")

- **Pruebas:** todo cambio de lógica lleva su prueba en el mismo PR (skill `incos-testing`); el CI ejecuta
  `npm run test:unit` (backend) y `npm test` (frontend). Un bug corregido lleva la prueba que lo reproduce.

- Al crear un listado o ficha completa, sigue el checklist del skill
  correspondiente **hasta el final**, incluyendo seeds y prueba con rol sin permiso.
- Si una tarea cruza frontend y backend (lo normal), aplica AMBOS skills de
  módulo + `incos-rbac`, y verifica que `dataKey` (front) = `dataFieldName` (back).
- Si dudas entre dos ubicaciones de carpeta o niveles atómicos, elige la que
  ya use un módulo de referencia (Docentes para ABM, CFG Académico para tabs).
- **Ant Design 6:** `Alert` → `title` (no `message`); `Space` → `orientation`
  (no `direction`, deprecado en antd@6.0.1); modales → `open` (no `visible`); evitar `<List>` nuevo (ver `incos-ui-system` y `incos-antd5-api`).

---

# Alcance de esta versión

- **Fuera de alcance, no se codifica:** seguimiento académico (avance académico, deserción,
  acompañamiento), **Traspasos** y **Transitabilidad**. El seed 59 los mantiene desactivados
  (`/avance-academico`, `/desercion`, `/acompanamiento` dan 403 a todos los roles). No contarlos
  como pendientes ni como deuda; si vuelven, se reactivan en el seed y se documentan en la matriz.
- Documentación de entrada: `README.md` (raíz), `docs/README.md`, `docs/guias/pruebas.md`,
  `docs/referencia/` (flujo operativo, matriz de permisos) y `docs/plan/` (planes con su estado).
- Contexto de negocio histórico: `docs/referencia/contexto-negocio-original.md` (sin verificar).

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

Referencia horarios: `docs/referencia/flujo-operativo-gestion-academica.md`.

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
- Consumir APIs ya expuestas antes de hooks legacy (`GET/PUT schedule`) salvo persistencia transitoria documentada en `docs/referencia/flujo-operativo-gestion-academica.md`.
