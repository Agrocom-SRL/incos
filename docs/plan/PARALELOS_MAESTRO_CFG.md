# Plan — Paralelos maestro en Configuración (CFG)

**Estado:** borrador para implementación  
**Relación:** Fase 3 oferta (`paralelos_gestion`) depende de maestros en `paralelos`  
**Referencias:** `PLAN_MAESTRO.md` §2.1, `flujo-operativo-gestion-academica.md`, `incos-modulo-listado`, `incos-rbac`

---

## 1. Objetivo

Exponer en **CFG → Académico** el ABM de **paralelos maestro** (`paralelos`): plantillas reutilizables por **carrera + periodo del plan + turno + nombre**, sin año lectivo ni aula/cupos.

La **instancia de gestión** (`paralelos_gestion`, turno editable, aula, cupos, oferta, estados) sigue en **INST → Oferta académica** con permiso `institucional.oferta.paralelo-gestion`.

---

## 2. Separación de responsabilidades (no mezclar)

| | Paralelo maestro | Paralelo en gestión |
|---|------------------|---------------------|
| Tabla | `paralelos` | `paralelos_gestion` |
| Ejemplo | PRIMERO-A TARDE (SIS-INF, 1er año plan) | Misma plantilla en gestión 2026-REG |
| Campos clave | `carrera_id`, `periodo_id`, `nombre`, `turno`, `descripcion`, `activo` | `gestion_plan_id`, `paralelo_id`, `aula_id`, cupos, `estado` |
| Pantalla | `/configuracion/academico?tab=paralelos` | `/institucional/oferta` paso 3 |
| Permiso | **`configuracion.paralelo`** (nuevo) | `institucional.oferta.paralelo-gestion` |
| API | `GET/POST/PUT/DELETE /api/v1/paralelos` | `gestiones-planes/.../paralelos-gestion`, `paralelos-gestion/:id` |

**Generación:** `POST .../generar-paralelos-gestion` copia maestros **activos** de la carrera del plan (`GenerarParalelosGestionUseCase`). Sin maestros → error *"No hay paralelos maestros activos para la carrera del plan"*.

---

## 3. Estado actual (auditoría)

### Backend — listo parcialmente

| Pieza | Estado |
|-------|--------|
| DDL `paralelos` | OK (`06-estructura-academica-parte2.sql`) |
| `ParallelRepository` + `ListParalelosUseCase` | OK (`BaseRepository` incluye create/update/delete) |
| `GET /api/v1/paralelos` | OK, con filtros `carrera_id`, `periodo_id`, `periodo` |
| `POST/GET/:id/PUT/DELETE` | **Comentados** en `paralelos.routes.js` |
| Permiso en `GET /` | **`institucional.gestion.horarios` LISTAR** (legado tablero horarios) |
| Dashboard `/paralelos/dashboard/*` | Horarios; no mover a CFG |

### Frontend — sin pantalla CFG

| Pieza | Estado |
|-------|--------|
| `application/modules/academico/paralelos/` | `useParalelosApi`, mapper, domain use cases |
| `presentation/modules/configuracion/academico/` | Tabs: planes, carreras, materias — **sin paralelos** |
| Consumidores | Matrícula (`useInscripcionNuevaParalelos`), horarios (dashboard legacy en `/paralelos`) |

### RBAC

- No existe `configuracion.paralelo` en seed 54.
- `institucional.oferta.paralelo-gestion` (106) es solo gestión.

---

## 4. Permiso nuevo (RBAC)

### 4.1 Seed 54 — permiso id **90** (bloque CFG Académico, tras materias)

```sql
(90, 'configuracion.paralelo', 'Académico: paralelos maestro', 'CONFIGURACION', 'CFG',
 'configuracion_academico_paralelo', '/configuracion/academico', TRUE),
```

### 4.2 Seed 56 — acciones

`LISTAR`, `DETALLE`, `CREAR`, `EDITAR`, `ELIMINAR`, `ACTIVAR` (mismo patrón que `configuracion.carrera`).

### 4.3 Seed 55 — roles

| Rol | LISTAR | CREAR | EDITAR | ELIMINAR |
|-----|--------|-------|--------|----------|
| DIR_ACADEMICO (3) | sí | sí | sí | sí |
| SEC_ACADEMICA (5) | sí | sí | sí | opcional |
| RECTOR (2) | sí | no | no | no |

(Ajustar según matriz operativa; no filas para ADMIN_SISTEMA.)

### 4.4 Matriz `matriz-permisos-sistema.md`

Documentar fila CFG + endpoints §3 backend.

### 4.5 Lectura transversal de `GET /paralelos`

Hoy consumen el listado:

- CFG (nuevo tab)
- Matrícula / inscripción (`useParalelosApi`)
- Horarios (dashboard legacy)

**Decisión recomendada:** en `GET /` usar middleware **`verificarPermisoAny`** con:

- `configuracion.paralelo` + `LISTAR`
- `institucional.gestion.horarios` + `LISTAR`
- `matricula.inscribir` + `LISTAR`

Mutaciones (`POST`, `PUT`, `DELETE`) solo `configuracion.paralelo` con acción correspondiente.

Dashboard y `schedule` mantienen permisos horarios actuales.

---

## 5. Backend — entregables

Orden sugerido (checklist `incos-backend-module` §8).

### 5.1 Use cases (`application/use-cases/configuracion/` o `academico/`)

| Use case | Base | Notas |
|----------|------|-------|
| `CreateParaleloUseCase` | `BaseCreateUseCase` | Validar unicidad lógica `(carrera_id, periodo_id, turno, nombre)` activo |
| `GetParaleloByIdUseCase` | `BaseGetUseCase` | Incluir joins carrera + periodo (nombre plan) |
| `UpdateParaleloUseCase` | `BaseUpdateUseCase` | No permitir bajar `activo` si hay `paralelos_gestion` vigentes sin regla explícita (fase 2: solo warning en UI) |
| `DeleteParaleloUseCase` | soft delete | Rechazar si `paralelos_gestion` referencia el id |

`ListParalelosUseCase`: mover permiso en router; opcional quitar `enrichData` de inscripciones en listado CFG (estadísticas por gestión pueden quedar solo con query `?incluir_estadisticas=1` en fase 2).

### 5.2 Controllers + validators

- `presentation/controllers/configuracion/paralelos/` (o extender `academico/paralelos/`)
- `createParaleloValidator`, `updateParaleloValidator` — campos alineados al modelo:
  - `carrera_id` (requerido)
  - `periodo_id` (requerido; debe pertenecer al plan de la carrera)
  - `nombre` (requerido, max 50)
  - `turno` enum `MAÑANA|TARDE|NOCHE`
  - `descripcion` opcional
  - `activo` boolean

### 5.3 Router `paralelos.routes.js`

```text
GET    /                          → permisoAny (§4.5)
POST   /                          → configuracion.paralelo CREAR
GET    /:id                         → configuracion.paralelo DETALLE  (antes de dashboard/* si hay conflicto — orden: estáticas, dashboard/*, /:id)
PUT    /:id                         → configuracion.paralelo EDITAR
DELETE /:id                         → configuracion.paralelo ELIMINAR
GET    /:id/schedule, PUT, dashboard/* → sin cambio (horarios)
```

Registrar use cases en `configuracion` container o ampliar `paralelos.container.js` con tokens CFG.

### 5.4 Mapper presentación

- `dataFieldName`: `paralelo` (detalle), `paralelos` (lista) — ya usado en listado.
- Detalle: `carreraNombre`, `periodoNumero`, `periodoNombre`, `turno`, `activo`.

### 5.5 Sin ALTER TABLE

El esquema actual basta. Índice compuesto `(carrera_id, periodo_id, turno, deleted_at)` ya existe.

---

## 6. Frontend — entregables

Patrón **tab CFG** (`incos-frontend-module` §4.1), referencia **CarrerasList**.

### 6.1 Estructura carpetas

Mover/evolucionar hooks bajo menú configuración (no dejar lógica huérfana en `academico/paralelos` sin consumidor CFG):

```text
application/modules/configuracion/academico/
  hooks/api/useParalelosApi.js          ← reexport o mover desde academico
  hooks/features/useParalelosList.js
  hooks/api/useParaleloMutationsApi.js  ← create/update/delete
  providers/ParaleloProvider.jsx
  config/paths.js                       ← paraleloNuevoPath, paraleloEditarPath (si modal inline, omitir rutas)

presentation/modules/configuracion/academico/
  config/academicoTabs.js               ← TAB_PARALELOS = 'paralelos'
  config/academicoTabPanels.js          ← meta ícono + labels
  config/paralelosTableColumns.jsx
  pages/ParalelosList.jsx               ← embedded tab
  pages/ParaleloFormDrawer.jsx          ← o página /paralelos/registrar si se prefiere ABM dedicado
```

**Alias Vite/jsconfig:** mantener `@application-academico/paralelos` como reexport temporal para matrícula hasta migrar imports.

### 6.2 UI (`incos-ui-system`)

- Tab en `AcademicoPage`: `permisoAny` incluye `configuracion.paralelo` LISTAR.
- `TableListView` + `ListPanelHeader` (embedded).
- Columnas sugeridas:
  - Identidad: `nombre` + badge turno (`StatusPill`)
  - Carrera (`TableCell` + código)
  - Periodo (número + nombre del plan)
  - Activo
  - `TableActions`: DETALLE/EDITAR/ELIMINAR con `permisos="configuracion.paralelo"`
- Filtros en toolbar: select carrera, select periodo (cascada desde plan de la carrera), select turno.
- ABM en **página completa** (mismo patrón que carreras/materias; **sin drawer** en CFG):
  - `/configuracion/academico/paralelo/nueva`, `/paralelo/:id`, `/paralelo/:id/editar`
  - Carrera, periodo (plan vigente), nombre, turno, descripción, activo

### 6.3 Connector

```jsx
// AcademicoConnector.jsx
<ParaleloProvider>
  <CarreraProvider>
    ...
```

### 6.4 Rutas

- Sin ruta nueva de menú: solo `?tab=paralelos` en `/configuracion/academico`.
- Actualizar `permisoAny` en `routes.jsx` del académico.

### 6.5 Enlace con Oferta (UX mínima en este sprint)

En wizard oferta, cuando falle `generar-paralelos-gestion`:

- Alert con enlace: *"Configurar paralelos maestro"* → `/configuracion/academico?tab=paralelos&carrera_id={id}`.

---

## 7. Fases de implementación

| Fase | Alcance | Depende de |
|------|---------|------------|
| **P0** | Seeds 90 + 56 + 55 + matriz | — |
| **P1** | BE CRUD + permisos router `GET /` any | P0 |
| **P2** | FE tab listado + páginas ABM | P1 |
| **P3** | Enlace desde Oferta + smoke SIS-INF | P2 |
| **P4** (opcional) | Detalle read-only; regla “no desactivar si en gestión”; estadísticas solo bajo flag | P2 |

**No incluir en P1–P3:** refactor completo oferta workspace, board horarios, ni retirar dashboard legacy `/paralelos/dashboard`.

---

## 8. Criterios de aceptación (smoke)

### CFG

1. Rol con `configuracion.paralelo` LISTAR ve tab **Paralelos**.
2. Crear: SIS-INF · periodo 1 · PRIMERO-A · TARDE · activo.
3. Listado filtra por carrera SIS-INF.
4. Editar nombre/descripcion; desactivar con confirmación.
5. Rol sin permiso: sin tab; `GET /paralelos` → 403 si solo tiene otros permisos revocados.

### Cadena con Oferta (Fase 3)

6. Con maestros activos, en oferta: **Generar paralelos de gestión** crea filas en `paralelos_gestion`.
7. Sin maestros: mensaje claro + link a CFG tab paralelos.

### Matrícula (regresión)

8. Usuario con `matricula.inscribir` LISTAR sigue cargando paralelos en paso paralelos del wizard (permisoAny en GET).

---

## 9. Datos semilla de referencia

Ver seeders de paralelos maestro (ej. TERCERO A `paralelo_id=10` en comentarios de asignaciones). Para smoke SIS-INF 2026-REG alinear con carrera/plan del instituto:

- Al menos un maestro por periodo usado en el plan habilitado (ej. PRIMERO-A TARDE, SEGUNDO-A TARDE).

---

## 10. Documentación a actualizar

| Documento | Cambio |
|-----------|--------|
| `flujo-operativo-gestion-academica.md` | Fase 1 CFG: tab paralelos maestro; Fase 3: no confundir con `paralelos_gestion` |
| `matriz-permisos-sistema.md` | Permiso 90 + endpoints CRUD |
| `PLAN_MAESTRO.md` | Una línea en §2.1 tabla “Dónde se gestiona” |

---

## 11. Archivos previstos (resumen)

### Backend

- `backend/database/02-seeders/54-seed-permisos.sql` (+90)
- `backend/database/02-seeders/56-seed-permiso-acciones.sql`
- `backend/database/02-seeders/55-seed-roles-permisos.sql`
- `backend/src/application/use-cases/configuracion/CreateParaleloUseCase.js` (+ Get/Update/Delete)
- `backend/src/presentation/controllers/configuracion/paralelos/*.js`
- `backend/src/presentation/validators/configuracion/paralelos.validator.js`
- `backend/src/presentation/routes/paralelos.routes.js`
- `backend/src/infrastructure/container/modules/configuracion/paralelos.container.js` (o extensión existente)
- `docs/referencia/matriz-permisos-sistema.md`

### Frontend

- `frontend/src/presentation/modules/configuracion/academico/config/academicoTabs.js`
- `frontend/src/presentation/modules/configuracion/academico/pages/AcademicoPage.jsx`
- `frontend/src/presentation/modules/configuracion/academico/pages/ParalelosList.jsx`
- `frontend/src/presentation/modules/configuracion/academico/config/paralelosTableColumns.jsx`
- `frontend/src/application/modules/configuracion/academico/providers/ParaleloProvider.jsx`
- `frontend/src/application/modules/configuracion/academico/hooks/...`
- `frontend/src/presentation/modules/configuracion/academico/routes.jsx` (`permisoAny`)
- `frontend/src/presentation/modules/institucional/oferta/...` (mensaje + link, fase P3)

---

## 12. Riesgos y decisiones abiertas

1. **Unicidad:** ¿permitir dos "PRIMERO-A" mismo turno si nombres difieren solo en descripción? → recomendar validación backend estricta por `(carrera_id, periodo_id, turno, nombre)`.
2. **Campo `codigo`:** el mapper FE menciona `codigo` pero el DDL no lo tiene — no exponer en formulario hasta migración explícita.
3. **Dashboard legacy:** rutas `/paralelos/dashboard/*` pueden deprecarse cuando horarios use solo `paralelos-gestion`; fuera de alcance inicial.
4. **Horarios `schedule` en maestro:** legacy pre-oferta; no exponer en CFG; documentar como deuda.

---

## 13. Orden respecto al resto del sprint

1. **Este plan (paralelos maestro CFG)** — desbloquea Fase 3 oferta estable.  
2. **Refactor UI Oferta** (workspace, KPIs) — en paralelo o después; no bloquea P1–P2 de paralelos.  
3. **Asignación docente masiva** — después de smoke §8 con `oferta_curso_id` real.
