---
name: incos-ui-system
description: Sistema de diseño homogéneo INCOS — Ant Design v5 + Atomic Design + tokens. SIEMPRE activa al crear o editar cualquier componente, página, tabla, formulario, ficha o estilo en el frontend.
---

# Sistema de diseño UI — INCOS (Ant Design v5)

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

```jsx
// theme/incosTheme.js — ÚNICO lugar donde viven los valores literales
export const incosTheme = {
  token: {
    colorPrimary: '#...',      // definir aquí, no en componentes
    borderRadius: 8,
    fontFamily: '...',
    fontSize: 14,
  },
  components: {
    Table:  { /* overrides solo de Table */ },
    Button: { /* overrides solo de Button */ },
  },
};
```

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

### Página de listado
`PageTemplate` → `PageHeader` (con acciones vía `ActionButton`) → `TableListView`.
Columnas en archivo dedicado `config/*TableColumns.jsx` usando `TableCell`,
`Space` y `TableActions`. Nunca columnas inline en el `.jsx` de la página.

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

## 5. Ant Design 6 — props deprecadas (warnings en consola)

El proyecto usa **Ant Design 6.x** (`antd` ^6 en `frontend/package.json`). No asumir
la API de v5 (`Alert.message`) ni v4 (`Modal.visible`).

| Componente | ❌ No usar (v6 deprecado) | ✅ Usar en INCOS |
|------------|-------------------------|------------------|
| `Alert` | `message` | `title` (string o JSX; título en `<strong>` si hace falta) |
| `Alert` | — | `description` para el cuerpo largo |
| `Space` | `orientation` | `direction="vertical"` \| `direction="horizontal"` |
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
<Space direction="vertical" size="small" style={{ width: '100%' }}>
  ...
</Space>

// Preferir Flex cuando solo necesitas layout (AntD 5)
<Flex vertical gap="small" style={{ width: '100%' }}>
  ...
</Flex>
```

### Excepción del repo: `TableCell`

El molécula `TableCell` expone prop **`orientation`** como API propia del proyecto
(documentada en su JSDoc). Eso **no** autoriza pasar `orientation` a `<Space>` de
`antd` en componentes nuevos. Si usas `TableCell`, pasa `orientation`; si usas
`<Space>` directo, usa **`direction`**.

### Checklist AntD antes de cerrar JSX nuevo

- [ ] ¿Todo `<Alert>` usa `title`, nunca `message`?
- [ ] ¿Todo `<Space>` usa `direction`, nunca `orientation`?
- [ ] ¿Modales/drawers usan `open`, no `visible`?

Referencia rápida para agentes: skill `.cursor/skills/incos-antd5-api/SKILL.md`.

## 6. Material Design como guía de comportamiento (no de librería)

No se introduce MUI. "Material" aquí significa adoptar sus *principios* sobre
AntD: jerarquía visual por elevación/peso, feedback inmediato en toda acción
(loading/disabled/success), spacing consistente (múltiplos del token base),
y un único color primario de marca. Si un patrón de AntD y uno de Material
chocan, **gana el componente AntD** para no fragmentar la implementación.

## 7. Checklist antes de dar por cerrado un componente

- [ ] ¿API Ant Design 6 correcta? (`Alert.title`, `Space.direction`, `Modal.open` — ver §5)
- [ ] ¿Cero `#hex`, `fontSize:` numérico o `px` de color en JSX/CSS (salvo color de negocio sanitizado)?
- [ ] ¿Usé props de AntD antes que estilos manuales?
- [ ] ¿El componente está en el nivel atómico correcto y la carpeta correcta?
- [ ] ¿La página solo orquesta y la lógica pesada vive en organismos/hooks?
- [ ] ¿Reutilicé `PageTemplate`/`PageHeader`/`TableListView`/`DetailInfoCard` en vez de recrearlos?
- [ ] ¿Los controles de acción respetan permisos (ver `incos-rbac`)?
- [ ] ¿Los nombres de persona en listas/tablas/selects/exportaciones van
      `APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES` vía `buildFullName`? (ver §4b)
- [ ] ¿Si un valor de estilo se repite, lo subí al theme en vez de copiarlo?

## 8. Errores frecuentes (los que causan la UI inconsistente)

1. **Hex literal en componente** en vez de `token.colorPrimary` → cada pantalla
   con un azul distinto. El #1 del problema.
2. **`Alert message=` (v5) o `Space orientation=`** → warnings o UI roto (§5).
3. **CSS var propia con su propio hex** que ya existe como token AntD → dos
   fuentes de verdad. Mapear, no clonar.
4. **Columnas/acciones inline** en la página → imposible homogeneizar tablas.
5. **Página monolítica** sin extraer organismos → estilos copiados entre fichas.
6. **`fontSize` numérico suelto** en vez de tamaño del token → tipografía irregular.
7. **Reinventar `PageHeader`/cards** por módulo → cada módulo se ve distinto.
