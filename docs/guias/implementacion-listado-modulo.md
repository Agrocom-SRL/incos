# Guía — Implementar listado de módulo

Patrones de referencia: docentes (ABM) · CFG académico (tabs) · institucional

**Versión:** 1.2  
**Fecha:** 2026-05-27  

**Checklist:** `docs/guias/checklist-listado.md`  

**Detalle / ficha:** `docs/guias/implementacion-detalle-modulo.md` y `docs/guias/checklist-detalle.md`

**Arquitectura frontend (menú, hooks):** `.cursor/rules/incos-frontend-module.mdc`  

**Arquitectura backend (capas, DI, RBAC, respuestas API):** `.cursor/rules/incos-backend-module.mdc` — **obligatoria** para cualquier listado nuevo; esta guía detalla el paso a paso integrado frontend + backend.

**Relación con otros documentos**

- `docs/02_estructura_sidebar.md` — keys de menú, `permiso` / `accion` en rutas de presentación.
- `docs/referencia/matriz-permisos-sistema.md` — vocabulario v2 de acciones (`LISTAR`, `DETALLE`, `CREAR`, etc.).
- `docs/plan/SPRINT_1.md` — catálogo plan de estudio (CFG académico), solo mientras aplique Plan V2.

---

## 1. Objetivo de esta guía

Describir los **pasos ordenados** y los **artefactos** necesarios para incorporar un **listado básico** de un recurso del sistema (API paginada + pantalla con tabla, búsqueda y acciones mínimas).

No sustituye el código: sirve como **checklist** y mapa de archivos para nuevas integraciones similares.

### 1.1 Elegir patrón de referencia

| Caso | Referencia principal | Listado en |
|------|---------------------|------------|
| Pantalla dedicada `/modulo/listar` | **Docentes** | `pages/*List.jsx` + provider + `hooks/features` o list context |
| Tab dentro de menú con varios permisos | **CFG → Académico** | `hooks/features/use*List.js` + tab panel (`CarrerasList.jsx`) |
| Listado embebido en wizard/flujo | **Inscripciones** | `hooks/features/` + estado del wizard |
| Tabla en flujo institucional multi-paso | **INST → Horarios** | `hooks/state/` + datos de `hooks/api/` |

Regla de carpetas: **un directorio por ítem de menú**, no por entidad; ver `incos-frontend-module`.

---

## 2. Resultado esperado (definición de “listado listo”)

1. **Backend:** `GET /api/v1/<recurso>` con `authenticate`, `verificarPermiso`, `listValidator`, `validateRequest`, caso de uso de listado y respuesta estándar (`success`, `data`, `pagination` cuando aplica).
2. **Frontend:** ruta de menú que carga un **Connector** (lazy) bajo `Suspense`, página con `PageTemplate` + `PageHeader` + `TableListView`, datos vía **caso de uso** → **repositorio HTTP**, búsqueda en cliente sobre **todos los campos mapeados** (visibles y ocultos) y carga inicial con **`limit` alto** (p. ej. `10000`) para no truncar el universo filtrable en cliente.
3. **Modelo ORM y BD:** los atributos del modelo Sequelize deben existir en la tabla; un desajuste produce errores tipo `Unknown column '…' in 'field list'`.
4. **Permisos:** coherencia entre `routes.jsx` del frontend, seeds de `permisos` / `roles_permisos` y middleware del backend.

---

## 3. Backend — proceso completo

Visión de capas y checklist de archivos: **`.cursor/rules/incos-backend-module.mdc`**.

### 3.0 Flujo resumido

```
GET /api/v1/<recurso>?pagina&limite&busqueda
  → routes (auth + verificarPermiso LISTAR + listValidator)
  → List*Controller (BaseListController)
  → List*UseCase (BaseListUseCase)
  → *Repository.findAll → Sequelize model → MySQL
  → *Mapper.entitiesToPresentation
  → { success, data: { <dataFieldName>: [...] }, pagination }
```

### 3.1 Datos: DDL, modelo y repositorio

| Paso | Acción |
|------|--------|
| 1 | Confirmar **DDL** en `backend/database/01-schemas/`. |
| 2 | Modelo **`infrastructure/database/models/<entidad>.js`** — solo columnas existentes (`activo`, `deleted_at` si aplica). |
| 3 | Interfaz **`domain/interfaces/repositories/I*Repository.js`** (contrato dominio). |
| 4 | **`infrastructure/repositories/*Repository.js`** extends `BaseRepository`: |
| | — `getCollectionName()` → inglés plural (`careers`, `teachers`) |
| | — `getSearchFields()` → atributos Sequelize para `busqueda` / `search` |
| | — `findAll({ pagina, limite, busqueda, filtros, incluirInactivos })` |
| 5 | Registrar repositorio en **`repositories.container.js`** (`REPOSITORIOS_TOKENS.*`). |

**Referencias:** `CareerRepository.js` + `carrera.js` (CFG); `TeacherRepository.js` + `docente.js` (docentes).

### 3.2 Capa de aplicación

| Paso | Acción |
|------|--------|
| 1 | **Mapper de presentación** en `application/mappers/<dominio>/` — método `entitiesToPresentation` / `entityToPresentation` (DTO para JSON: etiquetas, fechas ISO, campos compuestos). |
| 2 | **`List*UseCase`** extends `BaseListUseCase` (`application/use-cases/base/BaseListUseCase.js`): |
| | — `repository`, `logger`, `moduleName`, `resourceName` |
| | — `collectionFieldName` (inglés, salida del repo) |
| | — `dataFieldName` (español, clave en `data` de la API — **debe coincidir con frontend `dataKey`**) |
| | — `getMapper()` → clase mapper |

**Referencias:** `ListTeachersUseCase.js` + `TeacherListMapper.js`; `ListCarrerasUseCase.js` + `CareerMapper.js`.

### 3.3 Capa de presentación HTTP

| Paso | Acción |
|------|--------|
| 1 | **`List*Controller`** extends `BaseListController` — mismos `resourceName` y `dataFieldName` que el use case. |
| 2 | Ubicación: `presentation/controllers/<dominio>/<recurso>/list.controller.js` o agrupado en `configuracion/carreras/`. |
| 3 | **`build*Router`** en `presentation/routes/<recurso>.routes.js` — función factory que recibe `{ controllers, middlewares }`. |
| 4 | Cadena `GET '/'`: `authenticate` → `verificarPermiso('<codigo>', 'LISTAR')` → `listValidator` → `validateRequest` → `controller.handle`. |
| 5 | Validators de escritura (create/update) en `presentation/validators/<dominio>/` — el listado usa `listValidator` común. |

**Referencias:** `list.controller.js` (docentes); `carreras.routes.js` + `carreras.validator.js` (CFG).

### 3.4 Inyección de dependencias y montaje API

| Paso | Acción |
|------|--------|
| 1 | Tokens en `infrastructure/container/tokens/<modulo>.tokens.js` (use cases, controllers, router). |
| 2 | **`register*Resource(container)`** en `container/modules/<modulo>/<recurso>.container.js`: registra use cases → controllers → `build*Router`. |
| 3 | **`register*Module`** en `container/modules/<modulo>/index.js` compone todos los recursos del dominio (ej. `registerConfiguracionModule` llama carreras + materias + planes). |
| 4 | Invocar `register*Module` desde `container/modules/index.js` global. |
| 5 | **`presentation/routes/index.js`:** `router.use('/carreras', container.resolve(CONFIGURACION_TOKENS.carrerasRouter))`. |
| 6 | Documentar la ruta en el handler `GET /` raíz del API (lista de módulos disponibles). |

**Referencias:** `docentes.container.js`; `configuracion/carreras.container.js` + `configuracion/index.js`.

### 3.5 Permisos y seeders (backend)

| Paso | Acción |
|------|--------|
| 1 | Insertar permiso en **`54-seed-permisos.sql`** (`codigo`, `dominio`, `modulo`, `grupo_ui`, `ruta_sidebar`). |
| 2 | Acciones en **`56-seed-permiso-acciones.sql`** — al menos `LISTAR` para listado. |
| 3 | Filas en **`55-seed-roles-permisos.sql`** para roles operativos (RECTOR, DIR_ACADEMICO, …). |
| 4 | El string en `verificarPermiso('...', 'LISTAR')` debe ser **idéntico** a `permisos.codigo`. |
| 5 | Actualizar **`docs/referencia/matriz-permisos-sistema.md`** (tabla pantalla ↔ permiso ↔ endpoint). |

Ejemplo CFG carreras: `verificarPermiso('configuracion.carrera', 'LISTAR')` — permiso id **78**.

### 3.6 Contrato de respuesta y query params

**Query (listValidator):** `pagina`, `limite`, `busqueda` (y `filtros` / `incluirInactivos` según repositorio).

**Respuesta exitosa:**

```json
{
  "success": true,
  "data": { "docentes": [ /* o "carreras" */ ] },
  "pagination": { "page": 1, "limit": 50, "total": 100, "totalPages": 2 }
}
```

**Errores:** 401 sin token; 403 sin permiso; 422 validación; 500 si modelo/DDL desalineados.

### 3.7 Variante: varios recursos, un menú frontend (CFG)

El menú **Académico** es uno; el backend expone **varios routers**:

| Recurso API | Permiso listado | Container |
|-------------|-----------------|-----------|
| `/api/v1/carreras` | `configuracion.carrera` | `carreras.container.js` |
| `/api/v1/materias` | `configuracion.materia` | `materias.container.js` |
| `/api/v1/planes-estudios` | `configuracion.plan-estudio` | `planes-estudios.container.js` |

Cada uno repite §3.1–3.6 de forma independiente; el frontend unifica en `application/.../academico/hooks/api/`.

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

Organización de hooks (obligatoria en módulos nuevos — `incos-frontend-module`):

| Carpeta | Archivo típico | Rol |
|---------|----------------|-----|
| `hooks/api/` | `useCarrerasApi.js` | `createApiHook`, fetch, mapper |
| `hooks/features/` | `useCarrerasList.js` | api + `useTableData` + búsqueda del tab/listado |
| `hooks/context/` | `useCarreraContext.js` | consumidor del Provider |
| `hooks/state/` | `useDocenteDetail.js` | solo si el listado es parte de una **pantalla** con más lógica |

- **Mapper de lista:** `mappers/*ListMapper.js` — campos de tabla y **búsqueda** (visibles y ocultos).
- **Hook API:** `hooks/api/use<Recurso>Api.js` con `autoFetch: true`, `autoFetchArgs: [{ params: { page: 1, limit: 10000 } }]`.
- **Provider:** `providers/*Provider.jsx` llama `use*List()` del feature y publica contexto (ej. `CarreraProvider` en CFG académico).
- **Barrel:** `hooks/index.js` reexporta por tipo (como inscripciones).
- **Catálogos compartidos:** `application/modules/shared/hooks/use*CatalogApi.js` importan mappers del módulo dueño (ej. carreras desde `@application-configuracion/academico/mappers`).
- **Registro factory:** `application/container/modules/<modulo>.container.js`.

**Referencias:**

- ABM pantalla completa: `frontend/src/application/modules/docentes/`
- Tab en menú: `frontend/src/application/modules/configuracion/academico/hooks/`
- Complementarios (tab): `frontend/src/application/modules/configuracion/complementarios/hooks/`

### 4.2.1 Regla de arquitectura limpia (obligatoria en ABM)

- `presentation/modules/<menu>/pages/*` = solo UI.
- `application/modules/<menu>/hooks/features/` = listados en tabs o tablas embebidas.
- `application/modules/<menu>/hooks/state/` = orquestación de **pantalla** (no por entidad suelta).
- `providers/` + `context/` + `connectors/` como en `incos-frontend-module`.

No crear `hooks/carreras/` ni `presentation/.../carreras/routes.jsx` si carreras es solo un tab de `/configuracion/academico`.

### 4.3 Alias y configuración del bundler

- Añadir alias por **dominio de menú** (ej. `@application-configuracion`, `@configuracion`) en `vite.config.js` y `jsconfig.json`.
- Subrutas de import: `@application-configuracion/academico/hooks`, `@configuracion/academico/pages/...`.

### 4.4 Presentación

- **Página:** `PageTemplate`, `PageHeader`, `TableListView`; breadcrumb; acciones del header con **`ActionButton`** y permisos reales.
- **Columnas:** archivo dedicado `config/tableColumns.jsx` — usar **`TableCell`**, **`Space`** y variables **`var(--font-size-*)`** como en estudiantes; **`TableActions`** para ver/editar (y eliminar solo si existe API + permiso).
- **Connector:** envuelve providers + página; export **lazy** desde `connectors/index.js`.
- **Rutas del módulo:** `path`, `element`, `key`, `permiso`, `accion`, `menu` / `breadcrumbParent` según `02_estructura_sidebar.md`. Rutas dinámicas **`/:id`** después de las rutas estáticas para no colisionar con segmentos fijos.

**Referencia:** `DocentesList.jsx`, `tableColumns.jsx`, `DocentesListConnector.jsx`, `routes.jsx`.

### 4.5 Seguridad y permisos (restricción transversal)

Cada nueva función de listado/acciones debe validar permisos en 3 capas al mismo tiempo:

1. **Ruta frontend** (`routes.jsx`): `permiso` + `accion` correctos.
2. **Controles UI** (`ActionButton`, `TableActions`, `PermisoGuard`, `useAcciones`): misma acción que en ruta.
3. **Backend** (`verificarPermiso`): misma acción en endpoint real.

No mezclar vocabulario antiguo (`VER`) con el esquema operativo del módulo cuando use `LISTAR` / `DETALLE` en frontend.
Si existe divergencia temporal por legado, documentarla explícitamente en `docs/referencia/matriz-permisos-sistema.md` antes del merge.

---

## 5. Listas de archivos de referencia

### 5.1 Docentes — listado `/docentes/listar`

#### Backend

| Área | Ruta |
|------|------|
| DDL / modelo | `database/01-schemas/` (docentes), `models/docente.js` |
| Repositorio | `infrastructure/repositories/TeacherRepository.js` |
| Interfaz | `domain/interfaces/repositories/ITeacherRepository.js` |
| Mapper API | `application/mappers/docentes/TeacherListMapper.js` |
| Caso de uso | `application/use-cases/docentes/ListTeachersUseCase.js` |
| Controller | `presentation/controllers/docentes/list.controller.js` |
| Router | `presentation/routes/docentes.routes.js` |
| Validators | `presentation/validators/docentes/` + `common/listValidator` |
| DI | `container/modules/docentes/docentes.container.js`, `tokens/docentes.tokens.js` |
| Montaje | `presentation/routes/index.js` → `/api/v1/docentes` |
| Permiso | `docentes.ver` + `LISTAR` (seed 45) |

#### Frontend

| Área | Ruta |
|------|------|
| Dominio | `domain/repositories/IDocenteRepository.js`, `useCases/docentes/ObtenerTodosDocentesUseCase.js` |
| Infra HTTP | `infrastructure/repositories/DocenteRepository.js`, `api/endpoints.js` |
| Application | `application/modules/docentes/hooks/` (api + list/state) |
| Container app | `application/container/modules/docentes.container.js` |
| UI | `presentation/modules/docentes/pages/DocentesList.jsx`, `config/tableColumns.jsx`, connectors, `routes.jsx` |

### 5.2 CFG — Carreras (tab `?tab=carreras`)

#### Backend

| Área | Ruta |
|------|------|
| Modelo | `infrastructure/database/models/carrera.js` |
| Repositorio | `infrastructure/repositories/CareerRepository.js` |
| Mapper API | `application/mappers/configuracion/CareerMapper.js` |
| Caso de uso | `application/use-cases/configuracion/ListCarrerasUseCase.js` |
| Controller | `presentation/controllers/configuracion/carreras/list.controller.js` |
| Router | `presentation/routes/carreras.routes.js` |
| Validators | `presentation/validators/configuracion/carreras.validator.js` |
| DI | `container/modules/configuracion/carreras.container.js` |
| Módulo | `container/modules/configuracion/index.js` → `registerConfiguracionModule` |
| Permiso | `configuracion.carrera` + `LISTAR` (id 78) |

#### Frontend

| Área | Ruta |
|------|------|
| Hook API | `application/.../academico/hooks/api/useCarrerasApi.js` |
| Hook feature | `application/.../academico/hooks/features/useCarrerasList.js` |
| Provider | `application/.../academico/providers/CarreraProvider.jsx` |
| UI tab | `presentation/.../academico/pages/CarrerasList.jsx` |
| Columnas | `presentation/.../academico/config/carrerasTableColumns.jsx` |
| Menú | `AcademicoConnector.jsx`, `routes.jsx` (`permisoAny`) |

### 5.3 CFG — Materias (tab `?tab=materias`)

Backend: `ListMateriasUseCase.js`, `materias.routes.js`, `materias.container.js`, permiso **`configuracion.materia`** (79).  
Frontend: `useMateriasApi.js`, `useMateriasList.js`, `MateriaProvider.jsx`, `MateriasList.jsx` — misma estructura que §5.2.

### 5.4 CFG — Planes (tab `?tab=planes`)

Backend: `ListPlanesEstudiosUseCase.js`, `planes-estudios.routes.js`, permiso **`configuracion.plan-estudio`** (80).  
Frontend: `usePlanesEstudiosApi.js`, `PlanesTabPanel.jsx`; detalle en guía **05** (`/plan/:planId`).

### 5.5 CFG Complementarios — tab discapacidad

Backend: router `/api/v1/discapacidad` (o recurso equivalente), permiso **`configuracion.complementario.discapacidad`** (88).  
Frontend: `application/.../complementarios/hooks/` + `DiscapacidadesList.jsx`.

---

## 6. Checklist rápido (antes de dar por cerrado el listado)

### Backend

- [ ] ¿DDL = modelo Sequelize = columnas en `findAll`?
- [ ] ¿`getSearchFields()` usa nombres de atributo del modelo?
- [ ] ¿`List*UseCase` + `List*Controller` comparten `dataFieldName`?
- [ ] ¿Router con `authenticate` + `verificarPermiso` + `listValidator`?
- [ ] ¿Container + token + montaje en `routes/index.js`?
- [ ] ¿Seeds 54/56/55 + matriz actualizados?
- [ ] ¿`GET` lista con `limite` alto sin 500?

### Frontend

- [ ] ¿El `GET` lista sin error con muchos registros y `limit` máximo permitido por validator?
- [ ] ¿`search` / búsqueda en cliente cubre todos los campos del mapper?
- [ ] ¿El mapper del frontend incluye todos los campos que debe usar el buscador?
- [ ] ¿Los permisos del middleware coinciden con `routes.jsx` y con la matriz/seed?
- [ ] ¿Las rutas dinámicas no “secuestran” rutas estáticas (`/registrar`, `/listar`, etc.)?
- [ ] ¿`TableActions` solo muestra eliminar si hay `deleteFn` o use case real?
- [ ] ¿Conector exportado como `lazy` y envuelto por `Suspense` en el layout (patrón actual del proyecto)?
- [ ] ¿La página quedó liviana (UI) y la lógica de listado está en `hooks/features` (o `state` si es pantalla completa)?
- [ ] ¿La estructura respeta `incos-frontend-module` (sin subcarpetas por entidad sin URL propia)?
- [ ] ¿La acción de permiso coincide en `routes.jsx`, controles UI y `verificarPermiso` backend?

---

## 7. Errores frecuentes

### Backend

1. **Columnas del modelo Sequelize que no existen en MySQL** — 500 en listado; revisar DDL vs `define()`.
2. **`dataFieldName` distinto** entre use case, controller y `dataKey` del frontend — tabla vacía con 200 OK.
3. **`getSearchFields`** con nombres SQL en lugar de atributos Sequelize.
4. **Permiso del router ≠ seed 54** — 403 con rol que sí ve el menú.
5. **Router no registrado** en container o `routes/index.js` — 404.

### Frontend

1. **Límite por defecto del API (50)** — subir `limit` en petición inicial (hasta máximo del `listValidator`).
2. **Permisos:** `DETALLE` para ficha, no `VER` (v2).
3. **Mapper frontend** sin campos usados por el buscador del tab.

---

## 8. Próximos pasos naturales (fuera del alcance de “solo listado”)

- Detalle por `id` (`GET /:id`), formulario de alta/edición, eliminación lógica, exportaciones.
- Enriquecer filas con **JOINs** o vistas (nombres de municipio, estado civil, etc.) y extender mappers + búsqueda.
- Paginación **solo en servidor** si el volumen de datos supera el límite razonable para cliente.

---

*Fin de la guía — listado.*
