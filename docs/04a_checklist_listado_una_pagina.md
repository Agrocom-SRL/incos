# Checklist de una página — nuevo listado (INCOS)

**Complemento de:** `docs/04_guia_implementacion_listado_modulo.md`  

Marca en orden. Si un ítem no aplica, táchalo y anota por qué.

---

## Backend

| # | Tarea |
|---|--------|
| 1 | DDL / modelo Sequelize alineados (sin columnas inexistentes). |
| 2 | `getSearchFields()` del repositorio con atributos Sequelize correctos. |
| 3 | `List*UseCase` extends `BaseListUseCase` + mapper `entitiesToPresentation`. |
| 4 | `List*Controller` extends `BaseListController`. |
| 5 | `build*Router`: `GET /` + `authenticate` + `verificarPermiso` + `listValidator` + `validateRequest`. |
| 6 | Tokens + `*.container.js` + `register*Module` en `modules/index.js`. |
| 7 | `routes/index.js`: `router.use('/ruta', …)` + documentación en `GET /`. |

---

## Frontend

| # | Tarea |
|---|--------|
| 1 | `I*Repository` + `ObtenerTodos*UseCase` + `*Repository` HTTP + `endpoints.js`. |
| 2 | `register*Module` en `application/container/modules/index.js`. |
| 3 | `use*Api` (`createApiHook`) con `page: 1`, `limit: 10000`, `mapper`, `dataKey`. |
| 4 | Provider lista + `useTableData` + `getSearchFields` exhaustivo. |
| 5 | Alias `@application-*` en `vite.config.js` y `jsconfig.json`. |
| 6 | Página: `PageTemplate` / `PageHeader` / `TableListView`. |
| 7 | `tableColumns.jsx`: `TableCell` + tema; `TableActions` con permisos reales. |
| 8 | Connector lazy + rutas en `routes.jsx` (`key`, `permiso`, `accion`, menú). |
| 9 | Rutas `/:id` **después** de rutas estáticas del mismo prefijo. |

---

## Cierre

| # | Tarea |
|---|--------|
| 1 | Prueba con > 50 filas y búsqueda por campo “oculto”. |
| 2 | Prueba con rol sin permiso: botones / rutas API coherentes. |
