---
name: incos-antd5-api
description: >-
  API Ant Design 6 en INCOS (Alert title, Space direction, Modal open, evitar List
  nuevo). Usar al crear o editar .jsx con antd, alerts, modales o layout Space/Flex.
---

# Ant Design 6 — API correcta en INCOS

Regla completa: `.cursor/rules/incos-ui-system.mdc` §5.

El frontend usa **React 18 + antd ^6** (`frontend/package.json`). Las reglas
antiguas de v5 (`Alert.message`) están **obsoletas** y generan warnings en consola.

## Tabla de reemplazos obligatorios

| Componente | ❌ No escribir (deprecado en v6) | ✅ Usar en INCOS |
|------------|----------------------------------|------------------|
| `Alert` | `message="..."` | `title="..."` o `title={<strong>...</strong>}` |
| `Alert` | — | `description` para el cuerpo largo |
| `Space` | `orientation="vertical"` | `direction="vertical"` |
| `Modal`, `Drawer` | `visible={open}` | `open={open}` |
| `Dropdown`, `Tooltip`, `Popover` | `visible` | `open` |
| `Tabs` | `<TabPane>` | prop `items={[...]}` |
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

<Space direction="vertical" size="small" style={{ width: '100%' }}>
  <span>Uno</span>
</Space>
```

## `List` deprecado

- En código **nuevo**: no importar `List` de `antd`; usar listas con `Flex` + botones/div (como modales del dashboard).
- Código existente con `<List>`: sigue funcionando pero muestra warning; migrar cuando convenga (sucesor futuro: **Listy** en antd).

## Checklist al generar código

1. Buscar en el diff: `message=` en `<Alert` → cambiar a `title`.
2. Buscar: `orientation=` en `<Space` → cambiar a `direction` (o `Flex vertical`).
3. Buscar: `visible=` en Modal/Drawer → cambiar a `open`.
4. No añadir `<List>` nuevo de antd sin justificar.

## Origen

Migración v5→v6: [Ant Design migration v6](https://ant.design/docs/react/migration-v6) — `Alert.message` → `title`.
