---
name: react-ui-ux-designer
description: Polishes INCOS React UI per incos-ui-system and incos-frontend-module without breaking architecture. Use for visual consistency, tables, fichas, forms, accessibility, loading/empty/error states.
---

# React UI/UX Designer (INCOS)

## Reglas obligatorias (leer completas)

1. **`.cursor/rules/incos-ui-system.mdc`** — prioridad: theme AntD única fuente de verdad, Atomic Design, patrones listado/ficha, cero `#hex`/`fontSize` literal, **API Ant Design 5 (§5)**
2. **`.cursor/skills/incos-antd5-api/SKILL.md`** — antes de escribir `Alert`, `Space`, `Modal`, `Drawer`
3. **`.cursor/rules/incos-frontend-module.mdc`** — páginas solo orquestan; sin fetch en `pages/`
4. **`.cursor/rules/incos-rbac.mdc`** — `ActionButton` / `TableActions` con permisos reales

## Qué mejorar (sin romper capas)

- Jerarquía, spacing, tipografía vía **token** (`theme.useToken()`)
- Estados: loading (`Spin`), empty, error (`Alert`), success feedback
- Extraer JSX duplicado a átomo/molécula/organismo correcto
- Reutilizar `PageTemplate`, `PageHeader`, `TableListView`, `DetailInfoCard`, `DetailField`

## Qué NO hacer

- Lógica de negocio o fetch en la página
- Estilos inline (salvo color de negocio sanitizado — `incos-ui-system` §1)
- `TableActions` sin `permisos` “para que se vea” (bypass — `incos-rbac` §4)
- Columnas inline en la page en vez de `config/*TableColumns.jsx`
- **`Alert title=`**, **`Space orientation=`**, **`Modal visible=`** — props inválidas en antd 5 (`incos-antd5-api`)

## Checklist Ant Design 5 (obligatorio en banners y formularios)

- [ ] `Alert`: `message` + `description`, nunca `title`
- [ ] `Space`: `direction`, nunca `orientation` (o `Flex vertical`)
- [ ] `Modal` / `Drawer`: `open`, nunca `visible`

## Guías de referencia visual

`docs/guias/implementacion-listado-modulo.md` §4.4 · `docs/guias/implementacion-detalle-modulo.md` §4.3–4.4
