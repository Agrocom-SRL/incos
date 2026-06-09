---
name: clean-architecture-refactor
description: Refactors INCOS features using project rules incos-project, incos-frontend-module, incos-backend-module and guides 04–07. Use when structuring modules, moving logic out of pages/controllers, or aligning layers.
---

# Clean Architecture Refactor (INCOS)

## 1. Leer reglas del proyecto (obligatorio)

| Área | Regla Cursor |
|------|----------------|
| Enrutador / principios | `.cursor/rules/incos-project.mdc` (`alwaysApply`) |
| Frontend (menú, hooks, capas) | `.cursor/rules/incos-frontend-module.mdc` |
| Backend (routes, use cases, DI) | `.cursor/rules/incos-backend-module.mdc` |
| Permisos 3 capas | `.cursor/rules/incos-rbac.mdc` |
| UI / Atomic Design / theme | `.cursor/rules/incos-ui-system.mdc` |

Reglas solo en `.cursor/rules/` (ver `docs/README.md`).

## 2. Guías paso a paso (cuando implementas, no solo refactor)

| Tarea | Guía |
|-------|------|
| Listado | `docs/guias/implementacion-listado-modulo.md` + `checklist-listado.md` |
| Detalle | `docs/guias/implementacion-detalle-modulo.md` + `checklist-detalle.md` |
| Matriz permisos | `docs/referencia/matriz-permisos-sistema.md` |

## 3. Patrón de referencia

| Caso | Módulo | Regla clave |
|------|--------|-------------|
| ABM `/listar` + `/:id` | Docentes | `incos-frontend-module` §4.2 |
| Tabs `?tab=` | CFG Académico | §4.1 — sin carpeta por entidad |
| Plan transaccional | `/plan/:planId` | doc 05 §5.3 |

## 4. Contrato crítico

`dataKey` (frontend) = `dataFieldName` (backend) — ver `incos-backend-module` §5 y `incos-frontend-module` §5.

## 5. Skills especializadas

- `incos-modulo-listado` · `incos-modulo-detalle` · `incos-permisos-rbac` · `react-ui-ux-designer`
