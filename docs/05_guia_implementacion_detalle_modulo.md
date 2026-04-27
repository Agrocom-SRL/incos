# Documento 5 — Guía intermedia: implementar el detalle (ficha) de un registro
## Patrón de referencia: ficha de docente (INCOS)

**Checklist compacto (una página):** `docs/05a_checklist_detalle_una_pagina.md`  

**Complementa:** `docs/04_guia_implementacion_listado_modulo.md` (listado suele enlazar a la ficha con `navigate` y `location.state`).

**Relación con otros documentos**

- `docs/02_estructura_sidebar.md` — keys de menú, `permiso` / `accion` en rutas de presentación.
- `docs/matriz-permisos-sistema.md` — acción **`DETALLE`** para ver ficha (`GET /:id`), coherente con `TableActions` y middleware.
- `docs/01_schema_datos.md` — modelo de datos; las **vistas SQL** de detalle deben reflejar columnas reales y joins necesarios.

---

## 1. Objetivo de esta guía

Describir los **pasos ordenados** y los **artefactos** para incorporar la **vista de detalle** de un recurso: una petición **`GET /api/v1/<recurso>/:id`**, respuesta enriquecida (perfil + colecciones relacionadas si aplica) y una **pantalla de ficha** con cabecera, pestañas o secciones, componentes reutilizables y estilos en `detail-page.css`.

Patrón de referencia: **`/docentes/:id`** (`DocentesDetail`, contexto de detalle, asignaciones con colores de carrera/curso, horarios en tab aparte).

---

## 2. Resultado esperado (definición de “detalle listo”)

1. **Backend:** `GET /:id` con `authenticate`, `verificarPermiso('<dominio>.<recurso>', 'DETALLE')`, **`idValidator`** (o equivalente), `validateRequest`, caso de uso que devuelve un **objeto** (no lista), `NotFoundError` si no existe, respuesta estándar (`success`, `data.<nombreCampo>`).
2. **Frontend:** ruta dinámica **`/:id`** declarada **después** de rutas estáticas del mismo prefijo (`/listar`, `/registrar`, …); **Connector** lazy; **Provider** de detalle que obtiene datos por ID; **página** con `PageTemplate`, `PageHeader`, `Spin` / `Alert`, cabecera de ficha y cuerpo (tabs u organización por secciones).
3. **Datos:** si la ficha agrega listas (asignaciones, horarios, etc.), el backend puede armar un **bundle** en el repositorio (varias consultas o vistas) y un **mapper de presentación** que exponga DTOs legibles (`profile`, `assignments`, …).
4. **Permisos:** coherencia entre `routes.jsx` (`accion: 'DETALLE'`), seeds y middleware del `GET /:id`.
5. **Navegación desde el listado:** pasar en `state` lo necesario para volver (p. ej. `returnListPath`, `menuSidebarKey`) y usarlo en la ficha al pulsar “Volver”.

---

## 3. Backend — pasos

### 3.1 Vistas o consultas de lectura

- Para fichas complejas, conviene **vistas en `backend/database/03-views/`** (una cabecera del registro, opcionalmente vistas para hijos) en lugar de exponer tablas internas crudas.
- Referencia docente: `50-vista-base-docente-ficha.sql`, `51-vista-base-docente-asignaciones-curso.sql`, `52-vista-base-docente-curso-bloques-horario.sql` (incluyen `color_hex` de curso/carrera cuando la UI debe pintar sectores).
- Tras crear o alterar vistas, **recrearlas en el entorno** para que el API devuelva las columnas nuevas.

### 3.2 Repositorio

- Método dedicado que devuelva un **objeto agregado** (p. ej. `{ teacher, assignments, schedules }`) usando `sequelize.query` contra vistas o joins controlados.
- Referencia: `TeacherRepository.findDetailBundleByTeacherId`.

### 3.3 Caso de uso y mapper de presentación

- Caso de uso **`execute(id)`** que llame al repositorio; si el registro principal es `null`, lanzar **`NotFoundError`** con nombre de recurso.
- **Mapper** (`TeacherDetailPresentationMapper`) que traduzca filas SQL → DTO estable (`profile`, `assignments`, `courseSchedules`, `access`), formatee fechas, concatene etiquetas y normalice valores auxiliares (p. ej. **`normalizeHex`** para colores de UI).

### 3.4 Controlador HTTP

- Extender **`BaseGetController`**: inyectar `useCase`, `logger`, `responseFormatter`, `resourceName`, `dataFieldName` (clave del objeto dentro de `data` en la respuesta HTTP).
- Referencia: `GetTeacherByIdController` → `getTeacherDetailUseCase`, `dataFieldName: 'docente'`.

### 3.5 Router Express

- **`GET /:id`** **después** de `GET /` y de cualquier ruta estática bajo el mismo router, con la misma cadena de permisos que el negocio defina para ver ficha (`DETALLE`).
- Referencia: `docentes.routes.js` (`idValidator` + `validateRequest`).

### 3.6 Contenedor de inyección

- Registrar caso de uso de detalle, controlador `get*ById`, y el router ya montado en `routes/index.js`.
- Referencia: `docentes.container.js`, tokens en `docentes.tokens.js`.

---

## 4. Frontend — pasos

### 4.1 Contrato de dominio e infraestructura

- **`I*Repository`:** método `obtenerPorId(id)`.
- **Caso de uso de dominio:** p. ej. `ObtenerDocentePorIdUseCase` → delega en el repositorio y devuelve `{ success, data }`.
- **Repositorio HTTP:** `GET` a `ENDPOINTS.BY_ID(id)` + `handleSuccessResponse` / `handleErrorResponse`.
- **`endpoints.js`:** ruta por ID alineada al backend.

### 4.2 Capa de aplicación (módulo vertical)

- **Mapper de detalle** (`mapDocenteDetailFromApi`): asegura forma estable del objeto que consumirá la UI (arrays por defecto, objetos anidados seguros).
- **Hook API** con `createApiHook`: `dataType: 'object'`, `dataKey` acorde al backend (`docente`), `useCase: 'obtener*PorId'`, **`fetchName`** explícito (`getDocenteById`), validación mínima del id antes de llamar.
- **Hook de estado** (`useDocenteDetail`): `useEffect` que dispara la carga cuando el id es válido; expone `profile`, colecciones, `breadcrumbItems`, `handleVolver`, `handleEditar`, lectura de `location.state` para `returnListPath`.
- **Contexto** (`DocentesDetailContext`) + **Provider** (`DocentesDetailProvider`) que solo envuelve la página de ficha.
- **Registro en factory** del caso de uso `obtener*PorId` en `*.container.js`.

### 4.3 Presentación — página y layout

- **`PageTemplate`**, **`PageHeader`**, **`Spin`** mientras carga, **`Alert`** si hay error.
- **Cabecera de ficha** (organismo tipo `DocenteProfileSummary`): nombre, iniciales, datos resumidos, acción editar según permisos.
- **`Tabs`** para separar dominios (resumen personal, laboral, académico, horarios, acceso, …) sin mezclar responsabilidades en un solo scroll infinito si el negocio lo pide.
- **Bloques de campos:** `DetailInfoCard` (molécula) + `DetailField` (átomo) con clases `sd-*` / `da-*` definidas en `frontend/src/presentation/styles/pages/detail-page.css`.

### 4.4 Secciones complejas y diseño atómico

- **Organismos:** secciones autocontenidas (`DocenteAssignmentsSection`, `DocenteSchedulesSection`, `DocenteAccessSection`) que reciben props ya mapeadas.
- **Moléculas:** tarjetas repetibles (`DocenteAssignmentCard`).
- **Átomos:** una sola unidad visual o de dato (`DetailField`, `DocenteColorBar`, `DocenteHorarioBloqueRow`).
- **Colores de negocio:** centralizar sanitización de hex (`sanitizeDocenteColorHex`, `docenteCarreraTitleStyles` en `DocenteColorBar.jsx`) para no duplicar regex en cada componente.
- **Tab “Académico” vs “Horarios”:** si una parte crecerá (p. ej. grilla semanal), conviene **tab independiente** para no saturar el tab académico y preparar un futuro átomo de grilla reutilizando `DocenteHorarioBloqueRow` o equivalente.

### 4.5 Listado → detalle

- En columnas / `TableActions`, **`viewPath`** y **`viewNavigateState`** con `returnListPath` (pathname actual del listado) y `menuSidebarKey` para restaurar menú al volver.
- Referencia: `tableColumns.jsx` (`createDocentesTableColumns`), `DocentesList.jsx` (`handleVer`).

### 4.6 Alias y bundler

- Mismo criterio que el listado: alias **`@application-<modulo>`** en `vite.config.js` y `jsconfig.json` para imports del módulo vertical.

---

## 5. Lista de archivos de referencia (módulo docentes — detalle)

### Backend

| Área | Ruta |
|------|------|
| Vistas | `backend/database/03-views/50-vista-base-docente-ficha.sql`, `51-…-asignaciones-curso.sql`, `52-…-bloques-horario.sql` |
| Repositorio | `backend/src/infrastructure/repositories/TeacherRepository.js` (`findDetailBundleByTeacherId`) |
| Caso de uso | `backend/src/application/use-cases/docentes/GetTeacherDetailUseCase.js` |
| Mapper API | `backend/src/application/mappers/docentes/TeacherDetailPresentationMapper.js` |
| Controller | `backend/src/presentation/controllers/docentes/get-by-id.controller.js` |
| Base | `backend/src/presentation/controllers/base/BaseGetController.js` |
| Router | `backend/src/presentation/routes/docentes.routes.js` |
| DI | `backend/src/infrastructure/container/modules/docentes/docentes.container.js` |

### Frontend

| Área | Ruta |
|------|------|
| Dominio | `frontend/src/domain/useCases/docentes/ObtenerDocentePorIdUseCase.js`, `IDocenteRepository.js` |
| Infra | `frontend/src/infrastructure/repositories/DocenteRepository.js` |
| Aplicación | `frontend/src/application/modules/docentes/hooks/state/useDocenteDetail.js`, `hooks/api/useGetDocenteById.js`, `mappers/docenteDetailMapper.js`, `context/DocentesDetailContext.js`, `providers/DocentesDetailProvider.jsx` |
| Presentación | `frontend/src/presentation/modules/docentes/pages/DocentesDetail.jsx`, `connectors/DocentesDetailConnector.jsx`, `components/**`, `styles/pages/detail-page.css` |
| Rutas | `frontend/src/presentation/modules/docentes/routes.jsx` (entrada `/docentes/:id` **después** de `/docentes/:id/editar` si aplica, y siempre después de rutas estáticas como `/listar`) |

---

## 6. Checklist rápido (antes de dar por cerrada la ficha)

- [ ] ¿`GET /:id` responde 404 coherente cuando el id no existe?
- [ ] ¿El mapper backend no expone IDs internos innecesarios y sí etiquetas legibles?
- [ ] ¿Las vistas SQL y el mapper están alineados (nombres de columnas → snake_case en filas → mapper)?
- [ ] ¿La ruta `/…/:id` no intercepta rutas estáticas del mismo prefijo?
- [ ] ¿`accion: 'DETALLE'` en frontend coincide con `verificarPermiso(..., 'DETALLE')` en backend?
- [ ] ¿“Volver” respeta `returnListPath` y opcionalmente `menuSidebarKey`?
- [ ] ¿Componentes pesados del detalle están en **organismos/moléculas** y la página solo orquesta?

---

## 7. Errores frecuentes vistos en integración tipo detalle

1. **Orden de rutas en React Router** — `/:id` definido antes que `/listar` captura “listar” como id.
2. **Columnas nuevas en vistas** no desplegadas en BD → el mapper recibe `undefined` y la UI muestra datos viejos o vacíos.
3. **Permiso `VER` vs `DETALLE`** — en vocabulario v2 la ficha debe usar **`DETALLE`** (ver matriz de permisos).
4. **Olvidar `dataKey` en `createApiHook`** — el objeto anidado no se extrae y el hook deja `data` en `null`.
5. **Mezclar todo en una sola página** — dificulta pruebas y reutilización; extraer secciones a organismos como en docentes.

---

## 8. Próximos pasos naturales (fuera del alcance de “solo ficha”)

- Formularios de edición (`PUT`/`PATCH`), invalidación de caché y `refetch` tras guardar.
- Acciones contextuales en la ficha (asignar, licencias, exportar PDF).
- Vistas de solo lectura adicionales (timeline, auditoría).

---

*Fin del documento 5.*
