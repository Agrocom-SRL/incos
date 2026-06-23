# Módulo de Asistencia — diseño e implementación por fases

> Estado: **Fase 1 implementada (andamiaje + RBAC), resto por fases**. Define cómo
> encaja la asistencia estudiantil como **ítem de menú de Académico** (gemelo de
> Calificaciones), su estructura por capas en el frontend y backend, la metodología
> de separación hook/estado/provider e inyección de dependencias, y el RBAC.
> No introduce versiones V2/beta (ver `CLAUDE.md`).
>
> Fuentes: `01-schemas/17-asistencias-licencias.sql`, documentación oficial del
> instituto (`/Users/miguel/Documents/incos/`), `docs/guias/activacion-cursado-horarios-calificaciones.md`
> §5.4, `docs/referencia/matriz-permisos-sistema.md`.

---

## 1. Decisión arquitectónica

La asistencia es **un único ítem de menú dentro de Académico (ACA)**, gemelo de
Calificaciones — **no** un dominio propio ni un menú con submenús. Igual que
Calificaciones agrupa muchas pantallas bajo un solo ítem (mis-cursos, cuaderno,
consolidado, política), Asistencia agrupa sus pantallas como **páginas** del mismo ítem:

```
Sidebar
 └─ Académico
     ├─ Calificaciones
     ├─ Asistencia                ← ítem ACA-ASI (gemelo de Calificaciones)
     │   ├─ Registro diario       (mis cursos → planilla diaria; toma del docente)
     │   ├─ Clases no dictadas    (cancelaciones del dictado por asignación docente)
     │   ├─ Consolidado %         (porcentaje de asistencia por estudiante/curso)
     │   └─ Licencias estudiantiles (página dentro de Asistencia)
     └─ …
```

**Por qué ítem de Académico y no dominio propio:** el registro oficial del instituto
(`registro pedagogico2026.xlsx`) y la planilla (`FORMATO PLANILLAS DE ASISTENCIA
2026.xlsx`) tratan asistencia y notas como dos planillas hermanas del mismo
docente/curso/bimestre. Como Calificaciones ya vive bajo Académico, Asistencia (su
gemela) vive al lado, reutilizando exactamente su patrón. El reporte transversal
existente (`reportes.asistencia`, dominio REP) se mantiene aparte.

**Patrón de implementación interno = Calificaciones.** El *Registro diario* reutiliza
el flujo del docente de Calificaciones: entrada por "mis cursos" con `viewStack`
(coordinación / propio) y `useRouteViewMode`, contexto de **bimestre EN_CURSO** como
cuaderno activo. Módulo de referencia: `academico/calificaciones`.

---

## 2. Metodología — capas, separación de hooks e inyección de dependencias

Esta sección es la guía de **cómo** se implementa (replica Calificaciones/Horarios) y
está reflejada en los skills `incos-frontend-module`, `incos-backend-module`,
`incos-ui-system`.

### 2.1 Frontend — flujo y separación de capas

```
routes.jsx (permiso+accion+menu)
   → connector lazy (delgado: import + <Page/>)
      → page (UI pura; consume hooks)
         → hooks (lógica)            + components (Atomic Design)
            ├─ hooks/api/*      fetch puro al use-case factory (carga/persistencia)
            ├─ hooks/state/*    estado de pantalla (load/error/edición local de celda)
            └─ context/ + providers/  provider DELGADO que ensambla el hook y publica contexto
```

Separación de hooks (regla, no opcional):
- **`hooks/api/`** — habla con el backend (vía use-case factory). No tiene estado de UI.
  Ej.: `useMisCursosAsistenciaApi`, `usePlanillaAsistenciaApi`, `useBulkAsistenciaApi`.
- **`hooks/state/`** — estado de una pantalla/celda (transitorio, sin persistir).
  Ej.: `usePlanillaAsistenciaState`, `useMarcaCeldaState` (gemelo de `useNotaAutosave`).
- **`context/` + `providers/`** — el provider **ensambla** el hook de API y publica el
  contexto; es delgado (no contiene lógica de negocio). Ej.: `AsistenciaAutosaveProvider`
  (gemelo de `CuadernoAutosaveProvider`): registra celdas modificadas, recolecta el lote
  y lo guarda. Los consumidores usan `useAsistenciaAutosaveRegistry` / `…FooterState`.
- **`config/`** — `ASISTENCIA_VIEW_STACK` / `ASISTENCIA_LANDING_STACK`.
  **`utils/`** — `asistenciaPermisos.js`, `asistenciaPaths.js`, breadcrumbs, cálculos puros.

No poner lógica pesada en `pages/`; la página solo orquesta hooks y compone componentes.

### 2.2 Backend — inyección de dependencias (patrón `register*Resource`)

Cadena de capas (dependencias hacia adentro): `repository/viewRepository → use-case →
controller (delgado) → router → token`. El recurso se registra en el container con un
`registerAsistenciaResource(container)` (patrón de `horarios.container.js`):

```
registerAsistenciaResource(container):
  1. (servicios del dominio si aplica)
  2. use-cases:   new GetPlanillaAsistenciaUseCase({ planillaViewRepository, ..., logger })
  3. controllers: new GetPlanillaAsistenciaController({ useCase, responseFormatter })
  4. router:      buildAsistenciaRouter({ controllers, middlewares: { validateRequest } })
  5. token:       ACADEMICO_TOKENS.asistenciaRouter
```

- Controller **delgado**: extrae req, llama `useCase.execute()`, formatea respuesta.
- Use-case: **toda** la lógica (validación, integridad, negocio); recibe deps por constructor.
- Repos de solo lectura sobre vistas SQL = `*ViewRepository` (interfaz que NO extiende
  `IRepository`); se registran una vez en `repositories.container.js`.
- Montaje en `presentation/routes/index.js`:
  `router.use('/asistencia', container.resolve(ACADEMICO_TOKENS.asistenciaRouter))`.
- **Contrato front↔back:** `dataFieldName` (clave en `data:{…}` del backend) = `dataKey`
  (frontend). Ver §8.

---

## 3. Mapeo documentación oficial → modelo de datos

### 3.1 Planilla de asistencia (`FORMATO PLANILLAS DE ASISTENCIA 2026.xlsx`)

Encabezado: `CARRERA · ASIGNATURA · CÓDIGO · DOCENTE · CURSO · PARALELO · GESTIÓN · BIMESTRE`.
Grano = **una asignatura de un curso/paralelo en un bimestre** (`asignacion_docente` →
`oferta_curso`). Filas = estudiantes; columnas = días del mes. Consolida totales por estado.

| Planilla oficial | Significado | `asistencias.estado` | Persistencia |
|------------------|-------------|----------------------|--------------|
| **P** | Presente | `PRESENTE` | sí |
| **R** | Retraso | `TARDANZA` | sí |
| **F** | Falta | `AUSENTE` | sí |
| **L** | Licencia | — | **no se persiste**; cruce dinámico con `licencias` APROBADAS por inscripción+fecha |

> La UI muestra P/R/F/L (vocabulario del docente) pero persiste `PRESENTE/TARDANZA/AUSENTE`.
> La "L" se renderiza, no se guarda: la calcula la capa de lectura cruzando licencias aprobadas.

### 3.2 Registro pedagógico (`registro pedagogico2026.xlsx`)

Confirma que asistencia y calificaciones comparten contexto (docente, curso, paralelo,
gestión, bimestre) y se llenan en el mismo flujo. Refuerza reutilizar "mis cursos".

### 3.3 Calendario académico

Feriados, recesos y bimestres ya están en `actividades_calendario` (seed 20) y
`periodos_academicos`, vía `vista_base_cronograma_gestion`. La asistencia **no duplica**
estas fechas: al calcular %, un día feriado/receso es **neutro**.

### 3.4 Jerarquía de cálculo de asistencia (schema 17, autoritativa)

```
1. ¿Tocaba clase ese día? (cursos_horarios / asignacion_horarios)   NO → ignorar
2. ¿Se dictó la clase?
     a. actividades_calendario (FERIADO/RECESO)            → día neutro
     b. clases_no_dictadas para la asignación + fecha       → día neutro
3. Estado registrado: PRESENTE / TARDANZA / AUSENTE
4. ¿Licencia (estudiante) APROBADA vigente? (inscripción + fecha) → día neutro
```

---

## 4. Cadena de datos (no negociable)

```
asignaciones_docentes  (docente vigente + materia + curso)
        ▼
oferta_cursos (oferta_curso_id == "cursoId" legacy)
        ▼
matriculas_materia (id)  ──────────────►  asistencias.matricula_materia_id
        ▲
inscripciones (id) ──► licencias.inscripcion_id   (cubre TODAS las materias del rango)
```

- **`asistencias`** cuelga de `matricula_materia_id` (1 estudiante · 1 materia · 1 día).
- **`clases_no_dictadas`** cuelga de `asignacion_docente_id` (1 curso · 1 día).
- **`licencias`** (estudiante) cuelga de `inscripcion_id` (1 estudiante · rango).
- `cursoId` en payloads legacy = **`oferta_curso_id`**.

---

## 5. Frontend — estructura (gemela de `academico/calificaciones/`)

```
presentation/modules/academico/asistencia/
  routes.jsx          # ítem ACA-ASI (menu) + páginas (menu:null): mis-cursos, planilla,
                      # clases-no-dictadas, consolidado, licencias/{listar,solicitar,aprobar}
  connectors/         # lazy delgados → pages
  pages/              # MisCursosAsistenciaPage, PlanillaAsistenciaPage, …
  components/         # atoms/molecules/organisms de la grilla diaria

application/modules/academico/asistencia/
  config/             # asistenciaViewStack.js (ASISTENCIA_VIEW_STACK / LANDING_STACK)
  utils/              # asistenciaPermisos.js, asistenciaPaths.js, breadcrumbs
  hooks/api/  hooks/state/   context/  providers/   (ver §2.1)
```

- En `academico/routes.jsx`: `...asistenciaRoutes` (y se quitó `...licenciasRoutes`).
- **No** se toca `dominios/routes.jsx` (no hay dominio nuevo).
- Ítem de menú `ACA-ASI` en `/academico/asistencia`, `order: 6`, `landingStack` →
  redirect a mis-cursos. Resto de páginas con `menu: null` (se navegan desde la entrada).

### Estado Fase 1 (hecho)
Andamiaje con placeholders `UnderConstruction` en todas las páginas + `config/utils`
(viewStack, permisos, paths). `academico/licencias` eliminado. Build OK.
Connectors/pages/hooks reales: fases siguientes.

---

## 6. Backend — qué existe y qué falta

### 6.1 Ya existe (no recrear)

| Capa | Archivo |
|------|---------|
| Schema | `01-schemas/17-asistencias-licencias.sql` (asistencias, licencias, clases_no_dictadas) |
| Modelos | `models/asistencia.js`, `models/licencia.js`, `models/clase_no_dictada.js` |
| Entidades | `entities/Attendance.js`, `entities/License.js`, `entities/MissedClass.js` |
| Repositorios | `repositories/AttendanceRepository.js`, `repositories/LicenseRepository.js` |
| Interfaces | `IAsistenciaRepository.js`, `ILicenciaRepository.js`, `IClaseNoDictadaRepository.js` |
| Constantes | `domain/constants/licencias.constants.js` |

### 6.2 Falta crear (patrón = `horarios`)

```
application/use-cases/asistencia/   GetMisCursosAsistencia, GetPlanillaAsistencia,
                                    BulkRegistrarAsistencia, RegistrarClaseNoDictada,
                                    GetConsolidadoAsistencia, {Crear,Aprobar,Listar}Licencia
application/mappers/asistencia/      PlanillaAsistenciaPresentationMapper (P/R/F/L + neutros)
presentation/controllers/asistencia/ presentation/routes/asistencia.routes.js
presentation/validators/asistencia/
infrastructure/repositories/views/   *Asistencia*ViewRepository (planilla, consolidado)
infrastructure/container/modules/academico/asistencia.container.js (registerAsistenciaResource)
```
Montar router en `presentation/routes/index.js`.

### 6.3 Endpoints (REST + RBAC)

| Método · Ruta | Permiso · Acción |
|---------------|------------------|
| `GET /asistencia/mis-cursos` | `academico.asistencia.registro.ver` · LISTAR |
| `GET /asistencia/cursos/:asignacionId/planilla?desde&hasta` | `academico.asistencia.registro.cuaderno` · LISTAR |
| `PUT /asistencia/cursos/:asignacionId/planilla` | `academico.asistencia.registro.cuaderno` · EDITAR |
| `GET /asistencia/consolidado?ofertaCursoId` | `academico.asistencia.consolidado.ver` · LISTAR |
| `GET /asistencia/clases-no-dictadas` | `academico.asistencia.clase_no_dictada.ver` · LISTAR |
| `POST /asistencia/clases-no-dictadas` | `academico.asistencia.clase_no_dictada.ver` · CREAR |
| `GET /asistencia/licencias` | `academico.asistencia.licencia.ver` · LISTAR |
| `POST /asistencia/licencias` | `academico.asistencia.licencia.crear` · CREAR |
| `PUT /asistencia/licencias/:id/decision` | `academico.asistencia.licencia.aprobar` · APROBAR |

---

## 7. Licencias de docentes (dominio Docentes) — alimentan clases no dictadas

El modelo actual **no** tiene licencias de docente (solo permisos `docentes.licencia.*`
sembrados; el schema 17 las dejaba "para módulo futuro RRHH"). Decisión:

- **Crear tabla nueva `licencias_docentes`** (FK `docente_id`, fechas, motivo, estado
  PENDIENTE/APROBADA/RECHAZADA/CANCELADA) + entidad `TeacherLicense` + constantes + CRUD.
  Es **cambio de schema** ⇒ DDL/seed en archivos; ejecución en BD con aprobación.
- Vive en el **dominio Docentes (DOC)**, reutilizando permisos `docentes.licencia.*`.
  **Asistencia las CONSUME** para las clases no dictadas.
- Relación licencia-docente aprobada → `clases_no_dictadas` (autogenerar filas al aprobar
  vs cruce dinámico en el cálculo): **se decide en su fase (Fase 5/6)**.

---

## 8. Vistas SQL — reutilizar, no duplicar (`03-views/`)

| Necesidad | Estrategia |
|-----------|-----------|
| "Mis cursos" del docente | **Reutilizar** la base de mis-cursos de Calificaciones (`asignacion_docente` vigente → `oferta_curso`). |
| Roster del curso | **Reutilizar** `99`–`101` (`vista_base_matricula_inscripcion_*`). |
| Planilla diaria (roster × días + neutros) | Vista final delgada: roster (`100/101`) ⋈ `asistencias` por rango ⋈ `licencias` APROBADAS ⋈ `actividades_calendario` ∪ `clases_no_dictadas`. |
| Consolidado % | Agregación sobre la planilla: PRESENTE/TARDANZA/AUSENTE; días neutros fuera del denominador. |

Cruce de licencias y días no dictados en la vista/aplicación (sin `licencia_id` en
`asistencias`, decisión del schema 17). **Cambios de schema/datos requieren aprobación.**

### Contrato front ↔ back (dataKey = dataFieldName)

| Concepto | Campo |
|----------|-------|
| Matrícula materia | `matriculaMateriaId` |
| Estudiante (nombre) | `estudianteNombre` (orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES — `buildFullName`) |
| Fecha de clase | `fechaClase` |
| Estado | `estado` (`PRESENTE`/`TARDANZA`/`AUSENTE`) |
| Día neutro (motivo) | `neutro` (`FERIADO`/`RECESO`/`CLASE_NO_DICTADA`/`LICENCIA`) |
| Render planilla | `marca` (`P`/`R`/`F`/`L`) derivada en mapper |

---

## 9. RBAC — permisos (seeds por módulo, prefijo `academico.asistencia.*`)

Los seeders se reorganizaron a **por módulo** (sin ids correlativos, refs por código;
ver `docs/referencia/matriz-permisos-sistema.md`). Asistencia vive en el archivo del
módulo Académico: `02-seeders/58-seed-permisos-aca.sql` (permisos + acciones + grants).

| codigo | grupo_ui | ruta_sidebar | acciones |
|--------|----------|--------------|----------|
| `academico.asistencia.registro.ver` | aca_asi_registro | `/academico/asistencia` | LISTAR, DETALLE |
| `academico.asistencia.registro.cuaderno` | aca_asi_registro | `/academico/asistencia/mis-cursos` | LISTAR, EDITAR |
| `academico.asistencia.clase_no_dictada.ver` | aca_asi_cnd | `/academico/asistencia/clases-no-dictadas` | LISTAR, CREAR, EDITAR |
| `academico.asistencia.consolidado.ver` | aca_asi_consolidado | `/academico/asistencia/consolidado` | LISTAR, EXPORTAR |
| `academico.asistencia.licencia.ver` | aca_asi_licencias | `/academico/asistencia/licencias/listar` | LISTAR, DETALLE |
| `academico.asistencia.licencia.crear` | aca_asi_licencias | `…/licencias/listar` | CREAR |
| `academico.asistencia.licencia.aprobar` | aca_asi_licencias | `…/licencias/listar` | APROBAR |

- **Licencias estudiantiles**: renombradas desde `academico.licencia.*` →
  `academico.asistencia.licencia.*` (en el mismo archivo de módulo).
- **Asignación a roles** (mismo archivo, INSERT roles_permisos por código): Registro/planilla
  → DOCENTE (propio, LISTAR+EDITAR) + coordinación (RECTOR, DIR_ACADEMICO, SEC_ACADEMICA).
  Clases no dictadas → DOCENTE + coordinación. Licencias → solicitar (CREAR) secretaría/
  estudiante; aprobar (APROBAR) coordinación. Consolidado → coordinación + DOCENTE.
  ADMIN_SISTEMA hereda todo por vista (sin filas).
- Coherencia de 3 capas (`incos-rbac`): mismo `permiso`+`accion` en ruta frontend, controles
  UI (`ActionButton`/`TableActions`/`PermisoGuard`) y `verificarPermiso` backend. Sidebar = LISTAR.

> Las tablas `permisos`/`permiso_acciones`/`roles_permisos` se vacían y resiembran; hasta
> sembrar, el ítem Asistencia permanece **oculto** (el sidebar filtra por LISTAR).

---

## 10. Roadmap por fases (un cambio por fase)

1. **✅ Fase 1 — Andamiaje + RBAC:** ítem ACA-ASI + páginas placeholder; `config/utils`;
   licencias reubicadas; seeds RBAC por módulo con `academico.asistencia.*`. (Hecho.)
2. **Fase 2 — Backend lectura** (en curso):
   - ✅ **Mis cursos + Coordinación** (page-driven): backend `GET /asistencia/mis-cursos`,
     `GET /asistencia/coordinacion/docentes` (reusa el use-case/controller de coordinación de
     Calificaciones) y `…/coordinacion/docentes/:docenteId/cursos`. `GetMisCursosAsistenciaUseCase`
     (delgado) + `asistencia.routes.js` + `asistencia.container.js` + router montado.
     Frontend: `CoordinacionAsistenciaPage` (elegir docente, inline para admin vía landingStack) +
     `MisCursosAsistenciaPage` (cards de curso; redirect directo para rol docente) + connectors +
     `AsistenciaRepository`/use-cases/factory + hooks. Permiso nuevo
     `academico.asistencia.registro.coordinacion` (admin; docente entra a sus cursos). Build + DI verificados.
   - ⏳ **Planilla diaria** + **Consolidado %**: requieren vistas SQL nuevas (reusar `99`–`101`),
     `*ViewRepository`, use-cases, mappers (P/R/F/L + neutros). SQL en archivos + validar en BD.
### 3.5 Refinamiento del modelo `asistencias` (marca ↔ sesión)

Ajuste de grano (no es versión ni V2): la marca de asistencia **cuelga de la sesión**,
no se redefine cada vez.

- **`asistencias` ya NO almacena `fecha_clase` ni `hora_clase`.** Eran redundancia
  derivable: la fecha/hora viven en `sesiones_clase` (`sesion_clase_id → sesiones_clase.fecha`
  / `hora_inicio`). La planilla de lectura (vista `133`) ya proyecta `sc.fecha AS fecha_clase`;
  duplicar la fecha en cada marca abría la puerta a inconsistencias (marca con fecha ≠ sesión).
  Camino de escritura: `AttendanceRepository.upsertMarcaSparse` ya no escribe esas columnas;
  `listarMarcasCursoRango` deriva la fecha con `JOIN sesiones_clase` (`sc.fecha AS fecha_clase`).
- **Bimestre DIRECTO al periodo académico, no vía `bimestres_matricula`.** La sesión se ata a
  `asignacion_docente_id` (el curso) y a `periodo_academico_id` (el bimestre,
  `periodos_academicos.division=BIMESTRE`) — mismo patrón que `evaluaciones.periodo_academico_id`
  en Calificaciones, que mantiene coherentes las dos planillas hermanas. Gestión y `numero_orden`
  se derivan del periodo, no se duplican. `bimestres_matricula` queda fuera de esta cadena.
- **Modelo SPARSE:** PRESENTE es implícito (no se persiste); solo filas AUSENTE/TARDANZA. La
  existencia de la **sesión** (no de las marcas) prueba el día tomado y da el denominador del %.
- **Orden de creación en el schema:** `sesiones_clase` se crea **antes** que `asistencias`
  (FK `asistencias.sesion_clase_id → sesiones_clase.id`); en ejecución por partes / MariaDB el
  orden inverso da error `#1824 Failed to open the referenced table`.

3. **✅ Fase 3 — Backend toma de asistencia (modelo `sesiones_clase`):** implementado.
   - **Modelo revisado**: tabla `sesiones_clase` (1 curso × 1 fecha) gobierna día tomado
     (dot + denominador) y cierre/reapertura (estado ABIERTA/CERRADA); `asistencias` SPARSE
     (solo AUSENTE/TARDANZA; PRESENTE implícito). `asistencias.sesion_clase_id` cuelga de la sesión.
   - **Vistas SQL nuevas** (delgadas, patrón 87/114; pendientes de ejecutar en BD):
     `132 vista_base_asistencia_sesion_dia_tomado` (días tomados),
     `133 vista_base_asistencia_planilla_celda` (roster 110 × sesiones × licencias aprobadas),
     `134 vista_base_asistencia_registro_estado_bimestre` (cierre derivado, patrón 114).
   - **Backend**: constantes `asistencia.constants.js`; modelo `sesion_clase.js`;
     repos `SesionClaseRepository` (A) + `Asistencia*ViewRepository` (B, views/) +
     `AttendanceRepository.upsertMarcaSparse`; use-cases `GetCalendarioAsistencia`,
     `GetPlanillaAsistenciaSemanal`, `BulkRegistrarAsistencia`, `Cerrar/ReabrirRegistroAsistencia`,
     `CrearSesionEspecial`; mapper `PlanillaAsistenciaPresentationMapper` (P/R/F/L + neutros);
     util `asistenciaCalendario` (expansión día-de-semana → fechas, lógica de app) y
     `asistenciaCursoAccess` (acceso docente/coordinación). Endpoints bajo
     `academico.asistencia.registro.cuaderno` (LISTAR/EDITAR):
     `GET cursos/:id/calendario`, `GET/PUT cursos/:id/planilla`,
     `POST cursos/:id/registro/{cerrar,reabrir}`, `POST cursos/:id/sesiones-especiales`.
     DI en `asistencia.container.js` + `repositories.container.js`. ESLint limpio.
4. **✅ Fase 4 — CRUD Licencias estudiantiles:** implementado (backend + frontend).
   - **Backend:** router `/asistencia/licencias` (`GET /`, `GET /:id`, `GET /inscripcion-vigente`,
     `POST /`, `PUT /:id/decision`); use-cases `Listar/GetById/Crear/Decidir/GetInscripcionVigente`;
     `LicenseRepository` ampliado con raw queries (estudianteNombre por JOIN en orden institucional,
     suma de días aprobados para tope 15/gestión, inscripción vigente vía vista 20). Solicitud nace
     PENDIENTE; aprobar/rechazar solo desde PENDIENTE. RBAC `academico.asistencia.licencia.*`. Sin
     cambio de schema ni vistas nuevas. DI verificado, lint limpio.
   - **Frontend:** listado (estilo `CarrerasList`/`DocentesList`), ficha de detalle como **página**
     (estilo `DocentesDetail`, ruta `ACA-ASI-LIC-DET` → `/licencias/:id`), solicitar como **página de
     formulario** (estilo `CarreraFormPage`, **no drawer**) con buscador de estudiante que precarga la
     inscripción vigente, bandeja de pendientes, y decisión vía Modal de confirmación. Build OK.
   - **Pendiente futuro:** atajo inline desde la planilla (clic en fila del estudiante → solicitar con
     estudiante/rango precargados). La planilla ya cruza licencias APROBADAS como `L`; la escritura
     desde la planilla queda para iteración.
5. **Fase 5 — Licencias de docentes (DOC):** tabla `licencias_docentes` + CRUD + frontend.
6. **Fase 6 — Clases no dictadas:** CRUD + consumo de licencias docentes (decidir autogenerar vs cruce).
   - **Entrada decidida (2026-06-17):** **reutilizar la página de Calendario** como superficie de
     marcado (ya es admin-only y pinta los días de clase): un clic en un **día de clase** abre un drawer
     "marcar como no dictada" (gemelo inverso de la sesión especial) que escribe en `clases_no_dictadas`.
     La ruta dedicada `ACA-ASI-CND` queda **delgada** (listado/auditoría), sin duplicar el calendario.
     Tabla `clases_no_dictadas` ya existe → sin cambio de schema (licencias docentes = Fase 5).
7. **Fase 7 — Registro diario funcional:** hooks api/state + provider autosave + grilla P/R/F/L (gemelo cuaderno).
8. **Fase 8 — Consolidado %:** vista de agregación + frontend, respetando jerarquía §3.4.
9. **Fase 9 — Verificación cruzada:** `dataKey`=`dataFieldName`; cálculo %; orden de nombres; rol sin permiso (403 + sidebar oculto).
