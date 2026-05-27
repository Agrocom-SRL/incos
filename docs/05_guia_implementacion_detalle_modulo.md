# Documento 5 — Guía intermedia: implementar el detalle (ficha) de un registro
## Patrones de referencia: docente (ficha) · plan de estudio (pantalla transaccional)

**Versión:** 1.2  
**Fecha:** 2026-05-27  

**Checklist compacto (una página):** `docs/05a_checklist_detalle_una_pagina.md`  

**Complementa:** `docs/04_guia_implementacion_listado_modulo.md` (listado o tab enlaza al detalle).

**Arquitectura frontend:** `docs/06_arquitectura_modulos_frontend.md`  

**Arquitectura backend (detalle, bundle, DI, RBAC):** `docs/07_arquitectura_modulos_backend.md` — **obligatoria** junto con esta guía.

**Relación con otros documentos**

- `docs/02_estructura_sidebar.md` — keys de menú, `permiso` / `accion` en rutas de presentación.
- `docs/matriz-permisos-sistema.md` — acción **`DETALLE`** para ver ficha (`GET /:id`), coherente con `TableActions` y middleware.
- `docs/01_schema_datos.md` — modelo de datos; las **vistas SQL** de detalle deben reflejar columnas reales y joins necesarios.
- `docs/SPRINT_1.md` — detalle de plan `/configuracion/academico/plan/:planId` (matriz + prerrequisitos).

---

## 1. Objetivo de esta guía

Describir los **pasos ordenados** y los **artefactos** para incorporar la **vista de detalle** de un recurso: una petición **`GET /api/v1/<recurso>/:id`**, respuesta enriquecida (perfil + colecciones relacionadas si aplica) y una **pantalla de ficha** con cabecera, pestañas o secciones, componentes reutilizables y estilos en `detail-page.css`.

Patrones de referencia:

| Caso | Ruta | Referencia |
|------|------|------------|
| Ficha de entidad | `/docentes/:id` | `DocentesDetail`, `hooks/state/useDocenteDetail`, vistas SQL 50–52 |
| Pantalla transaccional (no ficha simple) | `/configuracion/academico/plan/:planId` | `PlanDetallePage`, `PlanDetalleConnector`, permiso `configuracion.plan-estudio` + `DETALLE` |
| Flujo institucional | `/institucional/horarios/...` | `hooks/state/useGestionHorarios*State` |

---

## 2. Resultado esperado (definición de “detalle listo”)

1. **Backend:** `GET /:id` con `authenticate`, `verificarPermiso('<dominio>.<recurso>', 'DETALLE')`, **`idValidator`** (o equivalente), `validateRequest`, caso de uso que devuelve un **objeto** (no lista), `NotFoundError` si no existe, respuesta estándar (`success`, `data.<nombreCampo>`).
2. **Frontend:** ruta dinámica **`/:id`** declarada **después** de rutas estáticas del mismo prefijo (`/listar`, `/registrar`, …); **Connector** lazy; **Provider** de detalle que obtiene datos por ID; **página** con `PageTemplate`, `PageHeader`, `Spin` / `Alert`, cabecera de ficha y cuerpo (tabs u organización por secciones).
3. **Datos:** si la ficha agrega listas (asignaciones, horarios, etc.), el backend puede armar un **bundle** en el repositorio (varias consultas o vistas) y un **mapper de presentación** que exponga DTOs legibles (`profile`, `assignments`, …).
4. **Permisos:** coherencia entre `routes.jsx` (`accion: 'DETALLE'`), seeds y middleware del `GET /:id`.
5. **Navegación desde el listado:** pasar en `state` lo necesario para volver (p. ej. `returnListPath`, `menuSidebarKey`) y usarlo en la ficha al pulsar “Volver”.

---

## 3. Backend — proceso completo

Visión de capas: **`docs/07_arquitectura_modulos_backend.md`** §4 y §8.

### 3.0 Flujo resumido

```
GET /api/v1/<recurso>/:id
  → routes (auth + verificarPermiso DETALLE + idValidator)
  → Get*ByIdController (BaseGetController)
  → Get*ByIdUseCase.execute(id)
  → Repository.findById | findDetailBundleBy*Id
  → (opcional) vistas SQL 03-views
  → Detail*Mapper → { success, data: { <dataFieldName>: { ... } } }
```

Si no existe registro principal → **`NotFoundError`** → 404 coherente.

### 3.1 Lectura: vistas SQL vs modelo directo

| Enfoque | Cuándo | Acción |
|---------|--------|--------|
| **Vistas SQL** | Ficha con muchos joins (docente + asignaciones + horarios) | Scripts en `database/03-views/`; recrear vistas en BD tras cada cambio |
| **Modelo + repo** | Entidad simple o DTO armado en código | `findById` en `*Repository` sobre Sequelize |
| **Híbrido** | Plan de estudio + matriz | `GetPlanEstudiosByIdUseCase` + endpoints `/matriz`, `/validar` |

**Docente:** `50-vista-base-docente-ficha.sql`, `51-…-asignaciones-curso.sql`, `52-…-bloques-horario.sql`.

### 3.2 Repositorio

- Método dedicado: `findDetailBundleByTeacherId(id)` o `findById(id)`.
- Devuelve entidad de dominio o filas crudas para el mapper de aplicación.
- No exponer lógica de presentación (formato fechas, labels) en el repositorio.

**Referencias:** `TeacherRepository.findDetailBundleByTeacherId`; `CareerRepository` / plan repository para CFG.

### 3.3 Caso de uso y mapper de presentación

| Paso | Acción |
|------|--------|
| 1 | **`Get*ByIdUseCase`** — `execute(id)` llama al repositorio. |
| 2 | Si resultado principal es `null` → **`NotFoundError`** (`resourceName` legible). |
| 3 | **`Detail*PresentationMapper`** — DTO estable: `profile`, colecciones hijas, campos calculados, `normalizeHex` para colores. |
| 4 | `dataFieldName` acordado (`docente`, `plan`, `carrera`) — igual en controller y frontend `dataKey`. |

**Referencias:** `GetTeacherDetailUseCase` + `TeacherDetailPresentationMapper.js`; `GetCarreraByIdUseCase` + `CareerMapper`; `GetPlanEstudiosByIdUseCase` + `StudyPlanMapper`.

### 3.4 Controlador y router HTTP

| Paso | Acción |
|------|--------|
| 1 | **`Get*ByIdController`** extends `BaseGetController` — inyecta use case, `responseFormatter`, `dataFieldName`. |
| 2 | Router: **`GET /:id`** después de `GET /` y rutas fijas (`/matriz`, `/validar`, `/marcar-vigente`). |
| 3 | Cadena: `authenticate` → `verificarPermiso(codigo, 'DETALLE')` → `idValidator` → `validateRequest` → controller. |

**Referencias:** `get-by-id.controller.js` (docentes, carreras); `planes-estudios/get-by-id.controller.js`, `matriz.controller.js`, `validar.controller.js`.

### 3.5 Inyección de dependencias

- Registrar `get*ByIdUseCase` y `get*ByIdController` en el mismo `*.container.js` del recurso.
- El router del recurso ya debe estar registrado (mismo patrón que listado — doc **07** §5).
- Tokens: `CONFIGURACION_TOKENS.getCarreraByIdUseCase`, etc.

### 3.6 Permisos y endpoints especializados (CFG plan)

| Endpoint | Permiso | Acción |
|----------|---------|--------|
| `GET /planes-estudios/:id` | `configuracion.plan-estudio` | DETALLE |
| `GET /planes-estudios/:id/matriz` | `configuracion.plan-estudio` | DETALLE o LISTAR (según router) |
| `GET /planes-estudios/:id/validar` | `configuracion.plan-estudio` | LISTAR |
| Mutaciones periodos/asignaturas/prerrequisitos | `configuracion.plan-estudio.periodos` / `.asignaturas` / `.prerrequisitos` | CREAR, EDITAR, ELIMINAR |

Documentar cada uno en **matriz** y en `SPRINT_1.md` §4.

### 3.7 Contrato de respuesta detalle

```json
{
  "success": true,
  "data": {
    "docente": {
      "profile": { },
      "assignments": [ ],
      "courseSchedules": [ ]
    }
  }
}
```

**404:** id inexistente o soft-deleted según reglas del repositorio.  
**403:** permiso `DETALLE` no asignado al rol.

---

## 4. Frontend — pasos

### 4.1 Contrato de dominio e infraestructura

- **`I*Repository`:** método `obtenerPorId(id)`.
- **Caso de uso de dominio:** p. ej. `ObtenerDocentePorIdUseCase` → delega en el repositorio y devuelve `{ success, data }`.
- **Repositorio HTTP:** `GET` a `ENDPOINTS.BY_ID(id)` + `handleSuccessResponse` / `handleErrorResponse`.
- **`endpoints.js`:** ruta por ID alineada al backend.

### 4.2 Capa de aplicación (módulo vertical)

- **Mapper de detalle** en `mappers/` (forma estable para UI).
- **Hook API** en `hooks/api/` (`dataType: 'object'`, `dataKey`, `fetchName`, validación de id).
- **Hook de estado** en `hooks/state/use*Detail.js` o `use*PlanDetalle.js` para pantallas con `useParams`, breadcrumbs, `returnListPath`, tabs internos.
- **Context + Provider** delgados; **Connector** en presentation recibe `id` de `useParams` si aplica.
- Detalle que cuelga de un **menú con tabs**: subruta propia (`/plan/:planId`), no un cuarto tab de prerrequisitos.

**CFG plan de estudio:** orquestación en `hooks/state/` (cuando se extraiga de `PlanDetallePage`); APIs de matriz/validar en `hooks/api/usePlanesEstudiosApi.js`.

### 4.2.1 Regla de arquitectura limpia (obligatoria en ABM)

Ver doc **06**: `hooks/state/` por **pantalla**, no por entidad suelta; carpeta bajo el **ítem de menú** (`academico/`, no `academico/plan-estudio/hooks/` salvo que plan tenga menú propio en sidebar).

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

### 4.6 Detalle → gestión → wizard (trazabilidad de retorno)

Cuando una ficha abre pantallas intermedias (gestión/asignación wizard), propagar dos rutas:

- `returnListPath`: retorno funcional inmediato (p. ej. volver del wizard a gestión).
- `gestionReturnPath` (o equivalente): retorno de origen (p. ej. detalle vs listado).

Así el botón `Volver` siempre respeta el punto de entrada real y evita perder contexto de navegación.

### 4.7 Alias y bundler

- Mismo criterio que el listado: alias **`@application-<modulo>`** en `vite.config.js` y `jsconfig.json` para imports del módulo vertical.

---

## 5. Listas de archivos de referencia

### 5.1 Docentes — ficha `/docentes/:id`

#### Backend

| Área | Ruta |
|------|------|
| Vistas | `database/03-views/50-…`, `51-…`, `52-…` |
| Repositorio | `TeacherRepository.findDetailBundleByTeacherId` |
| Caso de uso | `GetTeacherDetailUseCase.js` |
| Mapper | `TeacherDetailPresentationMapper.js` |
| Controller | `presentation/controllers/docentes/get-by-id.controller.js` |
| Router | `docentes.routes.js` — `GET /:id` + `DETALLE` |
| DI | `docentes.container.js`, `DOCENTES_TOKENS` |
| Permiso | `docentes.ver` + `DETALLE` |

#### Frontend

| Área | Ruta |
|------|------|
| Dominio | `ObtenerDocentePorIdUseCase.js`, `DocenteRepository.js` |
| Application | `hooks/api/useGetDocenteById.js`, `hooks/state/useDocenteDetail.js`, mappers, providers |
| UI | `DocentesDetail.jsx`, `DocentesDetailConnector.jsx`, `routes.jsx` |

### 5.2 CFG — Carrera (detalle en drawer o futura ficha)

| Área | Ruta |
|------|------|
| Use case | `GetCarreraByIdUseCase.js` |
| Controller | `configuracion/carreras/get-by-id.controller.js` |
| Router | `carreras.routes.js` — `GET /:id` |
| Permiso | `configuracion.carrera` + `DETALLE` |

### 5.3 CFG — Plan de estudio `/configuracion/academico/plan/:planId`

#### Backend

| Área | Ruta |
|------|------|
| Use cases | `GetPlanEstudiosByIdUseCase.js`, `GetPlanEstudiosMatrizUseCase.js`, `ValidarPlanEstudiosUseCase.js` |
| Mappers | `StudyPlanMapper.js`, `PeriodMapper.js`, … |
| Controllers | `planes-estudios/get-by-id.controller.js`, `matriz.controller.js`, `validar.controller.js` |
| Sub-recursos | `periodos.controllers.js`, `asignaturas.controllers.js`, `prerrequisitos.controllers.js` |
| Router | `presentation/routes/planes-estudios.routes.js` (orden: list → estáticos → `/:id`) |
| DI | `planes-estudios.container.js` |
| Permisos | `configuracion.plan-estudio` (80), `.periodos` (81), `.asignaturas` (82), `.prerrequisitos` (83) |

#### Frontend

| Área | Ruta |
|------|------|
| Rutas | `academico/routes.jsx` — `plan/:planId` **antes** de `ACADEMICO_BASE` |
| Conector | `PlanDetalleConnector.jsx` |
| Página | `PlanDetallePage.jsx` |
| API | `hooks/api/usePlanesEstudiosApi.js` |
| Permiso ruta | `configuracion.plan-estudio` + `DETALLE` |
| Volver | `returnListPath` → `/configuracion/academico?tab=planes` |

---

## 6. Checklist rápido (antes de dar por cerrada la ficha)

### Backend

- [ ] ¿Vistas SQL desplegadas (si aplica) y mapper alineado a columnas?
- [ ] ¿`Get*UseCase` lanza `NotFoundError` cuando corresponde?
- [ ] ¿`GET /:id` con `DETALLE` y orden de rutas correcto?
- [ ] ¿`dataFieldName` igual en use case, controller y frontend?
- [ ] ¿Container registra use case + controller de detalle?
- [ ] ¿Endpoints hijos (`/matriz`, prerrequisitos) con permiso propio en router?

### Frontend

- [ ] ¿`GET /:id` responde 404 coherente cuando el id no existe?
- [ ] ¿El mapper backend no expone IDs internos innecesarios y sí etiquetas legibles?
- [ ] ¿Las vistas SQL y el mapper están alineados (nombres de columnas → snake_case en filas → mapper)?
- [ ] ¿La ruta `/…/:id` no intercepta rutas estáticas del mismo prefijo?
- [ ] ¿`accion: 'DETALLE'` en frontend coincide con `verificarPermiso(..., 'DETALLE')` en backend?
- [ ] ¿“Volver” respeta `returnListPath` y opcionalmente `menuSidebarKey`?
- [ ] ¿En flujos encadenados (detalle→gestión→wizard) se conserva también una ruta de origen (`gestionReturnPath` o equivalente)?
- [ ] ¿Componentes pesados del detalle están en **organismos/moléculas** y la página solo orquesta?
- [ ] ¿La acción de permiso coincide en frontend (`routes.jsx`, guards/botones) y backend (`verificarPermiso`)?

---

## 7. Errores frecuentes

### Backend

1. **`GET /:id` antes que `/matriz` o `/validar`** — Express interpreta el segmento como id.
2. **Vistas no recreadas** — columnas nuevas en `undefined`.
3. **Bundle incompleto en repositorio** — ficha parcial sin hijos.
4. **Permiso `DETALLE` ausente en 55** — 403 con menú visible por otro permiso del tab.

### Frontend

1. **Orden de rutas React** — `/:id` antes que `/listar`.
2. **Permiso `VER` vs `DETALLE`** en rutas o `TableActions`.
3. **`dataKey` incorrecto en `createApiHook`** — `data` null con 200 OK.
4. **Lógica de carga en `pages/`** — mover a `hooks/state/`.
5. **Página monolítica** — extraer organismos (docentes, plan).

---

## 8. Próximos pasos naturales (fuera del alcance de “solo ficha”)

- Formularios de edición (`PUT`/`PATCH`), invalidación de caché y `refetch` tras guardar.
- Acciones contextuales en la ficha (asignar, licencias, exportar PDF).
- Vistas de solo lectura adicionales (timeline, auditoría).

---

*Fin del documento 5.*
