# REVAMP Fase 1B · Workstream A — Spec de ejecución (tokens + tema global)

> Plan de reconciliación producido por el agente `arquitecto` (read-only, verificado
> contra la rama `revamp`). Es la spec que ejecuta `frontend` y verifica `verificador`.
> Lee primero `REVAMP.md` (§3 paleta) y `REVAMP-FASE-1B.md` (§0, §1).

## Decisiones fijadas (confirmadas por el usuario / recomendación del arquitecto)

1. **Tipografía única = Inter**, auto-hospedada vía `@fontsource/inter` (sin `<link>` a Google Fonts).
2. **`@theme` se queda en `infrastructure/config/theme/`**: se reconcilia el *contenido*,
   no las rutas (mover el árbol obliga a reescribir 64 imports `@theme/*`, sin beneficio;
   el alias ya abstrae la ubicación). Desvío menor y justificado de §0.1.
3. **Dark mode NO se aplica a legacy** en WS-A. Legacy lee `--color-*` (no conmutables) →
   queda en light. El dark global solo afecta a módulos migrados (matricula-v2). Es la red
   de seguridad de la fundación aditiva.

## Hallazgos clave (estado real)

- Dos namespaces de CSS vars que **no se solapan**: legacy lee `--color-*`/`--spacing-*`/
  `--shadow-*` (inyectadas en JS al boot por `injectCSSVariables()` en `@theme/root.js`,
  solo light, verde `#196b45`); matricula-v2 lee `--brand-*`/`--surface*`/`--text*`/
  `--ease-*`/`--dur-*` (CSS bajo `:root[data-theme]`). Por eso el dark global no cascadea a legacy.
- Fuente inconsistente: `index.html` carga Inter (Google Fonts); `styles/base/typography.css`
  L15 hace `@import` de Poppins; `tokens/typography.js` declara Poppins; matricula-v2 usa Inter.
- **Riesgo latente:** `matricula-v2-theme-vars.css` aplica `html, body, #root { background: var(--bg-page) }`
  a selectores **globales** sin namespacing → pisaría el `body` de legacy si se sube tal cual.
  Debe neutralizarse al promover.

## Mapeo de tokens (global ← marca §3) — editar `tokens/colors.js`

| Token AntD | Legacy actual | Marca (matricula-v2) | CSS var afectada |
|---|---|---|---|
| `colorPrimary` | `#196b45` | **`#007848`** (brand.500) | `--color-primary`, `--color-verde-main` |
| `colorPrimaryHover` | `#134d32` | `#006048` (brand.600) | `--color-primary-hover` |
| `colorPrimaryActive` | `#0f3a25` | `#004830` (brand.700) | `--color-primary-active` |
| `colorPrimaryBg` | `#e8f5e9` | `#e3f2ea` (brand.50) | `--color-primary-bg` |
| `colorPrimaryBgHover` | `#c8e6c9` | `#bfe0cf` (brand.100) | `--color-primary-bg-hover` |
| `colorPrimaryBorder` | `#22854f` | `#8ec9ad` (brand.200) | `--color-primary-border` |
| `colorTextHeading`/`colorPrimaryText` | `#196b45` | `#007848` | `--color-primary-text` |
| `colorSuccess` | `#399f53` | `#16a34a` | `--color-success` |
| `colorWarning` | `#f59e0b` | `#b07e10` (gold AA) | `--color-warning` |
| `colorError` | `#e41c24` | `#c0282a` (red §3) | `--color-error` |
| `colorInfo` | `#7d9bdc` | `#3d6dd0` (sky §3) | `--color-info` |
| `colorLink*` | `#196b45` | `#007848`/`#006048`/`#004830` | — |

**NO tocar en WS-A:** `accentColors`, `overlayColors`, `borderColors`, `textColors` neutrales,
y el `colorAccent` púrpura legacy (se revisa en WS-C). Evita romper componentes con escalas inline.

## Pasos atómicos (cada paso deja la app verde)

1. **Auto-hospedar Inter.** `npm i @fontsource/inter` (o woff2 manuales en `public/fonts/inter/`).
   Crear `presentation/styles/base/fonts.css` (`@font-face`/import de fontsource + `font-display: swap`).
   Importarlo primero en `presentation/styles/index.css`. Quitar `@import` Google Fonts de
   `base/typography.css` (L15). Quitar `<link>` Google Fonts de `index.html`. `tokens/typography.js`
   → `fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"`.
2. **Re-anclar paleta a marca** en `tokens/colors.js` (tabla de arriba). `root.js` reescribe
   las `--color-*` solo (no tocar `root.js`).
3. **Subir escala de marca + tokens de motion a CSS global.** Crear
   `presentation/styles/base/brand-tokens.css` a partir de `matricula-v2-theme-vars.css` con DOS
   cambios obligatorios: (a) **quitar** la regla global `html, body, #root { background: var(--bg-page) }`;
   (b) mantener `--ease-*`/`--dur-*` en `:root` y el bloque `@media (prefers-reduced-motion)`
   **des-namespado** de `.matricula-v2-app` a global (solo TOKENS; los wrappers Motion son WS-B).
   Importar tras `fonts.css` en `index.css`.
4. **Dark global + provider.** Extraer `buildAntdTheme(mode)` a `@theme/buildAntdTheme.js`
   (consumiendo `allThemeTokens` + escala de marca); `light.js`/`dark.js` = `buildAntdTheme('light'|'dark')`.
   Crear `presentation/hooks/useTheme.jsx` (provider: `data-theme` en `documentElement` +
   localStorage `incos-theme`, promovido de matricula-v2). `ThemeToggle` mínimo en `presentation/hooks/`
   o `components/atoms/` (ubicación final = WS-C).
5. **Cablear provider en root.** `App.jsx`: envolver con `ThemeProvider`, `theme` por modo
   (`light`/`dark` con su `algorithm`). `init.js`/`injectCSSVariables()` sigue corriendo (legacy depende).
   Light idéntica al arrancar; el toggle conmuta `data-theme` y matricula-v2 reacciona; legacy queda light.
6. **matricula-v2 consume el global.** `MatriculaV2Layout.jsx`: importar builder/`useTheme` del global,
   borrar imports locales. Apuntar consumidores de `incosColors` (`utils/avatarFor.js`,
   `utils/careerColors.js`, `components/MatriculaV2TopBar.jsx`) a la paleta canónica (`@theme/tokens/colors`).
   **Borrar al final** (re-verificando con grep): `modules/matricula-v2/theme/incosTheme.js`,
   `theme/matricula-v2-theme-vars.css`, `hooks/useTheme.jsx`, `components/ThemeToggle.jsx`.
   Conservar `matricula-v2.css` y `popupClass.js`.

## Riesgos / verificación

- No subir el CSS de matricula-v2 "tal cual" (regla global `body{background}` rompe legacy) → Paso 3.
- AA smoke test: botón primario (texto blanco sobre brand.500), Tags con `colorWarning`/`colorInfo`
  como texto, headers con `colorTextHeading`. Usar lente `impeccable`.
- FOIT: `font-display: swap` + preload del woff2 principal.
- Unificar el builder (`buildAntdTheme`) o matricula-v2 y global divergen de nuevo.
- `dataKey==dataFieldName` no aplica a WS-A (sin datos).

## Fuera de alcance (no invadir)

- **WS-B:** wrappers/hooks Motion (`motion/react`), presets de spring, `AnimatePresence` reutilizable.
  WS-A solo deja los TOKENS `--ease-*`/`--dur-*` + bloque `prefers-reduced-motion`.
- **WS-C:** AppLayout/Sidebar/Header/Table/Card/Empty/Error; re-ancle del `colorAccent`; ubicación final de `ThemeToggle`.
- **WS-D:** templates. **WS-F:** migración por ítem.
