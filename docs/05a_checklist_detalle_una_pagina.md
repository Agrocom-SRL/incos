# Checklist de una página — nuevo detalle / ficha (INCOS)

**Complemento de:** `docs/05_guia_implementacion_detalle_modulo.md`  
**Arquitectura frontend:** `docs/06_arquitectura_modulos_frontend.md`  
**Arquitectura backend:** `docs/07_arquitectura_modulos_backend.md`  

Marca en orden. Si un ítem no aplica, táchalo y anota por qué (ej. detalle embebido en modal sin `/:id`).

---

## Backend

| # | Tarea |
|---|--------|
| 1 | Vistas `03-views/` recreadas en BD (si ficha compleja) o `findById` en repositorio. |
| 2 | Repositorio: `findDetailBundle*` o equivalente (cabecera + hijos). |
| 3 | `Get*ByIdUseCase.execute(id)` + **NotFoundError** si no hay registro. |
| 4 | Mapper detalle: DTO estable (`profile`, colecciones, fechas, hex). |
| 5 | `Get*ByIdController` (`BaseGetController`, `dataFieldName` = use case). |
| 6 | `GET /:id` **después** de rutas estáticas (`/matriz`, …). |
| 7 | Cadena: `authenticate` + `verificarPermiso` + **`DETALLE`** + `idValidator` + `validateRequest`. |
| 8 | Registro en `*.container.js` + tokens; router montado en `routes/index.js`. |
| 9 | Seeds 54/56/55 + fila en matriz para `DETALLE` y endpoints hijos. |
| 10 | Prueba: 404 id inválido, 403 rol sin DETALLE, JSON con clave `dataFieldName` esperada. |

---

## Frontend

| # | Tarea |
|---|--------|
| 1 | `I*Repository.obtenerPorId` + caso de uso dominio + repositorio HTTP + `BY_ID` en `endpoints.js`. |
| 2 | `register*Module`: factory expone `obtener*PorId`. |
| 3 | `createApiHook` con `dataType: 'object'`, `dataKey` = clave del payload API, `mapper` de detalle. |
| 4 | Hook de estado en `hooks/state/` (`use*Detail`) + carga por id + breadcrumb / volver / editar. |
| 5 | `*DetailContext` + `*DetailProvider`; Connector recibe `id` de `useParams`. |
| 6 | Página: `PageTemplate` / `PageHeader` / `Spin` / `Alert`; cabecera de ficha; `Tabs` o secciones. |
| 7 | Secciones pesadas en **organismos**; tarjetas repetibles en **moléculas**; utilidades de color en **átomos**. |
| 8 | Estilos en `detail-page.css` (prefijos `sd-`, `da-`, etc.) sin inline masivo salvo casos puntuales (hex). |
| 9 | `routes.jsx`: ruta `/:id` con `accion: 'DETALLE'` y **después** de rutas estáticas del mismo prefijo. |
| 10 | Listado: `navigate` al detalle con `state` (`returnListPath`, `menuSidebarKey` si aplica). |
| 11 | Connector de detalle exportado como **`lazy`** y `Suspense` en el layout (mismo criterio que listado). |
| 12 | Si hay pantallas intermedias, conservar ruta de origen (`gestionReturnPath` o equivalente) además de `returnListPath`. |
| 13 | Permisos consistentes entre ruta frontend, guards/botones UI y middleware backend. |

---

## Cierre

| # | Tarea |
|---|--------|
| 1 | Prueba con id inexistente (UI + API). |
| 2 | Prueba con rol sin permiso `DETALLE`: ruta y API coherentes. |
| 3 | Volver desde ficha al listado correcto cuando se usa `returnListPath`. |
