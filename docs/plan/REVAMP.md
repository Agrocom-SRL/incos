# REVAMP — Bitácora de migración / refactor / modernización UI 2026

> **Memoria compartida de los subagentes.** Todo agente que trabaje en la rama
> `revamp` DEBE leer este archivo al iniciar y actualizar la sección "Estado y
> progreso" al terminar su tarea. Es la única fuente de verdad del avance.

## 1. Objetivo

Modernizar el frontend INCOS (hoy "plano", deuda histórica de UI inconsistente)
hacia un diseño "con vida" 2026, **sin migrar de framework** y sin tocar las
ramas funcionales. La página de referencia del nuevo lenguaje es
`frontend/src/presentation/modules/matricula-v2`.

## 2. Decisiones fijadas (no relitigar sin acuerdo del usuario)

- **Stack:** Ant Design 6 (base) + **Motion** (`motion/react`, ex framer-motion)
  para animación + Material Design como *lenguaje* (elevación, motion, jerarquía).
  **NO** se migra a MUI ni Tailwind. GSAP solo si hubiera una landing con
  scroll-hijack (no aplica al CRUD).
- **Ramas:** `master` (producción) · `development` (desarrollo sobre prod) ·
  `template` (prueba de UI, contiene `matricula-v2`) · **`revamp`** (esta:
  migración + refactor + automatización, base `template`).
- **Automatización:** Claude orquesta (subagentes + Workflows); **n8n solo
  dispara** (cron de runs, CI/PRs, notificaciones). Sin n8n como orquestador.
- **Raíz del problema:** el "estilo con vida" de `matricula-v2` vive encerrado en
  el módulo. Hay que subirlo a una capa global (`presentation/styles/` + tokens +
  componentes/hooks reutilizables) para que TODOS los módulos lo hereden.
- **Arquitectura frontend:** Clean Architecture estricta de 4 capas
  (`domain/application/infrastructure/presentation`) es ceremonia excesiva para
  React. Dirección: **feature-based / modular ligero** (estilo Feature-Sliced
  "lite") — co-locar `pages/`+`components/`+`hooks/` por módulo; capa compartida
  delgada (design-system); reservar domain/use-case solo para negocio real.
  **Aplicación INCREMENTAL:** solo módulos nuevos/migrados (empezando por
  `matricula-v2`); el resto sigue en 4 capas hasta migrarse. NO re-layout big-bang.
  Mantener `routes.jsx` por dominio y el sidebar tal cual.
  **Tres niveles:** módulo (dominio sidebar) → ítem de menú (sub-feature, normalmente
  un **ABM**: listado+formulario+detalle) → página. Cohesión alta dentro del ítem,
  independencia entre ítems. **SOLID = una responsabilidad por archivo** (componente
  render / hook lógica / api llamadas / util puro / validator). **Atomic Design:**
  átomos+moléculas siempre compartidos (un solo set); **organismos dentro o fuera**
  del módulo (compartido si se reutiliza, local si no); plantillas ABM en
  `presentation/templates/`. Spec completa: `docs/plan/REVAMP-FASE-1B.md §0`.
- **Política de modelos en agentes:** sub-agentes mecánicos (aplicar edits,
  verificar lint) en **Sonnet** (`claude-sonnet-4-6`); auditoría, arquitectura y
  planificación en Opus. Cuida el tope semanal de Opus del plan Max.

## 3. Paleta de marca (derivada de los logos)

Fuente: `frontend/src/presentation/assets/images/branding/` (logo-horizontal,
logo-icon). El verde es el color de marca dominante (el icono es casi monocromo).
Estos valores son la base de los **tokens** (van al theme de AntD, §2 de
`incos-ui-system`), no se usan como `#hex` sueltos en componentes.

| Rol | Hex | Origen en el logo |
|-----|-----|-------------------|
| **Primario (marca)** | `#007848` | Verde esmeralda del texto "INCOS" |
| Primario oscuro (hover/active) | `#006048` | Verde del icono/escudo |
| Primario más oscuro (headers/sidebar) | `#004830` | Verde pino de "Santa Cruz" |
| Acento dorado (destacados, categorías) | `#E0A82E` | Corona / borde / león (de `#F0D030`, ajustado) |
| Acento rojo / danger de marca | `#C0282A` | Cruz del escudo (de `#F01020`, ajustado) |
| Acento azul / info de marca | `#5080E0` | Cielo del escudo |

> Validar contraste AA al mapear a tokens (`colorPrimary`, `colorText`, estados).
> El dorado y el rojo crudos del logo son muy brillantes para texto: usar las
> versiones ajustadas o derivar tonos del token.

## 4. Fases

1. **Fundación design-system global** — extraer tokens/tema/dark-mode de
   `matricula-v2` a `presentation/styles/` + theme AntD con la paleta de marca.
2. **Capa de motion** — Motion + patrones de `emil-design-eng` como
   componentes/hooks reutilizables.
3. **Skills del proyecto** — alinear `incos-ui-system` / `incos-antd5-api` (hecho
   parcialmente) con tokens globales y motion.
4. **Docs** — `CLAUDE.md` con agentes + skills globales (hecho).
5. **Migración módulo a módulo** — empezar por gemelos de `matricula`; auditar
   cada uno con `impeccable`.
6. **Automatización n8n** — disparadores una vez probado el pipeline.

## 5. Estado y progreso (actualizar al cerrar cada tarea)

- [x] Skills globales de diseño instaladas (`emil-design-eng`, `impeccable`,
      `design-taste-frontend`, `caveman`, `find-skills`). `humanize` descartada
      (servicio de pago externo).
- [x] 5 subagentes creados en `.claude/agents/` (orquestador, arquitecto,
      planificador, frontend, backend).
- [x] `CLAUDE.md` actualizado (agentes, skills globales, principio de motion).
- [x] `incos-ui-system` actualizado a v6 + §6b Animación/motion.
- [x] Rama `revamp` creada desde `template`.
- [x] Bitácora creada + paleta de marca extraída del logo.
- [~] Fase 1: Fundación design-system global — anclada dentro de `matricula-v2`
      (paleta de marca §3 aplicada a `theme-vars.css` + `incosTheme.js` como
      única fuente literal; `MatriculaV2Layout` deriva el theme AntD desde ahí).
      Falta subirla a `presentation/styles/` global.
- [~] Fase 2: Capa de motion — tokens de motion + `useReducedMotion` +
      patrones (stagger, AnimatePresence, count-up, press feedback) aplicados en
      `matricula-v2`; pendiente extraerlos a capa compartida.
- [ ] Fase 5: migración módulo a módulo.

## 6. Bitácora de cambios (append, lo más reciente arriba)

- 2026-06-14 — Fix import roto PRE-EXISTENTE en `matricula-v2/hooks/useMatriculaListV2.js`
  (`@application-configuracion/academico/carreras/hooks/useCarrerasApi` →
  barrel `@application-configuracion/academico/hooks`). **Build ahora verde**
  (`vite build` ✓ 12.79s). Quedan 5 errores de lint pre-existentes en hooks no
  tocados (`set-state-in-effect`, `only-export-components`), fuera de alcance 1A.
- 2026-06-14 — Aplicados hallazgos de auditoría (motion + pulido/estados/tokens)
  sobre `matricula-v2`. (1) Tokens: paleta de marca §3 recalculada en
  `theme-vars.css` (brand anclado a #007848/#006048/#004830; accents
  gold/red/sky a #E0A82E/#C0282A/#5080E0 ajustados AA); `incosTheme.js` pasa a
  ser única fuente literal + `buildIncosAntdTheme(mode)`; `MatriculaV2Layout`
  deriva el ConfigProvider de ahí (sin ~13 hex en JSX). Paleta categórica única
  para avatares/carreras. (2) Tokens de motion (`--ease-*`, `--dur-*`) + bloque
  global `prefers-reduced-motion`; `useReducedMotion` compartido + `MotionConfig
  reducedMotion="user"`. (3) Motion: press feedback `:active` universal en
  botones/segmented/chips/cards (gateado `hover:hover`); stagger de la grilla
  (`StudentCardGrid`), `AnimatePresence` en toolbar bulk-swap, skeleton+crossfade
  vs `<Spin>`, count-up de KPIs, fill animado de progreso, cross-fade del
  theme-toggle (sin rotate-on-hover), acordeón del sidebar (grid-rows) + chevron
  rotatorio, stagger del Drawer. (4) Pulido: KpiCard/StatusPill/CareerChip/
  StudentCell/StudentDrawer migrados a clases CSS (fuera inline px/hex);
  CareerChip unificado con el chip "Todas" (átomo único, `<button>`+aria);
  empty state + error con `Alert title=` (no `message`); deltas KPI inventados
  eliminados; color de negocio vía `sanitizeBusinessColor`; helper único
  `pagoStatus`; `buildFullName` en adapter/topbar (§4b); footer del sidebar
  desde `useAuthContext`; ítems de nav como `<button>` con `aria-current`.
  Lint: archivos tocados/nuevos sin errores; quedan 5 errores PRE-EXISTENTES en
  hooks no tocados (`set-state-in-effect`, `only-export-components`). Build
  falla por import roto pre-existente (`useCarrerasApi` sin extensión) ajeno a
  esta tarea.
- 2026-06-14 — Auditoría jerarquía/pulido/estados (lente impeccable +
  design-taste) sobre `matricula-v2`. Hallazgo clave: la paleta del módulo NO
  deriva de la marca de §3 — `theme-vars.css`, `incosTheme.js` y los hex del
  `ConfigProvider` del layout son TRES escalas de color distintas e
  incorrectas (verde #0d7a3d/#0a6532 en vez de #007848/#006048; gold/red/sky
  divergentes). Inline masivo con fontSize/px/hex (KpiCard, StatusPill,
  CareerChip, StudentCell, StudentDrawer). Falta empty state y skeleton; error
  usa `Alert message=` (v6 deprecado). Deltas KPI inventados. Sin Motion.
  Detalle por archivo entregado al orquestador (código no editado).
- 2026-06-14 — Setup inicial: skills globales, subagentes, CLAUDE.md,
  incos-ui-system, rama `revamp`, paleta de marca desde logos.
- 2026-06-14 — Auditoría de motion/interacción (lente Emil Kowalski) sobre
  `matricula-v2`. Hallazgo clave: Motion v12 instalado pero NO usado en el módulo;
  0 microinteracciones de press (`:active`), sin `useReducedMotion`, sin enter/exit
  en Drawer/grid/expand, `transition: all` y curvas débiles. Detalle por archivo
  entregado al orquestador (no editado el código).
