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
