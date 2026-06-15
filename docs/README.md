# Documentación INCOS

Dos capas con distinto ciclo de vida: **permanente** (reglas + guías + referencia) y **temporal** (plan de refactor horarios + plan de estudio).

## Permanente — crece con el producto

| Capa | Ubicación | Cuándo editar |
|------|-----------|---------------|
| **Reglas Cursor** | `.cursor/rules/incos-*.mdc` | Convenciones de arquitectura, UI, RBAC |
| **Skills** | `.cursor/skills/*/SKILL.md` | Flujos: listado, detalle, permisos, UI |
| **Guías de implementación** | `docs/guias/` | Paso a paso al crear pantallas/endpoints |
| **Referencia operativa** | `docs/referencia/` | Datos vivos (permisos, endpoints) |

### `docs/guias/`

| Archivo | Propósito |
|---------|-----------|
| `implementacion-listado-modulo.md` | Cookbook listado (FE + BE, referencias Docentes/CFG) |
| `checklist-listado.md` | Checklist de una página — listado |
| `implementacion-detalle-modulo.md` | Cookbook ficha / detalle |
| `checklist-detalle.md` | Checklist de una página — detalle |

### `docs/referencia/`

| Archivo | Propósito |
|---------|-----------|
| `matriz-permisos-sistema.md` | Pantalla ↔ `permisos.codigo` ↔ API ↔ acción |
| `flujo-operativo-gestion-academica.md` | Orden operativo CFG→INST→MAT→ACA; smoke E2E pantalla por pantalla |

**No hay copia de las reglas en `docs/`** — solo `.cursor/rules/`.

## Temporal — eliminar al cerrar el refactor

| Ubicación | Propósito |
|-----------|-----------|
| `docs/plan/PLAN_MAESTRO.md` | Mapa del refactor horarios + plan de estudio |
| `docs/plan/MIGRACION_CODIGO.md` | Inventario código (tablas retiradas vs modelo actual) |
| `docs/plan/SPRINT_1.md` … `SPRINT_5.md` | Entregables por sprint |

Cuando el refactor esté en producción y estable, **borrar `docs/plan/`** (o archivar fuera del repo). Las reglas en `.cursor/rules/` siguen siendo la base para features nuevas.

## Flujo con el agente

```
Tarea nueva
  → incos-project.mdc (enrutador)
  → regla del área (frontend | backend | ui | rbac)
  → skill si aplica (incos-modulo-listado, …)
  → guía en docs/guias/ + matriz si hay permisos
  → docs/plan/ solo si el trabajo es parte del refactor V2
```

## Nombres antiguos (eliminados)

| Antes | Ahora |
|-------|--------|
| `04_guia_…` | `guias/implementacion-listado-modulo.md` |
| `04a_checklist_…` | `guias/checklist-listado.md` |
| `05_guia_…` | `guias/implementacion-detalle-modulo.md` |
| `05a_checklist_…` | `guias/checklist-detalle.md` |
| `06_` / `07_` arquitectura | `.cursor/rules/incos-frontend-module.mdc` / `incos-backend-module.mdc` |
| `docs/incos-*.mdc` duplicados | eliminados (solo `.cursor/rules/`) |
