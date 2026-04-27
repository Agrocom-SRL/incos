# Documento 4 — Guía intermedia: implementar un listado de módulo
## Patrón de referencia: lista de docentes (INCOS)

**Versión:** 1.0  
**Fecha:** 2026-04-24  

**Checklist compacto (una página):** `docs/04a_checklist_listado_una_pagina.md`  

**Ficha / detalle por ID:** `docs/05_guia_implementacion_detalle_modulo.md` y `docs/05a_checklist_detalle_una_pagina.md`

**Relación con otros documentos**

- `docs/02_estructura_sidebar.md` — keys de menú, `permiso` / `accion` en rutas de presentación.
- `docs/matriz-permisos-sistema.md` — vocabulario v2 de acciones (`LISTAR`, `DETALLE`, `CREAR`, etc.).
- `docs/01_schema_datos.md` — modelo de datos; el modelo Sequelize debe coincidir con las columnas reales.

---

## 1. Objetivo de esta guía

Describir los **pasos ordenados** y los **artefactos** necesarios para incorporar un **listado básico** de un recurso del sistema (API paginada + pantalla con tabla, búsqueda y acciones mínimas), siguiendo la arquitectura ya usada en **admisión de estudiantes**, **becas** y el módulo de referencia **docentes** (`/docentes/listar`).

No sustituye el código: sirve como **checklist** y mapa de archivos para nuevas integraciones similares.

---

## 2. Resultado esperado (definición de “listado listo”)

1. **Backend:** `GET /api/v1/<recurso>` con `authenticate`, `verificarPermiso`, `listValidator`, `validateRequest`, caso de uso de listado y respuesta estándar (`success`, `data`, `pagination` cuando aplica).
2. **Frontend:** ruta de menú que carga un **Connector** (lazy) bajo `Suspense`, página con `PageTemplate` + `PageHeader` + `TableListView`, datos vía **caso de uso** → **repositorio HTTP**, búsqueda en cliente sobre **todos los campos mapeados** (visibles y ocultos) y carga inicial con **`limit` alto** (p. ej. `10000`) para no truncar el universo filtrable en cliente.
3. **Modelo ORM y BD:** los atributos del modelo Sequelize deben existir en la tabla; un desajuste produce errores tipo `Unknown column '…' in 'field list'`.
4. **Permisos:** coherencia entre `routes.jsx` del frontend, seeds de `permisos` / `roles_permisos` y middleware del backend.

---

## 3. Backend — pasos

### 3.1 Repositorio y modelo de datos

- Confirmar el **DDL** del recurso (p. ej. scripts en `backend/database/01-schemas/`).
- Alinear **`backend/src/infrastructure/database/models/<recurso>.js`** con columnas reales (sin campos “fantasma”).
- Si el listado usa **`BaseRepository.findAll`**, revisar **`getSearchFields()`**: lista de **nombres de atributo Sequelize** usados en `LIKE` para el query param `search` (incluir teléfonos, dirección, observaciones, etc., si aplica).

**Referencia:** `TeacherRepository.getSearchFields` y modelo `docente.js` alineado a `06-estructura-academica-parte2.sql`.

### 3.2 Capa de aplicación (listado)

- **Mapper de presentación** (opcional pero recomendado): en `backend/src/application/mappers/<dominio>/` mapear entidad → DTO enriquecido para la API (p. ej. `nombreCompleto`, `ciCompleto`).
- **Caso de uso:** extender **`BaseListUseCase`** (`backend/src/application/use-cases/base/BaseListUseCase.js`) configurando:
  - `repository`, `logger`, `moduleName`, `resourceName`,
  - `collectionFieldName` = nombre de colección que devuelve `findAll` (p. ej. `teachers`),
  - `dataFieldName` = clave en el objeto de respuesta del caso de uso (p. ej. `docentes`),
  - `getMapper()` → clase con `entitiesToPresentation`.

**Referencia:** `ListTeachersUseCase.js`, `TeacherListMapper.js`.

### 3.3 Presentación HTTP

- **Controller:** extender **`BaseListController`**, inyectar `useCase`, `logger`, `responseFormatter`, `resourceName`, `dataFieldName` (el mismo `dataFieldName` que en el caso de uso).

**Referencia:** `backend/src/presentation/controllers/docentes/list.controller.js`.

### 3.4 Router Express

- Crear **`build<Modulo>Router`** en `backend/src/presentation/routes/<modulo>.routes.js`.
- Ruta `GET '/'` con: `authenticate`, `verificarPermiso('<dominio>.<recurso>', 'LISTAR')`, `listValidator`, `validateRequest`, controller.

**Referencia:** `docentes.routes.js`.

### 3.5 Contenedor de inyección

- **Tokens:** `backend/src/infrastructure/container/tokens/<modulo>.tokens.js` y export en `tokens/index.js`.
- **Módulo:** `backend/src/infrastructure/container/modules/<modulo>/` — registrar use case, controller y factory del **router** (con `middlewares.validateRequest` desde `SERVICIOS_TOKENS.validateRequest`).
- **Orquestación:** `register<Modulo>Module` en `backend/src/infrastructure/container/modules/index.js`.
- **Montaje API:** `router.use('/<recurso>', container.resolve(...))` en `backend/src/presentation/routes/index.js` y entrada en el JSON de la ruta raíz `/`.

**Referencia:** `docentes.container.js`, `DOCENTES_TOKENS`, `routes/index.js`.

---

## 4. Frontend — pasos

### 4.1 Contrato de dominio e infraestructura

- **Interfaz:** `frontend/src/domain/repositories/I<Recurso>Repository.js` (extiende `IBaseRepository` si aplica).
- **Caso de uso:** `frontend/src/domain/useCases/<modulo>/ObtenerTodos<Recurso>UseCase.js` — delega en `obtenerTodos({ params })`.
- **Repositorio HTTP:** `frontend/src/infrastructure/repositories/<Recurso>Repository.js` — `apiClient.get` + `handleSuccessResponse`; export default singleton si el resto del proyecto lo usa así.
- **Endpoints:** en `frontend/src/infrastructure/api/endpoints.js`, `createCRUDEndpoints('/<recurso>')` o constantes equivalentes.
- **Export barrel** de repositorios de dominio: `frontend/src/domain/repositories/index.js` y `frontend/src/domain/useCases/index.js`.

**Referencia:** `IDocenteRepository.js`, `ObtenerTodosDocentesUseCase.js`, `DocenteRepository.js`, `DOCENTES_ENDPOINTS`.

### 4.2 Capa de aplicación (módulo vertical)

- **Mapper de lista:** `frontend/src/application/modules/<modulo>/mappers/*ListMapper.js` — normalizar a campos usados por la tabla y por la **búsqueda** (incluir IDs, fechas serializadas, etc.).
- **Hook API:** `createApiHook` en `hooks/api/use<Recurso>Api.js` con:
  - `useCase: 'obtenerTodos<Recurso>'` registrado en el factory,
  - `dataType: 'array'`, `mapper`, `dataKey`,
  - **`autoFetch: true`** y **`autoFetchArgs: [{ params: { page: 1, limit: 10000 } }]`** para traer el conjunto completo que la UI filtra en cliente (mismo criterio que admisión/becas).
- **Contextos:** `*Context.js` para datos globales del módulo y, si aplica, `*ListContext.js` solo para la feature lista.
- **Providers:** provider “raíz” que llama al hook API; **ListProvider** que usa `useTableData` de `@molecules` con una función **`getSearchFields`** que liste **todos** los campos buscables (visibles y no visibles en columnas).
- **Hooks:** `hooks/context/use*Context.js`, `hooks/index.js`.
- **Registro en factory:** `frontend/src/application/container/modules/<modulo>.container.js` y `register<Modulo>Module` en `frontend/src/application/container/modules/index.js`.

**Referencia:** carpeta `frontend/src/application/modules/docentes/`.

### 4.3 Alias y configuración del bundler

- Añadir alias **`@application-<modulo>`** en `frontend/vite.config.js` y paths en `frontend/jsconfig.json` para imports estables.

### 4.4 Presentación

- **Página:** `PageTemplate`, `PageHeader`, `TableListView`; breadcrumb; acciones del header con **`ActionButton`** y permisos reales.
- **Columnas:** archivo dedicado `config/tableColumns.jsx` — usar **`TableCell`**, **`Space`** y variables **`var(--font-size-*)`** como en estudiantes; **`TableActions`** para ver/editar (y eliminar solo si existe API + permiso).
- **Connector:** envuelve providers + página; export **lazy** desde `connectors/index.js`.
- **Rutas del módulo:** `path`, `element`, `key`, `permiso`, `accion`, `menu` / `breadcrumbParent` según `02_estructura_sidebar.md`. Rutas dinámicas **`/:id`** después de las rutas estáticas para no colisionar con segmentos fijos.

**Referencia:** `DocentesList.jsx`, `tableColumns.jsx`, `DocentesListConnector.jsx`, `routes.jsx`.

---

## 5. Lista de archivos de referencia (módulo docentes — listado)

### Backend

| Área | Ruta |
|------|------|
| Caso de uso | `backend/src/application/use-cases/docentes/ListTeachersUseCase.js` |
| Mapper API | `backend/src/application/mappers/docentes/TeacherListMapper.js` |
| Controller | `backend/src/presentation/controllers/docentes/list.controller.js` |
| Router | `backend/src/presentation/routes/docentes.routes.js` |
| DI | `backend/src/infrastructure/container/modules/docentes/docentes.container.js`, `tokens/docentes.tokens.js` |
| Repositorio | `backend/src/infrastructure/repositories/TeacherRepository.js` |
| Modelo | `backend/src/infrastructure/database/models/docente.js` |

### Frontend

| Área | Ruta |
|------|------|
| Dominio | `frontend/src/domain/repositories/IDocenteRepository.js`, `frontend/src/domain/useCases/docentes/*` |
| Infra | `frontend/src/infrastructure/repositories/DocenteRepository.js`, `endpoints.js` |
| Aplicación | `frontend/src/application/modules/docentes/**` |
| Container | `frontend/src/application/container/modules/docentes.container.js` |
| Presentación | `frontend/src/presentation/modules/docentes/pages/DocentesList.jsx`, `config/tableColumns.jsx`, `connectors/*`, `routes.jsx` |

---

## 6. Checklist rápido (antes de dar por cerrado el listado)

- [ ] ¿El `GET` lista sin error con muchos registros y `limit` máximo permitido por validator?
- [ ] ¿`search` en backend cubre los campos que el negocio espera?
- [ ] ¿El mapper del frontend incluye todos los campos que debe usar el buscador?
- [ ] ¿Los permisos del middleware coinciden con `routes.jsx` y con la matriz/seed?
- [ ] ¿Las rutas dinámicas no “secuestran” rutas estáticas (`/registrar`, `/listar`, etc.)?
- [ ] ¿`TableActions` solo muestra eliminar si hay `deleteFn` o use case real?
- [ ] ¿Conector exportado como `lazy` y envuelto por `Suspense` en el layout (patrón actual del proyecto)?

---

## 7. Errores frecuentes vistos en integración tipo listado

1. **Columnas del modelo Sequelize que no existen en MySQL** — error 500 en listado; revisar DDL vs `define()`.
2. **Límite por defecto del API (50)** — la UI muestra “pocos” registros; para búsqueda global en cliente subir `limit` en la petición inicial (hasta el máximo validado en `listValidator`).
3. **`getSearchFields` del repositorio** con nombres incorrectos (deben ser atributos del modelo, no nombres SQL con guiones bajos).
4. **Permisos:** usar `DETALLE` para “ver ficha” en v2, no `VER` (ver `matriz-permisos-sistema.md` y comentarios en `TableActions.jsx`).

---

## 8. Próximos pasos naturales (fuera del alcance de “solo listado”)

- Detalle por `id` (`GET /:id`), formulario de alta/edición, eliminación lógica, exportaciones.
- Enriquecer filas con **JOINs** o vistas (nombres de municipio, estado civil, etc.) y extender mappers + búsqueda.
- Paginación **solo en servidor** si el volumen de datos supera el límite razonable para cliente.

---

*Fin del documento 4.*
