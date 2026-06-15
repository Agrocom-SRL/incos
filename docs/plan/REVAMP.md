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
