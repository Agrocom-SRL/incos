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

- [x] **studio/ mock de inscripciones regenerado a datos REALES del backend (shape intacto).**
      2026-06-21. `studio/src/mocks/enrollments.mock.js` reescrito leyendo seeders/schema/dump
      (solo lectura, 0 SQL/DDL). Misma forma vista 101 (camelCase anidado) que consume
      `adaptEnrollment.js` (sin tocar adapter ni config). Correcciones de fidelidad: solo 3
      carreras reales (SIS-INF/ADM-EMP/CON-GEN, antes 6 inventadas CG/SI/AE/MP/SE/EI); periodos
      ANUALES (Primer/Segundo/Tercer Año, no "N° Semestre"); gestion "Gestión Regular 2026";
      `cantidadMaterias` contado real de 14-asignaturas-plan por carrera+periodo; paralelos y
      turnos reales de 25/27-paralelos(-gestion); `historialPrevioEstado` limitado a los 3
      valores del CASE derivado de la vista 101 (NO_APLICA/REGISTRADO/PENDIENTE, sin OBSERVADO/
      REVISION que el adapter sólo maneja defensivamente). Estudiantes = PII REAL del dump
      migrado (11/12/19-migrate), código real "20260001" (no GESTION-CARRERA-NNNN). 16 filas
      cubriendo 3 carreras × periodos 1-3 × NUEVO/ANTIGUO/TRASPASO/TRANSITABILIDAD. 0 cambio de
      comportamiento (estadoPago sigue como display 'Al día'/'Pendiente' que espera pagoStatus.js).

- [x] **studio/ tabla responsive — FIX IMPLEMENTADO (BUG 1) + Select de export alineado (BUG 2).** 2026-06-20, pendiente re-gate verificador/revisor-ui. BUG 1: (1) `lib/hooks/useElementWidth.js` → CALLBACK-REF (`useCallback` setter + `useState` width; observer/rAF en refs); firma `useElementWidth()` ⇒ `[ref, width]`; engancha el `ResizeObserver` cuando React monta el nodo aunque aparezca tras el 1.er render dentro de `<AnimatePresence>`. `ListDataView` (único consumidor) actualizado. (2) `ListDataView.css`: `table-layout:fixed; width:100%` en `.mat-table .ant-table table`; `overflow-x:hidden` degradado a RED DE SEGURIDAD. (3) `buildColumns.jsx`: columna `actions` con `minWidth:140` (espejo ACTIONS_W.full) + `buildEnrollmentActions` invocado UNA vez por tabla (`actionsCell`). (4) Touch target ⋮ ≥44px: NUEVO `design-system/tokens/sizes.js` ({control:38, touchTarget:44}) en barrel + emitido `--size-control`/`--size-touch-target` por `applyThemeVars`; `IconButton.css` usa `var(--size-control)` y crece a `var(--size-touch-target)` bajo `@media (pointer:coarse)` (desktop intacto). BUG 2: `EnrollmentHeaderActions.css` — el `flex:1 1 100%` de `@container content (max-width:640px)` forzaba el select a fila completa; ahora `(max-width:768px){flex:1 1 200px; min-width:0}` (absorbe sobrante y comparte fila con los 2 botones) y solo `(max-width:480px){flex-basis:100%}` lo lleva a fila completa. `--export-color` intacto; `PageHeader.css` sin cambios. Tokens al origen, 0 hex/px/fontSize sueltos nuevos. NOTA: lint/build NO ejecutables en este entorno (policy bloquea eslint/vite) → revisión estática limpia, pendiente gate de `verificador`.

- [ ] ~~BUG ABIERTO — studio/ tabla responsive NO colapsa~~ (RESUELTO arriba). Diagnóstico original: `useElementWidth` usaba `useEffect([ref])` con `ref` = objeto `useRef` estable; el effect corre solo al montar `ListDataView` con `loading=true`, cuando `tableRef.current=null` (el `div.mat-table__measure` vive dentro de `<AnimatePresence mode=popLayout>`, rama `data-table` aún no en DOM). Al entrar los datos el node se asigna pero el effect NO re-corre → `ResizeObserver` nunca se adjunta → `containerWidth=0` toda la sesión → `useResponsiveColumns(cols,0)` early-return = todo visible/density full → 0 columnas ocultas, 0 ResidualRow, RowActions siempre full (sin ⋮). Agravante: `.mat-table .ant-table-content { overflow-x:hidden }` recorta silenciosamente las columnas que no caben (sin scroll, sin chevron) → 4 columnas inaccesibles. FIX MÍNIMO pendiente de implementar: (1) callback-ref en `ListDataView` (useState(null)+ref fn) o mover el measure-div a wrapper estable fuera de AnimatePresence, y `useElementWidth` dependiente de `[node]`; (2) `table-layout:fixed`/`width:100%` para que la tabla no exceda el wrapper; (3) `minWidth` real a la columna `actions` (hoy solo width:140); (4) touch target ⋮ ≥44px en density compact (IconButton 38px). Lint/build verdes; SOLID/contrato del template intactos; 0 schema.

- [x] studio/ TABLA RESPONSIVE POR CONTENEDOR (plan eventual-napping-deer Fases 1-4). COMPLETADO (2026-06-20). Sistema homogéneo en el template ui/templates/ListPage/ que toda página futura hereda sin reimplementar. Fase 1: lib/hooks/useElementWidth.js (ResizeObserver+rAF). Fase 2: useResponsiveColumns.js (función pura (columns, containerWidth, prev?)→{visibleColumns,hiddenColumns,density}; oculta por suma de minWidth, derecha→izquierda; density por breakpoints.js md/lg) + minWidth en buildColumns.jsx. Fase 3: parts/ResidualRow/ (fila collapse) + ListDataView expandable, sin scroll-x. Fase 4: ListDensityContext.js + parts/RowActions/ (data-driven, 3 densidades full/medium/compact); feature consumidor: model/enrollmentActions.jsx (descriptores {key,icon,labelKey,tone?,primary?,danger?,divider?,onClick}); StudentCard usa el mismo RowActions; EnrollmentActions retirado. La card NO cambia. Histéresis 20px columnas / 16px densidad + preset residualReveal anti-parpadeo/anti-doble-salto. Gates: verificador APROBADO + revisor-ui APROBADO (2 HIGH resueltos en re-gate). Build ✓ 6.63s · Lint exit 0. 0 schema/SQL. Sin commits.

- [x] studio/ Fases 1+4+5+6 (plan eventual-napping-deer). COMPLETADO (2026-06-20).
      Fase 1: nav i18n es/en — 6 labels desambiguados (teachersList/reportProgress/
      academicConfig/reportAttendance/internships/academicHistory), solo valores. Fase 4:
      ui/templates/ListPage/ → parts/ (ListKpiRow/ListFacets/ListFilterBar/ListDataView/
      ListSkeleton carpeta-por-componente; ListPage/ListPage.css/useListPage en raíz;
      ListDataView→../ListSkeleton/ListSkeleton). Fase 5: features/matriculas/lista/ →
      capas ligeras config/data/model/components/ (sections/ eliminada; EnrollmentsListPage
      en raíz; careerColor/pagoStatus/historyStates/adaptEnrollment/buildColumns en model/).
      Fase 6: auditoría color — 0 hex en js/jsx fuera de las 3 fuentes (palette/categorical/
      brand), 0 literal de color en css sin var(). Gate post-movimiento + final: build ✓ /
      lint exit 0; 0 imports rotos; dataKey↔accessor 0 desajustes. revisor-ui + verificador
      APROBADO_CON_OBSERVACIONES; único hallazgo material (AA dark on-accent) RESUELTO por tokens.

- [x] Fase 2 — Ampliación de perceptibilidad motion/hover en `matricula-v2` (pase 2):
      Primario reanclado a brand-500 en `incosTheme.js` + CSS; sombras amplificadas
      (shadow-md/lg con brecha real); hover botón primario con lift+glow; ghost hover
      con lift+shadow; KPI hover con translateY(-3px)+icon scale+value scale+blob parallax;
      sidebar hover con translateX+icon tint; chips activos con `@keyframes mv2-chip-pop`;
      AnimatePresence mode=popLayout con y+scale asimétrico (enter 0.26s/exit 0.16s);
      topbar icon microinteracciones con scale+bell tilt; search focus ring amplificado;
      acción de fila icon scale en hover; dark mode verde menos fosforescente (#86e3b3/#5dd3a0).


- [x] Skills globales de diseño instaladas (`emil-design-eng`, `impeccable`,
      `design-taste-frontend`, `caveman`, `find-skills`). `humanize` descartada
      (servicio de pago externo).
- [x] 5 subagentes creados en `.claude/agents/` (orquestador, arquitecto,
      planificador, frontend, backend).
- [x] `CLAUDE.md` actualizado (agentes, skills globales, principio de motion).
- [x] `incos-ui-system` actualizado a v6 + §6b Animación/motion.
- [x] Rama `revamp` creada desde `template`.
- [x] Bitácora creada + paleta de marca extraída del logo.
- [x] Fase 1B WS-A: Fundación design-system global completada.
      Inter auto-hospedada (@fontsource/inter, sin Google Fonts). Paleta
      reanclada a §3 en tokens/colors.js. brand-tokens.css global (tokens de
      marca + motion + prefers-reduced-motion, sin la regla body global peligrosa).
      buildAntdTheme(mode) en @theme/buildAntdTheme.js; light.js/dark.js = builder;
      ThemeProvider + useTheme en presentation/hooks/ (global); ThemeToggle en
      presentation/components/atoms/. App.jsx cableado con ThemeProvider +
      AppConfigProvider. MatriculaV2Layout consume el global (sin ConfigProvider
      ni ThemeProvider locales). Borrados: incosTheme.js, matricula-v2-theme-vars.css,
      hooks/useTheme.jsx, components/ThemeToggle.jsx de matricula-v2.
      Build: ✓ 12.80s. Lint: 534 errores pre-existentes, 0 nuevos en archivos WS-A.
- [x] Fase 1B WS-B: Capa de motion compartida. COMPLETADO (2026-06-15).
      presentation/motion/presets.js (EASE/DUR/STAGGER/variants); barrel index.js;
      hooks: useReducedMotion (re-export motion/react), useCountUp (DUR/EASE, sin setState en efecto);
      átomos: FadeIn, Stagger+Item, CountUp, PresenceSwap, Collapse;
      motion-utilities.css global (collapse-wrapper, is-pressable, keyframes bell-tilt/chip-pop/shimmer).
      Shell: MotionConfig reducedMotion="user" en MainLayout; RouteTransition via EASE/DUR (sin literales);
      MatriculaV2Layout sin MotionConfig local (hereda global). NavigationMenu usa Stagger.
      mv2 consume capa compartida: StudentCardGrid→Stagger, KpiCard→useCountUp, StudentDrawer→FadeIn+STAGGER,
      FilterToolbar→PresenceSwap+variants, MatriculaListV2→motionVariants.presenceSwap, StudentCard→global hook.
      Gate reduced-motion: 3 capas (MotionConfig, useReducedMotion en wrappers, @media CSS global).
      Build: ✓ 51.90s. Lint: exit 0, 0 errores en 19 archivos WS-B. RBAC: application/navigation/ sin diff.
      Observacion menor: bell-tilt usa 0.35s literal (no hay --dur-bell token) en mv2.css y app-topbar.css.
- [x] studio/ Fix AA on-accent (light+dark) por tokens. COMPLETADO (2026-06-20).
      --color-on-accent por modo (light #fff / dark #0a1f15); accents light gold/teal/orange
      oscurecidos (≥4.5 blanco-encima); SEMANTIC.light.warning sincronizado; cat-6/10/11 verdes
      extra por modo AA-válidos. 8 accents + 12 cat ≥4.5:1 (texto) en AMBOS modos; dots ≥3:1.
      Build ✓ 6.47s · Lint exit 0. Componentes intactos.
- [ ] Fase 5: migración módulo a módulo.
- [x] studio/ Fase 2 (paleta ampliada theme-aware) + Fase 3 (cards híbridas). COMPLETADO (2026-06-20).
      accents 3→8 por modo (red/gold/sky + teal/violet/orange/pink/lime) en incos.brand.js;
      categorical.js → { light, dark } 12 colores DERIVADOS de incosBrand (índices 0–5 = carreras
      CG/SI/AE/MP/SE/EI) + categoricalFor(mode) + compat categoricalPalette=light; palette.js
      añade categorical:categoricalFor(mode); applyThemeVars itera p.accent (--accent-*) y emite
      --cat-0…11; careerColor → var(--cat-N) theme-aware (consumidores todos en contexto CSS,
      0 roturas); NUEVO lib/hooks/useCategoricalPalette.js; Fase 3: .mat-grid > *:nth-child(2n)
      .mat-card tinte alterno sutil vía color-mix(--surface-alt). Build ✓ 6.99s · Lint exit 0.
- [x] studio/ Fase A — responsive por contenedor (container queries). COMPLETADO (2026-06-20).
      NUEVO design-system/tokens/breakpoints.js (escala única xs480/sm640/md768/lg1024/xl1280)
      en el barrel; .ds-shell__content con container-type:inline-size + container-name:content;
      grids de matrículas migrados @media(viewport)→@container content(ancho del content); drawer
      767 sigue @media (sidebar fixed al window). Cleanup post-gate: 3 @media off-scale normalizados
      a la escala vía @container (ListPage.css 575→640, BulkActionsBar.css 767→768,
      EnrollmentHeaderActions.css 639→640). Build ✓ 6.59s · Lint exit 0.
- [x] studio/ Fase B — template ListPage parametrizado + Matrículas a config. COMPLETADO (2026-06-20).
      NUEVO ui/templates/ListPage/ (ListPage/useListPage/ListKpiRow/ListFacets/ListFilterBar/
      ListDataView/ListSkeleton + CSS) generaliza 1:1 useEnrollmentsList; config declarativa +
      slots headerActions/cardRender/rowActions/bulkActions/skeleton. Matrículas = consumidor
      delgado (enrollments.config.jsx); useEnrollmentsList y secciones viejas eliminadas; viewMode
      unificado 'table'|'card'. Build ✓ 6.43s · Lint exit 0.
- [x] studio/ Fase C — nav por dominio (4 grupos) + menú completo. COMPLETADO (2026-06-20).
      navigation.js: 1→4 secciones (main/academicMgmt/financeReports/system), 37 ítems hoja;
      i18n es/en con labels de sección + todas las keys nuevas (keys muertas limpiadas); 37 rutas
      explícitas a PlaceholderPage en router.jsx (enrollments→ListPage); Sidebar.jsx sin cambios.
      Build ✓ 6.58s · Lint exit 0.
- [x] Fase 1B WS-D: plantillas ABM + estados compartidos. COMPLETADO (2026-06-19).
      ADITIVO (no se migró ninguna page; eso es WS-F). Estados base: atoms/Skeleton.jsx
      (variant rows|grid|detail|form, wrapper sobre AntD Skeleton, sin motion JS);
      molecules/ErrorState.jsx (Alert title/description + Button reintento, FadeIn gateado);
      molecules/EmptyState.jsx (generaliza MatriculaEmptyState; variant default|no-results,
      FadeIn gateado). Consolidación: TableListView (error→ErrorState, loading→Skeleton rows,
      prop opcional emptyState; default idéntico); DetailPageShell (loading→Skeleton detail,
      error→ErrorState; Empty intacto). PageHeader (props opcionales subtitle/description;
      título en FadeIn; layout idéntico sin esas props). PageTemplate (FadeIn interno
      conservador, firma intacta). Plantillas ABM: templates/{ListTemplate,FormTemplate,
      DetailTemplate}.jsx — COMPONEN organismos existentes (TableListView/WizardForm/
      DetailPageShell+ProfileCard+TabsPanel), no reimplementan tabla/wizard/estados.
      Tokens al origen: spacing.js stateSizes (emptyIconBox/Glyph/HintMaxW/PadY) +
      skeletonCardWidth emitidos como --state-empty-* / --skeleton-card-width en root.js;
      CSS nuevo styles/components/{atoms/skeleton.css, molecules/state.css} + subtitle/
      description en page-header.css (todo var(--…)). Build verde por bloque (11.69/11.46/
      12.55/11.38s). Lint exit 0 en los 15 archivos tocados. RBAC: application/navigation/
      sin tocar. AntD v6: ErrorState usa title/description (no message).
- [x] Fase 1B WS-C: shell legacy + tokens centralizados. COMPLETADO (2026-06-15).
      Tokens: brandScale.light/dark en colors.js (única fuente literal); buildAntdTheme
      sin hex hardcodeados; applyThemeVars(mode, overrides) idempotente (reemplaza
      injectCSSVariables one-shot); --brand-N en runtime vs CSS estático; useTheme
      llama applyThemeVars al cambiar modo. Shell: CSS conmutable (dark via
      [data-theme='dark'] en header/sider/content/navigation-menu); Sidebar visual mv2
      (logo-area + nav + SidebarUserFooter molécula); NavigationMenu reescrito con
      SidebarItem/SidebarSection botones (RBAC intacto: solo pinta menuItemsWithIcons
      filtrado); Header integra HeaderUtilities molécula (ThemeToggle global oscurece
      TODO el shell); Content con transición de ruta (AnimatePresence+fade+translateY,
      gateada por useReducedMotion). Build: ✓ 14.47s. Lint: 0 nuevos errores en
      archivos tocados (604 total = 534+70 pre-existentes sin cambio).

## 6. Bitácora de cambios (append, lo más reciente arriba)

- 2026-06-21 — **backend (solo lectura) + frontend: studio/ mock de inscripciones regenerado a datos reales.** Único archivo escrito: `studio/src/mocks/enrollments.mock.js`. Leídos (sin tocar): `02-seeders/{10-carreras,12-periodos,14-asignaturas-plan,16-gestiones,25-paralelos,27-paralelos-gestion}`, `01-schemas/{13-inscripciones,14-pagos-academicos}`, `03-views/101-vista-base-matricula-resumen-inscripcion`, `05-migrations/{11-estudiantes,12-datos-academicos,19-inscripciones}` y `adaptEnrollment.js`. Shape de la vista 101 (camelCase anidado) preservado 1:1; ni el adapter ni los config (pagoStatus/historyStates) se modificaron. **Valores reales tomados:** carreras = `{1:'Sistemas Informáticos'/SIS-INF, 2:'Administración de Empresas'/ADM-EMP, 3:'Contaduría General'/CON-GEN}` (el mock viejo inventaba 6 carreras CG/SI/AE/MP/SE/EI — corregido); gestión vigente = id 1, 2026, "Gestión Regular 2026"; periodos = grano ANUAL numero 1-3 "Primer/Segundo/Tercer Año" (el viejo decía "N° Semestre"); `cantidadMaterias` = conteo real de asignaturas_plan (SIS 7/8/8, ADM 7/8/7, CON 9/7/8 por Año1/2/3); paralelos "PRIMERO/SEGUNDO/TERCERO X" con turno efectivo de paralelos_gestion (SIS NOCHE, ADM/CON TARDE+NOCHE); `tipoInscripcion` ENUM real NUEVO|ANTIGUO|TRASPASO|TRANSITABILIDAD; `historialPrevioEstado` = SOLO los 3 valores del CASE derivado de la vista 101 (NO_APLICA para NUEVO, REGISTRADO/PENDIENTE para los otros) — NO un ENUM de tabla; OBSERVADO/REVISION del mock viejo eliminados (la vista nunca los emite, el adapter sólo los maneja por defensa). Estudiantes = **PII real del dump migrado** (no inventada): nombres/CI/código reales (formato real "20260001", no "GESTION-CARRERA-NNNN"), expedicion casi siempre null (rara 'SC'), carrera/tipo/fecha enlazados a las filas reales de datos_academicos+inscripciones. **Supuestos documentados:** `estadoPago` y `promedio` NO existen en la vista 101 (campos extra que leen adapter/columnas) — `estadoPago` se mantiene como display 'Al día'/'Pendiente' que espera `config/pagoStatus.js` (ENUM crudo subyacente de pago_aporte = PENDIENTE|PARCIAL|CANCELADO); `promedio` null en la gestión vigente (sin notas aún en el dump). 16 filas variando carrera/periodo/tipo/pago/historial. 0 schema/SQL/DDL ejecutado.

- 2026-06-20 — **frontend: studio/ 2 refactors estructurales (ListPage hooks + matrículas config), SIN cambio de comportamiento.** Ejecuta E1+E2 del arquitecto (entrada previa). **REFACTOR 1 — separar PÁGINA vs LÓGICA en `ui/templates/ListPage`:** nuevo dir `hooks/` SOLO para hooks con estado React. (1) `hooks/useResponsiveTable.js` ⇒ `(columns, viewMode) → { tableRef, visibleColumns, hiddenColumns, density }`: mueve desde `ListDataView.jsx` el `useElementWidth()` (callback-ref), el `prevDecisionRef` (useRef de histéresis), la invocación de `useResponsiveColumns` y la escritura de `prevDecisionRef.current` **EN EL CUERPO del render** (NO en efecto — documentado en el hook: aplicar la histéresis un render tarde reintroduciría el parpadeo en el borde). (2) `hooks/useResidualExpandable.jsx` ⇒ `({ hiddenColumns, getRowKey }) → expandable | undefined`: mueve el objeto `expandable` (`expandedRowRender` con `ResidualRow`, `columnWidth:48`, `expandIcon` con chevron `RightOutlined`, badge `__count`, a11y `aria-expanded`/`-controls`/`-label` + i18n vía `useTranslation` interno); devuelve **`undefined`** (no `{}`) cuando `hiddenColumns.length === 0`. `ListDataView.jsx` queda como COMPOSICIÓN pura: llama a ambos hooks y pasa el resultado al `<Table>`; imports migrados eliminados (`useRef`, `RightOutlined`, `useElementWidth`, `useResponsiveColumns`, `ResidualRow`). `useResponsiveColumns.js` (función PURA, "NO es un hook") SE QUEDA en root — no se movió. `ListPage.jsx`/`useListPage.js`/`useResponsiveColumns.js`/`ListDensityContext.js` sin cambios (no se creó hook de densidad: `useListDensity` ya existe). Comportamiento responsive intacto (medición, histéresis, `fixed:'right'`, chevron). **REFACTOR 2 — `config/` en `features/matriculas/lista`:** movidos a `config/`: `enrollmentActions.jsx`, `historyStates.js`, `pagoStatus.js` (descriptores estáticos = config). QUEDAN en `model/`: `adaptEnrollment.js`, `buildColumns.jsx`, `careerColor.js` (lógica). Imports arreglados en TODOS los importadores (grep): `model/buildColumns.jsx` (`./enrollmentActions|./pagoStatus|./historyStates` → `../config/...`), `config/enrollments.config.jsx` (`../model/historyStates` → `./historyStates`), y `components/StudentCard/StudentCard.jsx` (`../../model/{enrollmentActions,historyStates,pagoStatus}` → `../../config/...`) — este último NO estaba en el grep del arquitecto pero es importador real, corregido. `EnrollmentsListPage.jsx` no tocado (verificado). **Lint exit 0 · Build ✓ 7.61s.** 0 schema/SQL/RBAC, sin commits. PENDIENTE MANUAL (la policy del entorno bloquea `git mv`/`rm`): borrar los 3 originales huérfanos en `model/` (`enrollmentActions.jsx`, `historyStates.js`, `pagoStatus.js`) — ya copiados a `config/`, sin importadores (orphan, tree-shaken por Vite); el árbol no estará 100% limpio hasta eliminarlos.

- 2026-06-20 — **frontend: studio/ 3 fixes UI responsive (ListPage + matrículas), por tokens.** **FIX 1 — columna de ACCIONES recortada al borde derecho:** la columna `actions` ahora es `fixed: 'right'` (`buildColumns.jsx`) → AntD la ancla a la derecha; `ListDataView.jsx` añade `scroll={{ x: '100%' }}` para ACTIVAR el modo fixed (sin scroll real: `useResponsiveColumns` ya ajusta las columnas visibles al ancho medido). Red de seguridad CSS en `ListDataView.css`: `.ant-table-cell-fix-right` con `position:sticky; right:0; z-index:2; background:var(--surface)` (header `--surface-alt`) → el ⋮ queda pegado a la derecha y por encima de las columnas de datos aunque la suma roce el wrapper; nunca lo recorta `overflow-x:hidden`. **FIX 2 — toggle de collapse sin forma/icono (glifo +/- nativo de AntD roto):** el `expandIcon` deja de reusar `.ant-table-row-expand-icon` y pasa a button PROPIO `.mat-expand` con `<RightOutlined className="mat-expand__chevron">` explícito DENTRO (chevron que rota 90° con `.mat-expand--open`, `transform var(--dur-pop) var(--ease-out)`). `ListDataView.css`: `.mat-expand` autocontenido — `width/height` por `var(--size-control)` (38px mouse) / `var(--size-touch-target)` (44px en `@media pointer:coarse`), `border 1px var(--border)`, `border-radius:var(--radius-md)`, `background:var(--surface-alt)`; pseudo-elementos nativos anulados (`::before/::after { content:none }`); tinte `--brand-600`/`--brand-500` con `--has-hidden`, hover `--brand-700`, micro-badge `.mat-expand__count` reposicionado sin solaparse, focus-visible con ring de marca. `aria-expanded`/`aria-controls`/`aria-label` mantenidos. **FIX 3 — Select de export no llega al borde en pantalla angosta:** `PageHeader.css` `.ds-page-header__actions` recibe `flex:1 1 100%` en `@container content (max-width:768px)` → cuando el bloque de acciones wrappea a su propia fila, ocupa TODO el ancho del header (no solo el de su contenido), así el select (que ya tenía `flex:1 1 200px` a 768 y `flex-basis:100%` a 480 en `EnrollmentHeaderActions.css`) crece hasta el borde derecho, alineado con las KPI cards; `justify-content:flex-end` intacto → en desktop el cluster sigue ajustado a contenido y a la derecha, sin cambio. White-label `--export-color` intacto. Archivos: `features/matriculas/lista/model/buildColumns.jsx`, `ui/templates/ListPage/parts/ListDataView/ListDataView.{jsx,css}`, `ui/molecules/PageHeader/PageHeader.css`. 0 hex/px-color/font-size sueltos nuevos (radius/dur/size/brand reusan tokens ya emitidos por `applyThemeVars`); `@container content` de la escala (768=md, 480=xs), no `@media` de breakpoint; chevron respeta reduced-motion vía cap global de `base.css`. Sin tocar schema/SQL/RBAC. NOTA: lint/build no corridos (policy); revisión estática limpia, pendiente re-gate de `verificador`/`revisor-ui`. Sin commits.

- 2026-06-20 — **arquitecto: studio/ decisión de diseño (read-only) — 2 entregables.** **E1 — separar PÁGINA vs LÓGICA en `ui/templates/ListPage`:** crear dir `hooks/` SOLO para hooks con estado React del template; `useResponsiveColumns.js` (función PURA, su JSDoc dice "NO es un hook") SE QUEDA en root (no entra a `hooks/`). Extraer de `parts/ListDataView/ListDataView.jsx` (hoy concentra medición+histéresis+expandable): (1) `hooks/useResponsiveTable.js` ⇒ `(columns,viewMode)→{tableRef,visibleColumns,hiddenColumns,density}` (mueve líneas 81–104: useElementWidth + prevDecisionRef + invocación de useResponsiveColumns + escritura del ref EN EL CUERPO del render, no en efecto, para no reintroducir parpadeo); (2) `hooks/useResidualExpandable.jsx` ⇒ `({hiddenColumns,getRowKey})→expandable|undefined` (mueve 106–138: objeto expandable + expandIcon con a11y/i18n; .jsx por el JSX del icono; devolver undefined no {}). NO crear hook de densidad: `ListDensityContext` ya expone useListDensity. ListDataView queda como composición pura. `useListPage.js`/`ListPage.jsx`/`useResponsiveColumns.js`/`ListDensityContext.js` SIN cambios. Cero impacto en features: ninguno importa ListDataView/useResponsiveColumns/useElementWidth/contexto directo (solo `@ui/templates/ListPage/ListPage` y `.../parts/RowActions`). Convención verificada: studio NO usa `hooks/state/` (eso es del frontend legacy); usa hooks planos en root del template + `lib/hooks/` transversales. **E2 — config/ en `features/matriculas/lista`:** `config/` YA existe (solo `enrollments.config.jsx`). MOVER a config/: `model/enrollmentActions.jsx` (descriptor de acciones como DATA), `model/historyStates.js` (mapa estático estado→{tone,iconKey}+opciones de filtro) y `model/pagoStatus.js` (mapa estado→tono, P2). QUEDAN en model/: `adaptEnrollment.js` (transformación API→VM), `buildColumns.jsx` (JSX de celdas), `careerColor.js` (regla de derivación con fallback, co-locado con su único consumidor adaptEnrollment). Imports a tocar: buildColumns.jsx (`./enrollmentActions|./pagoStatus|./historyStates`→`../config/...`), enrollments.config.jsx (`../model/historyStates`→`./historyStates`). 0 schema/SQL, 0 RBAC. Listos para dispatch a `frontend`.

- 2026-06-20 — **frontend: studio/ ResidualRow ficha de definición + a11y del toggle collapse (TAREAS A/B/C), por tokens.** **TAREA A — `ResidualRow` leía como celdas sueltas a la deriva:** `column.render(undefined,row)` devolvía el JSX de la celda de tabla con su tipografía/alineación propia (en GESTIÓN el año salía GRANDE con la fecha apilada), y `.ds-residual-row__value` forzaba `text-align:right` + `space-between` → valores floteando a la derecha a escalas dispares. Rediseñado a **ficha de definición alineada a la IZQUIERDA**: cada item apila label (uppercase `--font-size-xs` `--text-soft`) ARRIBA y valor DEBAJO; eliminados `justify-content:space-between` y `text-align:right`. Valor normalizado a la escala del residual (`--font-size-sm`/`--text`) con `flex-wrap` para badges; un selector acota el texto plano heredado de renders de celda (`> span/div:not([class])`) a la escala de ficha SIN tocar los chips semánticos (que conservan color/tipografía). `minmax(220→200px)`, gap a `--space-md`/`--space-xl`. **TAREA C — contrato genérico robusto del template:** `valueOf` ahora soporta (1) `column.renderResidual?.(row)` (modo ficha opt-in), (2) `column.render(value,row)` con el VALOR REAL resuelto desde `dataIndex` (antes pasaba `undefined`), (3) `row[dataIndex]` plano. `ResidualRow` sigue genérico (no acopla a @features). Matrículas declara `renderResidual` para la columna `term` en `buildColumns.jsx` (año + fecha inline a escala de ficha vía `.mat-term--residual`, tabular-nums). **TAREA B — a11y del toggle de collapse:** (B1) `.ant-table-row-expand-icon` pasa de ~17px nativo a `var(--size-control)` (38px mouse) / `var(--size-touch-target)` (44px en `@media (pointer:coarse)`) con glifo centrado por flex — mismo trato por token que el ⋮, sin px literales. (B2) descubribilidad: clase `mat-expand--has-hidden` tiñe el toggle con `--brand-600`/`--brand-500` (no gris inerte) + micro-badge `.mat-expand__count` con `hiddenColumns.length` (solo colapsado, `--brand-600`/`--color-on-accent`); `aria-expanded` mantenido + `aria-controls` al id de la fila residual + `aria-label` `common.hiddenFields` con conteo (nuevo i18n es/en). Hover sube a `--brand-700`. Archivos: `ui/templates/ListPage/parts/ResidualRow/ResidualRow.{jsx,css}`, `parts/ListDataView/ListDataView.{jsx,css}`, `features/matriculas/lista/model/buildColumns.jsx`, `lib/i18n/locales/{es,en}/common.js`. 0 hex/px/fontSize sueltos nuevos (tamaños del toggle reusan `--size-control`/`--size-touch-target` ya emitidos por `applyThemeVars`). Arquitectura del template extendida, no modificada (`renderResidual` opcional con fallback). Sin schema/SQL. NOTA: lint/build no corridos (policy); revisión estática limpia, pendiente re-gate. Sin commits.

- 2026-06-20 — **frontend: studio/ FIX tabla responsive (BUG 1) + Select de export (BUG 2), por tokens.** Implementa el "PLAN MÍNIMO DE FIX" de la revisión previa. **BUG 1 — la tabla nunca colapsaba (containerWidth=0 toda la sesión):** (1) `lib/hooks/useElementWidth.js` reescrito de `useRef`+`useEffect([ref])` a **callback-ref** (`useCallback` que adjunta el `ResizeObserver` al recibir el nodo, observer+rAF guardados en refs, limpieza al recibir `null`); nueva firma `useElementWidth()` ⇒ `[ref, width]`. Razón: el measure-div vive dentro de `<AnimatePresence>` y solo entra al DOM cuando llegan los datos (tras el 1.er render con loading=true); la callback-ref se engancha exactamente cuando React monta el nodo, el `useEffect([ref])` no re-corría. `ListDataView.jsx` (único consumidor) pasa a `const [tableRef, containerWidth] = useElementWidth()`. (2) `ListDataView.css`: `.mat-table .ant-table table { table-layout:fixed; width:100% }` para que la tabla no exceda el wrapper medido; `overflow-x:hidden` queda como RED DE SEGURIDAD documentada (no como recortador de columnas). (3) `features/matriculas/lista/model/buildColumns.jsx`: columna `actions` recibe `minWidth:140` (columna fija; espejo de `ACTIONS_W.full` en useResponsiveColumns) y `buildEnrollmentActions(t,handlers)` se invoca UNA vez a nivel de columna (`actionsCell`), no por celda (SRP). (4) **Touch target ⋮ ≥44px** sin literales: NUEVO `design-system/tokens/sizes.js` `{ control:38, touchTarget:44 }` añadido al barrel `tokens/index.js` y emitido por `applyThemeVars` como `--size-control`/`--size-touch-target`; `ui/atoms/IconButton/IconButton.css` consume `var(--size-control)` (antes `--chrome-control,38px` literal) y crece a `var(--size-touch-target)` bajo `@media (pointer:coarse)` → 44px en táctil, 38px en desktop intacto. **BUG 2 — el Select de export rompía la fila a tablet:** `features/matriculas/lista/components/EnrollmentHeaderActions/EnrollmentHeaderActions.css` — el `@container content (max-width:640px){ .mat-export-select{ flex:1 1 100% } }` forzaba fila completa prematura. Reemplazado por: `(max-width:768px){ flex:1 1 200px; min-width:0 }` (el select absorbe el espacio sobrante de la fila Y se puede encoger → select + “Exportar” + “Nueva Inscripción” SIGUEN en la misma fila mientras quepan) y solo `(max-width:480px){ flex-basis:100% }` lo lleva a fila completa con los botones fluyendo debajo (alineados a la derecha por el `justify-content:flex-end` del slot `.ds-page-header__actions`). DECISIÓN BUG 2: el wrapper del slot (PageHeader.css) ya tenía el layout correcto (flex + wrap + gap + flex-end) y NO se tocó; el descuadre era 100% del `flex:1 1 100%` del feature. Breakpoints SIEMPRE de la escala (768=md, 480=xs). White-label `--export-color` intacto. 0 hex/px/fontSize sueltos nuevos (todo token al origen). Sin tocar arquitectura del template, schema ni SQL. NOTA: en este entorno la policy bloquea ejecutar `eslint`/`vite` (lint/build no corridos por el agente); revisión estática limpia (imports/sintaxis/firmas verificados). Pendiente re-gate de `verificador` (lint/build) y `revisor-ui`. Sin commits.

- 2026-06-20 — **Orquestador: REVISIÓN (no implementación) tabla responsive studio/ListPage — NO APTO, causa raíz confirmada.** Delegué 2 auditorías en paralelo (verificador=arquitectura/coherencia, revisor-ui=QA visual) + lectura propia del cableado. CONVERGEN: la captura ES la vista tabla (default viewMode='table' en useListPage.js:38; cabeceras ESTUDIANTE/CARRERA/GESTIÓN = buildColumns program/term), el bug es real. CAUSA RAÍZ ÚNICA (verificador): `useElementWidth.js:50` `useEffect([ref])` no re-corre cuando el DOM node `mat-table__measure` (dentro de AnimatePresence popLayout en ListDataView.jsx:148) se asigna tras el 1.er render (montaje con loading=true, ref.current=null) → ResizeObserver nunca attachado → containerWidth=0 → useResponsiveColumns devuelve todo visible/full → sin colapso, sin ResidualRow, RowActions siempre full. AGRAVANTE (revisor-ui): ListDataView.css:99 `overflow-x:hidden` recorta en silencio las columnas que no caben (4 inaccesibles, sin chevron). Hallazgos secundarios: columna actions sin minWidth (buildColumns.jsx:95, solo width:140); touch target ⋮ 38px<44px en compact (IconButton.css); buildEnrollmentActions invocado por celda (buildColumns.jsx:97, SRP menor); deuda baja px/sombras sin tokenizar. Coherencia OK: dataKey↔accessor 0 desajustes; SOLID/contrato del template intactos; i18n es+en; motion gateado; lint 0 / build 0 (7.16s). PLAN MÍNIMO DE FIX (no ejecutado): callback-ref + useElementWidth([node]); table-layout:fixed; minWidth a actions; ⋮≥44px compact. 0 schema. Sin commits. Pendiente: aprobación del usuario para dispatchar el fix a `frontend`.

- 2026-06-20 — **Orquestador: cierre plan studio TABLA RESPONSIVE POR CONTENEDOR (eventual-napping-deer, Fases 1-4) — APROBADO.** Sistema HOMOGÉNEO en el template ListPage: medición por contenedor (useElementWidth, ResizeObserver+rAF), ocultación de columnas por suma de minWidth (caída derecha→izquierda) a fila collapse (ResidualRow), y acciones progresivas en 3 densidades (RowActions data-driven + ListDensityContext). Todo en el template/lib; Matrículas = primer consumidor (columnas con minWidth en buildColumns.jsx, acciones como data en enrollmentActions.jsx). EnrollmentActions retirado. Orquestación: 1 delegación serial a frontend (Fases 1→2→3→4 convergen en ListDataView.jsx → no paralelizable). Gates iniciales: verificador APROBADO (lint 0 / build 0 6.57s / dataKey↔accessor 0 desajustes / 0 hex-breakpoints sueltos / 0 scroll-x / AntD6 limpio / i18n es+en) y revisor-ui APROBADO_CON_OBSERVACIONES con 2 HIGH sobre "natural sin saltos" (sin histéresis → parpadeo en el borde; ResidualRow competía con el salto de altura del tr). Fix dispatchado (histéresis asimétrica 20px columnas / 16px densidad + preset residualReveal opacidad diferida DUR.swapIn) → re-gate revisor-ui APROBADO, ambos HIGH RESUELTOS, sin regresión, card intacta. Re-build/lint exit 0 (6.63s). Desviaciones aceptadas: enrollmentActions.js→.jsx (JSX de iconos; Vite no transforma JSX en .js); ⋮/aria-label del expand usan common.moreActions/common.expandRow (template no se acopla a @features); useResponsiveColumns invocada incondicional con width 0 en card (rules-of-hooks). 0 schema/SQL (mock-first). Sin commits.

- 2026-06-20 — **revisor-ui (re-gate focalizado): studio/ tabla responsive — APROBADO, 2 HIGH RESUELTOS.** HIGH#1 (doble salto): residualReveal anima solo opacidad (sin Y) con delay=DUR.swapIn → un solo gesto con la expansión del tr; gateado por useReducedMotion. HIGH#2 (parpadeo en el borde): histéresis asimétrica confirmada — ocultar usa minWidth crudo, re-mostrar exige +HYST_W(20px) → punto de ocultar ≠ punto de re-mostrar, sin toggle ida-y-vuelta; densidad estable dentro de ±16px de md/lg; función sigue pura. Holguras 20/16px razonables. Sin hex/font-size nuevos; card intacta (width 0 → todo visible/full). Seguimiento baja: validar en navegador que delay(260)+pop(200) no deje hueco si la expansión real del tr de AntD es más corta.

- 2026-06-20 — **studio/ — fix 2 hallazgos ALTO del gate de la tabla responsive (histéresis +
  sync ResidualRow), por tokens.** Cierra la promesa "reacciona al collapse del sidebar SIN saltos
  ni parpadeos". (1) HISTÉRESIS en `ui/templates/ListPage/useResponsiveColumns.js`: nueva firma
  `useResponsiveColumns(columns, containerWidth, prev?)` (3.er param OPCIONAL — sin él, comportamiento
  original idéntico, contrato { visibleColumns, hiddenColumns, density } intacto). `prev = { density,
  hiddenKeys }`. Banda muerta: a una columna que estaba OCULTA en el resultado previo se le carga
  `HYST_W` (20px de layout) extra en el chequeo de cabida → re-mostrarla exige esa holgura, no
  reaparece en el mismo ancho en que se ocultó; densidad con banda `HYST_DENSITY_W` (16px) alrededor
  de md/lg (dentro de la banda conserva la densidad previa). Sigue siendo función PURA (de sus 3
  args); breakpoints md/lg siguen viniendo de breakpoints.js (HYST_* son px de layout, constantes
  nombradas+comentadas, NO breakpoints). `ListDataView.jsx` guarda la decisión en `prevDecisionRef`
  (ref, escrita en el cuerpo) y la pasa como `prev`. (2) SYNC ResidualRow: nuevo preset
  `lib/motion/presets.js > residualReveal` (opacidad SIN traslado en Y para no pelear con el cambio
  de altura del <tr>, `delay: DUR.swapIn` para diferir el fade hasta que la fila terminó de crecer →
  un solo gesto). `ResidualRow.jsx` usa `residualReveal` (antes `fadeInUp`), sigue gateado por
  `useReducedMotion`. 0 literales de duración/easing (todo DUR/EASE de tokens). Build ✓ 6.63s · Lint
  exit 0. Sin commits, sin backend, sin schema, sin tocar navigation/router/frontend legacy ni la
  vista CARD.
- 2026-06-20 — **Verificador: studio/ tabla responsive por contenedor (plan eventual-napping-deer, Fases 1-4) — APROBADO.** Lint exit 0 (eslint ., salida limpia). Build exit 0 / 6.57s / 5246 módulos (Vite 6.4.3). dataKey↔accessor: 0 desajustes — todos los campos de adaptEnrollment cubren los accesos de buildColumns (career.color/name, semestre, materias, gestionYear, fecha, typeKey, historialKey, estadoPago, fullName). ResidualRow: llama column.render(undefined, row); TODOS los renders en buildColumns usan (_, row) → compatible sin excepción. RowActions: los 6 descriptores de enrollmentActions.jsx tienen key/icon/labelKey/onClick; primary en view(1) y edit(2); danger+divider en delete. Sin hex sueltos en ningún archivo nuevo/editado. px en CSS: layout (1px borders, 4/2px bar, 12/14/16/18px padding/gap, 0.5px letter-spacing, 220/300px minmax) todos aceptables como layout — 0 breakpoints fuera de escala (único @container = 640 = sm de la escala; @media = hover:hover/pointer:fine = feature-query, no breakpoint). Scroll horizontal: eliminado — overflow-x:hidden en .ant-table-content; 0 scroll.x ni columnas fixed en la Table. AntD6: Dropdown usa menu={{items:menuItems}} correcto; expandable con API estándar v6; 0 props deprecadas. i18n: common.moreActions y common.expandRow en es+en; enrollments.actions.{view/edit/print/email/report/delete} en es+en (en enrollments.js de ambos idiomas). Sin tocar backend/, frontend/ legacy, navigation.js ni router.jsx (solo docs/plan/REVAMP.md en working tree limpio). OBSERVACIONES: (baja) 220px en minmax de ResidualRow.css = ancho de columna de layout no documentado en breakpoints.js (aceptable como layout, no breakpoint); (baja) padding 14/16px en celdas de tabla = deuda de tokenización pre-existente conocida.
- 2026-06-20 — **Orquestador: cierre plan studio (Fases 1/2/3/4/5/6) — APROBADO.** Plan único
  por fases (eventual-napping-deer.md) ejecutado y cerrado. Orden: Wave 1 paralela en file sets
  disjuntos (Fase 5 mover feature, Fase 4 mover template, Fase 1 nav i18n) → gate de build crítico
  post-movimiento (BUILD/LINT exit 0, 0 imports rotos); Wave 2 serial (Fase 2 paleta theme-aware +
  Fase 3 cards híbridas, dependía de careerColor en model/); Fase 6 auditoría color (limpia).
  Corrección de imprecisión del plan: el palette real es design-system/tokens/palette.js (no
  theme/palette.js). Compuertas finales: revisor-ui APROBADO_CON_OBSERVACIONES (paridad visual
  intacta, cards híbridas decorativas por token, motion gateado) y verificador
  APROBADO_CON_OBSERVACIONES (lint 0, build 0/7.47s/5239 mód, dataKey↔accessor 0 desajustes,
  i18n es+en sin faltantes, AntD6 limpio, estructura parts/ + capas confirmada). Único hallazgo
  material de ambos gates (contraste AA dark: blanco sobre acentos luminosos 1.78–2.82:1)
  RESUELTO por tokens (--color-on-accent por modo + gold/teal/orange light oscurecidos +
  cat-6/10/11 por modo): 8 accents + 12 cat ≥5.0:1 texto en AMBOS modos, dots ≥3:1. Re-gate final:
  lint exit 0 / build ✓ 6.47s / hex audit limpio. Deuda baja: chunk JS 1.18MB (advisory Vite,
  code-split al salir de mock-first). 0 cambios de schema/SQL (mock-first). Sin commits ni push.

- 2026-06-20 — **studio/ — fix AA contraste on-accent (light + dark), por tokens.** Cierra el
  HALLAZGO ALTO de contraste del gate de revisor-ui. (1) `palette.js` MISC: `--color-on-accent`
  ahora DEPENDE DEL MODO — light `#ffffff` (acentos oscuros), dark `TEXT.light.strong` `#0a1f15`
  (acentos luminosos; el blanco se quemaba 1.78–2.82:1). `--color-on-accent-soft` dark pasa a
  rgba(10,31,21,.22). No es `if(mode)` en componente: el token ya es por modo. (2) `incos.brand.js`
  acentos LIGHT oscurecidos para que BLANCO-encima ≥4.5: gold #b07e10→#8a6308 (3.60→5.43),
  teal #0a8a96→#0a757f (4.13→5.43), orange #c2580f→#b04f0d (4.47→5.29). `SEMANTIC.light.warning`
  sincronizado al nuevo gold #8a6308. (3) `categorical.js`: verdes extra por modo (slots 6/10/11)
  — cat-6=r[500], cat-10=#004830(light)/#2eae79(dark), cat-11=#2e7d52(light)/#7fdcb6(dark);
  el viejo cat-11 r[300] daba 2.72:1(light)/4.34:1(dark). RESULTADO: los 8 accents + 12 cat
  pasan ≥4.5:1 (texto on-accent) en AMBOS modos; dots ≥3:1. Build ✓ 6.47s · Lint exit 0. Sin
  commits, sin tocar componentes (KpiCard/Chip intactos), 0 hex fuera de las 3 fuentes de paleta.

- 2026-06-20 — **revisor-ui (gate contraste/paridad): studio/ Matrículas Fases 2/3/6 → APROBADO_CON_OBSERVACIONES.** Paridad visual intacta (KPIs/facetas/search/segmented/select/toggle/bulk/paginación/estados = mv2; refactor solo de organización+paleta). Motion motivado y gateado en 3 capas (MotionConfig + useReducedMotion en wrappers + @media CSS). Tinte nth-child(2n) correcto: decorativo, color-mix de --surface-alt, theme-aware. HALLAZGO ALTO de contraste: en DARK el texto/glifo BLANCO sobre fondo de acento se quema — KpiCard __icon (white/accent: gold 2.14:1, sky 2.78:1, brand-600 2.82:1) y Chip activo (white sobre --cat-N dark: lime 1.78:1, gold/teal ~2.1:1, sky/violet/orange/pink ~2.4-2.8:1) < AA. En LIGHT: gold como bg con blanco (KpiCard returning) = 3.60:1 < 4.5 texto; --cat-5 EI gold chip activo 3.60:1 y --cat-11 g300 2.72:1 < AA; --cat-11 como dot 2.64:1 < 3:1 decorativo. Fix: en dark usar texto OSCURO sobre acentos luminosos (--color-on-accent dependiente de modo o por-token) y oscurecer gold light, o no usar blanco como on-accent universal. No bloqueante de la entrega de organización; sí de la promesa AA.

- 2026-06-20 — **studio/ Fase 2 (paleta ampliada theme-aware) + Fase 3 (cards híbridas).**
  EXTIENDE el flujo de theme existente (brand → palette.paletteForMode → buildPalette →
  applyThemeVars → var(--…)), no lo reinventa. (a) `config/brand/incos.brand.js`: accents 3→8
  por modo manteniendo el patrón objeto { red, gold, sky, teal, violet, orange, pink, lime };
  dark = variantes más luminosas. (b) `design-system/tokens/categorical.js`: array plano →
  `{ light, dark }` de 12 colores DERIVADOS de `incosBrand` (ramp+accents) para no divergir;
  índices 0–5 = carreras (CG verde marca · SI azul · AE violeta · MP rojo · SE teal · EI dorado),
  6–11 extras; nuevo `categoricalFor(mode)`; compat `categoricalPalette = light`. Barrel
  `tokens/index.js` exporta también `categoricalFor`. (c) `palette.js`: `paletteForMode` añade
  `categorical: categoricalFor(mode)` (los 8 accents ya se propagan vía `brand.accents[mode]`).
  (d) `applyThemeVars.js`: itera `p.accent` → `--accent-*` (sin hardcodear nombres; ahora 8) y
  emite `--cat-0 … --cat-11` desde `p.categorical`. (e) `careerColor.js` (movido a
  `features/matriculas/lista/model/`): retorna `var(--cat-${idx})` en vez de hex → color de
  carrera THEME-AWARE; mismo CAREER_INDEX, CAT_COUNT=12. Verificados TODOS los consumidores —
  todos usan el valor en contexto CSS (Avatar `--avatar-tone`, StudentCard `--card-career-color`,
  Chip `--chip-color` vía ListFacets, EnrollmentHeaderActions `--export-color`, buildColumns
  `background:` de `.mat-career__bar`); ninguno hace color-math en JS ni canvas → 0 roturas.
  (f) NUEVO `lib/hooks/useCategoricalPalette.js` (lee modo de `useTheme`, devuelve
  `categoricalFor(mode)`; base para gráficos, sin crear gráficos — YAGNI). FASE 3:
  `StudentCard.css` añade tinte decorativo ALTERNO `.mat-grid > *:nth-child(2n) .mat-card`
  con `color-mix(--surface-alt …)` (contraste bajísimo, no compite con el acento de carrera,
  sin prop-drilling de índice, funciona en dark por tokens). 0 hex/px/fontSize sueltos nuevos
  fuera de la fuente de paleta. Build ✓ 6.99s · Lint exit 0. Sin commits, sin backend, sin schema.

- 2026-06-20 — **Orquestador: cierre plan studio (Fases A+B+C) — APROBADO.** Plan único por fases
  (eventual-napping-deer.md) ejecutado y cerrado. arquitecto fijó el contrato del template ListPage
  (shape de config + firmas de slots + 8 riesgos de regresión); frontend ejecutó Fase A y Fase C en
  paralelo (file sets disjuntos) y Fase B después con el contrato. Compuertas: revisor-ui
  APROBADO_CON_OBSERVACIONES (paridad + estados + motion + reflow @container) y verificador
  APROBADO_CON_OBSERVACIONES (lint 0, build 0, dataKey↔accessor 0 desajustes, i18n es+en sin
  faltantes, AntD6 limpio, router sin rutas rotas). Único issue material de ambos gates (3 @media
  off-scale 575/767/639) RESUELTO → @container content de la escala (640/768/640); re-verificado
  lint exit 0 / build ✓ 6.59s. Deudas baja restantes (px 14/18 paridad mv2, ErrorState margin
  inline) = tokenización pendiente, no bloqueantes. 0 cambios de schema/SQL (mock-first). Sin commits.

- 2026-06-20 — **Verificador: studio/ Fases A+B+C — APROBADO_CON_OBSERVACIONES.** Lint exit 0,
  build exit 0 / 6.56 s / 5239 módulos. dataKey↔accessor: 0 desajustes (todos los campos de
  adaptEnrollment.js cubiertos en config/columns/card). i18n: 44 labelKeys nav.* + 23 enrollments.*
  + common.results/showing en es+en, 0 faltantes. AntD6: 0 props deprecadas. Router: 37 rutas
  explícitas + catch-all al final, 0 rotas. ISSUE-1 (media) ListPage.css @media(575) → 640 RESUELTO
  por orquestador. ISSUE-2/3 (baja) px 14/18 = deuda de tokenización conocida. 0 cambios de schema.

- 2026-06-20 — **revisor-ui (gate paridad): studio/ Matrículas → ListPage — APROBADO_CON_OBSERVACIONES.** Paridad visual intacta (orden canónico PageHeader→KpiRow→Facets→ErrorState→.mat-toolbar→DataView; clases .mat-* conservadas; KPIs/chips/search/segmented/select/toggle/bulk/paginación = mv2). viewMode UNIFICADO a 'table'|'card' en las 3 capas (useListPage/ListFilterBar/ListDataView/ListSkeleton) — el riesgo crítico del arquitecto (skeleton tabla en vista tarjeta) NO existe (ListDataView pasa el mismo valor al skeleton). Motion motivado y gateado en 3 capas: stagger KPIs+grid, presenceSwap del DataView (key=data-${viewMode} fuerza animación de swap de vista), presenceWait bulk↔contador, shimmer con @media prefers-reduced-motion; todos reduce?undefined:variants. Reflow por @container content (escala 1024/768/640) sobre .ds-shell__content (container-type:inline-size); feature CSS sin @container propio (centralizado en template); drawer 767 sigue @media (correcto). Estados vacío/carga/error completos; ErrorState AntD6 title=/description=. 0 hex, 0 font-size literal. OBSERVACIONES: (media) 3 @media fuera de escala — BulkActionsBar.css:29 (767→768), EnrollmentHeaderActions.css:25 (639→640), ListPage.css:16 (575→640), no migrados en Fase A; (baja) px sueltos de paridad mv2 (18/14 16/10px) en ListDataView.css/ListPage.css/BulkActionsBar.css = deuda de tokenización conocida; (baja) ErrorState margin inline → mover a CSS. No bloqueante.

- 2026-06-20 — **studio/ Fase B — template ListPage parametrizado + Matrículas a
  consumidor de config.** Ejecutado al pie del CONTRATO del arquitecto (entrada
  Arquitecto-ListPage). NUEVO `src/ui/templates/ListPage/`: `useListPage.js`
  (generaliza 1:1 useEnrollmentsList — fetch/adapt, KPIs por selectores, facetas por
  accessor, search por campos, filtros declarativos con predicate, paginación,
  selección, viewMode; bulk/export = no-ops console; hasFilters/clearFilters por
  defaultValue), `ListKpiRow.jsx` (sobre KpiCard, stagger gateado), `ListFacets.jsx`
  (sobre Chip atom), `ListFilterBar.jsx` (search + filtros segmented/select + toggle
  vista + swap bulk↔contador con presenceWait gateado), `ListDataView.jsx` (skeleton↔
  EmptyState↔table/card con AnimatePresence popLayout gateado + CardGrid genérico con
  stagger + footer/paginación), `ListSkeleton.jsx` (co-locado en el template),
  `ListPage.jsx` (orquesta useListPage + compone en ORDEN canónico PageHeader→
  ListKpiRow→ListFacets→ErrorState(fuera de la toolbar)→.mat-toolbar(ListFilterBar)→
  ListDataView; slots headerActions/cardRender/rowActions(objeto único compartido por
  columns y cardRender)/bulkActions/facetsRender/skeleton; JSDoc del shape de config),
  + CSS co-locado por componente conservando clases `.mat-*` y las reglas `@container
  content` de Fase A EXACTAS (ListKpiRow.css/ListFacets.css/ListFilterBar.css/
  ListDataView.css/ListSkeleton.css/ListPage.css). **viewMode UNIFICADO a 'table'|'card'**
  en Segmented/DataView/skeleton (antes mv2 emitía 'grid' suelto; el skeleton ahora
  recibe y comprueba el mismo valor). ListPage NO importa nada de @features (acoplamiento
  prohibido); lo específico entra por slots. Matrículas → consumidor: NUEVO
  `enrollments.config.jsx` (breadcrumbs factory(t) con icono, titleKey/subtitleKey/
  headerI18nParams, fetch/adapt/getRowKey, kpis con selectores total/returning/news/
  pending, facets{accessor:r=>r.career}, search 3 campos, filters tipo(segmented)+
  history(select), views ['table','card'], columns:buildColumns); `EnrollmentsListPage.jsx`
  reescrito DELGADO (<ListPage config + slots headerActions/cardRender(StudentCard)/
  rowActions(objeto noop único)/bulkActions(BulkActionsBar)>). i18n: añadida `common.results`
  es/en (default genérico del contador; Matrículas sigue usando enrollments.filters.results
  vía resultsLabelKey → 0 cambio visual). ELIMINADOS (verificado por grep que nadie los
  importa): useEnrollmentsList.js, FilterToolbar.jsx/.css, EnrollmentsListPage.css,
  sections/{EnrollmentKpis,CareerChips,EnrollmentDataView}.jsx+css, StudentCardGrid.jsx/.css,
  ListSkeleton.jsx/.css (feature; el del template cubre). CONSERVADOS sin cambio de render:
  StudentCard, BulkActionsBar, EnrollmentHeaderActions, EnrollmentActions, StudentCell,
  AdmissionTypeTag, buildColumns, historyStates, pagoStatus, careerColor, adaptEnrollment,
  enrollments.api. enrollments.config debió ser .jsx (contiene JSX en breadcrumbs/iconos).
  Build ✓ 6.42s · Lint exit 0 (0 nuevos). NO se tocó navigation.js, nav.js, router.jsx,
  AppShell.css, breakpoints.js ni frontend/ legacy. Criterio de aceptación: Matrículas
  idéntica (KPIs, chips, search, segmented tipo, select historial, toggle table↔card, bulk,
  paginación, loading/empty/error) pero nace de config; un 2º listado = otro *.config.jsx.

- 2026-06-20 — **studio/ Fase C — nav por dominio (4 grupos) + menú completo.**
  `config/navigation.js` reestructurado de 1 sección (`nav.main` monolítica) a **4 grupos**
  con el mismo shape `{ sectionKey, items:[NavItem] }`: `nav.main` (Dashboard), `nav.academicMgmt`
  (Matrícula·Académico·Docentes·Institucional), `nav.financeReports` (Finanzas·Reportes),
  `nav.system` (Configuración·Seguridad·Mi perfil). Children completados al menú real (37 ítems
  hoja); `defaultOpen:true` solo en Matrícula; `Mi perfil` como ítem suelto sin children. Iconos
  reutilizados + nuevos de `@ant-design/icons` (RiseOutlined, SwapOutlined, NodeIndexOutlined,
  ExperimentOutlined, AuditOutlined, FileProtectOutlined, PlusCircleOutlined, FallOutlined,
  FileSearchOutlined, FileTextOutlined, ClockCircleOutlined, DatabaseOutlined, ShopOutlined,
  ProfileOutlined, UserOutlined). i18n es/en (`lib/i18n/locales/{es,en}/nav.js`): añadidos labels
  de sección (academicMgmt/financeReports/system) y TODAS las keys nuevas; limpiadas keys muertas
  (subjects, teachersCoordination, teacherAssignment, financeSettings, generalConfig,
  newRegistration). Cada `labelKey` de navigation.js verificada en ambos idiomas. Router
  (`app/router.jsx`): registradas EXPLÍCITAMENTE las 37 rutas → `PlaceholderPage` (excepto
  `enrollments`→EnrollmentsListPage y el index Navigate); rutas relativas; catch-all `*` al final.
  Sidebar.jsx SIN cambios (ya iteraba N secciones, pinta `section.sectionKey`, oculta label en
  collapsed; separación de grupos vía `.ds-sidebar__group + .ds-sidebar__group { margin-top:
  var(--space-md) }`). Cero hex/px/fontSize sueltos nuevos. Build ✓ 6.58s · Lint exit 0. No se
  tocó Fase A/B ni frontend/ legacy.

- 2026-06-20 — **studio/ — Fase A: responsive por contenedor (container queries).** Nueva
  escala única de breakpoints `design-system/tokens/breakpoints.js` ({xs:480,sm:640,md:768,
  lg:1024,xl:1280}) + barrel; JSDoc documenta que CSS no lee var() dentro de @container/@media,
  por eso los .css repiten el número pero SIEMPRE de la escala (prohibido 1199/639/575 sueltos).
  `.ds-shell__content` ahora es `container-type: inline-size; container-name: content` → los grids
  internos reaccionan al ancho del content (al colapsar el sidebar reflowen, antes miraban el
  viewport). Migrado @media (viewport) → @container content (ancho del content) en Matrículas con
  mapeo a la escala: 1199→1024(lg), 639/575→640(sm), 767→768(md). Archivos: AppShell.css (padding
  del content + media→container 768), EnrollmentKpis.css (4→2→1 cols vía lg/sm), StudentCardGrid.css
  (auto-fill/minmax intacto; 1 col en sm; 575 normalizado a 640), FilterToolbar.css (search full-row
  en md), EnrollmentDataView.css (tabla scroll-x en md). Drawer (767) sigue @media en useMobileNav/
  useMediaQuery/Sidebar.css (sidebar es position:fixed al window → manda el viewport). 0 hex/px/
  fontSize sueltos nuevos (única excepción: números de breakpoint, todos de la escala). Build ✓ 7.00s
  · Lint exit 0, 0 nuevos. Sin regresión visual: mismo reflow, ahora reactivo al content.

- 2026-06-20 — **Arquitecto: CONTRATO del template ListPage (studio/, Fase B del plan
  eventual-napping-deer).** Solo lectura, sin código. Ubicación confirmada SIN colisión:
  src/ui/templates/ListPage/ (hermano de AppShell; ListPage NO existe aún). Contrato
  fijado: useListPage(config) generaliza 1:1 useEnrollmentsList (mismas props de retorno),
  ListPage.jsx orquesta (PageHeader + ListKpiRow + ListFacets + ListFilterBar en wrapper
  .mat-toolbar + ListDataView), config declarativa { fetch, adapt, getRowKey, kpis[select],
  facets{accessor}, search{fields}, filters[predicate], views, columns(factory t,handlers) }
  + slots de escape (headerActions/cardRender/rowActions/bulkActions/facetsRender). Matrículas
  queda como enrollments.config.js + EnrollmentsListPage.jsx delgado. Riesgo crítico señalado:
  el viewMode usa valor 'grid' en FilterToolbar pero 'table' vs no-table en DataView/Skeleton
  (mantener el mismo desajuste); clases .mat-* conservadas tal cual (CSS co-locado) para 0
  regresión visual. Entregado al orquestador para que frontend lo ejecute al pie de la letra.

- 2026-06-20 — **studio/ — fix layout (CSS co-locado) + pase responsive.** El listado se
  "desformó" (KPIs apilados, grilla perdida) porque la reescritura de la página dejó fuera
  el `import` de su CSS monolítico. Solución alineada al estándar: **partir el monolito y
  co-locar cada CSS con su componente** (cada uno lo importa, igual que el JSX): EnrollmentKpis,
  CareerChips, EnrollmentHeaderActions, EnrollmentDataView (tabla+footer+celdas), StudentCell,
  StudentCardGrid, StudentCard, ListSkeleton; la página retiene solo `.mat-page` + `.mat-toolbar`.
  Así un import olvidado ya no puede romper el layout. Pase responsive mobile→XXL: KPIs 1/2/4
  por ancho (≤639/≤1199); grid de tarjetas auto-fill→1 col en móvil; tabla con scroll horizontal
  (min-width 760px ≤767px); select de export full-width en móvil; `.mat-page` max-width 1680px
  centrado para monitores XXL. Build ✓ 6.89s · Lint exit 0. Distribución de componentes intacta.

- 2026-06-20 — **studio/ — auditoría white-label + refactor Atomic (manual).** A pedido del
  usuario, barrido de hardcodes y descomposición:
  • **Hardcodes → 0**: `careerColor.js` ya no define hex (consume nueva paleta
    `design-system/tokens/categorical.js`); `#fff`/`rgba` literales de CSS → tokens nuevos
    `--color-on-accent` / `--color-on-accent-soft` / `--backdrop` (en `palette.js` MISC por
    modo + emitidos por `applyThemeVars`). Verificado: 0 hex en js/jsx (excl tokens/brand),
    0 color literal en css (excl var()).
  • **Atomic**: nuevos átomos compartidos `ui/atoms/ProgressBar` y `ui/atoms/Stat`; molécula
    `ui/molecules/DescriptionRow`. `StudentCard` (164→~110 líneas) ahora COMPONE
    AdmissionTypeTag + Stat + DescriptionRow + ProgressBar + EnrollmentActions (sin HTML
    redundante ni menú duplicado). Acciones ver/editar/⋮ deduplicadas en una molécula única
    `EnrollmentActions` usada por tabla (buildColumns) y tarjeta.
  • **Página**: `EnrollmentsListPage` (269→~110 líneas) = composición pura; secciones
    extraídas a `lista/sections/`: `EnrollmentKpis`, `CareerChips`, `EnrollmentHeaderActions`,
    `EnrollmentDataView`. CSS huérfano eliminado (meta-row/stat/progress-fill reemplazados por
    átomos). Build ✓ 6.79s · Lint exit 0. Sin tocar frontend/ legacy ni navigation.

- 2026-06-20 — **Verificador: studio/ paridad UI matrícula — APROBADO.** Build verde (vite ✓ 6.44s) y lint exit 0 (0 errores/warnings) confirmados por el orquestador (Bash del verificador estaba en sandbox). 4 issues estáticos detectados y corregidos: (1) StatusPill.css font-size:11px → var(--font-size-xs) (token existente, sin crear); (2) StudentCell.jsx "CI" literal → t('enrollments.card.ci'); (3) EnrollmentsListPage.jsx stagger de KPIs gateado con reduce?undefined:stagger*; (4) StudentCardGrid.jsx stagger gateado con useReducedMotion. Sin cambios de schema/datos reales (solo mock con shape de vista 101). Sin tocar frontend/ legacy, navigation.js ni nav.js.

- 2026-06-20 — **studio/ paridad UI matrícula (9 bloques, mock-first).** Listado de
  inscripciones llevado a paridad visual con mv2, todo por tokens. B0: par neutral en
  PILL.light/dark (emisor lo genera --pill-neutral-*); presets presenceSwap/presenceWait
  (+ dur.swapIn:260/swapOut:160 en tokens/motion.js); keyframes globales shimmer/chip-pop
  + reduced-motion en base.css. B1: KpiCard EXTENDIDO (blob lg+sm, riel de acento,
  value-row, hover completo translateY/icon scale/value scale/blob parallax; props sin
  cambios; único consumidor). B2: mock con estadoPago/promedio planos; adapter +semestre/
  tipo/isAntiguo/historialKey/gestion/estadoPago/promedio (puro, sin i18n, reusa careerColor).
  B3: pagoStatus.js + historyStates.js (puros); StatusPill +tone neutral; AdmissionTypeTag
  organismo local (acentos de marca del studio, i18n). B4: buildColumns enriquecido
  (career+subtítulo, history pill con icono, columna payment, AdmissionTypeTag, acciones
  Ver/Editar/⋮ Dropdown); IconButton +tone info/warning/danger/muted (aditivo); cell
  padding 14/16. B5: selección múltiple en hook + BulkActionsBar local; rowSelection+onRow.
  B6: FilterToolbar local (search+Segmented tipo+Select historial+AnimatePresence wait
  bulk↔contador/toggle); hook +tipoFilter/historyFilter/viewMode. B7: StudentCard +
  StudentCardGrid (stagger) locales; AnimatePresence popLayout skeleton/empty/data-{viewMode}
  con presenceSwap; .mat-grid/.mat-card* port a tokens. B8: Select carrera para exportar
  en header + botón teñible (--export-color, scoped sin !important). B9: ListSkeleton
  grid/rows con shimmer; EmptyState con acciones (limpiar filtros / nueva inscripción).
  i18n es/en: namespaces enrollments +history/payment/filters/bulk/card/table.careerSubtitle/
  actions.{more,print,email,report,delete,exportCareerPlaceholder}. Build verde por bloque
  (~6.5–7.8s); lint exit 0 (0 errores, 0 warnings). Atomos/moléculas EXTENDIDOS por props
  (StatusPill tone, IconButton tone, KpiCard estructura). Sin tocar navigation/nav.js ni
  frontend/ legacy.

- 2026-06-19 — **Cambio de estrategia + Hito 1 de `studio/`.** Tras descartar (a) namespace
  en el mismo proyecto y (b) greenfield con cableado, se acordó: **proyecto frontend NUEVO
  e independiente `studio/` (Vite propio, hermano de `frontend/`), MOCK-FIRST** — cascarón +
  datos mock que replican `matricula-v2`, sin tocar legacy ni backend. Arquitectura limpia
  (SOLID: un archivo = una responsabilidad; Atomic), design-system centralizado y
  **white-label paramétrico** (config por tenant). Integración backend = por capas, al final
  (cambiar solo `*.api.js` mock→http). GUARD-RAIL: mocks con shapes reales (vista 101 /
  `backend/database`). Hito 1 construido a mano (fijar estándar antes de escalar con agentes):
  • `config/brand` (rampa+acentos+fuente+locale+features) + `config/navigation`.
  • `design-system/tokens` (palette por modo, spacing, radii, typography, shadows, motion, z)
    + `theme` (`applyThemeVars` simétrico sin if(mode), `buildAntdTheme`, ThemeProvider/useTheme).
  • `lib/i18n` (keys en INGLÉS, namespaces es/en por contexto), `lib/motion` (presets +
    useReducedMotion + useCountUp), `lib/hooks` (useMediaQuery/useMobileNav), `lib/text`.
  • `ui` atoms (IconButton, ThemeToggle, LanguageSwitch, Logo, Avatar, Chip, StatusPill,
    Skeleton) · molecules (SidebarItem/Section/Footer, HeaderUtilities, UserChip, KpiCard,
    PageHeader, EmptyState, ErrorState) · organisms (Sidebar, TopBar) · template **AppShell**
    (sidebar+topbar+content + dark + i18n + drawer móvil responsive).
  • Feature `features/matriculas/lista` (mock+api+adapter+hook+columns+StudentCell+page) =
    listado gemelo de MatriculaListV2 con KPIs (count-up), chips de carrera, tabla AntD,
    estados vacío/error/carga, paginación. Router + App (providers) + main.
  Build ✓ 8.27s · Lint ✓ exit 0 · dev ✓ HTTP 200 en :5173. Memorias:
  revamp-prototipo-mock-first, studio-i18n-keys-ingles-namespaces.

- 2026-06-19 — Frontend WS-D (plantillas ABM + estados compartidos), ADITIVO.
  B1 estados base: `atoms/Skeleton.jsx` (paramétrico rows|grid|detail|form sobre AntD
  Skeleton, shimmer CSS, sin motion JS), `molecules/ErrorState.jsx` (Alert title=/
  description= + reintento, FadeIn gateado), `molecules/EmptyState.jsx` (promueve
  MatriculaEmptyState; variant default|no-results). B2 consolidación con default IDÉNTICO:
  `TableListView` (error→ErrorState, loading inicial→Skeleton rows, prop opcional
  `emptyState`), `DetailPageShell` (loading→Skeleton detail, error→ErrorState, Empty
  intacto). B3 punto de control: `PageHeader` (props OPCIONALES subtitle/description,
  título en FadeIn; sin esas props el layout no cambia) y `PageTemplate` (FadeIn interno
  conservador, firma {header,children,sidebar,bottom} intacta). B4 plantillas:
  `templates/{ListTemplate,FormTemplate,DetailTemplate}.jsx` — COMPONEN organismos
  existentes (no reimplementan tabla/wizard/estados); ListTemplate reusa el shell
  cfg-academico-workspace. Tokens al origen: `spacing.js` (stateSizes + skeletonCardWidth)
  → `root.js` emite --state-empty-*/--skeleton-card-width; CSS nuevo en
  `styles/components/atoms/skeleton.css` y `styles/components/molecules/state.css` +
  page-header__subtitle/description (todo var(--…), 0 literales nuevos). Build verde por
  bloque; lint exit 0 en 15 archivos; RBAC application/navigation/ sin tocar; AntD v6 OK.
  NO se migró ninguna page ABM (WS-F, fuera de alcance).

- 2026-06-15 — Responsive del shell global = paridad mv2 en móvil (≤767px).
  (a) Scroll de documento eliminado: `.app-shell` position:fixed inset:0 (réplica
  `.matricula-v2-app`). (b) Sidebar drawer móvil: `useMobileNav` promovido a
  `presentation/hooks/`; `MainLayout` usa isMobile/navOpen → Sider pasa a overlay
  (`.sider--mobile`/`--mobile-open`, position:fixed + translateX, gateado reduced-motion)
  + backdrop `.app-sider-backdrop`; trigger alterna drawer en móvil / colapso en desktop;
  cierra al navegar. `.app-main` toma ancho completo (sider fuera de flujo). (c) Header
  móvil: buscador oculto y texto de perfil oculto (solo avatar) en ≤767px; utilities ya
  colapsan en HeaderCompactMenu (MoreOutlined) <900px. Build verde, lint 0 nuevos.

- 2026-06-15 — Fix sidebar (2 detalles). (1) Altura FIJA de página sin scroll de
  página: `.sider` overflow-y:auto→hidden + `.ant-layout-sider-children` height:100%
  flex-column + `.sidebar-container__logo` flex-shrink:0 → solo `.sidebar-container__nav`
  (flex:1) scrollea internamente. (2) Padre activo en colapsado: NavigationMenu calcula
  `hasActiveDescendant` y pasa `active` a SidebarSection; el toggle recibe
  `sidebar-item--active` (fondo+icono tintado+barra) + aria-current → en modo colapsado
  se ve qué módulo tiene un hijo de 2do nivel seleccionado. Build ✓ 15.99s, lint 0 nuevos.

- 2026-06-15 — WS-B (motion) APROBADO ronda 1 + Fase 3 (skills). Capa de motion
  compartida en `presentation/motion/` (presets EASE/DUR/STAGGER/variants) + átomos
  (FadeIn/Stagger/CountUp/PresenceSwap/Collapse) + hooks (useReducedMotion/useCountUp);
  `MotionConfig reducedMotion="user"` global en MainLayout; mv2 consume la capa (no
  duplica). Cierre del único faltante: `bell-tilt` tokenizado → `--dur-bell:350ms` en
  brand-tokens.css + `DUR.bell` en presets.js (sin literal 0.35s). Fase 3: actualizados
  `incos-ui-system` (§2 tokens al origen + flujo brandScale→buildAntdTheme→applyThemeVars;
  §6b.1 capa de motion) e `incos-antd5-api` (theme único desde buildAntdTheme). Build ✓.

- 2026-06-15 — Verificador Ronda 1 WS-B (capa de motion): APROBADO. Build verde 51.90s. Lint exit 0, 0 errores en 19 archivos tocados. RBAC: application/navigation/ 0 lineas diff. capaMotionCompartida: presentation/motion/ (presets.js+index.js) + hooks/useReducedMotion.js + hooks/useCountUp.js + atoms/motion/{FadeIn,Stagger,CountUp,PresenceSwap,Collapse}. shellConMotion: MainLayout con MotionConfig reducedMotion=user + RouteTransition via DUR.press/EASE.out; NavigationMenu envuelto en Stagger; MatriculaV2Layout sin MotionConfig local. mv2ConsumeCapa: StudentCardGrid→Stagger, KpiCard→useCountUp, StudentDrawer→FadeIn+STAGGER, FilterToolbar→PresenceSwap+variants.presenceWait, MatriculaListV2→motionVariants.presenceSwap, StudentCard+StudentDrawer→@presentation/hooks/useReducedMotion (global). todoGateado: 3 capas (MotionConfig, wrappers useReducedMotion, brand-tokens.css @media .app-shell*+.matricula-v2-app*). tokensMotionOrigen: JS consume EASE/DUR de presets.js; CSS consume var(--ease-*)/var(--dur-*). Observacion menor: bell-tilt 0.35s literal en app-topbar.css L102 y matricula-v2.css L378 (--dur-bell token no existe; easing SI usa var(--ease-out)). No bloqueante.

- 2026-06-15 — Fix de estructura del layout (orden topbar/sidebar). Antes: `.header`
  `position:fixed` full-width arriba y `.sider` empezando en `top:var(--header-height)`
  (topbar tapando el inicio del sidebar). Ahora replica el patrón flex de mv2
  (`.matricula-v2-app`): `MainLayout` = `Layout.app-shell` (fila) con `Sider` (columna
  izquierda a `top:0`, `height:100vh`) + `Layout.app-main` (columna: `AntHeader` topbar
  sobre `Content`). CSS: sider/header sin `fixed`; `.content` con `flex:1`+scroll propio
  (sin márgenes de offset). Build ✓ 12.55s. (Mobile drawer overlay del sider = follow-up menor.)

- 2026-06-15 — Mejora de PROCESO (para no repetir instrucciones): creado
  `docs/plan/REVAMP-SHELL-CONTRACT.md` (definición de HECHO del shell = réplica
  COMPLETA de mv2 + reglas no negociables: tokens al ORIGEN sin hardcode, theming
  simétrico, SOLID/atomic). Inyectadas "reglas de oro" en `.claude/agents/frontend.md`
  y memoria durable. Workflow `revamp-shell-completo` con BUCLE AUTO-CORRECTOR
  (frontend↔verificador hasta APROBADO contra el contrato) — APROBADO en ronda 1.
  Pendiente menor: border-radius:4px literal en `.sidebar-item__bar` → `var(--border-radius-sm)`.

- 2026-06-15 — Verificador Ronda 1 shell-contract (AppTopBar+tokens+RBAC): APROBADO. Build verde 12.80s. Lint: 0 errores nuevos en 21 archivos tocados (errores en useNavigationMenu.jsx son pre-existentes, confirmados presentes antes del diff). RBAC: git diff application/navigation/ = 5 líneas passthrough puro (group metadata, sin tocar filterMenuByPermiso/itemPermitido/hasAnyPermiso). Header: AppTopBar con trigger→search(Input+SearchOutlined+allowClear)→spacer→[HeaderUtilities|HeaderCompactMenu]+UserProfileChip; HeaderUtilities=help+lang+bell(Badge)+ThemeToggle; UserProfileChip=buildFullName+gestionLabel+avatar iniciales+logout; HeaderCompactMenu=MoreOutlined Dropdown<900px. Trigger dentro de AntHeader fixed, no tapado. Sidebar: sub-items vía .sidebar-item--sub padding-left: var(--nav-sub-indent,44px) (sub=true inyectado en renderItem); nav-section-label renderizada desde group metadata en NavigationMenu.groupMenuItems; bordes visibles light (--border:#c8d6cc) y dark (#1d3528). Tokens: fontSizeNav/Meta/Label/Icon en typography.js; navSpacing completo en spacing.js (spread en allSpacing→allThemeTokens); 17+ vars CSS emitidas en root.js sin literales de shell. Theming: grep if(mode root.js = 0. Literales px residuales justificados: border-radius:4px (.sidebar-item__bar, = --border-radius-sm, debería usar token) y font-size:10px (.sidebar-section__chevron, icono decorativo posicional, comentado). MatriculaV2TopBar=wrapper delgado de AppTopBar; useMediaQuery mv2=re-export global.

- 2026-06-15 — Verificador pase paridad WS-C (shell+theming): APROBADO. Build verde 12.59s. Lint exit 0 en root.js/colors.js/HeaderLeft.jsx/Sidebar.jsx (0 errores). themingSimetrico: applyThemeVars escribe 9 --color-* CORE (bg-container/elevated/layout/content-bg/content-text/text/text-secondary/border/split) + 8 --color-primary* SIEMPRE desde sc=brandScale[mode], sin ningún if(mode). noIfModeEnColorCore: grep 'if (mode' root.js = 0 resultados. logoNoDuplicado: HeaderLeft.jsx = solo IconButton trigger (clase matricula-v2-topbar__menu), logo ausente; Logo atom SOLO en Sidebar.jsx. fontItem14: .sidebar-item font-size: var(--font-size-sm, 14px); fontSizeSM=14 en typography.js → resuelve a 14px (antes var(--font-size-base)=16px). footerParidad: .sidebar-user-footer gap:10px / padding:12px 16px / avatar font-size:13px / nombre:13px / rol:11px — idéntico a .matricula-v2-sidebar__footer. rbacIntacto: git diff application/navigation/ = 0 líneas.

- 2026-06-15 — Cierre WS-C tras auditoría revisor-ui (MIXTO → resuelto) + 2 pases de
  corrección. revisor-ui (Opus) marcó 4 altos: dark incompleto fuera del shell, sidebar
  colapsado sin tooltip, sin :focus-visible, AA avatar dark (2.33:1). Decisión del usuario:
  alcance dark = **shell + superficies de la app** (dark fino por página legacy → Fase 5).
  1er pase de corrección FALLÓ (el agente frontend devolvió el saludo de la skill sin editar).
  2º pase (prompt endurecido) aplicó los 8 hallazgos: applyThemeVars regenera las --color-*
  CORE (bg-container/elevated/layout/content-bg/text/text-secondary/border/split) desde
  brandScale[mode] (light idéntico, content oscurece en dark); title={label} al colapsar en
  SidebarItem/Section; :focus-visible de marca en los 4 botones del shell; avatar dark a
  brand-800+#fff (9.24:1); typo `.ant-mƒenu-item` (U+0192) eliminado; route transition a
  0.14s/y:4 sin mode="wait"; header light bg=--surface-chrome explícito; fallbacks hex→tokens.
  verificador re-gate: **APROBADO** (build ✓ 13.20s, 0 lint nuevos, RBAC intacto, AA dark OK).
  Pendiente Fase 5: dark fino de --color-* específicas de componentes legacy. WS-C CERRADO.


- 2026-06-15 — Verificador (re-gate WS-C): APROBADO_CON_OBSERVACIONES. Build verde 12.51s. Lint exit 0 en 14 archivos WS-C + 5 matricula-v2. RBAC: application/navigation/ 0 lineas diff, intacto. Dark shell funciona via brand-tokens.css [data-theme=dark] (--bg-page/--surface-chrome/--border/--text); applyThemeVars regenera --brand-N por modo pero NO regenera --color-content-bg/bg-container/bg-elevated/text/border (siguen estaticos light) — no causa regresion en WS-C porque layout CSS usa --bg-page/--surface-chrome, no --color-content-bg. Light sin regresion. 3 issues pendientes: (1) avatar dark contrast 2.33:1 < AA 4.5:1 (bg=#16513a fg=#1f9163 en brandScale.dark brand200/brand700); (2) :focus-visible ausente en .sidebar-item/.sidebar-section__toggle/.header-utilities__avatar/.header-utilities__theme-toggle; (3) typo .ant-mfenu-item en navigation-menu.css L211 NO eliminado.
- 2026-06-15 — Verificador (re-gate 2 WS-C): APROBADO. Build verde 13.20s. Lint: exit 0, 0 errores en root.js/SidebarItem.jsx/SidebarSection.jsx/MainLayout.jsx (CSS ignorado por ESLint, esperado). darkSuperficies: applyThemeVars escribe --color-bg-container/#102019, --color-bg-elevated/#102019, --color-bg-layout/#07140e, --color-content-bg/#07140e, --color-text/#e8f0ea, --color-text-secondary/#9fb3a7, --color-border/#1d3528, --color-split/#1d3528 solo en modo dark; lightIdentico confirmado (rama mode!==dark lee allThemeTokens.*). a11yTooltipColapsado: title={collapsed?label:undefined} presente en SidebarItem.jsx L39 y SidebarSection.jsx L45. a11yFocusVisible: .sidebar-item:focus-visible/.sidebar-section__toggle:focus-visible en navigation-menu.css L284-288; .header-utilities__avatar:focus-visible/.header-utilities__theme-toggle:focus-visible en header.css L122-126. aaAvatarDark: bg=#16513a (brand-800 dark), color=#fff; contraste calculado 9.24:1 >> AA 4.5:1 (fallback CSS #003a26=12.86:1). typoEliminado: U+0192 (0xC6 0x92) ausente en bytes de navigation-menu.css. routeTransition: AnimatePresence sin mode=wait (L99), duracion 0.14s en ambas ramas (L47/L58), gateado useReducedMotion (L41). rbacIntacto: git diff application/navigation/ = 0 lineas.
- 2026-06-15 — Verificador: WS-C APROBADO. Build verde 10.90s. Lint: 0 errores nuevos en 14 archivos WS-C (exit 0). RBAC: application/navigation/ sin diff (0 lineas), NavigationProvider/useNavigationMenu/filterMenuByPermiso intactos; NavigationMenu.jsx mapea solo menuItemsWithIcons del contexto, sin items hardcodeados. Dark conmutable: [data-theme=dark] en header/sider/content/navigation-menu con vars --surface-chrome/--border/--bg-page. Tokens: brandScale.light/dark en colors.js (unica fuente); buildAntdTheme sin hex literales; applyThemeVars idempotente; brand-tokens.css solo motion+superficies semanticas. Light sin regresion observable. Hex/px sueltos nuevos: 3 valores (SidebarItem paddingLeft:44/paddingRight:0 inline + HeaderUtilities styles minWidth:220px/padding:8px) — observacion menor (valores de layout fijos, no de color). AntD v6: sin props deprecated en archivos nuevos.
- 2026-06-15 — Frontend: Fase 1B WS-C ejecutada (tokens + shell). Parte 1: brandScale
  .light/dark consolidado en tokens/colors.js; buildAntdTheme sin literales (lee brandScale);
  applyThemeVars(mode, overrides) idempotente en root.js + alias injectCSSVariables legacy;
  brand-tokens.css limpio (solo motion + superficies semánticas; --brand-N generados en JS);
  useTheme.jsx llama applyThemeVars en useEffect al cambiar modo. Parte 2 (6 pasos):
  CSS conmutable (header/sider/content/navigation-menu con :root[data-theme=dark]);
  sidebar visual mv2 (logo-area, nav, SidebarUserFooter molécula @molecules/SidebarUserFooter
  con buildFullName §4b); NavigationMenu.jsx reescrito a SidebarItem/SidebarSection botones
  (RBAC-safe: sin tocar NavigationProvider/useNavigationMenu/filterMenuByPermiso, mapeo
  recursivo de menuItemsWithIcons, openKeys/handleOpenChange/handleMenuClick intactos);
  Header.jsx usa HeaderUtilities molécula (ThemeToggle global + avatar); MainLayout.jsx
  añade AnimatePresence/RouteTransition (fade+translateY, gateada por useReducedMotion);
  limpieza: 0 hex/px sueltos nuevos, 0 props AntD v5 deprecated, 0 errores lint nuevos.
  Nuevos archivos: SidebarItem.jsx, SidebarSection.jsx, SidebarUserFooter.jsx,
  HeaderUtilities.jsx, hooks/useReducedMotion.js. Build final ✓ 14.47s.

- 2026-06-15 — Arquitecto: plan WS-C (migración shell legacy) + arquitectura de
  tokens para personalización runtime. Blast radius medido: 67 archivos importan
  @theme (61 vía @theme/tokens) → NO mover el árbol; reconciliar contenido, no
  rutas. Hallazgo clave Parte 1: doble fuente de literales (colorPrimary/semánticos
  en buildAntdTheme.js Y colors.js; --brand-* dark en brand-tokens.css = 3ª copia)
  → cambiar el verde hoy toca 3 archivos. Recomendado: single source = state del
  ThemeProvider; buildAntdTheme(mode, overrides) + applyThemeVars(mode) idempotente
  (hoy injectCSSVariables corre 1 vez al boot); consolidar literales en colors.js
  por-modo y generar --brand-* en runtime. Parte 2: el sidebar legacy ya es
  RBAC-aware (useNavigationMenu+filterMenuByPermiso); mv2 sidebar es maqueta sin
  permisos → estilar el <Menu> AntD legacy, NO migrar a botones hardcodeados
  (riesgo RBAC). Promover SidebarUserFooter + HeaderUtilities a moléculas
  compartidas; ThemeToggle ya global → integrar en HeaderRight. Shell dark requiere
  migrar header/sider/content/navigation-menu CSS a vars conmutables --brand-*.
  Código NO editado.

- 2026-06-15 — Cierre Fase 1B WS-A: resueltas las 2 observaciones AA del verificador.
  `colorSuccess` #16a34a → **#0e7a39** (≈4.6:1) y `colorWarning` light #b07e10 →
  **#9a6b00** (≈4.6:1) en `tokens/colors.js` (base+Text) y `buildAntdTheme.js`
  (rama light; dark conserva #16a34a/#e0a82e sobre fondo oscuro). Además
  `buildAntdTheme` ahora hace `...allThemeTokens` como base antes de aplicar la
  marca → fundación estrictamente aditiva (no se pierde la escala rica del legacy).
  Comentario stale "Poppins" corregido en `base/typography.css`. Build ✓ 17.80s.
  Pendiente menor a WS-C: gold categórico #b07e10 en `categoricalPalette`/`careerColorMap`
  (decorativo, fuera de alcance AA de WS-A). WS-A CERRADO.

- 2026-06-15 — Verificacion Fase 1B WS-A (agente verificador, APROBADO_CON_OBSERVACIONES).
  Build verde 12.93s. Lint: 0 errores nuevos en archivos WS-A; 5 pre-existentes en archivos no tocados.
  Imports rotos: 0. Duplicados borrados confirmados (incosTheme.js, matricula-v2-theme-vars.css,
  hooks/useTheme.jsx, components/ThemeToggle.jsx). Google Fonts eliminados de index.html.
  typography.js = Inter. injectCSSVariables() sigue corriendo (legacy intacto en light).
  Observaciones: (1) colorWarning #b07e10 sobre blanco = 3.60:1 FALLA AA (comentario en codigo
  dice "AA" incorrecto; minimo 4.5:1); (2) colorSuccess #16a34a sobre blanco = 3.30:1 FALLA AA;
  (3) comentario obsoleto en typography.css linea 7 menciona "Poppins desde Google Fonts".
  Colores afectados solo como texto en Tags/Alerts sobre fondo blanco; como fondo con texto
  blanco encima pasan. Requiere ajuste en iteracion siguiente.

- 2026-06-15 — Fase 1B WS-A ejecutada (agente frontend). 6 pasos atómicos completados:
  (1) Inter auto-hospedada: @fontsource/inter instalado; fonts.css creado en
  styles/base/; typography.css quitó @import Google Fonts (Poppins → Inter);
  index.html quitó <link> Google Fonts; tokens/typography.js → Inter.
  (2) Paleta reanclada: tokens/colors.js — primaryColors a brand.500 #007848 /
  brand.600 / brand.700; semanticColors: success #16a34a, warning #b07e10 (AA),
  error #c0282a, info #3d6dd0; linkColors; textColors.colorTextHeading → #007848.
  (3) brand-tokens.css global creado (styles/base/) desde matricula-v2-theme-vars.css
  con 2 cambios: quitada regla `html,body,#root{background}`, prefers-reduced-motion
  des-namespaciado a global; importado en index.css tras fonts.css. Solo tokens de
  motion + escala de marca light/dark.
  (4) buildAntdTheme.js creado en @theme/; light.js y dark.js = buildAntdTheme();
  ThemeProvider + useTheme en presentation/hooks/useTheme.jsx; ThemeToggle átomo
  en presentation/components/atoms/ThemeToggle.jsx.
  (5) App.jsx cableado: ThemeProvider envuelve AppConfigProvider (accede a useTheme,
  pasa algorithm correcto + buildAntdTheme al ConfigProvider). injectCSSVariables()
  sigue corriendo (legacy depende). Light idéntica al arrancar.
  (6) MatriculaV2Layout: quitado ConfigProvider/ThemeProvider local, quitado import
  de matricula-v2-theme-vars.css. MatriculaV2TopBar: useTheme → global, ThemeToggle
  → @atoms/. avatarFor.js/careerColors.js: consumen @theme/tokens/colors
  (categoricalPalette, careerColorMap). Borrados: incosTheme.js, matricula-v2-theme-vars.css,
  hooks/useTheme.jsx, components/ThemeToggle.jsx. Build tras cada paso: verde.
  Build final: ✓ 12.80s. Lint: 534 errores pre-existentes, 0 nuevos en archivos WS-A.
  Desviación: el error de sintaxis de esbuild con `--surface*` en comentario JSDoc
  fue corregido (sintaxis `--varname*` interpretada como decremento por esbuild).


- 2026-06-14 — Verificación pase 2: lint módulo  reporta exactamente 5 errores
  PRE-EXISTENTES conocidos (3x set-state-in-effect en hooks no tocados + 2x
  only-export-components). Cero errores en archivos editados por el pase. Datos intactos:
   conserva el useEffect con refetch({ params:{page:1,limit:100} }) al
  montar; adaptadores sin cambios. Sin hex/px sueltos nuevos en componentes; todas las
  animaciones gateadas por useReducedMotion / prefers-reduced-motion. Estado: pase 2 CERRADO.

- 2026-06-14 — Pase 2 de amplificación motion/hover en `matricula-v2` (nivel "notorio pero
  profesional"). 14 hallazgos de auditoría aplicados: (alta) primario a brand-500 en
  `incosTheme.js` y CSS (esmeralda saturado, AA 4.8:1); sombras shadow-md/lg amplificadas
  con brecha real; botón primario hover con translateY(-1px)+glow de marca+active scale;
  KPI hover con translateY(-3px)+icon scale(1.1)+value scale(1.025)+blob parallax+border accent;
  sidebar hover con translateX(2px)+icon tint brand-600; AnimatePresence mode=popLayout con
  y:8+scale:0.985 enter (0.26s) / y:-6 exit (0.16s) eliminando el "corte" en tabla↔tarjetas.
  (media) ghost hover con lift+shadow; topbar icon scale+bell tilt keyframe; search focus
  ring 3px; segmented selected font-weight+shadow amplificado; dark mode nav-hover 18%.
  (baja/tokens) `@keyframes mv2-chip-pop` al activar chips; icon scale en acción de fila;
  StudentCard hover border+shadow amplificados; dark verde fosforescente bajado
  (active-fg #86e3b3, pill-ok-fg #5dd3a0). Lint: 0 errores en archivos tocados.


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
