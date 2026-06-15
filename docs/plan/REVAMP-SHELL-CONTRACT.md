# REVAMP — Contrato del Shell global (definición de HECHO)

> **Autoridad.** Todo agente que toque el shell global (sidebar/header/footer) DEBE
> cumplir este contrato AL COMPLETO en una sola pasada. La página de referencia
> (fuente de verdad visual) es `frontend/src/presentation/modules/matricula-v2`
> (`pages/MatriculaListV2.jsx` + `layout/MatriculaV2Layout.jsx` + `components/MatriculaV2TopBar.jsx`
> + `components/MatriculaV2Sidebar.jsx` + `theme/matricula-v2.css`). Los cambios YA
> APROBADOS en mv2 se replican TAL CUAL al shell global. No es parche parcial: si un
> elemento existe en mv2 y no en el global, falta.

## Reglas de arquitectura NO NEGOCIABLES

1. **Tokens en el ORIGEN, nunca literales.** Prohibido hardcodear `font-size`,
   `padding`, `gap`, `margin`, `border-radius`, colores. Si un valor no existe como
   token, se AÑADE en su origen y se consume vía `var(--…)`:
   - tipografía → `infrastructure/config/theme/tokens/typography.js`
   - espaciado/medidas → `infrastructure/config/theme/tokens/spacing.js`
   - color → `tokens/colors.js` (`brandScale` por modo)
   Los `.css` consumen `var(--font-size-*)`, `var(--spacing-*)`, `var(--brand-*)`, etc.
   Un mismo valor NO puede vivir en dos sitios.
2. **Theming automático y simétrico.** `applyThemeVars(mode)` escribe el mismo set de
   vars desde `brandScale[mode]` para light y dark. PROHIBIDO `if (mode === 'dark')`
   para casos especiales. Declarar el tema → cambia todo.
3. **SOLID + Atomic.** Un archivo, una responsabilidad (componente=render, hook=lógica).
   Promover a COMPARTIDO (`presentation/components/{atoms,molecules,organisms}`) lo que
   mv2 ya resolvió; el shell global COMPONE esos compartidos. No duplicar.
4. **Skills obligatorias:** `incos-ui-system` (tokens AntD v6) + `emil-design-eng` +
   `impeccable` + `design-taste-frontend` como principios. matricula-v2 como referencia.
5. **RBAC intacto:** no tocar `application/navigation/`. El menú solo pinta
   `menuItemsWithIcons` (ya filtrado). AntD v6 (`open`/`title`, no `visible`/`message`).
6. **Verde siempre:** build verde tras cada bloque; lint 0 nuevos en archivos tocados.

## Definición de HECHO — Header / TopBar (replica de `MatriculaV2TopBar`)

El header global DEBE tener, en este orden y con los mismos estilos/tamaños que
`.matricula-v2-topbar*`:
1. **Trigger** (hamburguesa `MenuOutlined`) a la izquierda, que alterna el colapso del
   sidebar. NO debe quedar tapado por el header.
2. **Buscador** (`Input` con `prefix=SearchOutlined`, `allowClear`,
   placeholder "Buscar estudiantes, códigos, carreras…") — `.matricula-v2-topbar__search`.
3. **Spacer** flexible.
4. **Zona derecha (`__end`)**:
   - **Utilities** (`.matricula-v2-topbar__utilities`): botones icono Ayuda
     (`QuestionCircleOutlined`), Idioma (`GlobalOutlined`), Notificaciones
     (`BellOutlined` con `Badge count`), y **ThemeToggle**.
   - **Versión compacta** (`@media max-width: 900px`): colapsar utilities en un
     `Dropdown` con `MoreOutlined` (`.matricula-v2-topbar__more`).
   - **Perfil** (`.matricula-v2-topbar__profile`): nombre del usuario
     (`buildFullName`, excepción ficha §4b) + meta "Gestión {año}" + avatar con iniciales.
   El header NO lleva LOGO (el logo vive solo en el sidebar).

## Definición de HECHO — Sidebar (replica de `MatriculaV2Sidebar`)

1. **Logo**: expandido → logo horizontal limpio; colapsado → badge "INCOS". Sizing igual a `.matricula-v2-sidebar__logo*`.
2. **Section labels** (`.matricula-v2-sidebar__section-label`, ej. "Principal", uppercase, muted): renderizar agrupando el menú. Requiere metadata de grupo en `menuItemsWithIcons` SIN romper RBAC (coordinar con `application/navigation` solo para AÑADIR metadata de grupo, no lógica de permisos) — si no es viable en esta pasada, dejarlo declarado y anotado, pero el resto del contrato es obligatorio.
3. **Ítems nivel 1 y nivel 2**: el **2do nivel DEBE estar indentado** (sub-item con mayor `padding-left`, `.matricula-v2-sidebar__item--sub`), NO alineado igual que el padre. Tipografía, gap, radio e icono desde tokens (= valores mv2: ítem 14px, icono 16px, gap/ radio por token).
4. **Estado activo** por ruta (barra lateral + tint), hover (translateX + tint), `:focus-visible`.
5. **Bordes/separadores visibles en AMBOS temas.** En light el borde NO debe desaparecer
   (definir `--border`/separador con contraste suficiente en light, no solo en dark).
6. **Footer de usuario** (`SidebarUserFooter`): avatar + nombre + rol, tamaños/gap de `.matricula-v2-sidebar__footer`.

## Verificación (gate)

- `grep` de literales en el CSS del shell: no debe haber `font-size: \d+px`, `gap: \d+px`,
  `border-radius: \d+px`, `padding: \d+px` sueltos sin que el valor venga de token (salvo
  posicionales puntuales justificados). Preferir `var(--…)`.
- Header global contiene: trigger + search + (help, lang, bell+badge, themetoggle) + perfil(nombre+gestión+avatar) + variante compacta MoreOutlined.
- Sidebar: sub-items indentados; section-label (o anotado); bordes visibles en light y dark.
- `root.js`: 0 `if (mode` para --color-* core. RBAC: `git diff application/navigation/` = 0.
- Comparar contra mv2: si un elemento de la "definición de hecho" falta → RECHAZADO.
