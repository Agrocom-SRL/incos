---
name: incos-antd5-api
description: >-
  Evita props obsoletas o inexistentes de Ant Design 5 en INCOS (Alert message,
  Space direction, Modal open). Usar al crear o editar cualquier .jsx con
  componentes antd, banners, alerts, modales, drawers o layout con Space/Flex.
---

# Ant Design 5 — API correcta en INCOS

Regla completa: `.cursor/rules/incos-ui-system.mdc` §5.

El stack del frontend es **React 18 + antd ^5**. Varias props de v4 u otras
librerías **no existen** en v5: React las ignora y el UI queda mal **sin error
en consola**.

## Tabla de reemplazos obligatorios

| Componente | ❌ No escribir | ✅ Escribir |
|------------|---------------|-------------|
| `Alert` | `title="..."` | `message="..."` o `message={<strong>...</strong>}` |
| `Space` | `orientation="vertical"` | `direction="vertical"` |
| `Modal`, `Drawer` | `visible={open}` | `open={open}` |
| `Dropdown`, `Tooltip`, `Popover` | `visible` | `open` |
| `Tabs` | `<TabPane>` | prop `items={[...]}` |

## Ejemplos canónicos

```jsx
import { Alert, Flex, Space } from 'antd';

// Banner informativo
<Alert
  type="info"
  showIcon
  closable
  message={<strong>Flujo operativo</strong>}
  description={
    <Flex vertical gap="small">
      <span>Texto de ayuda.</span>
    </Flex>
  }
/>

// Apilado (alternativa: Flex vertical)
<Space direction="vertical" size="small" style={{ width: '100%' }}>
  <span>Uno</span>
  <span>Dos</span>
</Space>
```

## `TableCell` (molécula del repo)

- `TableCell` **sí** tiene prop `orientation` — es API **del molécula**, no de antd.
- En componentes nuevos con `<Space importado de 'antd'>`: solo `direction`.
- No propagar `orientation` a `<Space>` por copiar `TableCell`.

## Checklist al generar código

1. Buscar en el diff: `title=` en `<Alert` → cambiar a `message`.
2. Buscar: `orientation=` en `<Space` → cambiar a `direction` (o usar `Flex vertical`).
3. Buscar: `visible=` en Modal/Drawer → cambiar a `open`.
4. Si pulís UI visual, aplicar también `incos-ui-system` y skill `react-ui-ux-designer`.

## Origen del conocimiento

Corregido en módulo Oferta Académica (`OfertaOperativaBanner`, `OfertaAlertBanner`,
etc., 2026-06): los títulos de `Alert` no se mostraban por usar `title` en lugar de `message`.
