# Sprint 1 — CFG: Catálogo Plan de Estudio

**Documento padre:** `PLAN_V2_MAESTRO.md`
**Duración estimada:** 1-2 semanas
**Pre-requisito:** Ninguno. Es el primer sprint.

> **Nota de ruta:** las rutas frontend acordadas son `/configuracion/academico/...`
> (no `/configuracion-sistema/plan-estudio/...` como decía la primera versión).
> Esto se alinea con la estructura ya existente del proyecto: `modules/configuracion/academico/`.

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

### 6.1 Arquitectura de carpetas

Patrón: cada feature dentro de `academico/` tiene su propio `routes.jsx`. El `routes.jsx`
padre solo hace spread de los hijos.

```
frontend/src/presentation/modules/configuracion/
├── routes.jsx                          # spread de submódulos
├── academico/
│   ├── routes.jsx                      # NUEVO — spread de las 4 features
│   ├── pages/
│   │   └── AcademicoPage.jsx           # layout con Tabs (Ant Design)
│   ├── carreras/
│   │   ├── routes.jsx
│   │   ├── connectors/                 # llamadas a API (servicios)
│   │   ├── pages/
│   │   │   └── CarrerasPage.jsx
│   │   └── components/
│   │       ├── CarreraForm.jsx
│   │       └── CarreraTable.jsx
│   ├── materias/
│   │   ├── routes.jsx
│   │   ├── connectors/
│   │   ├── pages/MateriasPage.jsx
│   │   └── components/
│   ├── plan-estudio/                   # vista matriz periodo × asignaturas
│   │   ├── routes.jsx
│   │   ├── connectors/
│   │   ├── pages/
│   │   │   ├── PlanesPage.jsx          # sidebar carreras + lista de planes
│   │   │   └── PlanDetallePage.jsx     # matriz editable
│   │   └── components/
│   │       ├── MatrizPlan.jsx
│   │       ├── PeriodoColumn.jsx
│   │       └── AsignaturaCell.jsx
│   └── prerrequisitos/
│       ├── routes.jsx
│       ├── connectors/
│       ├── pages/PrerrequisitosPage.jsx
│       └── components/
│           └── PrerrequisitoEditor.jsx
├── documentacion/
├── complementario/
└── ...
```

### 6.2 Pantalla con tabs

Ruta raíz: `/configuracion/academico`

Una sola página `AcademicoPage.jsx` con 4 tabs:

| Tab | Permiso lectura | Componente |
|---|---|---|
| Carreras | `configuracion.carrera.LISTAR` | `<CarrerasPage />` |
| Materias | `configuracion.materia.LISTAR` | `<MateriasPage />` |
| Planes de Estudio | `configuracion.plan-estudio.LISTAR` | `<PlanesPage />` (con drill-down a `PlanDetallePage`) |
| Prerrequisitos | `configuracion.plan-estudio.prerrequisitos.LISTAR` | `<PrerrequisitosPage />` |

Tabs filtrados por permiso: si el usuario no tiene un permiso, el tab no aparece.

URL deep-linked: el tab activo se sincroniza con query string (`?tab=carreras`, `?tab=materias`, `?tab=planes`, `?tab=prerrequisitos`). Esto sigue el patrón de `aulas` que ya usa `?tab=resumen` y `?tab=asignar`.

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

### 6.6 Tab Prerrequisitos

Ruta: `/configuracion/academico?tab=prerrequisitos`

- Selector arriba: carrera → plan (default vigente).
- Lista de asignaturas del plan agrupadas por periodo.
- Al seleccionar una asignatura: panel lateral con sus prerrequisitos actuales + selector para agregar (filtrado a asignaturas del mismo plan de periodos anteriores).
- Acción: clic en X para quitar prerrequisito; selector para agregar.

### 6.7 Estilos y patrón visual

- **Ant Design** como librería base (ya en uso en el proyecto).
- Tabs y tablas: variante densa (`size="small"` o `"middle"` según pantalla).
- Color por carrera: usar `carreras.color_hex` como acento de tab/header dentro del detalle.
- Iconografía: `@ant-design/icons` ya disponible.
- **Decidir patrón en consulta con el agente IA al arrancar el frontend:** revisar componentes ya construidos en `modules/academico/calificaciones/` para mantener consistencia (estructura de form, drawer, paginación, mensajería de error).

### 6.8 Decisión sobre código legacy

Carpetas existentes a evaluar:

- `frontend/src/presentation/modules/configuracion/academico/carreras/` — **mantener y refactorizar**. Si ya tiene CRUD funcional, adaptarlo a los endpoints nuevos del backend Tarea 1.
- `frontend/src/presentation/modules/configuracion/academico/materias/` — **mantener y refactorizar**.
- `frontend/src/presentation/modules/configuracion/academico/cursos/` (si existe) — **ELIMINAR**. En V2 desaparece.
- `frontend/src/presentation/modules/configuracion/academico/turnos/` (si existe) — **ELIMINAR**. En V2 el turno vive en `paralelos_gestion`.

El agente IA debe **inspeccionar primero** las carpetas existentes y decidir caso por caso:

1. Si el componente actual mapea bien al nuevo endpoint → conservar y solo ajustar las llamadas/payloads.
2. Si el componente no mapea (referencia a `cursos`, `cursos_horarios`, modelos viejos) → eliminar y rehacer.
3. Si la carpeta no existe aún → crear desde cero siguiendo §6.1.

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

### 8.2 Pendiente

- [ ] **Tarea 2:** `GET /planes-estudios/:id/matriz`
- [ ] **Tarea 3:** `GET /planes-estudios/:id/validar`
- [ ] **Tarea 4:** Seeder permisos `configuracion.*` (reemplaza códigos `cfg.academico.*` legacy)
- [ ] **Tarea 5 (frontend):** Refactor estructura `academico/` con `routes.jsx` por feature + `AcademicoPage` con tabs
- [ ] **Tarea 6 (frontend):** Tab Carreras y Tab Materias funcionando contra Tarea 1
- [ ] **Tarea 7 (frontend):** Tab Planes con sidebar + lista + matriz editable
- [ ] **Tarea 8 (frontend):** Tab Prerrequisitos
- [ ] **Tarea 9 (frontend):** Auditar y eliminar/refactorizar carpetas legacy de `carreras/` y `materias/`

## 9. Definition of Done

- [x] Backend CRUD para los 6 grupos de endpoints.
- [ ] Backend matriz y validador (Tareas 2-3).
- [ ] Permisos sembrados con códigos `configuracion.*` reemplazando los `cfg.academico.*` legacy (Tarea 4).
- [ ] Pantalla `AcademicoPage` con 4 tabs funcionales.
- [ ] Tab Carreras: tabla + modal CRUD.
- [ ] Tab Materias: tabla + modal CRUD + filtros.
- [ ] Tab Planes: sidebar + matriz editable + validador en vivo + marcar vigente.
- [ ] Tab Prerrequisitos: selector de plan + lista por periodo + editor.
- [ ] Código legacy de `carreras/` y `materias/` auditado y refactorizado o eliminado.
- [ ] Prueba manual: desde cero, navegar a `/configuracion/academico`, recorrer los 4 tabs, crear una carrera nueva, una materia nueva, agregar al plan vigente, marcar otro plan como vigente, agregar un prerrequisito.

---

## 10. Prompts para agente IA

### 10.1 Prompt original (Tareas 1-4 backend)

> **Estado:** Tarea 1 completada. Se mantiene como referencia histórica.
> Para continuar con Tareas 2-9, ver el prompt §10.2.

### 10.2 Prompt activo — Tareas 2-4 backend + Tareas 5-10 frontend

Copiar y pegar al agente:

```
Contexto: Sistema académico INCOS (Node.js + React + MySQL + Sequelize + Ant Design).
Sprint 1 del plan V2 en curso.

Estado actual:
- Backend Tarea 1 (CRUD de 6 recursos) ya terminada y funcionando. Endpoints en:
  /api/v1/carreras, /materias, /planes-estudios, /periodos, /asignaturas-plan,
  /prerrequisitos. RBAC aplicado con códigos configuracion.* aunque los permisos
  todavía no están sembrados.
- Frontend: existe estructura parcial en modules/configuracion/academico/ con
  subcarpetas carreras/ y materias/ posiblemente legacy.
- Seeders 10-15 cargados (carreras, planes, periodos, materias, asignaturas-plan,
  prerrequisitos).
- Schema V1 todavía vivo (cursos, cursos_horarios) pero V2 no se toca hasta Sprint 2.

Trabajo pendiente del Sprint 1 (entrega en orden, espera aprobación entre cada uno).

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

== FRONTEND ==

ANTES DE EMPEZAR: inspecciona y reporta qué hay en estas rutas:
- frontend/src/presentation/modules/configuracion/routes.jsx
- frontend/src/presentation/modules/configuracion/academico/ (todos los hijos)
- frontend/src/presentation/modules/academico/calificaciones/ (para ver patrón ya
  validado por el equipo)
- frontend/src/infrastructure/api/endpoints.js
- frontend/src/presentation/components/ (componentes reutilizables)
- Cualquier archivo con sistema de permisos en frontend (hook usePermisos, HOC, etc.)

Reporta y decide conmigo:
A. ¿La carpeta carreras/ tiene CRUD funcional? ¿Qué endpoints consume? ¿Sigue el
   patrón de calificaciones/?
B. Lo mismo para materias/.
C. ¿Existen cursos/ o turnos/? Propónme eliminarlas (decisión preconfirmada: SÍ).
D. ¿Qué patrón de Form/Modal/Drawer/Tabla usa calificaciones/? Lo replicamos.
E. ¿Cómo se valida permiso para mostrar/ocultar un botón? (componente PermissionGate,
   hook useHasPermission, etc.)

Después de mi aprobación, ejecuta en orden:

T5) Frontend: refactor estructura academico/ según SPRINT_1.md §6.1.
    - academico/routes.jsx que hace spread de routes de cada sub-feature.
    - academico/pages/AcademicoPage.jsx con Tabs Ant Design.
    - Sincronizar tab activo con query string ?tab=...
    - Filtrar tabs por permisos del usuario (si no tiene LISTAR, el tab no aparece).
    - Header de página con título "Configuración Académica" y breadcrumb.

T6) Frontend: Tab Carreras (sub-feature carreras/).
    - connectors/carrerasService.js consume /api/v1/carreras.
    - pages/CarrerasPage.jsx con tabla + modal CRUD siguiendo patrón de calificaciones.
    - components/CarreraForm.jsx (campos: codigo, nombre, area_formacion,
      titulo_otorgado, color_hex con ColorPicker de antd, imagen_ruta con Upload).
    - components/CarreraTable.jsx con columnas: código, nombre, área, color (chip),
      thumbnail 32px, activo, acciones.
    - Drawer al click en fila: detalle + lista de planes asociados + botón "Ir al
      plan vigente" que navega al tab planes con ese plan abierto.
    - Validación de permisos en botones: CREAR, EDITAR, ELIMINAR.

T7) Frontend: Tab Materias (sub-feature materias/).
    - Mismo patrón que T6.
    - Filtros tipo (TEORICA/PRACTICA/TEORICA_PRACTICA) y clasificación.
    - Búsqueda por nombre/sigla con debounce.

T8) Frontend: Tab Planes de Estudio (sub-feature plan-estudio/).
    - PlanesPage.jsx con sidebar izquierdo (240px) listando carreras + panel principal
      con lista de planes de la carrera seleccionada (vigente arriba, históricos abajo).
    - Cada plan: botón "Editar matriz" navega a /configuracion/academico/plan/:id.
    - PlanDetallePage.jsx en ruta /configuracion/academico/plan/:id consume
      /planes-estudios/:id/matriz para renderizar tabla periodo × asignaturas:
      * Columnas: Periodo 1, Periodo 2, Periodo 3 (dinámico).
      * Filas: asignaturas.
      * Cada celda renderiza AsignaturaCell con sigla, nombre, horas editables inline,
        modalidad (TRONCAL/ELECTIVA/REGULAR) como tag clickeable.
      * Fila de TOTAL con horas asignadas vs esperadas. Badge verde si OK, rojo si no.
      * Header: nombre del plan, RM, botón "Marcar vigente" (deshabilitado si ya lo es),
        botón "Editar plan" (modal con metadatos).
      * Botón "+" en cada periodo para agregar asignatura del plan (modal con selector
        de materia + horas + modalidad).
    - Validador en vivo: tras cada edición exitosa, refresca /matriz y /validar.

T9) Frontend: Tab Prerrequisitos (sub-feature prerrequisitos/).
    - Selector arriba: carrera > plan (default plan vigente).
    - Lista de asignaturas agrupadas por periodo (collapse por periodo).
    - Click en asignatura: panel lateral derecho con:
      * Lista de prerrequisitos actuales (chip con X para quitar).
      * Selector para agregar nuevo prerrequisito, filtrado a asignaturas del mismo
        plan en periodos con numero < numero del periodo de la asignatura.

T10) Frontend: limpieza.
    - Eliminar configuracion/academico/cursos/ si existe.
    - Eliminar configuracion/academico/turnos/ si existe.
    - Actualizar configuracion/routes.jsx eliminando referencias.
    - Si carreras/ o materias/ tenían código legacy que no se reutilizó, eliminarlo.

Estilo y patrón:
- Componentes Ant Design solamente.
- Replicar patrones de modules/academico/calificaciones/ (consistencia visual).
- Color carreras.color_hex como acento en headers del detalle de plan.
- Tablas size="middle". Mensajería con notification de Ant Design.
- Spinners de carga durante fetch.
- Mensajes de error específicos según respuesta del backend.

Restricciones:
- Cero ALTER TABLE.
- Validación crítica en backend; en frontend solo UX previa al POST.
- Soft delete: frontend nunca muestra registros con deleted_at !== null.
- Cada acción RBAC verificada antes de mostrar el botón correspondiente.
- Cualquier duda sobre estilos o patrones: revisa modules/academico/calificaciones/
  antes de inventar.

Empieza con T2.
```