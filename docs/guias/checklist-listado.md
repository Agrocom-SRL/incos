# Checklist de una página — nuevo listado (INCOS)

**Complemento de:** `docs/guias/implementacion-listado-modulo.md`  
**Arquitectura frontend:** `.claude/skills/incos-frontend-module/SKILL.md`  
**Arquitectura backend:** `.claude/skills/incos-backend-module/SKILL.md`  

**Detalle / ficha:** `docs/guias/checklist-detalle.md`

Marca en orden. Si un ítem no aplica, táchalo y anota por qué (ej. listado solo en tab → omitir ruta `/listar` dedicada).

---

## Backend

| # | Tarea |
|---|--------|
| 1 | DDL (`01-schemas`) / modelo Sequelize alineados. |
| 2 | `I*Repository` + `*Repository` + registro en `repositories.container.js`. |
| 3 | `getSearchFields()` y `getCollectionName()` correctos. |
| 4 | Mapper aplicación `entitiesToPresentation` en `application/mappers/`. |
| 5 | `List*UseCase` (`BaseListUseCase`) — `collectionFieldName` + `dataFieldName`. |
| 6 | `List*Controller` (`BaseListController`) — mismo `dataFieldName`. |
| 7 | `build*Router`: `GET /` + `authenticate` + `verificarPermiso(LISTAR)` + `listValidator` + `validateRequest`. |
| 8 | Validators create/update en `presentation/validators/` si hay mutaciones. |
| 9 | `*.container.js` (use cases, controllers, router) + tokens. |
| 10 | `register*Module` + `routes/index.js` montaje `/api/v1/...`. |
| 11 | Seed RBAC del módulo (`58-67`: permisos + acciones + roles, por código) + matriz. |
| 12 | Prueba API: 200 con datos, 403 sin permiso, 500 descartado (DDL/modelo). |

---

## Frontend

| # | Tarea |
|---|--------|
| 0 | Directorio = **ítem de menú** (`<menu>/`), no subcarpeta por entidad si es tab (doc 06). |
| 1 | `I*Repository` + `ObtenerTodos*UseCase` + `*Repository` HTTP + `endpoints.js`. |
| 2 | `register*Module` en `application/container/modules/index.js`. |
| 3 | `hooks/api/use*Api` con `page: 1`, `limit: 10000`, `mapper`, `dataKey`. |
| 4 | `hooks/features/use*List` (tab/listado) **o** `hooks/state` (pantalla `/listar`); Provider delgado. |
| 5 | Alias `@application-<dominio>` / `@<dominio>` en `vite.config.js` y `jsconfig.json`. |
| 6 | Página o panel: `PageTemplate` / `PageHeader` / `TableListView`. |
| 7 | `config/*TableColumns.jsx`: `TableCell` + `TableActions` con permisos reales. |
| 8 | Connector lazy; rutas con `permiso` o `permisoAny` (menú con tabs). |
| 9 | Rutas `/:id` **después** de estáticas; tabs usan `?tab=` (no `/:id` para el tab). |
| 10 | Permisos coherentes: ruta, UI y `verificarPermiso` backend. |
| 11 | Si el catálogo se reusa en otros módulos: mapper exportado + `@application-shared/hooks/use*CatalogApi`. |

---

## Cierre

| # | Tarea |
|---|--------|
| 1 | Prueba con > 50 filas y búsqueda por campo “oculto”. |
| 2 | Prueba con rol sin permiso: botones / rutas API coherentes. |
