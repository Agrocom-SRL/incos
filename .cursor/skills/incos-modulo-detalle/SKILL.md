---
name: incos-modulo-detalle
description: Implements INCOS detail/ficha per incos-frontend-module, incos-backend-module, incos-rbac, incos-ui-system and docs 05/05a. Use for GET /:id, profile pages, plan detail, DETALLE permission.
---

# INCOS — Implementar detalle / ficha

## Reglas (leer antes de codificar)

1. `.cursor/rules/incos-project.mdc`
2. `.cursor/rules/incos-frontend-module.mdc` — §3 `hooks/state`, §6 rutas, `returnListPath`
3. `.cursor/rules/incos-backend-module.mdc` — §4 detalle, orden router
4. `.cursor/rules/incos-rbac.mdc` — acción `DETALLE`
5. `.cursor/rules/incos-ui-system.mdc` — §4 ficha (`Spin`, `DetailInfoCard`, `detail-page.css`)

## Guía detallada

`docs/guias/implementacion-detalle-modulo.md` · checklist `docs/guias/checklist-detalle.md`

## Workflow

1. Patrón: ficha ABM vs pantalla transaccional (plan) — doc 05 §1.
2. Backend: `Get*ByIdUseCase`, `NotFoundError`, `GET /:id` después de estáticas.
3. Frontend: `hooks/api` (`dataType: 'object'`) + `hooks/state/use*Detail`.
4. UI: organismos para secciones; página solo orquesta (`incos-ui-system` §3).
5. Navegación: `returnListPath`, `menuSidebarKey`, `gestionReturnPath` si aplica.
6. Cierre: 404, 403 sin DETALLE, volver al listado correcto.

## Referencias código

Docentes ficha doc 05 §5.1 · Plan CFG §5.3
