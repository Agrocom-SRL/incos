# Institucional → Gestión actual + Cronograma — estado y plan por etapas

> **Documento de traspaso entre iteraciones.** Resume contexto, permisos, endpoints, estructura
> de páginas y **en qué punto continuar**. Última actualización: 2026-06-10.
> Reglas del repo: `CLAUDE.md` + skills `.claude/skills/` (incos-rbac, incos-frontend-module,
> incos-backend-module, incos-ui-system, incos-vistas-y-evolucion). Memoria: `gestion-actual-fases`.

---

## 1. Objetivo y contexto

Módulo **Institucional → Gestión actual** (`/institucional/actual`): panel de la gestión vigente
(KPIs + cronograma académico + línea de bimestres) y sus acciones. Se construye **por fases, con
páginas por propósito** (no monolítica). El **cronograma** quedó **integrado dentro de Gestión actual**
(se eliminó el ítem "Cronogramas" del sidebar y su directorio).

**Dos recursos distintos (no confundir):**
- **Catálogo maestro `actividades`** (seed `02-seeders/17`): actividades reutilizables entre gestiones
  (`nombre`, `descripcion`, `tipo` ENUM, `es_destacada`, `icono`). **No** se borra al quitarla del calendario.
- **`actividades_calendario`** (seed `02-seeders/20`): instancias con **fechas** ligadas a un **periodo**
  (`periodo_academico_id`) y opcionalmente a una actividad maestra (`actividad_id`, FK `ON DELETE SET NULL`).
  Si `fecha_fin` es NULL ⇒ **actividad de todo el día**.

Cadena de datos: `gestiones` → `periodos_academicos` (PLAN, BIM1–BIM4, CLAU) → `actividades_calendario`
(+ `actividades` catálogo). La **gestión vigente** se resuelve con `CalificacionContextoRepository.obtenerContextoVigente()`.

---

## 2. Permisos (RBAC) — seeds 54/55/56

| id | permiso | acciones | roles (seed 55) | uso |
|----|---------|----------|-----------------|-----|
| 67 | `institucional.gestion.actual` | LISTAR, **EDITAR** | 2,3,5 (ADMIN deriva) | Panel (LISTAR) + Control de bimestres (EDITAR) |
| 68 | `institucional.gestion.cronograma` | LISTAR, **DETALLE**, CREAR, EDITAR, **ELIMINAR** | 2,3,5 | CRUD + **ficha** de actividades **de calendario** |
| — | `institucional.actividad` (**A CREAR en Fase B**) | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR | 2,3,5 | CRUD del **catálogo maestro** |

- La acción **EDITAR del 67** y **ELIMINAR del 68** fueron añadidas a seeds 55/56 (ids: 56→257,258; 55→649-651,652-654).
- Endpoints de lectura `gestion-bimestres` y `gestion-cronograma` usan `verificarPermisoCualquiera`
  (`academico.calificacion.gestion_bimestres` **o** `institucional.gestion.actual` LISTAR).
- El CRUD de calendario usa `verificarPermiso('institucional.gestion.cronograma', X)`.
- **Borrar maestra ≠ borrar del calendario** (permisos separados, requisito del usuario).

---

## 3. Backend — endpoints implementados

Todo montado en `presentation/routes/calificaciones.routes.js` (router de Calificaciones, prefijo `/v1/calificaciones`).
Componentes en `application/use-cases/academico/`, `presentation/controllers/academico/calificaciones/`,
repos en `infrastructure/repositories/`, DI en `container/modules/academico/calificaciones.container.js` + tokens.

| Método | Ruta | Permiso | Use case / nota |
|--------|------|---------|-----------------|
| GET | `/gestion-cronograma` | 67/gb LISTAR | `GetCronogramaGestionUseCase` — panel: periodos+actividades agrupados + próximas |
| GET | `/cronograma` | 68 LISTAR | `ListCronogramaAdminUseCase` — `{ gestion, actividades(flat), periodos, catalogo }` |
| GET | `/cronograma/:id` | 68 **DETALLE** | `GetActividadCronogramaUseCase` — ficha + precarga del form (incluye `periodoColor`, `estado`) |
| POST | `/cronograma` | 68 CREAR | `CreateActividadCronogramaUseCase` (usa `CalendarActivityRepository`) |
| PUT | `/cronograma/:id` | 68 EDITAR | `UpdateActividadCronogramaUseCase` |
| DELETE | `/cronograma/:id` | 68 ELIMINAR | `DeleteActividadCronogramaUseCase` (soft delete) |
| GET | `/gestion-bimestres/periodos` | 67/gb LISTAR | `GetPeriodosGestionUseCase` — periodos/etapas de la gestión vigente (calendario) |
| PUT | `/gestion-bimestres/periodos/:id/fechas` | 67/gb EDITAR | `UpdatePeriodoFechasUseCase` — edita fechas inicio/fin (reusa `AcademicPeriodRepository.update`) |
| POST | `/gestion-bimestres/periodos` | 67/gb EDITAR | `CreatePeriodoEtapaUseCase` — alta de etapa (división OTRO) |
| DELETE | `/gestion-bimestres/periodos/:id` | 67/gb EDITAR | `DeletePeriodoEtapaUseCase` — baja de etapa no estructural (protege bimestres/PLAN/CLAU) |

- Periodos: use cases en `application/use-cases/academico/{Get,Update,Create,Delete}Periodo*UseCase.js`, controllers en
  `presentation/controllers/academico/calificaciones/{get,update,create,delete}-periodo*.controller.js`, validators
  en `presentation/validators/academico/periodos-gestion.validator.js`, DI en `calificaciones.container.js`.
  Reutilizan `AcademicPeriodRepository` (CRUD heredado de BaseRepository) y `CronogramaGestionRepository.obtenerPeriodosGestion` (lectura).

- Vista SQL delgada **`03-views/129-vista-base-cronograma-gestion.sql`** (`vista_base_cronograma_gestion`) para la lectura del panel.
- `CronogramaGestionRepository`: `obtenerActividadesGestion` (vista), `obtenerActividadesAdmin`,
  `obtenerActividadAdminPorId`, `obtenerPeriodosGestion`, `obtenerCatalogoActividades`, `obtenerAdminVigente`.
- **Catálogo maestro**: ya existen `ActivityRepository`, modelo `actividad.js`, `ActivityMapper`, entidad `Activity`,
  token `REPOSITORIOS_TOKENS.activityRepository`. ENUM tipos en `domain/constants/gestion.constants.js`
  (`TIPOS_ACTIVIDAD_VALUES`, 10 valores). **Falta** use cases/controllers/router/permiso (Fase B).

---

## 4. Frontend — estructura

Módulo `presentation/modules/institucional/actual/` + `application/modules/institucional/actual/`.

**Rutas (`presentation/.../actual/routes.jsx`)** — todas con `menu: null` salvo el panel:
- `/institucional/actual` — Panel (`GestionActualConnector` → `GestionActualPage`), permiso 67 LISTAR, **único ítem de sidebar** (order 1).
- `/institucional/actual/bimestres` — Control de bimestres (67 EDITAR), acceso por botón del panel.
- `/institucional/actual/cronograma` — Admin del cronograma (68 LISTAR), acceso por botón "Gestionar".
- `/institucional/actual/cronograma/nueva` (68 CREAR) y `/cronograma/:id/editar` (68 EDITAR) — form-page.

**Páginas / componentes:**
- `pages/GestionActualPage.jsx` — KPI strip full-width + `DashboardPageShell` (Main=`CronogramaGestion`, Sidebar=`GestionActualCard`+`BimestresTimeline`).
- `components/organisms/CronogramaGestion.jsx` — Collapse por periodo + Timeline; **iconos + badges** por actividad; botón "Gestionar".
- `pages/CronogramaAdminPage.jsx` — shell `cfg-academico-workspace` (igual que Docentes): header con título primario + subtítulo, `TableListView embedded` con búsqueda. Columnas en `config/cronogramaTableColumns.jsx` (patrón Docentes): **#** numérica, **Etapa** (pill teñido con `periodoColor` propio), **Actividad** (`IdentidadCelda` + dot de tipo debajo), **Duración** (fechas con icono; sin `fecha_fin` ⇒ "todo el día") y **Acciones** con `TableActions` (**Ver/DETALLE**, Editar, Eliminar). Se eliminó la columna Estado y los `StatusPill` de tipo/estado.
  - Átomos nuevos: `components/atoms/CronogramaEtapaCell`, `CronogramaActividadCell`, `CronogramaDuracionCell`. Color de etapa vía `periodoColor` (alias `pa.color_hex` en `obtenerActividadesAdmin` + `mapActividad`).
- `pages/CronogramaActividadFormPage.jsx` (+ `connectors/CronogramaActividadFormConnector.jsx`) — form-page create/edit con shell `cfg-academico-form-workspace` (igual que CFG Académico, grid span 12). Organismo `components/organisms/CronogramaActividadFormSections`:
  1. **Etapa** (`Select` con dot de color por periodo), 2. **Actividad** (campo con botón Buscar → `CronogramaActividadSelectorModal`, estilo del selector de asignación docente), 3. switch **Personalizar nombre** → input condicional, 4. **Fecha de inicio**, 5. switch **¿Evento de un solo día?** → si NO, aparece **Fecha de fin**.
  - Átomo `CronogramaActividadSelectorField` (input + botón, compatible con `Form.Item`). El modal tiene botón "Nueva actividad" **deshabilitado** (tooltip "Fase B") hasta habilitar el catálogo maestro.
  - Estado del modal/switches en `hooks/state/useCronogramaActividadForm.js` (no en la página): `selectedActividad`, `modalOpen`, `sobrescribirNombre`, `eventoUnDia`.

- `pages/CronogramaActividadDetailPage.jsx` (+ `connectors/CronogramaActividadDetailConnector.jsx`) — **ficha** (permiso DETALLE), ruta `/institucional/actual/cronograma/:id`. `DetailInfoCard` + `DetailField`: código, etapa (pill de color), tipo (dot+texto teñido), estado, origen del nombre, destacada, duración. Hook `hooks/state/useCronogramaActividadDetail.js` (reusa `GET /:id`).

**Pendiente del form (Fase B):** "Crear nueva actividad" desde el modal debe lanzar a una form-page del **catálogo maestro** con el mismo estilo y, al volver, reabrir el form de calendario con el borrador. Hoy el botón está deshabilitado.

**Hooks (`application/.../actual/hooks/`):**
- `api/useGestionActivacionApi.js` (panel: gestión vigente, bimestres, cronograma), `api/useCronogramaAdminApi.js` (list/byId/crear/actualizar/eliminar).
- `state/useGestionActualState.js`, `state/useControlBimestresState.js`, `state/useCronogramaAdminState.js` (tabla+borrado+navegación), `state/useCronogramaActividadForm.js` (form).
- `config/paths.js` (`actualPaths`: root, bimestres, cronograma, cronogramaNueva, cronogramaEditar).
- `config/actividadPill.js` (tipo/estado → label + clase pill), `utils/cronogramaGestion.js` (mapeo lectura).

**Infra/UI compartido:**
- Repo frontend: métodos en `infrastructure/repositories/CalificacionRepository.js` (`listarCronogramaAdmin`,
  `obtenerActividadCronograma`, `crear/actualizar/eliminarActividadCronograma`); endpoints en `infrastructure/api/endpoints.js` (`CRONOGRAMA_ADMIN`, `_BY_ID`).
- **Iconos**: `infrastructure/config/icons/activityIcons.js` (`getActivityIconComponent`, `ACTIVITY_ICON_OPTIONS`) — usar `createElement` para render dinámico (regla `react-hooks/static-components`).
- **Badges**: `StatusPill` (atom) + `styles/cronograma.css` (`cronograma-pill--*`).
- **Fechas**: átomo `components/atoms/FieldDatePicker` (devuelve dayjs → formatear a `YYYY-MM-DD` en submit).

---

## 5. Estado por etapas

- ✅ **Panel Gestión actual** (KPIs + cronograma + bimestres) + Control de bimestres (sin sidebar).
- ✅ **CRUD cronograma (calendario)** backend + frontend (lista + form-page + borrado).
- ✅ **Cronograma v2 Fase A**: form-page (no modal), `FieldDatePicker`, **badges + iconos** en lista y panel, `GET /cronograma/:id`.
- ⏳ **Cronograma v2 Fase B** (SIGUIENTE — orden elegido "calendario primero, luego maestras + selector"):
  1. **Backend catálogo maestro** `actividades`: use cases List/GetById/Create/Update/Delete sobre `ActivityRepository`,
     controllers (estilo `configuracion/materias`), router `actividades.routes.js` montado en `routes/index.js` como
     `/v1/actividades`, DI + tokens, validators. **Permiso nuevo `institucional.actividad`** en seeds 54/55/56
     (LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR; roles 2/3/5).
  2. **Frontend catálogo**: lista `ActividadesMaestrasPage` (TableListView + StatusPill tipo + icono + destacada) y
     form-page `ActividadMaestraFormPage` (nombre, tipo pillSelect, icono Select de `ACTIVITY_ICON_OPTIONS`,
     es_destacada switch, descripción). Repo frontend `ActividadRepository` + endpoints + hooks api/state.
     Rutas `/institucional/actual/actividades` (+ `/nueva`, `/:id/editar`, `menu: null`). Botón de acceso desde el cronograma.
  3. **Selector** `CatalogoActividadSelectorModal` (estilo `OfertaParaleloAulaSelectModal` + `SelectableDataList`):
     buscador + **filtro por tipo y destacadas** + **multi-selección** + **crear maestra inline** (→ `CreateActividad`),
     integrado en el form de calendario (reemplaza el Select simple) y/o flujo bulk "Agregar del catálogo".
- ✅ **Gestión de bimestres/etapas (Fase C)**: `ControlBimestresPage` rediseñada (shell `cfg-academico-workspace`
  como las hermanas) con **calendario anual** (`BimestresCalendarBoard` + átomos `CalendarMonthMini`/`PeriodoRangePicker`)
  que pinta cada periodo con su color, **aside de configuración** (`BimestresConfigAside`) con edición de fechas en vivo
  (`PUT .../periodos/:id/fechas`), **CRUD de etapas** (`EtapaFormModal` + POST/DELETE) y **habilitar inicio de clases**
  (`IniciarGestionCard`); el cierre queda en `CerrarBimestreCard`. Hook `useControlBimestresState` ampliado
  (`usePeriodosGestionApi`, util `periodosCalendario.js`). RBAC: reusa 67 EDITAR (sin permiso nuevo).
  Pendiente: cierre real de bimestre (stub) y edición de fechas de la **gestión** misma.
- ⏳ **Cierre real de bimestre**: `cerrarBimestreGestion` es stub "en preparación" (falta consolidación de notas).

---

## 6. Pasos manuales pendientes (entorno del usuario)

> El usuario aplica cambios de **schema/datos** (no ejecutar SQL contra su BD sin su aprobación).

1. **Aplicar la vista**: `mysql ... < backend/database/03-views/129-vista-base-cronograma-gestion.sql`.
2. **Re-seed** (trunca + corre seeds 54/55/56) para activar EDITAR del 67, el 68 completo (incl. **DETALLE** y ELIMINAR)
   y —tras Fase B— el permiso `institucional.actividad`. **Sin re-seed, la ficha y el botón "ver" dan 403.**
3. **Reiniciar backend** al agregar rutas/DI nuevas.

---

## 7. Convenciones / decisiones clave

- Páginas por propósito; `menu: null` para sub-páginas (acceso por botón, no sidebar).
- `dataKey` (front) = `dataFieldName` (back). Fechas: dayjs → `YYYY-MM-DD`.
- RBAC coherente en 3 capas (ruta, UI `ActionButton`, `verificarPermiso` backend).
- Vistas SQL delgadas, sin sufijos V2/beta (regla `incos-vistas-y-evolucion`).
- Badges: mismo estilo que materias (`StatusPill` + clases). Iconos catálogo → AntD (`activityIcons.js`).
- Verificar siempre con `npx eslint` (front) y `node --check` (back) en archivos tocados.
