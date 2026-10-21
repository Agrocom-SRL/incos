---
name: incos-antd5-api
description: >-
  API Ant Design 6 en INCOS (Alert title, Space orientation, Modal open, evitar List
  nuevo). Usar al crear o editar .jsx con antd, alerts, modales o layout Space/Flex.
---

# Ant Design 6 — API correcta en INCOS

Regla completa: `.claude/skills/incos-ui-system/SKILL.md` §5.

El frontend usa **React 18 + antd ^6** (`frontend/package.json`). Las reglas
antiguas de v5 (`Alert.message`) están **obsoletas** y generan warnings en consola.

## ConfigProvider — fuente única del theme

El objeto `theme` que se pasa al `ConfigProvider` raíz **siempre** sale de
`buildAntdTheme(mode)`. Esta función consume `brandScale[mode]` de
`infrastructure/config/theme/tokens/colors.js` y construye `token` + `components`
con los valores de la paleta de marca. PROHIBIDO:

```jsx
// MAL — theme ad-hoc en un componente local
<ConfigProvider theme={{ token: { colorPrimary: '#007848' } }}>

// BIEN — theme desde la fuente única
import { buildAntdTheme } from '@infrastructure/config/theme/buildAntdTheme';
<ConfigProvider theme={buildAntdTheme(mode)}>
```

El runtime escribe las CSS vars (`var(--brand-N)`, `var(--color-*)`) vía
`applyThemeVars(mode)` — simétrico para light y dark, sin `if (mode === 'dark')`.

## Tabla de reemplazos obligatorios

| Componente | ❌ No escribir (deprecado en v6) | ✅ Usar en INCOS |
|------------|----------------------------------|------------------|
| `Alert` | `message="..."` | `title="..."` o `title={<strong>...</strong>}` |
| `Alert` | — | `description` para el cuerpo largo |
| `Space` | `direction="vertical"` | `orientation="vertical"` (antd@6.0.1 deprecó `direction` a favor de `orientation` — verificado en `antd/es/space/index.js`, warning en runtime) |
| `Modal`, `Drawer` | `visible={open}` | `open={open}` |
| `Drawer` | `width={520}` / `height={...}` | `size={520}` (acepta número igual que `width`, o `'default'`/`'large'` para presets) |
| `Dropdown`, `Tooltip`, `Popover` | `visible` | `open` |
| `Tabs` | `<TabPane>` | prop `items={[...]}` |
| `Tag` | `bordered={false}` | `variant="filled"` (también `variant="outlined"`) |
| `Spin` | `tip="..."` suelto (sin hijos) | patrón **nest** `<Spin tip><div/></Spin>`, **fullscreen** `<Spin fullscreen tip>`, o spinner + `<Text>` aparte |
| `List` (antd) | **Nuevo** `<List>` en pantallas | `Flex vertical` + filas, o mantener `List` solo en legacy hasta migrar |

## Ejemplos canónicos

```jsx
import { Alert, Flex, Space } from 'antd';

<Alert
  type="info"
  showIcon
  closable
  title={<strong>Flujo operativo</strong>}
  description={
    <Flex vertical gap="small">
      <span>Texto de ayuda.</span>
    </Flex>
  }
/>

<Space orientation="vertical" size="small" style={{ width: '100%' }}>
  <span>Uno</span>
</Space>
```

## `List` deprecado

- En código **nuevo**: no importar `List` de `antd`; usar listas con `Flex` + botones/div (como modales del dashboard).
- Código existente con `<List>`: sigue funcionando pero muestra warning; migrar cuando convenga (sucesor futuro: **Listy** en antd).

## Checklist al generar código

1. Buscar en el diff: `message=` en `<Alert` → cambiar a `title`.
2. Buscar: `direction=` en `<Space` → cambiar a `orientation` (o `Flex vertical`).
3. Buscar: `visible=` en Modal/Drawer → cambiar a `open`.
4. Buscar: `width=`/`height=` en `<Drawer` → cambiar a `size=` (mismo valor numérico funciona igual).
5. Buscar: `bordered={false}` / `bordered` en `<Tag` → cambiar a `variant="filled"` / `variant="outlined"`.
6. Buscar: `<Spin ... tip=` sin hijos → usar nest/fullscreen o sacar el texto a `<Text>` aparte (`tip` solo aplica en patrón nest o fullscreen; suelto genera warning).
7. No añadir `<List>` nuevo de antd sin justificar.

## Drawer y Modal — motion de enter/exit

No animes `Drawer`/`Modal` a mano por componente. El gate de animación global
es `<MotionConfig reducedMotion="user">` en `MainLayout`. Para swap de contenido
dentro de un modal/drawer usa `<PresenceSwap mode="wait">` de
`presentation/motion/` (no `AnimatePresence` ad-hoc). Las duraciones y easings
vienen de `presentation/motion/presets.js` (`EASE.drawer`, `DUR.drawer`), que
espeja los tokens CSS `var(--ease-drawer)` / `var(--dur-drawer)` de
`presentation/styles/base/brand-tokens.css`.

```jsx
import { PresenceSwap } from '@presentation/motion';
// dentro de un Drawer open con contenido intercambiable:
<PresenceSwap mode="wait" keyProp={activeTab}>
  {children}
</PresenceSwap>
```

## Origen

Migración v5→v6: [Ant Design migration v6](https://ant.design/docs/react/migration-v6) — `Alert.message` → `title`.
