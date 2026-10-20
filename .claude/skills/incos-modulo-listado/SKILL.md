---
name: incos-modulo-listado
description: Implements INCOS list screens per incos-frontend-module, incos-backend-module, incos-rbac and docs 04/04a. Use for new listings, tab tables, or GET list endpoints.
---

# INCOS — Implementar listado

## Reglas (leer antes de codificar)

1. `.cursor/rules/incos-project.mdc` — identificar área
2. `.cursor/rules/incos-frontend-module.mdc` — hooks `api`/`features`, menú, `dataKey`
3. `.cursor/rules/incos-backend-module.mdc` — §3 listado, middleware, `dataFieldName`
4. `.cursor/rules/incos-rbac.mdc` — acción `LISTAR` en 3 capas
5. `.cursor/rules/incos-ui-system.mdc` — §4 patrón listado (`PageTemplate` + `TableListView`)

## Guía detallada

`docs/guias/implementacion-listado-modulo.md` · checklist `docs/guias/checklist-listado.md`

## Workflow

1. Elegir patrón: tab (CFG) vs pantalla `/listar` (docentes) — `incos-frontend-module` §4.
2. Backend: tabla §3 de `incos-backend-module` + seeds 54/56/55 + matriz.
3. Frontend: `hooks/api` (`limit: 10000`) + `hooks/features` + Provider delgado.
4. UI: `config/*TableColumns.jsx`, `TableActions` con `permisos` (fail-closed — `incos-rbac` §4).
5. Cierre: >50 filas, búsqueda campo oculto, rol sin permiso → 403 + UI sin CTA.

## Patrón visual canónico (PROTOTIPO — clonar, no reinventar)

Toda pantalla `/listar` a página completa clona este shell (ver `incos-ui-system` §4
"Página de listado" para el árbol JSX completo y las reglas):

```
PageTemplate
  header = PageHeader title="Lista de …" breadcrumbItems actions={exportActions}
  └─ Flex vertical gap={allSpacing.marginLG}
       └─ section.cfg-academico-workspace
            ├─ header.cfg-academico-workspace__header
            │    ├─ ListPanelHeader title="Lista de …" actions={crearAction}
            │    └─ Paragraph.cfg-academico-workspace__desc   (lede 1–2 líneas)
            └─ div.cfg-academico-tab-panel
                 └─ TableListView embedded searchColSpan={10} searchStyle={{maxWidth:520}}
```

Reglas fijas:
- **`PageHeader` conserva su título primario** (`title="Lista de …"`); convive con el título
  del `ListPanelHeader`.
- **Botón CREAR** → dentro del `ListPanelHeader` del workspace. **Exportar / filtros globales
  (Select de carrera, Excel)** → en `PageHeader actions`.
- Importar `@configuracion/academico/styles/academico-form-page.css`.
- Columnas en `config/*TableColumns.jsx` con `TableActions` + `permisos` (fail-closed).

**Páginas prototipo (copiar la más parecida, solo cambian los datos):** `DocentesList.jsx`,
`EstudiantesList.jsx`, `InscripcionesList.jsx`, `PagosList.jsx`, `BecasList.jsx`. Listados en
tabs (CFG Académico) usan la variante `embedded` de `CarrerasList/MateriasList/ParalelosList`.
CSS compartido en `configuracion/academico/styles/academico-form-page.css`.

## Referencias código

Docentes §5.1 doc 04 · CFG carreras tab §5.2 · catálogo académico `configuracion/academico`
