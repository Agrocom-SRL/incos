# REVAMP Fase 1B · Workstream C — Spec de ejecución (shell legacy + tokens centralizados)

> Plan del agente `arquitecto` + decisiones del usuario. Ejecuta `frontend`, audita
> `revisor-ui`, gate `verificador`. Lee `REVAMP.md` (§2/§3 + bitácora 2026-06-15 arquitecto),
> `REVAMP-FASE-1B.md` (§0, §3) y `REVAMP-FASE-1B-WSA.md`. matricula-v2 = fuente de verdad visual.

## Decisiones fijadas por el usuario (no relitigar)

1. **Tokens: UNIFICAR la doble fuente AHORA.** El verde de marca vive triplicado
   (`tokens/colors.js`, literales en `buildAntdTheme.js`, `--brand-*` dark en `brand-tokens.css`).
   Consolidar para que un cambio sea de UN solo lugar y quede listo para personalización runtime.
2. **Dark mode del shell legacy: CONMUTABLE.** El `ThemeToggle` del header debe oscurecer toda la
   app, no solo matricula-v2 → migrar el CSS del shell a vars `--brand-*` conmutables.
3. **Menú del sidebar: REESCRIBIR al patrón matricula-v2** (`<button>` con `aria-current`, secciones
   acordeón) — PERO preservando intacta la maquinaria RBAC como fuente de datos.

## Mapa de arquitectura (verificado)

- **Shell:** `presentation/templates/MainLayout.jsx` (Layout: `AntHeader`>`Header`, `Sider`>`Sidebar`, `Content`>Outlet).
- **Organismos:** `presentation/components/organisms/Header/Header.jsx`, `.../Sidebar/Sidebar.jsx` (+ `hooks/useSidebarState`).
- **Menú (render):** `presentation/components/molecules/NavigationMenu.jsx` → hoy `<Menu items={menuItemsWithIcons}>`.
- **Menú (datos/RBAC, NO TOCAR la lógica):** `application/navigation/` — `NavigationProvider`, `useNavigationContext`
  expone `{ selectedKeys, openKeys, menuItemsWithIcons, handleMenuClick, handleOpenChange }`;
  `menuItemsWithIcons` YA viene filtrado por permisos (`useNavigationMenu` + `filterMenuByPermiso`).
- **CSS shell:** `presentation/styles/layout/{header,sider,content}.css`, `styles/components/molecules/navigation-menu.css`.
- **Referencia visual mv2:** `modules/matricula-v2/components/MatriculaV2Sidebar.jsx` (`SidebarItem`/`SidebarSection`),
  `MatriculaV2TopBar.jsx`, `layout/MatriculaV2Layout.jsx`. CSS en `modules/matricula-v2/theme/matricula-v2.css`.

## Parte 1 — Unificar tokens (single source para runtime)

1. `tokens/colors.js`: consolidar los semánticos/primario **por-modo** (light/dark) en UN objeto
   (p. ej. `brandScale.light` / `brandScale.dark`), de modo que sea la única fuente literal.
2. `buildAntdTheme(mode, overrides = {})`: dejar de hardcodear literales; leer de `colors.js` por modo +
   aplicar `overrides` (preparado para accent/scale). Mantener `...allThemeTokens` de base.
3. `root.js`: convertir `injectCSSVariables()` (one-shot al boot) en `applyThemeVars(mode, overrides)`
   **idempotente y re-invocable**; generar `--brand-*` (light/dark) en runtime desde `colors.js`
   (hoy las dark viven en `brand-tokens.css` → eliminar esa 3ª copia, dejar solo los tokens de motion ahí).
4. `presentation/hooks/useTheme.jsx`: al cambiar `mode`, llamar `applyThemeVars(mode)` (y dejar el hook
   listo para extender con `accent`/`scale` SIN implementar la feature todavía).
5. `App.jsx`/`AppConfigProvider`: pasar `buildAntdTheme(mode)` y disparar `applyThemeVars` por modo.
   **Sin store nuevo** (sobre-ingeniería). Resultado: cambiar el verde o el modo = un solo origen.

## Parte 2 — Migración del shell (pasos atómicos, cada uno build verde)

1. **CSS conmutable:** migrar `layout/{header,sider,content}.css` + `navigation-menu.css` a vars
   `--brand-*`/`--surface*`/`--text*` (conmutables por `[data-theme]`). Verificar que light queda idéntico.
2. **Sidebar visual:** aplicar el lenguaje mv2 al sidebar (logo, secciones, footer de usuario, hover
   translateX+tint, ancho colapsable 252/76). Promover `SidebarUserFooter` a molécula compartida
   (`presentation/components/molecules/`) reusando `useAuthContext` + `buildFullName` (orden de nombre §4b).
3. **Reescribir el renderer del menú (RBAC-safe):** reescribir `NavigationMenu.jsx` para mapear
   `menuItemsWithIcons` (recursivo: items con `children` → `SidebarSection` acordeón; hojas → `SidebarItem`
   `<button>`), usando `selectedKeys` para `active`/`aria-current`, `openKeys`+`handleOpenChange` para
   abrir secciones, `handleMenuClick({key})` para navegar, y `collapsed` para modo icono.
   **NO** tocar `NavigationProvider`/`useNavigationContext`/`useNavigationMenu`/`filterMenuByPermiso`.
   Extraer `SidebarItem`/`SidebarSection` a moléculas/átomos compartidos (no hardcodear ítems).
4. **Header:** aplicar lenguaje mv2 (topbar) a `Header.jsx`; integrar el `ThemeToggle` global en la zona
   derecha; promover `HeaderUtilities` a molécula compartida. Motion gateado por `useReducedMotion`.
5. **Content:** fondo/superficie por tokens conmutables; transición de entrada de ruta suave (gateada).
6. **Limpieza:** sin hex/px/fontSize sueltos nuevos (todo por token); AntD v6 (`open`, `title`).
   Conservar comportamiento de colapso (`useSidebarState`) y rutas.

## Reglas duras / verificación

- **RBAC en 3 capas intacto:** un rol sin permiso sigue SIN ver los ítems filtrados. El renderer solo
  pinta lo que `menuItemsWithIcons` ya filtró. El `verificador` debe confirmarlo (no se añadió ningún ítem
  fuera del contexto; submenús anidados respetan el filtro).
- Cada paso: `npm run build` verde antes de avanzar; `npm run lint` al final (0 nuevos en archivos tocados).
- Dark: el toggle del header oscurece TODO el shell (no solo mv2). Light idéntico al estado previo.
- Contraste AA en light y dark (sidebar activo, header, texto secundario).
- Motion motivado y gateado por `useReducedMotion`/`prefers-reduced-motion`.
- `dataKey==dataFieldName` no aplica (sin datos nuevos).

## Fuera de alcance (no invadir)

- **WS-D:** `PageTemplate`/`PageHeader`, templates de listado/detalle.
- Feature de personalización runtime (accent/scale UI): solo se deja PREPARADA (Parte 1), no se implementa.
- Re-anclar el gold categórico `#b07e10` (decorativo) — pendiente menor anotado en WS-A.
