# Sprint 1 — CFG: Catálogo Plan de Estudio

**Documento padre:** `PLAN_V2_MAESTRO.md`
**Duración estimada:** 1-2 semanas
**Pre-requisito:** Ninguno. Es el primer sprint.

> **Nota de ruta:** las rutas frontend canónicas son `/configuracion/academico/...`
> (no `/configuracion-sistema/plan-estudio/...` como decía la primera versión).
> **Arquitectura de carpetas y hooks:** ver `docs/06_arquitectura_modulos_frontend.md`
> (menú = directorio; hooks por tipo `api|context|features|state`, no por entidad/tab).

---

## 1. Objetivo

Construir el **módulo CFG → Académico → Plan de Estudio** completo (backend + frontend)
sobre las tablas catálogo que ya existen en schema y ya tienen seeders. Es la base de
todos los sprints siguientes: la oferta académica, la asignación docente y el armado
de horario consumen este catálogo.

## 2. Entregables

1. **Backend:** API REST CRUD sobre `carreras`, `materias`, `planes_estudios`, `periodos`, `asignaturas_plan`, `prerrequisitos`.
2. **Permisos RBAC:** registrados en seeder de seguridad.
3. **Frontend:** módulo CFG → Académico con tabs (Carreras, Materias, Planes, Prerrequisitos).
4. **Validador de coherencia:** suma de horas por periodo coincide con horas/semana del plan.

## 3. Tablas afectadas

Ninguna alteración de schema. Estas tablas ya están creadas y sembradas:

- `carreras` (id 1=SIS-INF, 2=ADM-EMP, 3=CON-GEN)
- `materias` (69 registros del seeder)
- `planes_estudios` (3 planes vigentes RM 0210/2023)
- `periodos` (9 registros = 3 años × 3 carreras)
- `asignaturas_plan` (69 asignaciones materia→periodo con `horas_semanales`)
- `prerrequisitos` (12 prerrequisitos del plan vigente)

Solo se confirma que los seeders 10-15 estén ejecutados antes de iniciar.

## 4. Endpoints backend

Todos bajo `/api/v1` y todos requieren autenticación.

### 4.1 Carreras
- `GET /carreras` — lista paginada con filtros (`activo`, `q` para búsqueda por nombre/código)
- `GET /carreras/:id` — detalle incluyendo planes asociados
- `POST /carreras` — crear (permiso: `configuracion.carrera.CREAR`)
- `PUT /carreras/:id` — editar (permiso: `configuracion.carrera.EDITAR`)
- `DELETE /carreras/:id` — soft delete (permiso: `configuracion.carrera.ELIMINAR`)

### 4.2 Materias
- `GET /materias` — lista con filtro `clasificacion`, `tipo`, `q`
- `GET /materias/:id`
- `POST /materias`
- `PUT /materias/:id`
- `DELETE /materias/:id`

### 4.3 Planes de Estudio
- `GET /planes-estudios?carrera_id=` — lista (filtro por carrera opcional)
- `GET /planes-estudios/:id` — detalle completo: plan + periodos + asignaturas + prerrequisitos
- `GET /planes-estudios/:id/matriz` — devuelve estructura periodo × asignaturas para vista de matriz
- `POST /planes-estudios` — crear (permiso: `configuracion.plan-estudio.CREAR`)
- `PUT /planes-estudios/:id`
- `POST /planes-estudios/:id/marcar-vigente` — desmarca otros del mismo carrera + marca este

### 4.4 Periodos (años académicos del plan)
- `GET /planes-estudios/:id/periodos`
- `POST /planes-estudios/:id/periodos`
- `PUT /periodos/:id`
- `DELETE /periodos/:id`

### 4.5 Asignaturas del Plan
- `GET /planes-estudios/:id/asignaturas` — todas las asignaturas del plan
- `GET /periodos/:id/asignaturas` — asignaturas de un periodo específico
- `POST /asignaturas-plan` — body: `{ plan_estudio_id, periodo_id, materia_id, horas_semanales, modalidad }`
- `PUT /asignaturas-plan/:id` — sobre todo edita `horas_semanales` y `orden_visualizacion`
- `DELETE /asignaturas-plan/:id`

### 4.6 Prerrequisitos
- `GET /asignaturas-plan/:id/prerrequisitos` — qué necesita esta asignatura
- `GET /asignaturas-plan/:id/es-prerrequisito-de` — qué asignaturas dependen de esta
- `POST /prerrequisitos` — body: `{ plan_estudio_id, asignatura_id, prerrequisito_id }`
- `DELETE /prerrequisitos/:id`

### 4.7 Validación de coherencia
- `GET /planes-estudios/:id/validar`
  - Response: `{ valido: boolean, periodos: [{ periodo_id, horas_esperadas, horas_asignadas, materias_count, ok: bool }], total_horas: { esperado, asignado } }`
  - Regla: `SUM(asignaturas_plan.horas_semanales)` por periodo = `planes_estudios.horas_semana`.

## 5. Permisos RBAC (seeder)

Agregar al catálogo `permisos`:

| código | nombre | dominio | módulo |
|---|---|---|---|
| `configuracion.carrera` | Gestionar carreras | CONFIGURACION | CFG |
| `configuracion.materia` | Gestionar materias | CONFIGURACION | CFG |
| `configuracion.plan-estudio` | Gestionar planes de estudio | CONFIGURACION | CFG |
| `configuracion.plan-estudio.periodos` | Gestionar periodos del plan | CONFIGURACION | CFG |
| `configuracion.plan-estudio.asignaturas` | Gestionar asignaturas del plan | CONFIGURACION | CFG |
| `configuracion.plan-estudio.prerrequisitos` | Gestionar prerrequisitos | CONFIGURACION | CFG |

Cada uno con sus acciones aplicables (`LISTAR`, `DETALLE`, `CREAR`, `EDITAR`, `ELIMINAR`, `ACTIVAR`) en `permiso_acciones`. `ADMIN_SISTEMA` recibe todas.

**Importante (decisión Sprint 1):** alinear seeders previos. Los códigos `cfg.academico.carreras`,
`cfg.academico.materias`, `cfg.academico.plan` del seeder `54-seed-permisos.sql` legacy
quedan **reemplazados** por los nuevos `configuracion.*` (renombrar en el seeder, no agregar duplicados).
Los ítems del menú legacy `cfg.academico.cursos` y `cfg.academico.turnos` se marcan
como deprecados — en V2 desaparecen porque `cursos` pasa a Institucional (Sprint 3).

## 6. Frontend

**Guía normativa:** `docs/06_arquitectura_modulos_frontend.md`  
**Guías de listado/detalle:** `docs/04_*`, `docs/05_*` (patrón docentes para ABM; CFG usa tabs + `hooks/features`).

### 6.1 Arquitectura de carpetas (implementada / objetivo)

**Un directorio por ítem de menú**, no por entidad. Los tabs Carreras/Materias/Planes son **paneles** dentro de `AcademicoPage`, no submódulos con `routes.jsx` propios.

```
frontend/src/
├── application/modules/configuracion/
│   ├── academico/                    # menú "Académico"
│   │   ├── config/paths.js
│   │   ├── hooks/
│   │   │   ├── api/                  # useCarrerasApi, useMateriasApi, usePlanesEstudiosApi
│   │   │   ├── context/
│   │   │   ├── features/             # useCarrerasList, useMateriasList
│   │   │   └── index.js
│   │   ├── mappers/
│   │   ├── context/ + providers/
│   └── complementarios/              # menú "Datos complementarios"
│       └── (misma forma hooks/api|context|features)
│
└── presentation/modules/configuracion/
    ├── routes.jsx                    # spread: academico, complementarios, documentacion, …
    ├── academico/
    │   ├── routes.jsx                # /academico, /academico/plan/:planId, redirects legacy
    │   ├── connectors/AcademicoConnector.jsx, PlanDetalleConnector.jsx
    │   ├── config/academicoTabs.js, *TableColumns.jsx
    │   └── pages/
    │       ├── AcademicoPage.jsx
    │       ├── CarrerasList.jsx, MateriasList.jsx, PlanesTabPanel.jsx
    │       └── PlanDetallePage.jsx
    └── complementarios/
        └── (ComplementariosPage + tabs)
```

**Eliminar / no reintroducir** (legacy pre-refactor):

- `application/.../academico/carreras/`, `materias/`, `plan-estudio/` como árboles paralelos duplicados.
- `presentation/.../academico/carreras/routes.jsx`, `materias/routes.jsx` como rutas de menú (solo redirects a `?tab=`).

Alias Vite: `@application-configuracion`, `@configuracion`, `@application-configuracion-complementarios`, `@configuracion-complementarios`.

### 6.2 Pantalla con tabs

Ruta raíz: `/configuracion/academico`

`AcademicoPage.jsx` con **3 tabs** (prerrequisitos no es tab; viven en detalle del plan):

| Tab | Query `?tab=` | Permiso (`LISTAR`) | Componente |
|---|---|---|---|
| Plan de estudio | `planes` | `configuracion.plan-estudio` | `<PlanesTabPanel />` |
| Carreras | `carreras` | `configuracion.carrera` | `<CarrerasList />` |
| Materias | `materias` | `configuracion.materia` | `<MateriasList />` |

- Tabs filtrados por permiso; sin permisos → `Alert` de acceso denegado.
- Entrada de menú: `permisoAny` sobre los tres permisos anteriores (`routes.jsx`).
- `?tab=prerrequisitos` (legacy) redirige conceptualmente a tab planes.
- Subruta transaccional: `/configuracion/academico/plan/:planId` → matriz + prerrequisitos (`DETALLE` en `configuracion.plan-estudio`).
- Redirects: `/configuracion/academico/carreras|materias` → tab correspondiente.

Patrón equivalente en **Complementarios:** `/configuracion/complementarios?tab=discapacidad|apoderados|idiomas` (permisos 88–90).

### 6.3 Tab Carreras

Ruta: `/configuracion/academico?tab=carreras`

- Tabla con carreras: código, nombre, área, color (chip), imagen (thumbnail 32px), activo.
- Botón "Nueva Carrera" → modal con form.
- Click en fila → drawer con detalle + lista de planes asociados + botón "Ir al plan vigente".

### 6.4 Tab Materias

Ruta: `/configuracion/academico?tab=materias`

- Tabla con sigla, nombre, tipo, clasificación.
- Filtros: tipo (TEORICA / PRACTICA / TEORICA_PRACTICA), clasificación.
- Modal para crear/editar.
- Búsqueda por nombre/sigla.

### 6.5 Tab Planes de Estudio

Ruta: `/configuracion/academico?tab=planes`

**Layout dos paneles:**

- Sidebar izquierdo (240px): lista de carreras con icono + color + chip "Vigente".
- Panel principal: al seleccionar carrera, muestra lista de planes (vigente arriba, históricos abajo). Cada plan tiene botón "Editar matriz" → navega a `/configuracion/academico/plan/:id`.

**Subruta `/configuracion/academico/plan/:id` (PlanDetallePage):**

Vista matriz:

```
            Periodo 1          Periodo 2          Periodo 3
            ───────            ───────            ───────
Materia 1   [MPI-101 4hrs]    [EST-201 2hrs]    [EMP-301 4hrs]
Materia 2   [PRG-102 8hrs]    [PRG-202 6hrs]    [DPW-302 4hrs]
...
TOTAL       30 hrs ✓           30 hrs ✓           30 hrs ✓
```

- Cada celda es editable inline (horas, modalidad, orden).
- Validador en vivo (consume `/planes-estudios/:id/validar`): si la suma del periodo ≠ `horas_semana` del plan, badge rojo en el total.
- Botón "Marcar vigente" (deshabilitado si ya lo es).
- Botón "Editar plan" para metadatos (nombre, resolución ministerial, horas teóricas).

### 6.6 Prerrequisitos (dentro del detalle del plan)

**No** es un tab del menú Académico. UI en `PlanDetallePage` (`/configuracion/academico/plan/:planId`).

- Permiso dedicado: `configuracion.plan-estudio.prerrequisitos` (CREAR/ELIMINAR en API).
- Selector de asignatura + panel de prerrequisitos (misma pantalla que la matriz o sección asociada).
- Reglas de negocio: §7.3.

### 6.7 Application layer (hooks y providers)

| Pieza | Ubicación | Rol |
|-------|-----------|-----|
| API | `hooks/api/use*Api.js` | `createApiHook`, `limit: 10000`, mapper en `mappers/` |
| Listado tab | `hooks/features/use*List.js` | api + `useTableData` + campos de búsqueda |
| Provider | `providers/*Provider.jsx` | `use*List()` → Context |
| Consumo UI | `hooks/context/use*Context.js` | usado en `CarrerasList`, `MateriasList` |
| Catálogo cross-módulo | `shared/hooks/useCarrerasCatalogApi.js` | importa mappers de `@application-configuracion/academico` |

`AcademicoConnector` apila `CarreraProvider` + `MateriaProvider` y renderiza `AcademicoPage`.

### 6.8 Estilos y patrón visual

- **Ant Design** como librería base (ya en uso en el proyecto).
- Tabs y tablas: variante densa (`size="small"` o `"middle"` según pantalla).
- Color por carrera: usar `carreras.color_hex` como acento de tab/header dentro del detalle.
- Iconografía: `@ant-design/icons` ya disponible.
- **Decidir patrón en consulta con el agente IA al arrancar el frontend:** revisar componentes ya construidos en `modules/academico/calificaciones/` para mantener consistencia (estructura de form, drawer, paginación, mensajería de error).

### 6.9 Limpieza de código legacy

| Artefacto | Acción |
|-----------|--------|
| `academico/carreras/`, `academico/materias/` duplicados (application + presentation) | **Eliminar** tras migrar imports a `academico/pages` + `hooks/` consolidados |
| `academico/cursos/`, `academico/turnos/` | **Eliminar** (V2 → Institucional Sprint 3) |
| `complementario/discapacidad/` vs `complementarios/` | Quedarse solo en **`complementarios/`** |
| `datos-complementarios/` (presentation) | Eliminar cuando no queden imports; redirects en `routes.jsx` |
| Permisos `cfg.academico.*` en seeds | Ya reemplazados por `configuracion.*` (54–56) |

Antes de cerrar Sprint 1: `grep` de `@configuracion/academico/carreras` y rutas huérfanas; build frontend sin warnings de alias rotos.

## 7. Reglas de validación (en aplicación)

1. **Vigencia única por carrera:** solo un `planes_estudios.vigente = TRUE` por `carrera_id`. Al marcar vigente, desmarcar los demás de esa carrera.
2. **Horas coherentes:** validar al guardar un `asignaturas_plan` que la suma del periodo no exceda `planes_estudios.horas_semana`. Permitir guardar con warning si está por debajo (no error).
3. **Prerrequisito ciclo:** al crear `prerrequisitos`, validar que `prerrequisito_id` pertenezca a un periodo anterior (`periodos.numero < periodos.numero` de la asignatura).
4. **Soft delete cascada:** al eliminar un plan, marcar también sus periodos y asignaturas como `deleted_at`. No tocar `prerrequisitos` (se quedan huérfanos por `ON DELETE SET NULL`).

## 8. Estado actual del Sprint 1

### 8.1 Backend — ✅ COMPLETADO (Tarea 1)

CRUD operativo para los 6 recursos con auth, RBAC, soft delete:
- 5 endpoints Carreras (GET list/detail, POST, PUT, DELETE soft)
- 5 endpoints Materias
- 5 endpoints Planes de Estudio (incluye `POST /:id/marcar-vigente`)
- 4 endpoints Periodos
- 5 endpoints Asignaturas del Plan
- 4 endpoints Prerrequisitos

Arquitectura: routes + controllers + use-cases + repositorios Sequelize + DI container.
Permisos exigidos en rutas: `configuracion.carrera`, `configuracion.materia`,
`configuracion.plan-estudio`, `configuracion.plan-estudio.periodos`,
`configuracion.plan-estudio.asignaturas`, `configuracion.plan-estudio.prerrequisitos`.

### 8.2 Frontend — refactor menú (parcial ✅)

- [x] Consolidación `application/.../academico/` (hooks `api|context|features`, providers, mappers).
- [x] `AcademicoPage` + tabs + `AcademicoConnector` + rutas con `permisoAny`.
- [x] Listados Carreras/Materias en tabs (`CarrerasList`, `MateriasList`).
- [x] Ruta `/configuracion/academico/plan/:planId` + `PlanDetalleConnector`.
- [x] Complementarios: patrón tabs + discapacidad (listado).
- [ ] Matriz editable + validador en vivo (depende T2–T3 backend).
- [ ] Prerrequisitos completos en `PlanDetallePage`.
- [ ] Limpieza física carpetas legacy `carreras/`, `materias/`, `complementario/`, `datos-complementarios/`.

### 8.3 Pendiente backend y seeds

- [ ] **Tarea 2:** `GET /planes-estudios/:id/matriz`
- [ ] **Tarea 3:** `GET /planes-estudios/:id/validar`
- [x] **Tarea 4:** Seeders `configuracion.*` en 54–56 (verificar `ruta_sidebar` complementarios → `/configuracion/complementarios`)

## 9. Definition of Done

- [x] Backend CRUD para los 6 grupos de endpoints.
- [ ] Backend matriz y validador (Tareas 2-3).
- [x] Permisos sembrados `configuracion.*` (54–56); documentados en matriz § CFG.
- [x] Arquitectura frontend documentada (`docs/06_arquitectura_modulos_frontend.md`) y aplicada en académico/complementarios.
- [x] `AcademicoPage` con tabs (planes, carreras, materias) + permisos por tab.
- [ ] Tab Carreras: tabla + modal CRUD completo.
- [ ] Tab Materias: tabla + modal CRUD + filtros.
- [ ] Tab Planes: sidebar + matriz editable + validador en vivo + marcar vigente.
- [ ] Prerrequisitos en `PlanDetallePage` (no tab suelto).
- [ ] Carpetas legacy eliminadas (§6.9).
- [ ] Prueba manual: `/configuracion/academico` (3 tabs) → plan detalle → CRUD carrera/materia → prerrequisito en plan.

---

## 10. Prompts para agente IA

### 10.1 Prompt original (Tareas 1-4 backend)

> **Estado:** Tarea 1 completada. Se mantiene como referencia histórica.
> Para continuar con Tareas 2-9, ver el prompt §10.2.

### 10.2 Prompt activo — Tareas 2-4 backend + culminación frontend Sprint 1

Copiar y pegar al agente:

```
Contexto: Sistema académico INCOS (Node.js + React + MySQL + Sequelize + Ant Design).
Sprint 1 del plan V2 en curso.

Documentación obligatoria antes de tocar código:
- docs/06_arquitectura_modulos_frontend.md (carpetas = menú; hooks api|context|features|state)
- docs/SPRINT_1.md §6–§9
- docs/04_guia_implementacion_listado_modulo.md + docs/05_guia_implementacion_detalle_modulo.md
- docs/matriz-permisos-sistema.md § CFG

Estado actual:
- Backend Tarea 1 (CRUD 6 recursos) terminada. RBAC configuracion.* en rutas.
- Seeders 54–56 con permisos configuracion.* (78–83 académico).
- Frontend refactorizado: application/.../configuracion/academico/ consolidado;
  AcademicoPage (tabs planes|carreras|materias); PlanDetallePage en /plan/:planId;
  complementarios/ con patrón tabs. Pendiente: eliminar carpetas legacy carreras/,
  materias/, complementario/ duplicadas; matriz/validador backend; CRUD modales completos.
- Seeders datos 10–15 cargados. Schema V1 vivo hasta Sprint 2.

Trabajo pendiente (orden sugerido).

== BACKEND (Tareas 2-4) ==

T2) Backend: GET /api/v1/planes-estudios/:id/matriz
    Response:
    {
      plan: { id, nombre_plan, horas_semana, carrera: {...} },
      periodos: [
        { id, nombre, numero,
          asignaturas: [
            { id, materia: { sigla, nombre, tipo }, horas_semanales,
              modalidad, orden_visualizacion }
          ],
          horas_total: 30
        }
      ],
      horas_total_plan: 90
    }
    Cálculo de horas_total por periodo en aplicación (sumar asignaturas_plan).
    Sin views nuevas; en memoria.

T3) Backend: GET /api/v1/planes-estudios/:id/validar
    Reglas en SPRINT_1.md §7. Response:
    {
      valido: bool,
      periodos: [{ periodo_id, horas_esperadas, horas_asignadas, materias_count, ok }],
      total_horas: { esperado, asignado }
    }

T4) Backend: actualizar seeders de permisos
    - 54-seed-permisos.sql: agregar/renombrar a los códigos configuracion.* del §5.
      Marcar cfg.academico.cursos y cfg.academico.turnos como deprecados (no eliminar
      hasta Sprint 3).
    - 56-seed-permiso-acciones.sql: acciones LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR,
      ACTIVAR para cada uno.
    - 55-seed-roles-permisos.sql: ADMIN_SISTEMA recibe todas las acciones de todos
      los permisos nuevos.

== FRONTEND (culminación) ==

T5) Limpieza legacy §6.9: borrar carpetas duplicadas; grep imports rotos.

T6) Tab Carreras/Materias: modal CRUD, permisos CREAR/EDITAR/ELIMINAR, guía 04.

T7) Tab Planes + PlanDetallePage: consumir T2/T3; matriz editable; marcar vigente.

T8) Prerrequisitos en PlanDetallePage (permiso configuracion.plan-estudio.prerrequisitos).

Restricciones: respetar docs/06 (no crear hooks/carreras/ por entidad). Cero ALTER TABLE.
RBAC en UI con hasPermiso / ActionButton / TableActions.

Empieza con T2 (backend matriz) salvo que se pida solo frontend.
```