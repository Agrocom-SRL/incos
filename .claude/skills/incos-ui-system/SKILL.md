---
name: incos-ui-system
description: Sistema de diseño homogéneo INCOS — Ant Design v6 + Atomic Design + tokens + Motion. SIEMPRE activa al crear o editar cualquier componente, página, tabla, formulario, ficha o estilo en el frontend.
---

# Sistema de diseño UI — INCOS (Ant Design v6)

Esta regla existe porque la UI del sistema es inconsistente. La causa raíz es
que conviven **dos fuentes de verdad de estilo** (tokens propios en CSS +
defaults de Ant Design) sin jerarquía clara. Esta regla fija esa jerarquía.
Léela completa antes de tocar cualquier `.jsx` o `.css` de presentación.

## 0. Regla de oro (si solo lees una cosa)

**El theme de Ant Design (`ConfigProvider`) es la ÚNICA fuente de verdad para
color, tipografía, radio y espaciado.** El CSS propio (`detail-page.css`, etc.)
solo organiza *layout* (grid, flex, gap) y consume tokens, nunca redefine
colores/tamaños con valores literales.

Antes de escribir un `style={{ color: '#...' }}`, un `fontSize: 14` o una clase
con `color:` literal: **detente**. Eso es lo que rompe la homogeneidad.

## 1. Jerarquía de estilo (en este orden, sin saltarse pasos)

1. **Props del componente AntD** (`type="primary"`, `size`, `variant`). Primera
   opción siempre. No estilices a mano lo que el componente ya hace.
2. **Theme global** (`ConfigProvider` → `token` y `components`). Para cambios
   que aplican a TODO el sistema (color primario, radio, fuente base).
3. **CSS vars derivadas del theme** en `frontend/src/presentation/styles/`. Solo
   para layout y composición; deben referenciar el token, no clonarlo.
4. **`style` inline** — PROHIBIDO salvo una sola excepción documentada abajo.

### Única excepción a inline permitida
Color de negocio dinámico que viene de datos (ej. color de carrera/docente en
BD). Debe pasar por una utilidad de sanitización centralizada
(`sanitizeDocenteColorHex` / `normalizeHex`), nunca regex suelta en el JSX.
Cualquier otro inline es deuda técnica y se rechaza en review.

## 2. Tokens: una sola fuente

> **Regla de oro (del contrato de shell — `docs/plan/REVAMP-SHELL-CONTRACT.md`):**
> PROHIBIDO hardcodear `font-size`, `padding`, `gap`, `margin`, `border-radius` o
> colores en `.css`/JSX. Si el valor no existe como token, **añádelo al origen**
> y consúmelo vía `var(--…)`. Un valor NO puede vivir en dos sitios.
>
> **Color de marca:** los tokens de color derivan de los logos del instituto
> (`presentation/assets/images/branding/`). Paleta canónica en
> `docs/plan/REVAMP.md` §3 — verde `#007848` (primario), `#006048`/`#004830`
> (oscuros), dorado `#E0A82E`, rojo `#C0282A`, azul `#5080E0`. Validar contraste
> AA al mapear a `colorPrimary` y estados. No usar estos hex sueltos en JSX.

### Origen de cada tipo de token (única fuente, nunca el componente)

| Tipo de token | Archivo origen (escribir aquí; consumir vía `var()`) |
|--------------|-------------------------------------------------------|
| Color (escala de marca, light + dark) | `infrastructure/config/theme/tokens/colors.js` — export `brandScale[mode]` |
| Tipografía (`font-size`, `font-weight`, `line-height`) | `infrastructure/config/theme/tokens/typography.js` |
| Espaciado, medidas, radius | `infrastructure/config/theme/tokens/spacing.js` |
| Motion (ease, dur, stagger) | `presentation/motion/presets.js` (JS) + `presentation/styles/base/brand-tokens.css` (CSS) |

### Flujo de color (en este orden estricto)

```
tokens/colors.js (brandScale[mode])
  → buildAntdTheme(mode)        # construye el objeto theme de ConfigProvider
  → applyThemeVars(mode)        # escribe var(--brand-N) / var(--color-*) en :root
  → var(--brand-N) / token.*    # consumidos en CSS y JSX
```

- `buildAntdTheme(mode)` es la ÚNICA fuente del objeto `theme` que se pasa al
  `ConfigProvider`. **Prohibido** pasar `theme={{ token: {...} }}` ad-hoc en
  componentes locales.
- `applyThemeVars(mode)` es **simétrico**: mismo set de vars para light y dark,
  derivado de `brandScale[mode]`. PROHIBIDO `if (mode === 'dark')` para casos
  especiales. Declarar el tema → cambia todo automáticamente.
- Para consumir tokens dentro de un componente: `const { token } = theme.useToken();`
  y usa `token.colorPrimary`, `token.colorBorderSecondary`, etc.
- Las CSS vars (`--sd-*`, `--da-*`) que ya existen deben **mapearse** al token
  AntD en el provider raíz, no definir su propio hex. Si una var CSS tiene un
  `#hex` literal que también existe en el theme → es bug de consistencia.
- **Nunca** dupliques `colorPrimary` en CSS. Si lo necesitas en CSS puro, expón
  el token como CSS var en el `:root` del layout, derivado del theme.

## 3. Atomic Design — clasificación obligatoria

Cada componente nuevo se ubica según su nivel. No mezclar niveles en un archivo.

| Nivel | Qué es | Ejemplos del repo | Carpeta |
|-------|--------|-------------------|---------|
| **Átomo** | 1 unidad visual/dato, sin lógica de negocio | `DetailField`, `DocenteColorBar`, `DocenteHorarioBloqueRow` | `presentation/components/atoms/` |
| **Molécula** | Combinación reutilizable de átomos | `DetailInfoCard`, `DocenteAssignmentCard`, celda de tabla | `presentation/components/molecules/` |
| **Organismo** | Sección autocontenida con sentido propio | `DocenteAssignmentsSection`, `DocenteProfileSummary`, `TableListView` | `presentation/components/organisms/` |
| **Template** | Esqueleto de página sin datos | `PageTemplate`, `PageHeader` | `presentation/components/templates/` |
| **Página** | Template + datos vía hooks | `DocentesDetail`, `AcademicoPage` | `presentation/modules/<menu>/pages/` |

Reglas de oro atómicas:
- Un organismo **recibe props ya mapeadas**; no llama hooks de fetch.
- Una página **solo orquesta** (template + hooks + organismos). Si una página
  pasa de ~150–200 líneas de lógica no visual → extraer a hook (ver
  `incos-frontend-module`).
- Si vas a duplicar JSX por segunda vez → conviértelo en átomo/molécula.

## 4. Patrones canónicos (usar SIEMPRE estos, no reinventar)

### 4.0.1 TARJETA INFORMATIVA — **PRIORIDAD 1** (leer antes de diseñar cualquier tarjeta)

Toda tarjeta que **muestre información** (ficha de resumen, tarjeta de
selección, tile de entidad, panel de datos) se instancia desde este patrón. No
se inventa una tarjeta por pantalla. Anatomía completa, estados y antipatrones:
**`docs/referencia/tarjeta-informativa.md`** — de lectura obligatoria antes de
escribir el primer `div`.

Resumen de la anatomía (en este orden, dentro de UNA sola tarjeta):

1. **Identidad** — avatar/inicial + título fuerte + metadatos secundarios;
   pills de estado a la derecha (`margin-inline-start: auto`). Cierra con
   divisor.
2. **Datos** — columnas separadas por divisor vertical, cada una con **rótulo
   en versalitas** (`--font-size-xxs`, uppercase, `letter-spacing: .1em`,
   `--color-text-tertiary`) **sobre** el valor.
3. **Detalle** (opcional) — lista a dos columnas: código en
   `--font-family-code` teñido de primario + nombre, filas con `border-bottom`
   sutil.

No negociables: elevación real (`--shadow-elevation-2` en reposo), separación
por **divisores y escala tipográfica** (nunca fondos de color por sector), el
color reservado a pills/acentos/tonos de estado, y los datos de ancho fijo
(C.I., códigos, siglas) en monoespaciada. En tarjetas seleccionables, el hover
no se aplica sobre la ya elegida (produce borde doble).

Referencias vivas: `InscripcionSeleccionResumen.jsx` (ficha) y `ParaleloCard.jsx`
(tarjeta seleccionable con métricas).

### 4.0 Implementación de REFERENCIA visual — catálogo académico (CFG Académico)

**El módulo `configuracion/academico` (carreras, materias, paralelos) es la fuente
de verdad visual del CRUD del sistema.** Listado, formulario y ficha de cualquier
módulo nuevo (p. ej. Asistencia · Licencias) deben **clonar su lenguaje**, no
inventar otro. Las tres pantallas comparten el mismo shell `cfg-academico-*`:

| Pantalla | Archivo de referencia | Shell / clases |
|----------|----------------------|----------------|
| Listado | `pages/CarrerasList.jsx`, `MateriasList.jsx`, `ParalelosList.jsx` | `section.cfg-academico-workspace` → `header.cfg-academico-workspace__header` (`ListPanelHeader` + `.cfg-academico-workspace__desc`) → `.cfg-academico-tab-panel` → `TableListView embedded` |
| Formulario | `pages/CarreraFormPage.jsx` + `components/organisms/CfgAcademicoFormWorkspace.jsx` | `Flex.page-container` → `PageHeaderArea(PageHeader+BackButton)` → `DashboardPageShell` → `MainContent` → secciones `section.cfg-academico-workspace.cfg-academico-form-workspace` (`__header` + `__body` + `__footer` con el botón guardar) |
| Ficha/detalle | `pages/CarreraDetailPage.jsx`, `MateriaDetailPage.jsx` | mismo shell + `DetailInfoCard`/`DetailField` |

CSS compartido: `configuracion/academico/styles/academico-form-page.css`
(clases `cfg-academico-workspace`, `cfg-academico-form-workspace__{body,footer,grid}`,
`cfg-academico-tab-panel`). **Reutiliza esas clases** (no recrees cards propias).

> Antipatrón concreto a evitar: usar `sd-card` (cabeceras de *detalle*) para un
> **formulario**. El formulario va en `cfg-academico-form-workspace`, no en `sd-card`.

### Página de listado (PROTOTIPO — clonar tal cual, solo cambian los datos)

Estructura fija de toda pantalla `/listar` a página completa:

```
PageTemplate
  header = PageHeader
             title="Lista de …"            ← título primario, SIEMPRE presente
             breadcrumbItems={…}
             actions={exportActions}        ← acciones SECUNDARIAS (exportar, filtros globales)
  └─ Flex vertical gap={allSpacing.marginLG} style={{width:'100%', minWidth:0}}
       └─ section.cfg-academico-workspace
            ├─ header.cfg-academico-workspace__header
            │    ├─ ListPanelHeader title="Lista de …" actions={crearAction}  ← SOLO el botón crear
            │    └─ Paragraph.cfg-academico-workspace__desc                    ← lede de 1–2 líneas
            └─ div.cfg-academico-tab-panel
                 └─ TableListView embedded searchColSpan={10} searchStyle={{maxWidth:520}}
```

Reglas del prototipo (no negociables):
- **Título primario en `PageHeader`** (`title="Lista de …"`) — no se quita; convive con el
  título del `ListPanelHeader` (igual que en Licencias).
- **Acciones repartidas en dos niveles:** el botón **CREAR** (Nuevo estudiante/pago/beca,
  Nueva inscripción) va SIEMPRE dentro del `ListPanelHeader` del workspace; los botones de
  **exportar / filtros globales** (Select de carrera, Descargar Excel) van en `PageHeader actions`.
- `TableListView` con `embedded`, `searchColSpan={10}`, `searchStyle={{ maxWidth: 520 }}`.
- Importar `@configuracion/academico/styles/academico-form-page.css` (clases del workspace).
- **Columnas en archivo dedicado `config/*TableColumns.jsx`** (nunca inline en la página), con
  el mismo lenguaje de celda que la referencia:
  - **1ª columna `#`** numérica: `{ title:'#', key:'nro', width:56, align:'center',
    render:(_v,_r,index,rowOffset=0)=>rowOffset+index+1 }`.
  - **Identidad** (persona/entidad de la fila) → átomo `IdentidadCelda` (código + nombre en
    MAYÚSCULAS), `fixed:'left'`.
  - **Celdas multi-línea** (referencia, datos académicos, gestión/fecha) → átomo `InfoLinesCell`
    (`lines=[{icon,label,style?}]`). NO usar `Space direction` (deprecado) ni estilos inline.
  - **Estado/categoría** → átomo `StatusPill` con clase `cfg-materia-pill--{success|warning|danger|info|default}`.
  - **Acciones** → `TableActions` con `permisos` (fail-closed).
  - Estilos de estas celdas: átomos globales en `styles/components/atoms/table-cells.css`
    (cargado por `styles/index.css`) — NO dependen del CSS del módulo académico.

**Páginas prototipo (copiar la que más se parezca):** `DocentesList.jsx` (con configs
`config/docentesTableColumns.jsx`), `EstudiantesList.jsx`, `InscripcionesList.jsx`,
`PagosList.jsx`, `BecasList.jsx` — todas comparten este mismo shell. Para listados en tabs
(CFG Académico) usar la variante `embedded` de `CarrerasList/MateriasList/ParalelosList`.

### Página de formulario (ABM / solicitud)
`Flex.page-container` → `PageHeaderArea(PageHeader + BackButton)` → `DashboardPageShell`
→ `MainContent` → secciones `section.cfg-academico-workspace.cfg-academico-form-workspace`
(cada una con `header.cfg-academico-workspace__header > ListPanelHeader` + cuerpo
`.cfg-academico-form-workspace__body`). El botón principal va en
`.cfg-academico-form-workspace__footer` de la última sección. Campos en
`Form layout="vertical"` con `Row/Col` (ver `CfgAcademicoFormWorkspace`). Aunque el
formulario sea largo y de página completa, **sigue este patrón** (no `sd-card`).

### Página de ficha/detalle
`PageTemplate` → `PageHeader` → `Spin` (carga) / `Alert` (error) → cabecera
de ficha (organismo tipo `*ProfileSummary`) → `Tabs` o secciones. Campos en
`DetailInfoCard` (molécula) + `DetailField` (átomo). Estilos en `detail-page.css`
con prefijos `sd-`/`da-` **solo para layout**.

### Tablas
- `TableCell` para celdas; tamaños vía token, no `fontSize` literal.
- `TableActions` muestra ver/editar/eliminar **solo si hay permiso real** y, en
  el caso de eliminar, solo si existe `deleteFn`/use case (ver `incos-rbac`).
- `TableActions` sin objeto `permisos` → no muestra nada (fail-closed). Respétalo.

### Botones y acciones
- `ActionButton(permiso, accion)` para acciones de cabecera/formulario.
- `type="primary"` solo para la acción principal de la vista (una por pantalla).
- Acciones destructivas: `danger` + confirmación. No inventes estilos de "rojo".

### Grilla tipo cuaderno/planilla (Calificaciones, Asistencia)
Planilla diaria de asistencia = gemela de la grilla del cuaderno de notas; reutiliza
su patrón (no recrear una tabla nueva):
- Filas = estudiantes (nombre `APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES`, §4b); columnas = días.
- Celda = marca **P/R/F/L** (átomo, gemelo de `NotaCell`): P=Presente, R=Tardanza, F=Ausente,
  L=Licencia. Colores por **token de estado** (success/warning/error/neutral), nunca `#hex`.
- **L y días neutros** (feriado/receso/clase no dictada) son **solo lectura** (vienen
  calculados del backend, no se editan ni cuentan en el denominador).
- Estado de guardado en footer (organismo gemelo de `CuadernoFooter`): pendiente/guardando/
  guardado, alimentado por el provider de autosave (ver `incos-frontend-module` §3.1).

## 4b. Nombre completo de persona (estudiante / docente) — orden canónico

**En toda lista, tabla, select, buscador, tooltip, encabezado de cuaderno y
exportación (Excel/PDF), el nombre completo se muestra como
`APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES` (apellidos primero).** Aplica a
estudiantes y docentes por igual. El orden de la concatenación gobierna también
el orden de la lista (ordenación alfabética por apellido), así que no se ajusta
aparte.

- **Única excepción:** página de **detalle de un solo individuo** (ficha) — puede
  mostrar el nombre empezando por nombres si el diseño de la ficha lo pide. Nunca
  en colecciones.
- **Frontend:** no concatenes a mano. Usa el helper central
  `buildFullName(nombres, apellidoPaterno, apellidoMaterno, fallback)` o
  `buildPersonDisplayData(persona)` de
  `@application/utils/formatters` (`personFormatters.js`). Ambos ya devuelven el
  orden correcto. Un `[nombres, apellidoPaterno, ...].join(' ')` en el JSX es bug
  de consistencia.
- **Backend (vistas SQL `03-views/`):** cuando una vista concatena el nombre
  (`CONCAT_WS(' ', …)` / `CONCAT(COALESCE(…))`), el orden debe ser
  `apellido_paterno, apellido_materno, nombres`. Tras cambiar una vista,
  recréala en BD (ver `incos-vistas-y-evolucion`). El consumidor (grilla de
  calificaciones, dashboard, matrícula, horarios) recibe el campo ya formateado;
  no lo reordena en el front.
- **Coherencia front↔back:** la lista en pantalla (campo `nombre`/`nombreCompleto`
  de la vista) y el documento exportado deben mostrar el MISMO orden. Si difieren,
  casi siempre es una vista concatenando `nombres` primero.

## 4c. Tono y redacción — textos dirigidos al usuario (registro formal)

Auditoría de 2026-07-16 encontró ~82 textos en ~40 archivos con voseo
rioplatense ("podés", "guardá", "reintentá", "arrastrá") y tuteo ("tu",
"tienes", "estás") mezclados con el registro correcto. Causa raíz: cada
pantalla redactaba su copy suelta, sin una regla escrita. Esta sección la fija.

**Regla:** todo texto que el sistema le dirige al usuario sobre una acción o
procedimiento va en **segunda persona formal ("usted")**, imperativo o
indicativo — nunca primera persona ("voy a", "corregí"), nunca tuteo/voseo
("corrige"/"corregí"/"podés"), nunca tercera persona distante ("el usuario
debe"). Frases ya neutrales/impersonales que no le hablan directamente al
usuario ("No hay registros disponibles.", "Esta acción no se puede
deshacer.") no necesitan reescritura — no fuerces una conjugación donde no
hay sujeto.

**Dónde aplica** (cualquier prop/llamada que renderice una oración al
usuario, no solo Alert):
`Alert` (`title`/`description`), `notification.*`, `Modal.confirm/warning/
error/success/info` (`title`/`content`), `Popconfirm` (`title`/`description`),
`Empty description`, `Spin tip`, mensajes de validación (`Form.Item
rules[].message`), `placeholder`, párrafos `Typography`/banners descriptivos.
NO aplica a: nombres de campo, comentarios/JSDoc, `description` que en
realidad es un dato de negocio (no una oración dirigida al usuario), strings
técnicos de log.

**Catálogo de conversiones (patrones reales encontrados → corrección):**

| ❌ Informal (voseo/tuteo/1ª persona) | ✅ Formal "usted" |
|---|---|
| Corregí / Corrige las celdas | Corrija las celdas |
| Reintentá en unos segundos | Reintente en unos segundos |
| Probá con otra semana / usá «Ir a fecha» | Pruebe con otra semana / utilice «Ir a fecha» |
| Editá el motivo... eliminala | Edite el motivo... elimínela |
| Habilitá un día... | Habilite un día... |
| Arrastrá los bloques / Arrastra aquí | Arrastre los bloques / Arrastre aquí |
| Elige en cuánto tiempo... | Elija en cuánto tiempo... |
| Vas a {acción} este permiso | Va a {acción} este permiso |
| Podés reubicar / guardá / abrí / mové / completá / revisá / generá / afiná | Puede reubicar / guarde / abra / mueva / complete / revise / genere / afine |
| No se pudo cargar tu ficha / tus datos | No se pudo cargar su ficha / sus datos |
| Aún no tienes... / Estás cursando... | Aún no tiene... / Está cursando... |
| Consulta tu ficha / Revisa tu cuenta | Consulte su ficha / Revise su cuenta |
| Únete a nuestra comunidad y construye tu futuro | Únase a nuestra comunidad y construya su futuro |

Catálogo completo con archivo:línea → `docs/referencia/estilo-textos-usuario.md`.

Antes de escribir cualquier texto nuevo dirigido al usuario, verifica la
conjugación "usted" (imperativo: -e/-a según terminación del verbo; ej.
guardar→guarde, corregir→corrija, elegir→elija, usar→use). Si dudas, revisa
el catálogo o el checklist de §7.

## 5. Ant Design 6 — props deprecadas (warnings en consola)

El proyecto usa **Ant Design 6.x** (`antd` ^6 en `frontend/package.json`). No asumir
la API de v5 (`Alert.message`) ni v4 (`Modal.visible`).

| Componente | ❌ No usar (v6 deprecado) | ✅ Usar en INCOS |
|------------|-------------------------|------------------|
| `Alert` | `message` | `title` (string o JSX; título en `<strong>` si hace falta) |
| `Alert` | — | `description` para el cuerpo largo |
| `Space` | `direction` | `orientation="vertical"` \| `orientation="horizontal"` (antd@6.0.1 deprecó `direction`/`split` a favor de `orientation`/`separator` — verificado en `antd/es/space/index.js`, no asumir la migración v5→v6 "de manual") |
| `Modal` / `Drawer` | `visible` | `open` |
| `Dropdown` / `Tooltip` / `Popover` | `visible` | `open` |
| `Tabs` | `TabPane` hijo | `items={[ { key, label, children } ]}` |
| `List` | Nuevo uso en pantallas | `Flex` + filas; legacy `<List>` migrar gradualmente |

### Patrones correctos (copiar, no improvisar)

```jsx
// Alert — título visible (antd 6)
<Alert
  type="warning"
  showIcon
  title={<strong>Sin planes habilitados</strong>}
  description="Texto de ayuda o acciones."
/>

// Space — apilado vertical
<Space orientation="vertical" size="small" style={{ width: '100%' }}>
  ...
</Space>

// Preferir Flex cuando solo necesitas layout (AntD 5)
<Flex vertical gap="small" style={{ width: '100%' }}>
  ...
</Flex>
```

### `TableCell` y `orientation`

El molécula `TableCell` expone prop **`orientation`** como API propia del proyecto
(documentada en su JSDoc) y la reenvía tal cual al `<Space>` interno — coincide
con el nombre real de antd@6.0.1, no hace falta traducir nada.

### Checklist AntD antes de cerrar JSX nuevo

- [ ] ¿Todo `<Alert>` usa `title`, nunca `message`?
- [ ] ¿Todo `<Space>` usa `orientation`, nunca `direction`?
- [ ] ¿Modales/drawers usan `open`, no `visible`?

Referencia rápida para agentes: skill `.cursor/skills/incos-antd5-api/SKILL.md`.

## 6. Material Design como guía de comportamiento (no de librería)

No se introduce MUI. "Material" aquí significa adoptar sus *principios* sobre
AntD: jerarquía visual por elevación/peso, feedback inmediato en toda acción
(loading/disabled/success), spacing consistente (múltiplos del token base),
y un único color primario de marca. Si un patrón de AntD y uno de Material
chocan, **gana el componente AntD** para no fragmentar la implementación.

## 6b. Animación y motion (diseño "con vida", 2026)

Librería única de animación: **Motion** (`motion/react`, ex framer-motion). No
GSAP salvo *scroll-hijack* de una landing (no aplica al CRUD). Reglas:

- **Motion motivado:** toda animación necesita una razón en una frase —
  jerarquía, feedback, transición de estado o narrativa. "Se ve cool" no vale.
- **Nunca `useState`** para valores continuos (scroll, mouse, drag): usar
  `useMotionValue` / `useTransform` / `useScroll`.
- Respetar `useReducedMotion` siempre (ver §6b.1).
- Preferir CSS transitions sobre keyframes para UI interrumpible; `@starting-style`
  para enter; transforms (`translate`/`scale`) y `clip-path` para reveals.
- CSS consume `var(--ease-*)` / `var(--dur-*)` de `brand-tokens.css`. JS consume
  `EASE`/`DUR`/`STAGGER` de `presentation/motion/presets.js`. **Cero literales**
  `[0.23,1,0.32,1]` o duraciones `0.26` sueltas en componentes.

### §6b.1 Capa de motion compartida (fuente única — no animar ad-hoc por módulo)

La capa de animación reutilizable vive en:

```
presentation/motion/
  index.js            # barrel: re-exporta presets + wrappers + useReducedMotion
  presets.js          # ÚNICA fuente JS de easings/durations/stagger/variants
presentation/components/atoms/motion/
  FadeIn.jsx          # entrada fade + y (item de grid, sección de drawer)
  Stagger.jsx         # contenedor stagger + Stagger.Item
  Pressable.jsx       # wrapper press scale(0.97) — gateado @media hover:hover
  CountUp.jsx         # número animado (KPI)
  Collapse.jsx        # acordeón grid-rows (submenú, expandibles)
  PresenceSwap.jsx    # AnimatePresence mode wait | popLayout (swap de vistas)
presentation/hooks/
  useReducedMotion.js # re-export de motion/react
  useCountUp.js       # lógica count-up sin render (SRP)
```

**`presets.js` — tokens canónicos para JS (espeja `brand-tokens.css`):**

```js
// presentation/motion/presets.js — única fuente JS
export const EASE = {
  out:    [0.23, 1, 0.32, 1],   // = var(--ease-out)
  inOut:  [0.77, 0, 0.175, 1],  // = var(--ease-in-out)
  drawer: [0.32, 0.72, 0, 1],   // = var(--ease-drawer)
};
export const DUR  = { press:0.14, hover:0.16, pop:0.20, base:0.26, count:0.55, drawer:0.32 };
export const STAGGER = { children:0.05, delay:0.03 };
```

**Reglas de la capa compartida:**

- Cada wrapper lee `useReducedMotion()`: si `true`, anima **solo opacity**
  (nunca desactiva todo — accessible ≠ sin feedback).
- `<MotionConfig reducedMotion="user">` vive en **`MainLayout`** (raíz global),
  no en layouts de módulo.
- Patrones CSS interrumpibles (chip-pop, shimmer, hover-lift) permanecen en CSS
  (`var(--ease-*)`/`var(--dur-*)`); no se "JS-ifican".

### Cuándo invocar las skills globales de diseño (`~/.claude/skills/`)

- `emil-design-eng` → decidir/afinar cualquier animación, easing, springs, gestos,
  microinteracción, perceived performance.
- `impeccable` → auditar una pantalla "plana", pulir jerarquía/estados, detectar
  antipatrones.
- `design-taste-frontend` → dirección de diseño (paleta, tipografía) — solo
  principios, su stack (Tailwind/Next) no aplica.

## 7. Checklist antes de dar por cerrado un componente

- [ ] ¿API Ant Design 6 correcta? (`Alert.title`, `Space.orientation`, `Modal.open` — ver §5)
- [ ] ¿Cero `#hex`, `fontSize:` numérico o `px` de color en JSX/CSS (salvo color de negocio sanitizado)?
- [ ] ¿Usé props de AntD antes que estilos manuales?
- [ ] ¿El componente está en el nivel atómico correcto y la carpeta correcta?
- [ ] ¿La página solo orquesta y la lógica pesada vive en organismos/hooks?
- [ ] ¿Reutilicé `PageTemplate`/`PageHeader`/`TableListView`/`DetailInfoCard` en vez de recrearlos?
- [ ] ¿Los controles de acción respetan permisos (ver `incos-rbac`)?
- [ ] ¿Los nombres de persona en listas/tablas/selects/exportaciones van
      `APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES` vía `buildFullName`? (ver §4b)
- [ ] ¿Si un valor de estilo se repite, lo subí al token de origen (`colors/typography/spacing.js`) y lo consumo por `var()`?
- [ ] ¿La animación usa presets de `presentation/motion/presets.js` (EASE/DUR/STAGGER), no literales?
- [ ] ¿La animación respeta `useReducedMotion()` / `<MotionConfig reducedMotion="user">` global?
- [ ] ¿El theme de AntD sale de `buildAntdTheme(mode)` (no `theme={{ token:{...} }}` local)?
- [ ] ¿Todo texto dirigido al usuario (Alert, notification, Modal, Popconfirm, Empty, Spin tip, validaciones, placeholders) está en "usted" formal, sin voseo/tuteo/1ª persona? (ver §4c)

## 9. Contrato del shell (definición de HECHO para header/sidebar)

Antes de tocar el shell global (header, sidebar, footer), leer
`docs/plan/REVAMP-SHELL-CONTRACT.md` y cumplirlo AL COMPLETO en esa pasada.
Los puntos no negociables:

1. **Theming simétrico:** `applyThemeVars(mode)` desde `brandScale[mode]` — mismo
   set de vars para light y dark. PROHIBIDO `if (mode === 'dark')` para valores especiales.
2. **Tokens al ORIGEN:** tipografía → `tokens/typography.js`; espaciado → `tokens/spacing.js`;
   color → `tokens/colors.js` (`brandScale`). Los `.css` consumen `var(--font-size-*)`,
   `var(--spacing-*)`, `var(--brand-*)`. Un valor NO vive en dos sitios.
3. **Replicar mv2 completo:** `matricula-v2` es la fuente de verdad visual. Lo aprobado
   en mv2 se replica TAL CUAL al shell (no parche parcial). Si un elemento existe en mv2
   y no en el global, falta.
4. **Bordes visibles en ambos temas:** en light el borde no puede desaparecer.
5. **Motion del shell** usa la capa compartida (§6b.1): `<Stagger>` para lista de menú,
   press `:active scale(0.97)` gateado `@media (hover:hover)`, bell-tilt con keyframe
   en `brand-tokens.css` (sin prefijo `mv2-`), `var(--dur-press)` / `var(--ease-out)`.
6. **RBAC intacto:** no tocar `application/navigation/`. El menú solo pinta
   `menuItemsWithIcons` ya filtrado.

## 8. Errores frecuentes (los que causan la UI inconsistente)

1. **Hex literal en componente** en vez de `token.colorPrimary` → cada pantalla
   con un azul distinto. El #1 del problema.
2. **`Alert message=` (v5) o `Space direction=`** → warnings o UI roto (§5).
3. **CSS var propia con su propio hex** que ya existe como token AntD → dos
   fuentes de verdad. Mapear, no clonar.
4. **Columnas/acciones inline** en la página → imposible homogeneizar tablas.
5. **Página monolítica** sin extraer organismos → estilos copiados entre fichas.
6. **`fontSize` numérico suelto** en vez de tamaño del token → tipografía irregular.
7. **Reinventar `PageHeader`/cards** por módulo → cada módulo se ve distinto.
8. **Voseo/tuteo o 1ª persona en texto al usuario** ("guardá", "tu ficha",
   "corregí") en vez de "usted" formal → tono inconsistente entre pantallas
   (ver §4c).
