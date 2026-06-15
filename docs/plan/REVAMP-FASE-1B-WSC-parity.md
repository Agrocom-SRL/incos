# WS-C · Pase de paridad shell con matricula-v2 + theming automático

> Objetivo: el shell global (sidebar/header/footer) debe verse IDÉNTICO a la página de
> referencia `modules/matricula-v2` (MatriculaListV2). Foco SOLO en sidebar/header/footer
> (el contenido se deja para otra iteración). + corregir el theming a mode-driven automático.
> Fuente de verdad: `modules/matricula-v2/theme/matricula-v2.css` + `MatriculaV2Sidebar.jsx` + `MatriculaV2TopBar.jsx`.

## Parte A — Theming automático (sin casos especiales por modo)

Problema: `infrastructure/config/theme/root.js` usa `if (mode === 'dark') {…}` / `if (mode !== 'dark') {…}`
para las `--color-*` core. El theming debe ser **simétrico y automático**: `applyThemeVars(mode)` lee
`brandScale[mode]` y escribe el MISMO conjunto de vars para cualquier modo (declarar el tema → cambia todo).

Acción: eliminar TODOS los `if (mode === 'dark')` / `if (mode !== 'dark')` y escribir SIEMPRE desde `sc = brandScale[mode]`:
- `--color-bg-container` = `sc.colorBgContainer`
- `--color-bg-elevated` = `sc.colorBgElevated`
- `--color-bg-layout` = `sc.colorBgLayout`
- `--color-content-bg` = `sc.bgPage`
- `--color-content-text` = `sc.text`
- `--color-text` = `sc.text`
- `--color-text-secondary` = `sc.textSecondary`
- `--color-border` = `sc.border`
- `--color-split` = `sc.border`
- Primario mode-aware: `--color-verde-main`/`--color-primary` = `sc.brand500`, `--color-primary-hover` = `sc.brand600`,
  `--color-primary-active` = `sc.brand700`, `--color-primary-bg` = `sc.brand50`, `--color-primary-bg-hover` = `sc.brand100`,
  `--color-primary-border` = `sc.brand200`, `--color-primary-text` = `sc.brand500`.

Resto (menu legacy, table, breadcrumb, accent púrpura, semantic buttons, avatar genérico, sombras, spacing,
tipografía) se deja desde `allThemeTokens` por ahora (Fase 5 dará su variante dark). Dejar comentario.
Consecuencia aceptada: en light las superficies pasan a las de marca/mv2 (homogeneización). Verificar coherencia AA.

## Parte B — Paridad visual sidebar/header/footer (copiar valores de mv2)

### Header (organismo Header + HeaderLeft)
- **Quitar el LOGO del header.** mv2 topbar NO tiene logo (lo tiene solo el sidebar). Hoy `HeaderLeft` pinta
  logo + trigger → logo DUPLICADO con el sidebar. HeaderLeft debe quedar solo con el trigger (hamburguesa),
  replicando `.matricula-v2-topbar__menu`. Layout del topbar: hamburguesa izquierda · (buscador opcional) ·
  spacer · utilities a la derecha. El buscador global se difiere hasta que exista búsqueda global (anotarlo);
  NO shipear un input muerto.
- Igualar tamaños de icono/spacing de utilities a `.matricula-v2-topbar__icon`/`__utilities`/`__profile`.

### Sidebar (logo + nav + footer)
Valores de referencia (de `matricula-v2.css`), replicar en `sidebar.css`/`navigation-menu.css`:
- **Logo**: expandido → logo horizontal limpio (`.matricula-v2-sidebar__logo-img`); colapsado → badge "INCOS"
  (`.matricula-v2-sidebar__logo-icon`, font-size 14px). Corregir el actual logo comprimido/pequeño.
- **Ítem de menú** (`.sidebar-item` ← `.matricula-v2-sidebar__item`): `font-size: 14px` (HOY usa
  `var(--font-size-base)` = 16px → POR ESO se ve más grande; cambiar a 14px o `var(--font-size-sm)` si resuelve a 14),
  `gap: 12px`, `width: calc(100% - 20px)`, `margin: 2px 10px`, `border-radius: 10px`, `font-weight: 500`,
  `padding: 10px 14px` (sub: `padding-left: 44px`).
- **Icono de ítem** (`.sidebar-item__icon`): `font-size: 16px` (ya está; confirmar).
- **Chevron de sección**: `font-size: 10px`.
- **Section-label** ("Principal"/…): requiere metadata en menuItemsWithIcons → DIFERIR a WS-D (anotar).
- **Footer de usuario** (`.sidebar-user-footer` ← `.matricula-v2-sidebar__footer`): `gap: 10px`,
  avatar `font-size: 13px`, nombre `font-size: 13px`, rol `font-size: 11px`. Igualar paddings.

## Reglas
- NO tocar `application/navigation/` (RBAC). AntD v6.
- `cd frontend && npm run build` verde; `npm run lint` 0 nuevos en archivos tocados.
- Verificar visualmente coherencia: el sidebar/header/footer global debe coincidir con mv2 en fuente, icono,
  espaciado y logo, en light Y dark. El toggle conmuta TODO automáticamente (sin casos especiales en root.js).
