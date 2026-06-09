---
name: incos-permisos-rbac
description: Aligns INCOS RBAC using incos-rbac rule and matriz-permisos-sistema.md. Use for verificarPermiso, routes.jsx, ActionButton, TableActions, seeds 54/55/56, landingStack, viewStack.
---

# INCOS — Permisos y RBAC

## Regla canónica (leer completa)

`.cursor/rules/incos-rbac.mdc`

No duplicar aquí: esa regla define vocabulario v2, 3 capas, seeds, `landingStack`/`viewStack`, catálogo referencia 105, fail-closed en `TableActions`.

## Matriz operativa

`docs/referencia/matriz-permisos-sistema.md` — pantalla ↔ `permisos.codigo` ↔ endpoint ↔ acción

## Workflow al agregar recurso

1. Seed 54 → 56 → 55 (no ADMIN_SISTEMA en 55)
2. `routes.jsx` + UI + `verificarPermiso` — **mismo** `codigo` y **misma** `accion`
3. Fila en matriz
4. Prueba rol con y sin permiso

## Relación con otras reglas

- Listado: `LISTAR` — skill `incos-modulo-listado`
- Ficha: `DETALLE` — skill `incos-modulo-detalle`
- Enrutador: `incos-project.mdc`
