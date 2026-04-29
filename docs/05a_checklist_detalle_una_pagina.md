# Checklist de una página — nuevo detalle / ficha (INCOS)

**Complemento de:** `docs/05_guia_implementacion_detalle_modulo.md`  

Marca en orden. Si un ítem no aplica, táchalo y anota por qué.

---

## Backend

| # | Tarea |
|---|--------|
| 1 | Vistas SQL o consultas de lectura alineadas al modelo de negocio (cabecera + hijos si aplica). |
| 2 | Repositorio: método que arme el **bundle** o entidad enriquecida para el detalle. |
| 3 | Caso de uso `execute(id)` + **NotFoundError** si no hay registro principal. |
| 4 | Mapper de presentación: DTO estable (fechas, textos compuestos, hex/colores si la UI los usa). |
| 5 | `Get*ByIdController` extends **`BaseGetController`** (`resourceName`, `dataFieldName`). |
| 6 | `GET /:id` con `authenticate` + `verificarPermiso` + **`DETALLE`** + `idValidator` + `validateRequest`. |
| 7 | Tokens + `*.container.js` + router ya montado en `routes/index.js`. |

---

## Frontend

| # | Tarea |
|---|--------|
| 1 | `I*Repository.obtenerPorId` + caso de uso dominio + repositorio HTTP + `BY_ID` en `endpoints.js`. |
| 2 | `register*Module`: factory expone `obtener*PorId`. |
| 3 | `createApiHook` con `dataType: 'object'`, `dataKey` = clave del payload API, `mapper` de detalle. |
| 4 | Hook de estado (`use*Detail`) + `useEffect` por id válido + `breadcrumb` / navegación volver/editar. |
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
