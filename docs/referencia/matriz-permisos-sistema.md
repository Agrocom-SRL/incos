# Matriz de Permisos - Instituto INCOS
## Ultima actualizacion: 2026-08-10

Documento de auditoria funcional (frontend + backend + seeds) sobre permisos por accion.

> **Nota de verificación contra seeds (2026-10-20) — leer antes de usar esta matriz.**
> La matriz describe la **intención de negocio** y el diseño RBAC; el estado **real en BD** lo
> fija `backend/database/02-seeders/`. Numeración vigente de seeds: `55` roles → `56` usuarios-admin
> → `57` titulación-modalidades (catálogo, no RBAC) → permisos por módulo: `58` MAT · `59` ACA · `60` DOC ·
> `61` FIN · `62` INST · `63` REP (solo conservado como historial: módulo disuelto) · `64` CAP · `65` TIT ·
> `66` CFG · `67` SEG(+SYS). Las menciones a «seed 54/55/56», «57-64» o «65 = CAP / 66 = TUT» en los
> changelogs son **históricas** y ya no corresponden a los archivos.
>
> **Divergencias conocidas matriz ↔ seeds:**
>
> 1. **«Seguimiento académico» oculto (2026-08-03, seed 59).** Los permisos `academico.avance`,
>    `academico.desercion`, `academico.acompanamiento.{alerta,sesion,panel}` (con sus acciones,
>    asignaciones a roles y grupos UI `aca_avance`, `aca_desercion`, `aca_acompanamiento`) se marcan
>    `activo=0, deleted_at='2026-08-03'`. Efecto: `/avance-academico`, `/desercion` y `/acompanamiento`
>    responden **403 a todos los roles, incluido ADMIN_SISTEMA** (hereda por `vista_*_activas`, que filtra
>    activo y `deleted_at`), aunque las secciones «ACA - Avance académico y Deserción» y la fila
>    «Avance académico» de esta matriz los describan como vivos. El código (backend y frontend,
>    incluida la agrupación `/academico/seguimiento`) sigue existiendo; la **intención de negocio se
>    conserva** y se rehabilita poniendo `activo=1, deleted_at=NULL` en esas filas del seed 59.
> 2. **Traspasos y Transitabilidad** (`academico.trazabilidad.traspaso.*` / `.transitabilidad.*`):
>    apagados desde 2026-06-24 (seed 59); sus menús se dieron de baja (la función migrará a una pestaña de
>    la ficha de Inscripción). Las filas de esta matriz que los listan son plan, no estado vivo.
> 3. **Nivelaciones** (`academico.nivelacion.{ver,inscribir,aprobar}`): rehabilitadas 2026-08-07; el seed
>    usa las acciones propias `ver/inscribir/aprobar` como códigos de permiso, no el vocabulario genérico
>    `VER/CREAR/APROBAR` de la tabla «Nivelaciones, Trazabilidad, Historial».
> 4. **Permisos sembrados que la matriz no lista como fila propia:** `academico.calificacion.centralizador`,
>    `academico.asistencia.registro.coordinacion`, `docentes.licencia.aprobar` (solo en changelog),
>    `matricula.admision.crear`, `matricula.admision.editar`, `matricula.documento.ver`,
>    `finanzas.aporte`, `finanzas.pago.reporte.estudiante`, `finanzas.pago.reporte.gestion`,
>    `institucional.oferta.gestionar`, `institucional.gestion.pasadas`. La fuente de verdad es el seed.
> 5. **Códigos que la matriz cita y ya no existen** (renombrados o retirados): `tutorias.*` → `titulacion.*`
>    y `academico.acompanamiento.*`; `reportes.*` (módulo disuelto 2026-07-29);
>    `docentes.supervision.{evaluar,reporte,pasantia.evaluar}` (reemplazados por el único
>    `docentes.supervision.ficha`); `academico.historial.{folio,validar}` (reemplazados por `academico.libro` y
>    `titulacion.*`).
> 6. **Seed 63 (REP):** conserva solo el historial; no siembra permisos activos.

## Changelog 2026-08-10 — TIT: Requisito 3 reemplazado por "Seguimiento de tutorías a docentes" (sin permisos nuevos)

La planilla "10 en 10" (bimestral, dependía de Matrícula/`periodo_numero=3`,
sin correspondencia con ningún documento físico real del instituto) se
reemplazó por un reporte administrativo A LOS DOCENTES (réplica de
`PLANILLA DE SEGUIMIENTO DE TUTORIA 2026.xlsx`), roster-driven desde
`proyectos_grado`/`integrantes_proyecto`, filtro mes+año. **No se agregan
permisos ni acciones**: reutiliza `titulacion.proyecto` LISTAR/EXPORTAR,
mismo criterio que la extensión 2026-07-31 que reemplaza.

| Endpoint | Acción | `dataFieldName` |
|---|---|---|
| `GET /proyectos-grado/reportes/seguimiento-tutoria-docentes` | LISTAR | `seguimientoTutoriaDocentes` |
| `GET /proyectos-grado/reportes/seguimiento-tutoria-docentes/export` | EXPORTAR | binario (.xlsx) |

Vistas SQL reescritas en el mismo número (no se crearon vistas nuevas):
`180-vista-base-tutoria-bitacora-mes-fila.sql` (antes
`...-bimestre-fila`), `181-vista-tutoria-seguimiento-docentes.sql` (antes
`...-planilla-avance-tercer-anio`). Endpoints, use cases, controllers,
validator y builder Excel (`excel/titulacion-seguimiento-docentes/`, antes
`titulacion-planilla-avance/`) renombrados en consecuencia. Ver nota
"SUPERSEDIDO" en `docs/plan/titulacion-avance-y-modalidad-plan-desarrollo.md`
para el registro histórico del diseño descartado. Requisitos 1 y 2 (fila de
la entrada 2026-07-31 de abajo) NO cambiaron.

## Changelog 2026-08-02 — TIT: anulación de acta de defensa (P8) + guard anti-IDOR en satélites del proyecto (sin permisos nuevos)

`docs/plan/acta-defensa-grado-plan-desarrollo.md` (P8 re-resuelta: se
implementa; hallazgo G5 cerrado). Dos cambios independientes sobre el mismo
módulo:

1. **Anulación de acta** — `AnularActaDefensaUseCase` +
   `PATCH /proyectos-grado/:id/acta-defensa/:actaId/anular`. **No se agregan
   permisos ni acciones**: reutiliza `titulacion.proyecto`·APROBAR, mismo
   criterio que `POST /acta-defensa`.

   | Endpoint | Acción | `dataFieldName` |
   |---|---|---|
   | `PATCH /proyectos-grado/:id/acta-defensa/:actaId/anular` | APROBAR | `actaDefensa` |

   Body `{ motivo }` (3-500 caracteres). 404 si el acta no pertenece al
   proyecto; 409 si ya estaba `ANULADA`. NO revierte la transición del
   proyecto (`proyectos_grado.estado` queda igual) — decisión manual
   documentada.

2. **Guard anti-IDOR** (`proyectoGradoIntegranteGuard`, sin cambios de
   RBAC): hallazgo verificado en vivo — ESTUDIANTE podía leer por API
   directa el proyecto/satélites de OTRO estudiante (permiso grueso
   DETALLE/LISTAR, sin validación de fila). Se agregó middleware DESPUÉS de
   `verificarPermiso` en `GET /:id`, `GET /:id/bitacora`, `GET /:id/dictamenes`
   y `GET /:id/acta-defensa` (reusa `assertIntegranteActivo`, sin permisos
   nuevos). No explotable vía la UI real (usa `/mi-proyecto`, ID resuelto en
   servidor).

## Changelog 2026-08-01 — TIT: acta de defensa de grado (Iteración 1 backend, sin permisos nuevos)

`docs/plan/acta-defensa-grado-plan-desarrollo.md` (P1-P8 resueltas). Tablas
nuevas `actas_defensa` + `tribunal_acta_defensa` (DDL en
`22-modalidades-grado.sql`, pendiente de aprobación/ejecución del usuario en
BD — sin migración incremental: el módulo TIT aún no está desplegado en
servidor). **No se agregan permisos ni acciones**: los 3 endpoints nuevos
reutilizan `titulacion.proyecto` — mismo criterio que la extensión
2026-07-31 (solo se amplió el texto `nombre` del permiso).

| Endpoint | Acción | `dataFieldName` |
|---|---|---|
| `GET /proyectos-grado/:id/acta-defensa` | DETALLE | `actasDefensa` |
| `POST /proyectos-grado/:id/acta-defensa` | APROBAR | `actasDefensa` |
| `GET /proyectos-grado/:id/acta-defensa/:actaId/pdf` | EXPORTAR | binario (PDF) |

`POST` delega la transición `DEFENSA → APROBADO|REPROBADO` en
`AprobarEtapaProyectoUseCase` (T11) tras registrar el/los acta(s) — misma
máquina de estados, sin duplicarla. Anulación de acta (P8) diferida en esta
fecha, **implementada 2026-08-02** (ver changelog arriba). Iteración 2
(frontend, tab «Acta de defensa» en `ProyectoGradoDetail.jsx`) queda
pendiente.

## Changelog 2026-07-31 — TIT: formulario de modalidad, reporte de avance por carrera y planilla 10-en-10 (extensión, sin permisos nuevos)

Iteración 1 (backend) de 3 extensiones sobre el módulo TIT ya integrado
(`docs/plan/titulacion-avance-y-modalidad-plan-desarrollo.md`): Requisito 1
(formulario de elección de modalidad de graduación FMDG-1), Requisito 2
(reporte de avance de tutorías por carrera) y Requisito 3 (planilla de
seguimiento de tutoría "10 en 10", bimestral, 3er año). **No se agregan
permisos ni acciones**: los 6 endpoints nuevos reutilizan `titulacion.proyecto`
LISTAR (datos en pantalla) y EXPORTAR (descarga PDF/Excel) — mismo criterio
que `GET /modalidades` (LISTAR, catálogo de apoyo) y `GET /reportes/bitacora-mensual`
(EXPORTAR, PDF ya existente).

| Endpoint | Acción | `dataFieldName` |
|---|---|---|
| `GET /proyectos-grado/estudiantes-elegibles` | LISTAR | `estudiantesElegibles` |
| `GET /proyectos-grado/:id/formulario-modalidad/pdf` | EXPORTAR | binario (PDF) |
| `GET /proyectos-grado/reportes/avance-carrera` | LISTAR | `avanceTutoriaCarrera` |
| `GET /proyectos-grado/reportes/avance-carrera/pdf` | EXPORTAR | binario (PDF) |
| `GET /proyectos-grado/reportes/planilla-avance-tercer-anio` | LISTAR | `planillaAvanceTercerAnio` |
| `GET /proyectos-grado/reportes/planilla-avance-tercer-anio/export` | EXPORTAR | binario (.xlsx) |

Vistas SQL nuevas: `178-vista-base-tutoria-estudiante-tercer-anio`,
`179-vista-tutoria-avance-carrera`, `180-vista-base-tutoria-bitacora-bimestre-fila`,
`181-vista-tutoria-planilla-avance-tercer-anio`; ajuste aditivo (columna
`ultima_observacion`) a la vista 160 ya existente. Guard nuevo
`assertEstudianteEsTercerAnio` en `CreateProyectoGradoUseCase` (restringe la
creación de proyecto a estudiantes de 3er año, para titular e integrantes PSP).
Requisito 3 **no requirió tabla nueva**: se deriva en tiempo de lectura de
`bitacora_proyecto` + `integrantes_proyecto` + `proyectos_grado` +
`periodos_academicos`. Iteración 2 (frontend) queda pendiente.

## Changelog 2026-07-31 — rename backend TUT→TIT (Titulación) + Acompañamiento reclasificado a ACADEMICO

Ejecución del rename backend aprobado por el usuario (código en carpetas/tokens/DI;
BD sigue con los códigos VIEJOS hasta coordinar la resiembra junto con el rename
de frontend, todavía pendiente). Revierte la decisión del changelog 2026-07-29
("los CÓDIGOS tutorias.\* y el modulo TUT no cambian"): el módulo pasa de TUT a
**TIT** y los 7 códigos de proyectos de grado/pasantías pierden el prefijo
`tutorias.`. Además, los 3 códigos de Acompañamiento (que ya vivían con
`dominio='ACADEMICO'` en la tabla `permisos`, aunque bajo `modulo='TUT'` y
código `tutorias.acompanamiento.*`) se reclasifican por completo — código,
`modulo` y carpetas de código — al dominio Académico, porque sus datos (alertas
de riesgo, sesiones de refuerzo, panel) se derivan de `asignaciones_docentes` y
de las vistas del centralizador, sin ninguna FK a `proyectos_grado`/
`modalidades_grado`.

**Tabla completa de códigos — old → new** (fuente: `65-seed-permisos-tit.sql`,
antes `65-seed-permisos-tut.sql`):

| Código anterior | Código nuevo | `dominio` | `modulo` | `grupo_ui` | `ruta_sidebar` |
|---|---|---|---|---|---|
| `tutorias.titulacion.proyecto` | `titulacion.proyecto` | TITULACION | TIT | `tit_proyectos` | `/titulacion/proyectos-grado` |
| `tutorias.titulacion.bitacora` | `titulacion.bitacora` | TITULACION | TIT | `tit_proyectos` | `/titulacion/proyectos-grado` |
| `tutorias.titulacion.avance` | `titulacion.avance` | TITULACION | TIT | `tit_proyectos` | `/titulacion/proyectos-grado` |
| `tutorias.pasantia` | `titulacion.pasantia` | TITULACION | TIT | `tit_pasantias` | `/titulacion/pasantias` |
| `tutorias.pasantia.empresa` | `titulacion.pasantia.empresa` | TITULACION | TIT | `tit_pasantias` | `/titulacion/pasantias` |
| `tutorias.pasantia.informe` | `titulacion.pasantia.informe` | TITULACION | TIT | `tit_pasantias` | `/titulacion/pasantias` |
| `tutorias.pasantia.seguimiento` | `titulacion.pasantia.seguimiento` | TITULACION | TIT | `tit_pasantias` | `/titulacion/pasantias` |
| `tutorias.acompanamiento.alerta` | **`academico.acompanamiento.alerta`** | ACADEMICO | **ACA** | `aca_acompanamiento` | `/academico/acompanamiento/alertas` |
| `tutorias.acompanamiento.sesion` | **`academico.acompanamiento.sesion`** | ACADEMICO | **ACA** | `aca_acompanamiento` | `/academico/acompanamiento/sesiones` |
| `tutorias.acompanamiento.panel` | **`academico.acompanamiento.panel`** | ACADEMICO | **ACA** | `aca_acompanamiento` | `/academico/acompanamiento/panel` |

- **Acciones y roles: SIN cambios de comportamiento**, solo de código/ubicación.
  Los 3 permisos de Acompañamiento se movieron de `65-seed-permisos-tut.sql` a
  `59-seed-permisos-aca.sql` con filas EXPLÍCITAS de `roles_permisos` (DIR_ACADEMICO
  y RECTOR control total; SEC_ACADEMICA solo `alerta` LISTAR/DETALLE; DOCENTE
  `alerta` LISTAR/DETALLE + `sesion` LISTAR/DETALLE/CREAR/EDITAR) — antes
  DIR_ACADEMICO/RECTOR llegaban por un catch-all `p.modulo = 'TUT'` que ya no
  los cubre (ACA no tiene catch-all de módulo), por eso las filas explícitas.
- **URLs de API sin cambios:** `/api/v1/proyectos-grado`, `/api/v1/acompanamiento`,
  `/api/v1/pasantias` — ninguna contenía la palabra "tutorias".
- **Carpetas de código:** `use-cases/tutorias/` → `use-cases/titulacion/` +
  `use-cases/academico/acompanamiento/`; `controllers/tutorias/` →
  `controllers/titulacion/` + `controllers/academico/acompanamiento/`;
  `mappers/tutorias/` → `mappers/titulacion/` (proyecto) + 2 archivos a
  `mappers/academico/`; `container/modules/tutorias/` → `container/modules/titulacion/`
  + `acompanamiento.container.js` a `container/modules/academico/`; tokens
  `TUTORIAS_TOKENS` → `TITULACION_TOKENS` (+ claves de acompañamiento
  fusionadas en `ACADEMICO_TOKENS`); constantes `tutorias.constants.js` →
  `titulacion.constants.js` + `academico.acompanamiento.constants.js`.
  `pasantias/` (carpetas y naming) NO se tocó — ya vivía separado.
- **Pendiente:** resiembra de `65-seed-permisos-tit.sql` + `59-seed-permisos-aca.sql`
  en BD, coordinada con el rename de frontend (rutas `/tutorias/*` →
  `/titulacion/*`, ítems de sidebar, `permiso` en `routes.jsx`).

## Changelog 2026-07-30 — Libros de registro (Fase 4, iteración 1 backend): permiso único en seed 59

Módulo nuevo contra el schema 25 (`libros_registro` + `folios_libro` +
`folio_estudiantes`; libro físico real «LIBRO LLENADO SISTEMAS 11 dic 2025»).
Backend completo montado en `/api/v1/libros` (vistas **175**
`vista_libros_registro_listado`, **176** `vista_base_libro_folio_fila`
reutilizando la 127, **177** `vista_base_libro_paralelo_estudiante` sobre las
bases 03/04; notas por materia SIN vista nueva: se leen de la **135** vía
`calificacionCentralizadorRepository`). **Pendiente BD:** ejecutar vistas
175-177 + resembrar `59-seed-permisos-aca.sql`.

- **Seed 59 (ACA):** permiso ÚNICO por ítem `academico.libro`
  («Libros de registro del centralizador»), grupo `aca_libros` (orden 22),
  ruta `/academico/libros`. Acciones: LISTAR, DETALLE, CREAR, EDITAR, APROBAR,
  EXPORTAR — **sin ELIMINAR** (un folio no se borra: se ANULA con motivo).
- **Roles:** RECTOR y DIR_ACADEMICO las 6 (firman); SEC_ACADEMICA todas menos
  APROBAR (prepara el libro, no firma). DOCENTE/ESTUDIANTE: sin filas.
- **Retirados del seed 59** (nota de reemplazo): `academico.historial.folio`
  (folio del egresado, concepto anterior al schema 25 → **reemplazado por
  `academico.libro`**) y `academico.historial.validar` (la validación de
  egreso **pasa a la Fase 5**, `tutorias.titulo.*`). La limpieza de sus rutas
  frontend (`ACA-HIS-FOLIO`/`ACA-HIS-VALIDAR` en `historial/routes.jsx`) va en
  la iteración 2, junto con la resiembra.
- **Regla de numeración (corrección 2026-07-30):** `numero_folio` es
  correlativo POR GESTIÓN cruzando TODAS las carreras (contador compartido
  1..N, asignado en transacción con FOR UPDATE); `numero_libro` se INGRESA
  cada gestión (mismo número para todas las carreras de la gestión; sin
  auto-sugerencia por carrera).

## Changelog 2026-07-30 — Supervisión docente (Fase 3, iteración 1 backend): permiso único en seed 60

Rediseño del bloque supervisión del módulo DOC contra el schema 27
(`fichas_seguimiento_clase`, «FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL»).
Backend completo montado en `/api/v1/supervision-docente` (vista **174**
`vista_supervision_fichas_listado`, reutiliza la base 51 + evaluador desde
`usuarios`). **Pendiente BD:** ejecutar vista 174 + resembrar
`60-seed-permisos-doc.sql`.

- **Seed 60 (DOC) — el archivo es hoy `60-seed-permisos-doc.sql`** (la
  numeración corrió con `57-seed-titulacion-modalidades.sql`; referencias
  antiguas a «seed 59-DOC» quedan históricas):
  - Se ELIMINAN los 5 códigos legacy sin pantalla ni backend
    (`docentes.supervision.evaluar`, `.reporte`, `.programar`, `.ficha.crear`,
    `.ficha.editar`) y su bloque de deshabilitación. Esto cierra la deuda del
    EXPORTAR huérfano de `docentes.supervision.reporte` (changelog 2026-07-29).
  - **Permiso ÚNICO por ítem de menú:** `docentes.supervision.ficha`
    («Supervisión: fichas de seguimiento en clase»), grupo `doc_supervision`
    REACTIVADO (orden 3, sale del UPDATE de deshabilitación; `doc_licencias`
    sigue apagado), ruta `/docentes/supervision`.
  - Acciones: LISTAR, DETALLE, CREAR, EDITAR, EXPORTAR — sin ELIMINAR ni
    APROBAR (la ficha realizada no se borra).
  - Roles: DIR_ACADEMICO y RECTOR con las 5 acciones; ADMIN_SISTEMA hereda por
    vista. **DOCENTE: SIN filas** — ve sus fichas por wrapper self.
- **Endpoints (permiso `docentes.supervision.ficha`):** `GET /` LISTAR ·
  `GET /:id` DETALLE · `POST /` CREAR (supervisor = usuario de la SESIÓN,
  jamás del body) · `PUT /:id` EDITAR · `GET /:id/pdf` EXPORTAR (réplica del
  formulario físico, `IncosPDFLibBase`).
- **Portal del docente (anti-IDOR):** `GET /supervision-docente/mis-fichas`
  con gate solo `authenticate` (patrón `/docentes/mis-datos`); docente resuelto
  en servidor con `resolveDocenteIdForUsuario` (403 si no es docente).

## Changelog 2026-07-29 (noche) — módulo REP disuelto; Avance/Deserción/Consolidado bajo ACA

Decisión de usuario (2026-07-29, `docs/plan/reportes-rep-diagnostico.md`): los
reportes viven con su módulo DUEÑO. Iteración 1 (backend) implementada; el
frontend (página tabs Avance/Deserción, Consolidado %, borrado de
`modules/reportes/`) es la iteración siguiente. **Pendiente BD:** ejecutar
vistas 169–173 (+ recrear 138/139/141 por columnas aditivas) y resembrar seeds
59 y 63.

- **Seed 63 (REP) = tombstone:** los 7 códigos `reportes.*` (deshabilitados
  desde 2026-06-24, nunca con backend) se retiran DEFINITIVAMENTE; el archivo
  solo conserva los DELETE de limpieza y la tabla de reemplazos (ver sección
  "REP - Reportes" abajo).
- **Seed 59 (ACA):**
  - `academico.avance` REHABILITADO (activo=1) + grupo `aca_avance`; acciones
    LISTAR/EXPORTAR. Roles: REC/DIRA (L+E), DOC/EST (L; alcance self de EST
    resuelto en servidor).
  - `academico.desercion` NUEVO (grupo `aca_desercion`, ruta `/academico/avance`
    — pestaña Deserción): LISTAR/EXPORTAR para RECTOR/DIR_ACADEMICO. Métrica
    ANUAL por estados ABANDONO/RETIRADO de `matriculas_materia`.
- **Endpoints nuevos (montados, backend completo por capas):**
  - `GET /asistencia/consolidado(+/export)` — `academico.asistencia.consolidado.ver`
    LISTAR/EXPORTAR (vista 169, patrón centralizador; % = misma regla que la
    actividad ASISTENCIA).
  - `GET /avance-academico(+/export)` — `academico.avance` (vistas 170/171
    sobre el universo del transcript 141; dataKey `avance`).
  - `GET /desercion(+/export)` — `academico.desercion` (vistas 172/173, espejo
    estructural de 156/157 con consumidor distinto; dataKeys `carreras`/
    `desertores`/`resumen`).
- **Deuda anotada (sin tocar):** EXPORTAR huérfanos sin endpoint en
  `docentes.ver`, `docentes.supervision.reporte` y `capacitacion.pago`.

## Changelog 2026-07-29 (tarde) — Pasantías: backend completo (seed 65, `/api/v1/pasantias`)

> **Nota (2026-07-31):** el seed se renombró a `65-seed-permisos-tit.sql` y los
> códigos `tutorias.pasantia*` de esta entrada pasaron a `titulacion.pasantia*`
> — ver Changelog 2026-07-31 al inicio del documento. Texto original sin editar.

Iteración backend de la Fase 2 de Titulación (frontend pendiente; contrato de
handoff en `docs/plan/titulacion-y-dominios-pendientes.md` §Fase 2). Grupo UI
nuevo `tut_pasantias` en dominio TUTORIAS. 19 endpoints montados en
`/api/v1/pasantias` (vistas 166–168; PDF de informes `IncosPDFLibBase`).
**Pendiente BD:** ejecutar vistas 166–168 + resembrar seed
`65-seed-permisos-tut.sql`.

- **Permisos (modulo TUT, seed 65):**
  - `tutorias.pasantia` (`/tutorias/pasantias`): LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/APROBAR/EXPORTAR — trámite con dos caminos PASANTIA/CONVALIDACION (R.M. 487/2023, 300–360 h); transiciones de estado = APROBAR; descarga de PDF de informe = EXPORTAR.
  - `tutorias.pasantia.empresa`: LISTAR/CREAR/EDITAR/ACTIVAR — catálogo de empresas (ABM propio en `/pasantias/empresas`, arranca vacío, toggle estado patrón EstadoTogglePill).
  - `tutorias.pasantia.informe`: LISTAR/CREAR/EDITAR — informes institucionales (emitir genera PDF; editar lo regenera).
  - `tutorias.pasantia.seguimiento`: LISTAR/CREAR/EDITAR — hoja de seguimiento (escala ALTO/MEDIO/BAJO).
- **Roles:** DIR_ACADEMICO y RECTOR control total (cross-join de todas las
  acciones); SEC_ACADEMICA: pasantia L/D/C/E/EXPORTAR + empresa completa +
  informe/seguimiento LISTAR; DOCENTE: pasantia L/D/EXPORTAR + informe y
  seguimiento L/C/E (sus supervisados); ESTUDIANTE: pasantia DETALLE (solo
  su trámite). ADMIN_SISTEMA hereda por vista.
- **Portales (anti-IDOR, identidad resuelta en servidor):** docente
  `GET /pasantias/mis-pasantias` (LISTAR); estudiante
  `GET /pasantias/mi-pasantia` (DETALLE, compuesto
  `{ pasantia, informes, seguimientos }`).

## Changelog 2026-07-29 — dominio TUT re-etiquetado "Titulación" + dueños de menú

> **Nota (2026-07-31):** la afirmación "los CÓDIGOS `tutorias.*` y el module
> code `TUT` NO cambian" de esta entrada quedó **REVERTIDA** — ver el
> Changelog 2026-07-31 al inicio del documento para la tabla completa de
> códigos nuevos (`titulacion.*` / módulo `TIT`; Acompañamiento reclasificado
> a `academico.acompanamiento.*` / módulo `ACA`). El texto original se
> conserva abajo sin editar, como registro histórico de la decisión original.

Decisión de diseño aprobada (cierra §6.7 de `docs/plan/auditoria-modelo-datos.md`;
detalle y plan por fases en `docs/plan/titulacion-y-dominios-pendientes.md`).
Los CÓDIGOS de permiso `tutorias.*`, el module code `TUT` y los paths
`/tutorias/*` NO cambian (identificadores estables); cambia lo visible:

- **Label del dominio TUT:** "Tutorías" → **"Titulación"** (`dominios/routes.jsx`,
  icono `SafetyCertificateOutlined`). Agrupará: Proyectos de grado (existente),
  Pasantías (Fase 2, schema 24, códigos `tutorias.pasantia.*`) y Títulos y
  certificados (Fase 5, schema 26, gated por documentación real).
- **Acompañamiento pedagógico → menú Académico:** los 3 ítems (Alumnos en
  riesgo order 8, Sesiones de refuerzo order 9, Panel order 10) cuelgan de
  `parent: 'ACA'`; en el seed 66 el grupo `tut_acompanamiento` y sus 3 permisos
  pasan a `dominio='ACADEMICO'` (pestaña Académico de la grilla; `modulo` sigue
  `TUT`). Paths y códigos intactos.
- **Grilla de Seguridad:** `DOMINIOS_V2` (`usePermisosCatalogo.js`) incorpora
  las pestañas CAPACITACION ("Capacitación") y TUTORIAS ("Titulación").
- **Pasantías legacy eliminadas:** seed 57 ya no siembra `matricula.pasantia.*`
  ni `mat_pasantias` (y desaparece su bloque de deshabilitación); rutas
  placeholder `MAT-PAS-*` retiradas de `estudiantes/routes.jsx`. Seed 59 ya no
  siembra `docentes.supervision.pasantia.*` ni `doc_pasantias`. Lo docente
  entrará por wrappers del portal (sin permisos nuevos).
- **Dueños de menú restantes:** Libros de registro (25) → ACA
  (`academico.libro.*`, ampliar seed 58); Supervisión docente (27) → DOC —
  ✅ HECHO 2026-07-30: bloque rediseñado en `60-seed-permisos-doc.sql`
  (el seed DOC ya no es el 59) contra `fichas_seguimiento_clase`
  (ver changelog 2026-07-30).
- Seeder `67-seed-modalidades-grado.sql` renombrado a
  `67-seed-titulacion-modalidades-grado.sql`.

## Changelog 2026-07-25 — módulo nuevo Tutorías y Acompañamiento (TUT, seed 66)

> **Nota (2026-07-31):** los códigos `tutorias.titulacion.*`/`tutorias.acompanamiento.*`
> de esta entrada fueron renombrados — ver Changelog 2026-07-31 al inicio del
> documento. El texto original se conserva abajo sin editar, como registro
> histórico.

Dominio propio `TUT` (menú "Tutorías", order 9; CFG→10, SEG→11), decisión cerrada del
plan `docs/plan/tutorias-plan-desarrollo.md`. No estaba contemplado en esta matriz
(anterior al diseño del módulo): agrupa 4 ítems de menú en 2 grupos_ui
(`tut_titulacion`, `tut_acompanamiento`) y no cabía como un solo ítem de otro módulo.

- **Permisos (modulo TUT, seed `66-seed-permisos-tut.sql`):**
  - `tutorias.titulacion.proyecto` (`/tutorias/titulacion`): LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/APROBAR/EXPORTAR
  - `tutorias.titulacion.bitacora`: LISTAR/CREAR/EDITAR
  - `tutorias.titulacion.avance`: LISTAR/DETALLE/CREAR
  - `tutorias.acompanamiento.alerta` (`/tutorias/acompanamiento/alertas`): LISTAR/DETALLE
  - `tutorias.acompanamiento.sesion` (`/tutorias/acompanamiento/sesiones`): LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR
  - `tutorias.acompanamiento.panel` (`/tutorias/acompanamiento/panel`): LISTAR/EXPORTAR
- **Roles:** DIR_ACADEMICO y RECTOR = todo; SEC_ACADEMICA = proyecto L/D/C/E/EXPORTAR +
  bitacora L + avance L/D + alerta L/D; DOCENTE = proyecto L/D + bitacora L/C/E +
  avance L/D + alerta L/D + sesion L/D/C/E; ESTUDIANTE = proyecto DETALLE + bitacora
  LISTAR + avance L/D/CREAR. ADMIN_SISTEMA hereda por vista (no se siembra).
- **Portal por rol (patrón historial/asistencia, mismos ítems y permisos, sin permisos nuevos):**
  DOCENTE ve los mismos ítems con connector que bifurca (`esDocente`) → Mis tutorados /
  Mis alumnos en riesgo, con `labelByRole` en el menú. ESTUDIANTE no tiene LISTAR de
  nada → no ve el menú TUT; su página es `/tutorias/mi-proyecto` (`TUT-MI-PROYECTO`,
  `menu: null`, DETALLE, guard de pertenencia en servidor vía
  `resolveEstudianteIdForUsuario`) con acceso desde tarjeta en `EstudianteDashboard`
  (patrón ACA-MI-BOLETIN). T17 (confirmar bitácora) = bitacora·LISTAR + guard
  integrante ACTIVO en servidor.

## Changelog 2026-07-14 — auditoría RBAC de los 8 módulos (57-64) + correcciones

Auditoría completa (8 agentes, uno por módulo MAT/ACA/DOC/FIN/INST/CFG/REP/SEG-SYS)
cruzando `routes.jsx`, controles UI (`ActionButton`/`TableActions`/`PermisoGuard`/`useAcciones`)
y `verificarPermiso` backend contra cada seed `57-64`, previa a retomar desarrollo de
nuevas funciones. Cambios aplicados:

- **`61-seed-permisos-inst.sql`:** faltaba CREAR/EDITAR/ACTIVAR de
  `institucional.oferta.gestion-plan`, DETALLE/CREAR/EDITAR/ACTIVAR de
  `institucional.oferta.paralelo-gestion` y CREAR/EDITAR/ELIMINAR de
  `institucional.oferta.cursos` para RECTOR/DIR_ACADEMICO/DIR_ADMIN (el seed solo
  tenía LISTAR pese a que la renovación de oferta gestión→gestión ya está construida
  en frontend/backend). Agregado.
- **`64-seed-permisos-seg.sql`:** `seguridad.usuario.administrar` solo tenía LISTAR
  para RECTOR/DIR_ACADEMICO/DIR_ADMIN pese a que la ficha-hub de usuarios (DETALLE/
  EDITAR/ELIMINAR/ACTIVAR) ya está activa desde el refactor de 2026-07-09; agregado
  espejo completo. También `seguridad.usuario.crear` (CREAR) y `seguridad.rol.gestionar`
  (EDITAR), sin ninguna asignación de rol, agregados a los mismos 3 roles.
- **`59-seed-permisos-doc.sql`:** DIR_ADMIN no tenía `docentes.asignar` (CREAR/EDITAR/
  ELIMINAR), a diferencia de RECTOR/DIR_ACADEMICO — le impedía operar asignación
  docente/color/carga desde Institucional → Oferta. Agregado.
- **`63-seed-permisos-rep.sql`:** `reportes.solicitudes.traspaso` no tenía ninguna fila
  de rol (a diferencia de sus hermanos general/becas). Agregado RECTOR/LISTAR.
- **Código (no-seed):** `pagos/routes.jsx` (PAG-EDITAR sin `permisoAny`, producía 403
  con botón visible para DIR_ACADEMICO/SEC_ACADEMICA); `DocenteAsignacionesColorSection.jsx`
  gateaba con `docentes.editar` cuando el backend solo acepta `docentes.asignar`/
  `institucional.horarios.color-docente`; `docentes.routes.js` (`POST /asignaciones` y
  `/asignaciones/curso` solo aceptaban EDITAR, se agregó CREAR como alternativa válida);
  `AporteConfigPage.jsx` (botón fijo en EDITAR, ahora condicional CREAR/EDITAR según
  `aporteVigente?.id`); `institucional/horarios/routes.jsx` (`INST-HORARIO-CONFLICTOS`
  usaba el código `institucional.horario.armado`, distinto al que exige el fetch real
  de esa pantalla; alineado a `institucional.horario.conflictos`).
- **Decisión de producto — catálogo abierto en Finanzas:** `GET /bancos-autorizados`,
  `/cuentas-pago` y `/metodos-pago` siguen resolviéndose vía el catálogo de referencia
  transversal (`sistema.catalogo.referencia`, cualquier autenticado), no vía
  `finanzas.configuracion.pago DETALLE`. Es **intencional** (igual que el patrón de
  `configuracion.documentacion`/complementarios): otros combos del sistema (registro de
  pagos, matrícula) dependen de ese catálogo abierto. No se restringe.
- ~~**Pendiente real (NO implementado, requiere feature propia):** self-service "Mi beca"
  para ESTUDIANTE...~~ **Implementado 2026-08-02.** `58-seed-permisos-mat.sql` otorga
  a ESTUDIANTE `matricula.beca.ver` LISTAR/DETALLE (sin CREAR/EDITAR/ELIMINAR/APROBAR,
  siguen staff-only). Mismo mecanismo que "Mis aportes": `GET /estudiantes/becas`
  (`ListStudentScholarshipsController`) resuelve el `estudianteId` de la sesión vía
  `resolveEstudianteIdForUsuario` cuando `rolCodigo === 'ESTUDIANTE'` y sobrescribe
  cualquier `studentId` de query params antes de delegar al listado admin (no hay
  endpoint `/mis-becas` separado: se reutiliza la misma ruta con `labelByRole`).
  Guards anti-IDOR: `becaSelfOnlyGuard` (nuevo, `presentation/middleware/becaSelfOnly.middleware.js`,
  mismo patrón que `aporteSelfOnlyGuard`) en `GET /estudiantes/becas/:id`; y
  `estudianteSelfOnlyGuard` (reutilizado, no duplicado — en esa ruta `:id` ya es el id
  del estudiante) en `GET /estudiantes/:id/scholarships`.
- **Hallazgo descartado (falso positivo):** un agente reportó que `SEC_ACADEMICA` no
  tenía `matricula.admision.ver LISTAR` (bloqueando la búsqueda en Historial académico).
  Verificado directamente en `57-seed-permisos-mat.sql` bloque "3b": SEC_ACADEMICA SÍ
  recibe esa fila vía el mirror por `grupo_ui IN ('mat_admision', ...)`. Sin acción.
- **No tocado (candidatos de limpieza, solo reportados, ver auditorías por dominio):**
  acciones/permisos sembrados sin ningún consumidor real (`docentes.ver EXPORTAR`,
  `matricula.admision.editar ACTIVAR`, `matricula.beca.asignar EDITAR`,
  `academico.calificacion.cuaderno GENERAR_PDF`, `institucional.horario.plantilla`,
  `institucional.gestion.oferta`, filas de `sistema.catalogo.referencia` en
  `roles_permisos` pese a que el middleware no las consulta) — no se borran sin
  aprobación explícita adicional.

> **IMPORTANTE (seeds RBAC por módulo, sin ids fijos):** Los seeders de permisos están
> **separados por módulo** en `02-seeders/`: `55-seed-roles.sql` → `56-seed-usuarios-admin.sql`
> → `58-67 seed-permisos-<mod>.sql` (MAT, ACA, DOC, FIN, INST, REP, CAP, TIT, CFG, SEG — **SEG incluye SYS**).
> Cada archivo de módulo es autocontenido con 3 inserts: `permisos` (SIN id, AUTO_INCREMENT) +
> `permiso_acciones` + `roles_permisos`, **referenciando por CÓDIGO** (de permiso y de rol),
> no por id. Por eso este documento **ya no cita ids de permiso**: la fuente de verdad es el
> `codigo`. `ADMIN_SISTEMA` (rol 1) no tiene filas en `roles_permisos`; hereda todo por la vista
> `vista_catalogo_acciones_permisos_activas`. Ver skill `incos-rbac`.

## Changelog 2026-06-12

- **Seeds RBAC migrados a por módulo (sin ids correlativos):** se eliminaron los monolíticos
  `54-seed-permisos` / `55-seed-roles-permisos` / `56-seed-permiso-acciones`. Ahora cada módulo
  tiene su archivo `57-64 seed-permisos-<mod>.sql` con permisos + acciones + roles_permisos
  (refs por código; id por AUTO_INCREMENT). `53/54` = evaluación, `55` = roles, `56` = usuarios-admin.
  **SEG incluye SYS.** Las tablas se vacían y resiembran.
- **Asistencia (nuevo ítem de Académico, gemelo de Calificaciones):** permisos
  `academico.asistencia.*` (registro.ver, registro.cuaderno, clase_no_dictada.ver, consolidado.ver)
  en `58-seed-permisos-aca.sql`. **Licencias estudiantiles** renombradas
  `academico.licencia.*` → `academico.asistencia.licencia.*` (ahora página dentro de Asistencia).
- Las referencias inline a ids de permiso de versiones previas de este documento quedaron obsoletas
  (el runtime resuelve por código); se están retirando por sección.

## Changelog 2026-06-09 (histórico — numeración de seeds anterior)

- **Fix RBAC `/supervision/pasantias/evaluar`:** `docentes.supervision.pasantia.evaluar` (id **58**) tenia
  solo `EDITAR` en el catalogo, pero la ruta exige `APROBAR` → bloqueaba incluso a ADMIN_SISTEMA.
  Corregido a `APROBAR` en `permiso_acciones` (56) y en `roles_permisos` (55) para RECTOR (2) y DIR_ACADEMICO (3).
- **SEC_ACADEMICA (rol 5) — operacion institucional completa:** se le asignaron los permisos institucionales
  67–83 (sin 74 plantilla) como espejo de RECTOR (37 filas), habilitando los botones de accion en
  `institucional/oferta`, `/horarios` y `/pasadas`. Coherente con "RECTOR y SEC_ACADEMICA operacion completa".
- **Seeders 55 y 56 regenerados desde BD y reordenados:** `56` por bloque de modulos (`permiso_id, accion`),
  `55` por bloque de roles (`rol_id, permiso_id, accion`); IDs reasignados secuenciales. BD y seeders quedan identicos.
- **Auditoria de paginas (horarios, oferta, pasadas, docentes, calificaciones, configuracion/academico):** todos
  los pares (permiso, accion) usados por los botones (`ActionButton`/`PermisoGuard`/`useAcciones`/`hasPermiso`)
  ya existian en el catalogo (54+56); no requirio permisos nuevos. ADMIN_SISTEMA los tiene todos por derivacion del catalogo.

**Arquitectura:** frontend skill `.claude/skills/incos-frontend-module` · backend skill `.claude/skills/incos-backend-module` (resumen en `CLAUDE.md`) · guías `docs/guias/implementacion-*` y `checklist-*`.

## ADMIN_SISTEMA (rol_id = 1)

El usuario **admin** inicial (`56-seed-usuarios-admin.sql`) tiene `rol_id = 1`. No tiene filas en `roles_permisos`; los permisos efectivos salen del catálogo `permiso_acciones` (poblado por los archivos de permisos por módulo) vía `AuthRepository` / `vista_catalogo_acciones_permisos_activas`.

En **RolPermisosPage**, la grilla usa `vista_grilla_roles_permisos_agrupada`: para `rol_id = 1` el backend marca como asignadas todas las acciones validas del catalogo (misma fuente que login), no las filas vacias de `roles_permisos`.

Tras cambiar `ruta_sidebar` o `grupo_ui` de un permiso, edita su archivo de módulo (`58-67 seed-permisos-<mod>.sql`) y re-seed (las tablas RBAC se vacían y resiembran); en instalación nueva basta con los seeders `55` (roles) → `56` (usuarios-admin) → `58-67` (permisos por módulo) y las vistas RBAC.

## Criterio canon para nuevas funciones (ABM limpio + seguridad)

Todo alta/baja/modificacion (ABM) o nueva pantalla de un modulo debe cumplir estas restricciones minimas:

1. **Arquitectura limpia por capa** (detalle en el skill `.claude/skills/incos-frontend-module`)
   - Carpetas alineadas al **menu lateral** (un directorio por item de menu).
   - `presentation/pages`: UI pura.
   - `application/hooks/api|features|state`: API; listados en tabs (`features`); pantallas (`state`).
   - `application/providers`: inyeccion de contexto.
   - `presentation/connectors`: composicion Provider + Page.
2. **Permisos coherentes extremo a extremo**
   - misma accion entre `routes.jsx`, `PermisoGuard/ActionButton/TableActions/useAcciones` y `verificarPermiso` backend.
   - El `routerFactory` envuelve cada ruta protegida con `PrivateRoute` usando `permiso` y `accion` del registro de rutas (denegacion directa por URL si falta capacidad RBAC).
3. **Accion correcta segun flujo**
   - listado/menu: `LISTAR`
   - ficha: `DETALLE`
   - alta: `CREAR`
   - edicion: `EDITAR`
   - baja: `ELIMINAR`
   - exportaciones: `EXPORTAR`
4. **Sin bypass en UI**
   - no mostrar CTA de accion si el permiso/accion no existe o no esta asignado al rol.
5. **Trazabilidad de navegacion**
   - cuando exista flujo multi-pantalla, propagar `returnListPath` y ruta de origen (`gestionReturnPath` o equivalente).

## Entradas por permisos (patron global de aterrizaje)

Cuando **un mismo item de menu** (`permiso` de **ingreso**, accion **LISTAR**) agrupa **varias pantallas** con permisos distintos (p. ej. coordinacion admin vs mis cursos del docente), la eleccion de pantalla **no depende del codigo de rol** (`DOCENTE`, `RECTOR`, …) sino de **que permisos hijos tiene el usuario** segun seed **55** y catalogo **56**.

### Capas del modelo

| Capa | Seed / artefacto | Responsabilidad |
|------|------------------|-----------------|
| Menu lateral | permiso **ingreso** (ej. `academico.calificacion.ingreso`) | Visibilidad del item en sidebar (`filterMenuByPermiso` + accion LISTAR) |
| Pantallas hijas | permisos `academico.calificacion.*` hijos, rutas hijas en `routes.jsx` | Cada pantalla con `permiso` + `accion`; `PrivateRoute` bloquea URL directa |
| Aterrizaje | `menu.landingStack` en la ruta de ingreso | Orden de preferencia al abrir el modulo (click menu o URL de ingreso) |
| Modo de subpantallas | `viewStack` en la ruta raiz del modulo (misma key que menu) | API / UI segun permiso efectivo (`useRouteViewMode`) |

### Esquema `menu.landingStack`

Declarar en la ruta que tiene `menu` (fuente unica en `routes.jsx`):

```javascript
menu: {
  label: 'Calificaciones',
  module: 'ACA',
  parent: 'ACA',
  order: 1,
  labelByRole: { ESTUDIANTE: 'Mis calificaciones' }, // solo etiqueta visible, no routing
  landingStack: [
    { permiso: 'academico.calificacion.coordinacion', accion: 'LISTAR' },
    { permiso: 'academico.calificacion.mis_cursos', accion: 'LISTAR', redirectTo: '/academico/calificaciones/mis-cursos' },
  ],
},
```

Reglas:

1. **Primera entrada cuyo par permiso+accion el usuario cumple gana** (misma regla en sidebar y en URL de ingreso).
2. Sin `redirectTo` → render **inline** (vista en la ruta de ingreso).
3. Con `redirectTo` → **Navigate** a la ruta hija (docente, estudiante, vista propia, etc.).
4. **`labelByRole`** solo cambia texto del menu; **nunca** sustituye permisos ni paths.
5. Controles de retorno (boton volver) usan **`hasPermiso(..., 'LISTAR')`** del permiso de coordinacion/admin, no comparacion de rol.

### Esquema `viewStack` (subpantallas del modulo)

Declarar **una vez** en la ruta del menu del modulo (propiedad de primer nivel en `routes.jsx`, no dentro de `menu`):

```javascript
import { MODULO_VIEW_STACK } from '@application-.../config/moduloViewStack.js';

{
  key: 'ACA-CAL',
  path: '/academico/calificaciones',
  menu: { /* ... */, landingStack: [ /* entrada */ ] },
  viewStack: MODULO_VIEW_STACK,
}
```

```javascript
export const MODULO_VIEW_STACK = [
  {
    id: 'coordinacion',
    permiso: 'academico.calificacion.coordinacion',
    accion: 'LISTAR',
    persistContext: { stateKey: 'docenteId', nameKey: 'docenteNombre' },
  },
  {
    id: 'propio',
    permiso: 'academico.calificacion.mis_cursos',
    accion: 'LISTAR',
  },
];
```

Reglas:

1. Misma prioridad por permisos que `landingStack` (no por rol).
2. Entrada con `persistContext` solo activa si el usuario tiene ese permiso **y** hay `docenteId` en `location.state` o en `sessionStorage` (`incos:view-context:{moduleKey}`).
3. Sin contexto persistido, cae al siguiente modo (ej. docente → `propio` + `GET /mis-cursos`).
4. En hooks de datos: `const { isView, contextId } = useRouteViewMode('ACA-CAL-MIS-CURSOS')` — resuelve el `viewStack` del ancestro `ACA-CAL`.
5. **No** crear hooks `useXxxVistaContext` por modulo salvo alias fino; la logica vive en `useRouteViewMode`.

| Pieza | Ubicacion |
|-------|-----------|
| `resolveViewStack` | `infrastructure/navigation/utils/resolveViewStack.js` |
| `findViewStackForRoute` | mismo archivo |
| `useRouteViewMode` | `infrastructure/navigation/hooks/useRouteViewMode.js` |

### Componentes frontend (reutilizables)

| Pieza | Ubicacion | Uso |
|-------|-----------|-----|
| `resolveModuleLanding` | `infrastructure/navigation/utils/resolveModuleLanding.js` | Logica pura: stack + hasPermiso → inline \| redirect |
| `resolveEffectiveMenuPath` | mismo archivo | Path al hacer clic en sidebar |
| `getEffectiveRouteFromMenuKey` | `infrastructure/navigation/services/routeMapper.js` | Lee `landingStack` del registry por `menuKey` |
| `ModuleEntryConnector` | `infrastructure/navigation/components/ModuleEntryConnector.jsx` | Conector generico en `element` de la ruta de ingreso |
| `AccessDeniedRedirect` + `notifyAccessDenied` | `infrastructure/navigation/components/AccessDeniedRedirect.jsx` | Notificacion Ant Design (`title` + `description`) y redirect; usado por `ModuleEntryConnector` y `PrivateRoute` |
| Conector del modulo | ej. `CalificacionesEntradaConnector` | Wrapper minimo: `menuKey` + `inlineElement` (pagina admin/coordinacion) |

**Dashboard (vista previa vs detalle):**

| Dato en panel | API | Permiso middleware | Detalle / listado ABM |
|---|---|---|---|
| Carreras, docentes, estudiantes, actividades, conteos | `GET /dashboard/resumen` | `sistema.catalogo.referencia` + LISTAR | Requiere permiso del modulo (`cfg.academico.carreras`, `docentes.ver`, `matricula.admision.ver`, etc.) |
| ABM carreras | `GET /carreras` | `cfg.academico.carreras` + LISTAR | No usar en dashboard; solo administracion |

> **Feed de actividades ampliado (2026-07-03):** `vista_dashboard_actividades_recientes`
> (archivo `149`, reemplaza al `49`) une ahora **10 bases** con contrato de 10 columnas
> (`… , estudiante_id, docente_id, usuario_id`): 41 estudiante, 42 inscripción, 43 pago,
> 44 docente, 47 beca + nuevas 144 nota registrada, 145 asistencia tomada, 146 licencia,
> 147 clase no dictada, 148 asignación docente. El feed global admin no cambia de shape;
> el feed del estudiante (`/dashboard/mi-resumen`) filtra por `estudiante_id` (tipos
> PAGO/MATRICULA/BECA remapeados por compatibilidad + NOTA_REGISTRADA + LICENCIA) y el del
> docente (`/dashboard/mi-resumen-docente`) por `docente_id`.

Frontend: `useDashboardData` carga solo `/dashboard/resumen`. `useDashboardGuardedNavigate` muestra notificacion de acceso denegado si el usuario pulsa "Ver todas", tarjeta o actividad sin permiso de detalle (misma notificacion que `PrivateRoute`).

Ejemplo conector del modulo:

```jsx
import ModuleEntryConnector from '@navigation/components/ModuleEntryConnector.jsx';
import CoordinacionPage from '../pages/CoordinacionPage.jsx';

const CalificacionesEntradaConnector = () => (
  <ModuleEntryConnector menuKey="ACA-CAL" inlineElement={<CoordinacionPage />} />
);
```

### Checklist al agregar un modulo con vistas distintas por perfil

1. **Seed del módulo (`58-67`), bloque `permisos`**: permiso de **ingreso** (menu) + permisos por pantalla hija (sin ids; referencia por código).
2. **Mismo seed, bloque `permiso_acciones`**: acciones validas por permiso.
3. **Mismo seed, bloque `roles_permisos`**: asignar a cada rol solo los permisos que le corresponden (docente **sin** coordinacion si no debe ver listado global).
4. **`routes.jsx`**: ruta de ingreso con `permiso` ingreso; hijas con permisos propios; `landingStack` + `viewStack` (archivo `config/*ViewStack.js` del modulo).
5. **`ModuleEntryConnector`** + pagina inline para la vista admin/coordinacion.
6. **Hooks de datos**: `useRouteViewMode(routeKey)` para elegir API segun `isView('coordinacion'|'propio')` y `contextId`.
7. **UI**: ocultar acciones admin con `PermisoGuard` / `ActionButton`, no con `if (rol === 'DOCENTE')`.
8. **Documentar** fila en esta matriz (permisos, stacks, roles asignados en el archivo de módulo).

Referencia implementada: **ACA · Calificaciones** (`ACA-CAL`, permisos `academico.calificacion.*`, rol DOCENTE en el archivo de módulo ACA).

## Resumen de roles

| ID | Codigo | Nombre |
|----|--------|--------|
| 1 | ADMIN_SISTEMA | Administrador del Sistema |
| 2 | RECTOR | Rector |
| 3 | DIR_ACADEMICO | Director Academico |
| 4 | DIR_ADMIN | Director Administrativo |
| 5 | SEC_ACADEMICA | Secretaria Academica |
| 6 | SEC_ADMIN | Secretaria Administrativa |
| 7 | DOCENTE | Docente |
| 8 | ESTUDIANTE | Estudiante |

Fuente: `55-seed-roles.sql` (ids de rol fijos 1-8).

## Tabla de acciones disponibles por accion HTTP

| Patron backend | Accion RBAC |
|---|---|
| `GET /...` (listado/detalle) | VER |
| `POST /...` (alta/registro) | CREAR |
| `PUT/PATCH /...` | EDITAR |
| `DELETE /...` | ELIMINAR |
| `GET /.../export`, `GET /.../recibo` | EXPORTAR |
| Flujos de aprobacion en UI/negocio | APROBAR |

## Endpoints activos del backend (auditados)

| Archivo | Metodo | Path base real | Accion UI |
|---|---|---|---|
| `auth.routes.js` | POST | `/api/v1/auth/login` | Autenticar |
| `auth.routes.js` | GET | `/api/v1/auth/me` | Perfil + permisos |
| `auth.routes.js` | POST | `/api/v1/auth/logout` | Cerrar sesion |
| `docentes.routes.js` | GET | `/api/v1/docentes` | LISTAR |
| `docentes.routes.js` | GET | `/api/v1/docentes/:id` | DETALLE ficha (anti-IDOR `docenteSelfOnlyGuard`) |
| `docentes.routes.js` | GET | `/api/v1/docentes/mis-datos` | Portal docente: id + nombre propio (solo `authenticate`) |
| `docentes.routes.js` | GET | `/api/v1/docentes/mis-estudiantes` | Portal docente: roster de SUS cursos vigentes (solo `authenticate`; vista 150) |
| `supervision-docente.routes.js` | GET | `/api/v1/supervision-docente` | LISTAR fichas de seguimiento (`docentes.supervision.ficha`; vista 174) |
| `supervision-docente.routes.js` | GET | `/api/v1/supervision-docente/mis-fichas` | Portal docente: fichas de SUS cursos (solo `authenticate`, anti-IDOR) |
| `supervision-docente.routes.js` | POST | `/api/v1/supervision-docente` | CREAR ficha (supervisor = sesión) |
| `supervision-docente.routes.js` | GET | `/api/v1/supervision-docente/:id` | DETALLE ficha |
| `supervision-docente.routes.js` | PUT | `/api/v1/supervision-docente/:id` | EDITAR ficha |
| `supervision-docente.routes.js` | GET | `/api/v1/supervision-docente/:id/pdf` | EXPORTAR PDF (réplica del formulario) |
| `libros.routes.js` | GET | `/api/v1/libros` | LISTAR libros de registro (`academico.libro`; vista 175) |
| `libros.routes.js` | POST | `/api/v1/libros` | CREAR (abrir libro; `numeroLibro` requerido) |
| `libros.routes.js` | GET | `/api/v1/libros/:id` | DETALLE ficha (cabecera + folios, vista 176) |
| `libros.routes.js` | PATCH | `/api/v1/libros/:id` | EDITAR / cerrar libro |
| `libros.routes.js` | GET | `/api/v1/libros/:id/paralelos` | CREAR (apoyo generador: paralelos candidatos) |
| `libros.routes.js` | POST | `/api/v1/libros/:id/folios` | CREAR (generar folios de UN paralelo, numeración por gestión) |
| `libros.routes.js` | POST | `/api/v1/libros/gestiones/:gestionId/folios` | CREAR (generar/reajustar TODOS los folios de la gestión, todo-o-nada) |
| `libros.routes.js` | GET | `/api/v1/libros/:id/folios/:folioId` | DETALLE folio (nómina + celdas 135) |
| `libros.routes.js` | PATCH | `/api/v1/libros/:id/folios/:folioId/estado` | APROBAR (BORRADOR→ANULADO, con motivo; sin IMPRESO/FIRMADO) |
| `libros.routes.js` | PATCH | `/api/v1/libros/:id/folios/:folioId/estudiantes/:filaId` | EDITAR observación de fila (si folio NO ANULADO) |
| `libros.routes.js` | GET | `/api/v1/libros/:id/export` | EXPORTAR Excel del libro completo |
| `dashboard.routes.js` | GET | `/api/v1/dashboard/mi-resumen-docente` | Portal docente: panel de inicio (solo `authenticate`; incluye `stats` + `actividades` desde vista 149) |
| `horarios-docente.routes.js` | GET | `/api/v1/horarios/docentes/:docenteId/grilla-conflictos` | Grilla semanal del docente (`institucional.horario.conflictos` LISTAR; DOCENTE solo la propia vía `docenteSelfOnlyGuard('docenteId')`) |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes` | VER listado |
| `estudiantes.routes.js` | POST | `/api/v1/estudiantes` | CREAR |
| `estudiantes.routes.js` | PUT | `/api/v1/estudiantes/:id` | EDITAR |
| `estudiantes.routes.js` | DELETE | `/api/v1/estudiantes/:id` | ELIMINAR |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/:id` | VER detalle (anti-IDOR: `estudianteSelfOnlyGuard` + `estudianteAlcanceDocenteGuard`) |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/search` | VER/consulta |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/export/estadistica-inscritos` | EXPORTAR |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/export/lista-inscritos-por-carrera` | EXPORTAR |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/becas` | VER becas |
| `estudiantes.routes.js` | GET | `/api/v1/estudiantes/:id/scholarships` | VER becas estudiante |
| `estudiantes.routes.js` | POST | `/api/v1/estudiantes/:id/scholarships` | CREAR asignacion beca |
| `estudiantes.routes.js` | DELETE | `/api/v1/estudiantes/becas/:id` | ELIMINAR asignacion beca |
| `estudiantes.routes.js` | POST | `/api/v1/estudiantes/:id/documentos/acta-compromiso` | CREAR documento |
| `estudiantes.routes.js` | POST | `/api/v1/estudiantes/:id/documentos/declaracion-jurada` | CREAR documento |
| `inscripciones.routes.js` | GET | `/api/v1/inscripciones` | VER listado |
| `inscripciones.routes.js` | POST | `/api/v1/inscripciones` | CREAR |
| `inscripciones.routes.js` | GET | `/api/v1/inscripciones/:id` | VER detalle |
| `inscripciones.routes.js` | PUT | `/api/v1/inscripciones/:id` | EDITAR |
| `inscripciones.routes.js` | DELETE | `/api/v1/inscripciones/:id` | ELIMINAR |
| `inscripciones.routes.js` | PATCH | `/api/v1/inscripciones/:id/activar-cursado` | EDITAR (activar cursado) |
| `inscripciones.routes.js` | POST | `/api/v1/inscripciones/:id/generar-formulario` | CREAR documento (PDF) |
| `pagos-aportes.routes.js` | GET | `/api/v1/pagos-aportes` | VER listado |
| `pagos-aportes.routes.js` | GET | `/api/v1/pagos-aportes/estado-registro` | VER estado |
| `pagos-aportes.routes.js` | POST | `/api/v1/pagos-aportes` | CREAR pago |
| `pagos-aportes.routes.js` | GET | `/api/v1/pagos-aportes/:id` | VER detalle |
| `pagos-aportes.routes.js` | DELETE | `/api/v1/pagos-aportes/:id` | ELIMINAR cuota |
| `pagos-aportes.routes.js` | GET | `/api/v1/pagos-aportes/:id/recibo` | EXPORTAR recibo |
| `usuarios.routes.js` | GET | `/api/v1/usuarios` | VER usuarios |
| `usuarios.routes.js` | POST | `/api/v1/usuarios` | CREAR usuario |
| `usuarios.routes.js` | GET | `/api/v1/usuarios/:id` | VER detalle usuario |
| `usuarios.routes.js` | PUT | `/api/v1/usuarios/:id` | EDITAR usuario |
| `usuarios.routes.js` | PATCH | `/api/v1/usuarios/:id/estado` | EDITAR estado |
| `usuarios.routes.js` | PATCH | `/api/v1/usuarios/:id/password` | EDITAR password |
| `usuarios.routes.js` | GET | `/api/v1/usuarios/:id/permisos` | VER permisos usuario |
| `usuarios.routes.js` | POST | `/api/v1/usuarios/:id/permisos` | EDITAR overrides |
| `usuarios.routes.js` | DELETE | `/api/v1/usuarios/:id/permisos/:overrideId` | ELIMINAR override |
| `roles.routes.js` | GET | `/api/v1/roles` | VER roles |
| `roles.routes.js` | GET | `/api/v1/roles/:id/permisos` | VER permisos rol |
| `roles.routes.js` | PUT | `/api/v1/roles/:id/permisos` | EDITAR permisos rol |
| `permisos.routes.js` | GET | `/api/v1/permisos` | VER catalogo permisos |
| Catalogos de referencia | GET | varios (ver seccion abajo) | `sistema.catalogo.referencia` + **LISTAR** |

## Catalogo global de capacidades (frontend + endpoints)

Este catalogo define las capacidades reales del sistema para evitar ambiguedad entre:
- permisos de menu/ruta (`routes.jsx` con `permiso`)
- controles de UI (`PermisoGuard`, `ActionButton`, `TableActions`)
- operaciones API (`frontend/src/infrastructure/api/endpoints.js`)

### Guardas y componentes de control por accion

| Componente/hook | Funcion |
|---|---|
| `PermisoGuard(codigo, accion)` | habilita/bloquea rutas o bloques de vista |
| `ActionButton(permiso, accion)` | renderiza/oculta botones de accion en headers y formularios |
| `TableActions(permisos, extraActions.permiso/accion)` | muestra/oculta ver, editar, eliminar y acciones extra por fila |
| `useAcciones(codigoPermiso)` | expone `puedeVer/Crear/Editar/Eliminar/Aprobar/Exportar` para una vista |

### Capacidades base por accion (canon RBAC)

| Accion | Capacidad funcional | Fuente tecnica principal |
|---|---|---|
| VER | listar, ver detalle, abrir modulo/menu | `GET` + `PermisoGuard` + filtro sidebar |
| CREAR | alta/registro, generar documento, asignar | `POST` + `ActionButton` |
| EDITAR | actualizacion de datos/estado/password | `PUT/PATCH` + `TableActions` |
| ELIMINAR | bajas/soft-delete/override delete | `DELETE` + `TableActions` |
| APROBAR | pasos de workflow de aprobacion | rutas de aprobacion + botones de flujo |
| EXPORTAR | excel/pdf/recibos | `GET export/recibo` + botones de descarga |

### Catalogo de capacidades por dominio (resumen operativo)

| Dominio | Permisos codigo base | Capacidades reales detectadas |
|---|---|---|
| MATRICULA | `matricula.*` | admision, inscripcion, becas, documentos, aportes |
| ACADEMICO | `academico.*` | calificaciones, nivelacion, trazabilidad, historial, licencias |
| DOCENTES | `docentes.*` | docentes, licencias, supervision, pasantias |
| FINANZAS | `finanzas.*` | pagos, cuotas, reportes, recibos |
| INSTITUCIONAL | `institucional.*` | gestiones, oferta, horarios, configuraciones |
| ~~REPORTES~~ | ~~`reportes.*`~~ | **disuelto 2026-07-29** — avance/deserción/consolidado bajo `academico.*`; solicitudes con sus dueños (FIN/ACA/Pasantías) |
| SEGURIDAD | `seguridad.*` | usuarios, roles, permisos, overrides |

### Inventario frontend de permisos en rutas (single source UI)

El barrido de `frontend/src/presentation/modules/**/routes.jsx` confirma que los codigos usados en UI
estan alineados con los archivos de permisos por módulo (`58-67 seed-permisos-<mod>.sql`) por **código** y que la visibilidad del sidebar depende de accion **LISTAR** (no existe `VER` en `permiso_acciones`).

### Nota de compatibilidad documental

Si algun documento legado usa `VER` como sinonimo de lectura, al implementar nuevas funciones priorizar `LISTAR` y `DETALLE` en frontend, y documentar cualquier excepcion temporal hasta completar la normalizacion.

### Recomendacion de normalizacion (siguiente paso de schema)

Para evitar redundancia en `roles_permisos`:
1. mantener `permisos` como catalogo de codigos
2. agregar tabla `permiso_acciones(permiso_id, accion, activo)` como catalogo de capacidades validas
3. mantener `roles_permisos(rol_id, permiso_id, accion)` solo como asignacion

Con esto:
- no se insertan combinaciones invalidas (ej. `APROBAR` donde no existe flujo)
- `ADMIN_SISTEMA` puede poblarse automaticamente desde `permiso_acciones`
- el documento de matriz se vuelve trazable 1:1 con el schema

## Matriz de permisos por pagina (sidebar)

> Convenciones de roles: `ADM` (8), `REC` (1), `DIRA` (2), `DIRM` (3), `SECA` (4), `SECADM` (5), `DOC` (6), `EST` (7).

### MAT - Admisiones (`/estudiantes/listar`)
Permiso base: `matricula.admision.ver`
Endpoint(s): `GET /estudiantes`, `GET /estudiantes/:id`, `GET /estudiantes/export/...`, `POST/PUT/DELETE /estudiantes`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver listado/detalle de estudiantes | GET | ADM, REC, DIRA, DIRM, SECA, SECADM, EST, DOC (solo DETALLE) |
| CREAR | Nuevo estudiante | POST | ADM, REC, DIRA, SECA |
| EDITAR | Editar estudiante | PUT | ADM, REC, DIRA, SECA |
| ELIMINAR | Eliminar estudiante | DELETE | ADM, REC (si se habilita), DIRM (si se habilita) |
| EXPORTAR | Exportar estadisticas/listas | GET `/export/...` | ADM, REC, DIRA, DIRM |

> **DOCENTE (2026-07-03):** `matricula.admision.ver` **DETALLE sin LISTAR** — la ficha
> `EstudiantesDetail` se abre desde "Mis estudiantes" del portal docente; el guard de alcance
> `estudianteAlcanceDocenteGuard` (GET `/estudiantes/:id`) exige que el estudiante pertenezca a
> algún curso VIGENTE del docente (EXISTS sobre asignaciones → matrículas → inscripción → datos
> académicos). El docente NO ve el listado general de admisión. ESTUDIANTE-self y staff no cambian
> (se compone con `estudianteSelfOnlyGuard`).

### MAT - Matriculas (`/matricula/listar`, `/matricula/nueva`)
Permisos: `matricula.inscribir`, `matricula.inscripcion.editar`
Endpoint(s): `GET/POST/PUT/DELETE /inscripciones`, `POST /inscripciones/:id/generar-formulario`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver matriculas | GET | ADM, REC, DIRA, SECA |
| CREAR | Registrar matricula | POST | ADM, REC, DIRA, SECA |
| EDITAR | Editar matricula | PUT | ADM, REC, DIRA, SECA |
| EDITAR | Activar cursado de una inscripcion (INSCRITO→CURSANDO + bimestres) | PATCH `/inscripciones/:id/activar-cursado` | ADM, REC, DIRA, SECA |
| ELIMINAR | Eliminar matricula | DELETE | ADM, REC (segun politica), DIRM (si aplica) |

> **Activación del cursado (`matricula.inscripcion.editar` + EDITAR):** el botón "Activar cursado" del
> detalle (`InscripcionesDetail`) usa `PATCH /inscripciones/:id/activar-cursado`. Misma acción en ruta UI
> (`/inscripciones/:id` DETALLE para entrar; botón con EDITAR), `ActionButton`/`hasPermiso` y `verificarPermiso`
> backend. La activación **masiva** por gestión vive en Institucional → Gestión actual (ver INST abajo) y
> reutiliza `academico.calificacion.gestion_bimestres` + EDITAR. Inscripciones creadas con la gestión ya
> iniciada nacen en CURSANDO automáticamente.

### MAT - Becas (`/estudiantes/becas/listar`, `/estudiantes/becas/asignar`)
Permisos: `matricula.beca.ver`, `matricula.beca.asignar`, `matricula.beca.aprobar`
Endpoint(s): `GET /estudiantes/becas`, `POST/DELETE /estudiantes/:id/scholarships | /estudiantes/becas/:id`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver becas asignadas. EST: "Mi beca", alcance self en servidor (anti-IDOR) | GET | ADM, REC, DIRA, SECA, EST |
| CREAR | Asignar beca | POST | ADM, REC, DIRA, SECA |
| ELIMINAR | Eliminar beca asignada | DELETE | ADM, REC (segun politica) |
| APROBAR | Aprobar beca (flujo UI) | proceso | ADM, REC, DIRA |

> ESTUDIANTE (2026-08-02): solo LISTAR/DETALLE, self-scope. `GET /estudiantes/becas`
> fuerza `studentId` = estudiante de la sesión (ignora query del cliente);
> `becaSelfOnlyGuard` en `GET /estudiantes/becas/:id` y `estudianteSelfOnlyGuard`
> (reutilizado) en `GET /estudiantes/:id/scholarships`. Mismo patrón que "Mis aportes".

### MAT/FIN - Aportes/Pagos (`/matricula/aportes/listar`, `/pagos/listar`, `/pagos/:id`)
Permisos: `matricula.pago.aporte.ver`, `finanzas.pago.ver`, `finanzas.pago.registrar`, `finanzas.pago.editar`
Endpoint(s): `GET/POST/DELETE /pagos-aportes`, `GET /pagos-aportes/:id/recibo`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver pagos/aportes | GET | ADM, REC, DIRM, SECADM, EST |
| CREAR | Registrar pago/cuota | POST | ADM, REC, DIRM, SECADM |
| ELIMINAR | Eliminar cuota de pago | DELETE | ADM, REC (si aplica) |
| EXPORTAR | Descargar recibo | GET `/recibo` | ADM, REC, DIRM |

> `finanzas.pago.editar` incluye ahora ELIMINAR también para SEC_ADMIN (anular cuota), además de RECTOR y DIR_ADMIN.

### FIN - Compromiso de pago (`finanzas.compromiso.gestionar`)
Permiso propio del compromiso de pago de una cabecera de aporte (antes se reutilizaba `finanzas.pago.editar`). Acciones: LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR. Grupo UI `fin_pagos`.

| Accion | Endpoint | Permiso/Acción | Roles |
|---|---|---|---|
| LISTAR/DETALLE | `GET /pagos-aportes/:pagoAporteId/compromiso` | `finanzas.compromiso.gestionar` LISTAR o DETALLE (o `matricula.pago.aporte.ver` LISTAR) | RECTOR, DIR_ADMIN, SEC_ADMIN |
| CREAR | `POST /pagos-aportes/:pagoAporteId/compromiso` | `finanzas.compromiso.gestionar` CREAR | RECTOR, DIR_ADMIN, SEC_ADMIN |
| EDITAR | `PUT /pagos-aportes/compromiso/:id` | `finanzas.compromiso.gestionar` EDITAR | RECTOR, DIR_ADMIN, SEC_ADMIN |
| ELIMINAR | `DELETE /pagos-aportes/compromiso/:id` | `finanzas.compromiso.gestionar` ELIMINAR | RECTOR, DIR_ADMIN |

> SEC_ADMIN tiene LISTAR/DETALLE/CREAR/EDITAR del compromiso, **sin** ELIMINAR.

### FIN - Pagos adicionales (`finanzas.pago.adicionales`)
Acciones completas: LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR. Grupo UI `fin_adicionales`.

| Accion | Roles |
|---|---|
| LISTAR | RECTOR, DIR_ADMIN, SEC_ADMIN |
| DETALLE | RECTOR, DIR_ADMIN |
| CREAR | RECTOR, DIR_ADMIN, SEC_ADMIN |
| EDITAR | RECTOR, DIR_ADMIN |
| ELIMINAR | RECTOR, DIR_ADMIN |

> SEC_ADMIN solo LISTAR/CREAR de adicionales (sin DETALLE/EDITAR/ELIMINAR).

### FIN - Reportes de control (becas y cuentas por cobrar)
Permisos propios (antes ambos reportes compartían `finanzas.pago.reporte.carrera`). Grupo UI `fin_reportes`.

| Permiso (codigo) | Acciones | Endpoint | Roles |
|---|---|---|---|
| `finanzas.beca.reporte` | LISTAR, EXPORTAR | `GET /pagos-aportes/reportes/becas-por-carrera` (LISTAR) | RECTOR, DIR_ADMIN |
| `finanzas.cuenta-cobrar.reporte` | LISTAR, EXPORTAR | `GET /pagos-aportes/reportes/cuentas-por-cobrar` (LISTAR) | RECTOR, DIR_ADMIN |

> SEC_ADMIN **no** recibe estos reportes de control.

### FIN - Configuración de Finanzas (catálogos: pagos y becas/descuentos)

Dos permisos gobiernan los 4 catálogos de Finanzas → Configuración. Grupos UI `fin_config_pagos` y `fin_becas_descuentos`.

| Permiso (codigo) | Acciones | Recursos / endpoints | Roles |
|---|---|---|---|
| `finanzas.configuracion.pago` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | `/metodos-pago`, `/bancos-autorizados`, `/cuentas-pago` (GET de listado como catálogo de referencia transparente `sistema.catalogo.referencia`) | RECTOR, DIR_ADMIN |
| `finanzas.beca-descuento` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | `/becas-descuentos` (catálogo maestro; GET de listado como catálogo de referencia transparente) | RECTOR, DIR_ADMIN |

> **Activación rápida de catálogos de Finanzas (`ACTIVAR`, 2026-07-08):** los 4 catálogos exponen
> `PATCH /api/v1/{metodos-pago|bancos-autorizados|cuentas-pago|becas-descuentos}/:id/estado` con body
> `{ "activo": boolean }` y `verificarPermiso('finanzas.configuracion.pago'|'finanzas.beca-descuento', 'ACTIVAR')`
> (mismo patrón que los complementarios de CFG). Funciona también sobre ítems ya inactivos (reactivar);
> el soft-delete (`deleted_at`) sigue siendo exclusivo de ELIMINAR. Los 4 GET de listado aceptan
> `?incluirInactivos=true` y cada ítem expone `activo` (boolean) más los conteos de uso
> `cantidadPagos` / `cantidadCuentas` / `cantidadAsignaciones` / `totalReferencias`
> (vista `vista_catalogos_finanzas_usos`, 152). Roles con ACTIVAR: RECTOR y DIR_ADMIN (los mismos
> que ya tienen el resto del bloque); ADMIN_SISTEMA hereda por vista (sin filas en `roles_permisos`).
> Métodos de pago sigue **sin** endpoint DELETE (catálogo fijo de 4 códigos referenciado por FK).
> Seed: `61-seed-permisos-fin.sql` (requiere re-siembra).

### ACA - Académico (`/academico/*`)
Submódulos (cada uno con directorio y `routes.jsx` bajo `modules/academico/`):

| Menú | Ruta canónica | Permisos (grupo) |
|------|---------------|------------------|
| Calificaciones | `/academico/calificaciones` | `academico.calificacion.*` |
| Asistencia | `/academico/asistencia` | `academico.asistencia.*` (gemelo de Calificaciones; ver detalle abajo) |
| Nivelaciones | `/academico/nivelaciones/listar` | `academico.nivelacion.*` |
| Traspasos | `/academico/traspasos/listar` | `academico.trazabilidad.traspaso.*` — **apagado en seed 59 (menú dado de baja)** |
| Transitabilidad | `/academico/transitabilidad/listar` | `academico.trazabilidad.transitabilidad.*` — **apagado en seed 59 (menú dado de baja)** |
| Historial | `/academico/historial/academico` | `academico.historial.*` |
| Avance académico | `/academico/avance` | `academico.avance` + `academico.desercion` (pestaña Deserción) — **OCULTO en seed 59 desde 2026-08-03 (403 a todos), ver nota de verificación** |
| Libros de registro | `/academico/libros` | `academico.libro` (backend + frontend completos) |

> **Licencias estudiantiles** ya **no** es un ítem propio: pasó a ser una **página dentro de
> Asistencia** (`/academico/asistencia/licencias/listar`), permisos renombrados
> `academico.licencia.*` → `academico.asistencia.licencia.*`.

Raíz `/academico`: dashboard pendiente (`UnderConstruction`).

### ACA - Calificaciones (detalle rutas)
Permisos: `academico.calificacion.*` — menu: `/academico/calificaciones` (IDs 15–24)

**Aterrizaje (`landingStack` en `ACA-CAL`):** `…coordinacion` inline → `…mis_cursos` redirect. Rol DOCENTE solo tiene ingreso + mis_cursos + cuaderno (+ operación cuaderno), sin coordinación → entra directo a mis cursos. Roles con `…coordinacion` (RECTOR, DIR_ACADEMICO, SEC_ACADEMICA) ven coordinacion.

**API mis cursos:** DOCENTE usa `GET /calificaciones/mis-cursos` (permiso 17). El backend resuelve el docente por `docentes.usuario_id` o, si falta, por `usuarios.referencia_id` + `tipo_referencia = DOCENTE` (y sincroniza `usuario_id` en docentes). Sin vínculo → 403 con mensaje de contacto a coordinación. Seeder demo: `60-seed-usuario-docente-demo.sql` (usuario `docente`, docente id=1). `GET /calificaciones/coordinacion/docentes/:id/cursos` exige permiso 16; el frontend solo lo llama si `hasPermiso(coordinacion)` y hay `docenteId` en contexto (ver `useCalificacionesVistaContext`).

| Permiso (codigo) | Acciones | Pantalla / comportamiento | Roles |
|---|---|---|---|
| `academico.calificacion.ingreso` | LISTAR | Item menu Calificaciones | REC, DIRA, SECA, DOC, EST |
| `academico.calificacion.coordinacion` | LISTAR | Vista general docentes (inline en ingreso) | REC, DIRA, SECA |
| `academico.calificacion.mis_cursos` | LISTAR, DETALLE | Mis cursos del docente (redirect desde ingreso si no hay 16) | REC, DIRA, SECA, DOC |
| `academico.calificacion.cuaderno` | LISTAR, EXPORTAR | Cuaderno / consolidado bimestre; export Excel registro pedagógico (`GET .../export/registro-pedagogico`) | REC, DIRA, SECA, DOC |
| `academico.calificacion.politica` | EDITAR (pantalla); LISTAR en ruta de menú | `/academico/calificaciones/politica` (solo edición) | REC, DIRA, SECA |
| `sistema.catalogo.referencia` | LISTAR | **API complemento:** `GET /calificaciones/politica`, `/politica/catalogo`, `/tipos-evaluacion` (cuaderno, drawer, vista previa). Cualquier usuario con rol; no aparece en grilla Seguridad | Todos con rol |
| `academico.calificacion.gestion_bimestres` | LISTAR, EDITAR | `/academico/calificaciones/gestion-bimestres` | REC, DIRA, SECA |
| `academico.calificacion.cuaderno.evaluaciones` | CREAR, EDITAR, ELIMINAR | Evaluaciones (columnas) del cuaderno | REC, DIRA, SECA, DOC |
| `academico.calificacion.cuaderno.notas` | EDITAR | Notas (celdas) del cuaderno | REC, DIRA, SECA, DOC |
| `academico.calificacion.cuaderno.guardar` | EDITAR | Guardar bimestre y recalcular componentes | REC, DIRA, SECA, DOC |
| `academico.calificacion.bimestre.ajuste_admin` | EDITAR | Consolidado bimestre cerrado: habilitación / ajuste administrativo | REC, DIRA, SECA |

### ACA - Asistencia (detalle rutas)
Permisos: `academico.asistencia.*` — ítem `/academico/asistencia` (gemelo de Calificaciones, un ítem con varias páginas). Seeds en `59-seed-permisos-aca.sql`. Ver `docs/plan/MODULO-ASISTENCIA.md`.

| Permiso (codigo) | Acciones | Pantalla / comportamiento | Roles |
|---|---|---|---|
| `academico.asistencia.registro.ver` | LISTAR, DETALLE | Ítem menú + mis cursos (registro diario); gobierna visibilidad | REC, DIRA, SECA, DOC |
| `academico.asistencia.registro.cuaderno` | LISTAR, EDITAR | Planilla diaria del curso (toma P/R/F/L) | REC, DIRA, SECA (LISTAR), DOC (LISTAR+EDITAR) |
| `academico.asistencia.clase_no_dictada.ver` | LISTAR, CREAR, EDITAR | Clases no dictadas (cancelaciones por asignación docente) | REC, DIRA, SECA, DOC |
| `academico.asistencia.consolidado.ver` | LISTAR, EXPORTAR | Consolidado % por estudiante/curso — backend construido 2026-07-29: `GET /asistencia/consolidado?paraleloGestionId[&bimestre]` (matriz patrón centralizador, vista 169) + `GET /asistencia/consolidado/export` (Excel planilla verde) | REC, DIRA, SECA (LISTAR+EXPORTAR), DOC (LISTAR) |
| `academico.asistencia.licencia.ver` | LISTAR, DETALLE | Licencias estudiantiles (página dentro de Asistencia) | REC, DIRA, SECA, DOC |
| `academico.asistencia.licencia.crear` | CREAR, EDITAR, ELIMINAR | Solicitar / editar (PENDIENTE) / cancelar licencia estudiantil | REC, DIRA, SECA, DOC |
| `academico.asistencia.licencia.aprobar` | APROBAR | Aprobar licencia estudiantil | REC, DIRA, SECA |

> **DOCENTE en licencias (2026-07-03):** el docente edita (`PUT /asistencia/licencias/:id`) y
> cancela (`PUT /:id/cancel`) **solo sus propias solicitudes** (`created_by = usuario de la
> sesión`) **y solo en estado PENDIENTE** — guard en servidor (Editar/CancelarLicenciaUseCase,
> 403 con mensaje claro). Staff (REC/DIRA/SECA) sin restricción de autoría; aprobar sigue en
> `licencia.aprobar` (REC/DIRA/SECA).

> Modo coordinación (ver cualquier docente) vs propio: se resuelve por rol sobre el mismo
> `registro.ver` (no hay permiso de coordinación separado), con `useRouteViewMode`.
> Marca **L** y días neutros (feriado/receso/clase no dictada) se calculan en lectura, no se persisten.

### ACA - Historial académico (kardex FORM-SIE-ITT-04) — construido 2026-07-02
Permiso: `academico.historial.academico` — menú `/academico/historial/academico` (**reactivado**
en el bloque de deshabilitación temporal del seed 59; `academico.avance` fue
rehabilitado el 2026-07-29 — ver sección Avance).

| Permiso (codigo) | Acciones | Pantalla / comportamiento | Roles |
|---|---|---|---|
| `academico.historial.academico` | LISTAR | Ítem menú Historial → lista de estudiantes + buscador ("Mi historial" para EST: redirige a su transcript) | REC, DIRA, SECA, EST |
| `academico.historial.academico` | DETALLE | Transcript `/academico/historial/academico/:id` (`GET /estudiantes/:id/historial-academico`) | REC, DIRA, SECA, EST (solo propio) |
| `academico.historial.academico` | EXPORTAR | Excel kit planilla verde (`GET .../export`) + PDF FORM-SIE-ITT-04 (`GET .../export-pdf`, plantilla boletín). La UI del portal EST solo ofrece PDF | REC, DIRA, SECA, EST (solo propio) |

> **Retirados 2026-07-30 (Fase 4):** `academico.historial.folio` (folio del
> egresado, concepto anterior al schema 25) fue **reemplazado por
> `academico.libro`** (sección ACA - Libros de registro); la validación de
> egreso de `academico.historial.validar` **pasa a la Fase 5**
> (`tutorias.titulo.*`). Ya no se siembran en el seed 59.

> **Anti-IDOR:** ambas rutas llevan `estudianteSelfOnlyGuard` tras `verificarPermiso`: un usuario
> con vínculo estudiante solo accede a su propio `:id` (resuelto en servidor); staff sin restricción.
> **DOCENTE sin historial** (decisión 2026-07-02): el kardex es administración académica + el
> propio estudiante; el docente consulta notas en Calificaciones/Centralizador.
> **Datos:** vista final delgada `141-vista-historial-academico-estudiante-fila` (une bases
> `138` nota efectiva, `139` detalle asignatura del plan, `140` historial previo). Plan:
> `docs/plan/HISTORIAL-ACADEMICO.md`.

### ACA - Avance académico y Deserción (`/academico/avance`) — backend 2026-07-29 (REP disuelto)
Una página, dos pestañas con `PermisoGuard` por pestaña (frontend construido y agrupado bajo `/academico/seguimiento`).
**Estado en BD: oculto por el seed 59 (2026-08-03); los endpoints devuelven 403 a todos los roles hasta rehabilitar.** Grupos UI:
`aca_avance` (rehabilitado) y `aca_desercion` (nuevo). Seeds en
`59-seed-permisos-aca.sql`.

| Permiso (codigo) | Acciones | Pantalla / comportamiento | Roles |
|---|---|---|---|
| `academico.avance` | LISTAR | Pestaña Avance: `GET /avance-academico[?carreraId]` — % de materias aprobadas/convalidadas vs total del plan (vistas 170/171, universo del transcript 141). EST: alcance self en servidor ("Mi avance", anti-IDOR) | REC, DIRA, DOC, EST |
| `academico.avance` | EXPORTAR | `GET /avance-academico/export` — Excel 1 hoja planilla verde | REC, DIRA |
| `academico.desercion` | LISTAR | Pestaña Deserción: `GET /desercion[?gestionId][&carreraId]` — agregado carrera × gestión + detalle de desertores (vistas 172/173, grano ANUAL por ABANDONO/RETIRADO) | REC, DIRA |
| `academico.desercion` | EXPORTAR | `GET /desercion/export` — Excel 1 hoja (resumen + detalle) | REC, DIRA |

> **Deserción ≠ riesgo:** la métrica ACA mide abandono CONSUMADO (estados de
> matrícula, histórico anual); el riesgo pedagógico por notas es del módulo TUT
> (vistas 156/157, gestión vigente). Consumidores distintos, sin duplicar vistas.

### ACA - Libros de registro (`/academico/libros`) — schema 25, backend + frontend completos
Permiso ÚNICO por ítem: `academico.libro` (grupo `aca_libros`, seed 59). Libro
físico del centralizador: **uno por GESTIÓN, compartido por las 3 carreras**
(`libros_registro` es `UNIQUE(gestion_id)`, sin `carrera_id` — corrección de
schema 2026-08-03); folio = página de un paralelo (de cualquier carrera) con
hasta 10 estudiantes; `numero_folio` correlativo POR GESTIÓN cruzando todas
las carreras. Frontend completo: `LibrosListPage` → `LibroDetailPage` (tabs
por carrera) → `FolioPreviewPage`, más `LibroAnuladosPage`; ítem de menú
propio (`order: 2.7`).

| Permiso (codigo) | Acciones | Pantalla / endpoint | Roles |
|---|---|---|---|
| `academico.libro` | LISTAR | Listado de libros — `GET /libros[?gestionId]` (vista 175, incluye `carreras_con_folio`) | REC, DIRA, SECA |
| `academico.libro` | DETALLE | Ficha del libro (`GET /libros/:id`, cabecera + folios vista 176) y folio (`GET /libros/:id/folios/:folioId`, nómina congelada + celdas de la 135) | REC, DIRA, SECA |
| `academico.libro` | CREAR | Abrir libro (`POST /libros`; `numeroLibro` se INGRESA, uno solo para toda la gestión) · paralelos candidatos (`GET /libros/:id/paralelos`) · generar folios de un paralelo (`POST /libros/:id/folios`) · generar/reajustar TODOS los folios de la gestión (`POST /libros/gestiones/:gestionId/folios`, páginas de 10, numeración transaccional cross-carrera, todo-o-nada) | REC, DIRA, SECA |
| `academico.libro` | EDITAR | Editar/cerrar/reabrir libro (`PATCH /libros/:id`, `estado` ABIERTO↔CERRADO) · editar SOLO la observación de la fila (`PATCH /libros/:id/folios/:folioId/estudiantes/:filaId`, `{ observaciones }`; el ESTADO académico de la fila NUNCA es editable a mano, siempre deriva de la vista 135 al generar/reajustar el folio) — bloqueado si el folio está ANULADO | REC, DIRA, SECA |
| `academico.libro` | APROBAR | Anular folio (`PATCH /libros/:id/folios/:folioId/estado`): BORRADOR→ANULADO (con motivo obligatorio); ANULADO es terminal — **sin IMPRESO/FIRMADO**, el sistema no verifica impresión/firma física. El cierre OFICIAL del documento es `libros_registro.estado` (acción EDITAR, no APROBAR) | REC, DIRA |
| `academico.libro` | EXPORTAR | Excel del libro completo (`GET /libros/:id/export`): una hoja por paralelo, folios apilados + página de firmas de docentes + bloque ESTADÍSTICAS, logo MINEDU, margen de encuadernado; bloque de firmas solo si el libro está CERRADO (si ABIERTO exporta como borrador, sin firmas) | REC, DIRA, SECA |

> **Sin ELIMINAR:** un folio no se borra — se ANULA (motivo obligatorio) y el
> paralelo se regenera con numeración nueva (los números anulados no se
> reutilizan). **Notas por materia:** sin vista propia — se derivan de la 135
> (asignación docente VIGENTE): el libro se genera al cierre de la gestión
> mientras es vigente; el folio solo congela ESTADO y OBSERVACIONES. El
> veredicto APROBADO/REPROBADO del ESTADO congelado usa la MISMA función
> (`calcularVeredictoMateria`, `folioCeldasHelper.js`) que usa Centralizador
> para `observacion` en `GetCentralizadorParaleloUseCase` — una sola fuente de
> verdad entre ambas pantallas (alineación 2026-08-06). Reimpresión de
> gestiones pasadas = evolución futura (parametrizar la 135).

### ACA - Nivelaciones, Trazabilidad, Historial
Permisos: `academico.nivelacion.*`, `academico.trazabilidad.*`, `academico.historial.*`

| Accion | Descripcion | Roles |
|---|---|---|
| VER | Consultas academicas | ADM, REC, DIRA, SECA (y EST en historial propio) |
| CREAR | Solicitudes/registro operativo | ADM, REC, DIRA, SECA |
| EDITAR | Convalidacion/ajustes | ADM, REC, DIRA |
| APROBAR | Aprobaciones formales | ADM, REC, DIRA |

### DOC - Docentes y supervision (`/docentes/*`)
Permisos: `docentes.*` (seed `60-seed-permisos-doc.sql` — la numeración corrió
2026-07-29; referencias antiguas a «seed 59» para DOC son históricas)

| Codigo (seed) | Acciones v2 (`permiso_acciones`) | Uso principal (UI) |
|---|---|---|
| `docentes.ver` | LISTAR, DETALLE, EXPORTAR | Listado, ficha, export (cuando exista). DOCENTE: LISTAR + DETALLE **solo ficha propia** (portal docente) |
| `docentes.crear` | CREAR | Alta `/docentes/registrar` |
| `docentes.editar` | EDITAR, ELIMINAR | Formulario edicion ficha; baja (DELETE API pendiente) |
| `docentes.asignar` | CREAR, EDITAR, ELIMINAR | Asignacion docente-curso (`/docentes/asignar`, API `POST /docentes/asignaciones/curso`, modal en armado paralelo) |
| `docentes.supervision.ficha` | LISTAR, DETALLE, CREAR, EDITAR, EXPORTAR | **Supervisión docente** (`/docentes/supervision`, grupo `doc_supervision` orden 3): fichas de seguimiento en la clase presencial (schema 27, API `/api/v1/supervision-docente`, vista 174). Sin ELIMINAR ni APROBAR: la ficha realizada no se borra. EXPORTAR = `GET /:id/pdf` (réplica del formulario físico) |

| Accion | Descripcion | Roles |
|---|---|---|
| VER | Ver docentes / fichas de supervisión | ADM, REC, DIRA, DIRM (solo docentes), DOC (solo ficha propia) |
| CREAR | Nuevo docente / nueva ficha de seguimiento | ADM, REC, DIRA |
| EDITAR | Ficha docente / ficha de seguimiento | ADM, REC, DIRA |
| EXPORTAR | PDF de la ficha de seguimiento | ADM, REC, DIRA |
| APROBAR | Licencias docentes (deshabilitado: página en construcción) | ADM, REC, DIRA |

> **Supervisión docente (2026-07-30, permiso único):** operan **REC** y **DIRA**
> (+ADM por herencia de vista) — la ficha real lleva firma y sello de la
> Dirección Académica. El evaluador (`supervisor_id`) se fija en servidor desde
> la sesión (`req.usuario.id`), jamás del cliente. Los 5 códigos legacy
> `docentes.supervision.evaluar/.reporte/.programar/.ficha.crear/.ficha.editar`
> fueron RETIRADOS del seed 60 (nunca tuvieron pantalla ni backend).
> **Wrapper self del DOCENTE (sin filas RBAC):**
> `GET /supervision-docente/mis-fichas` con gate solo `authenticate` (patrón
> `/docentes/mis-datos`); el docente se resuelve con `resolveDocenteIdForUsuario`
> (403 si el usuario no tiene vínculo docente, anti-IDOR) y ve únicamente las
> fichas de SUS cursos (vista 174 WHERE `docente_id`).

**Rol DOCENTE (7) — alcance propio (portal del rol docente, 2026-07-03):**
- `docentes.ver` LISTAR + DETALLE: el ítem Docentes salta a **SU propia ficha** `/docentes/:id` vía wrapper
  de rol (sin listado de plantilla ni escritura). El id propio se obtiene con `GET /docentes/mis-datos`
  (`{ id, nombreCompleto }`, gate solo `authenticate`; 403 si el usuario no tiene vínculo docente).
- Panel de inicio: `GET /dashboard/mi-resumen-docente` (gate solo `authenticate`, sin permiso propio, como
  `/auth/me`): identidad + gestión/bimestre vigentes + carga (vista 53) + cursos (composición de mis-cursos)
  + bloques de horario (vista 128). El docente se resuelve SIEMPRE en servidor (`resolveDocenteIdForUsuario`).
  **Segunda ola (2026-07-03), ADITIVO:** `stats { sesionesHoy, sesionesMes }` (conteo de sesiones del
  usuario) y `actividades[]` — feed propio del docente desde la vista 149
  (`vista_dashboard_actividades_recientes` WHERE `docente_id`; tipos ASISTENCIA_TOMADA, CLASE_NO_DICTADA,
  ASIGNACION_DOCENTE, NOTA_REGISTRADA, DOCENTE), mismas claves snake_case del feed del estudiante.
- "Mis estudiantes": `GET /docentes/mis-estudiantes` (gate solo `authenticate`; identidad vía
  `resolveDocenteIdForUsuario`): roster de estudiantes matriculados en SUS cursos vigentes de la
  gestión vigente (vista 150 `vista_docente_curso_estudiantes`). Sin gestión vigente → `estudiantes: []`.
  Desde ahí abre la ficha `GET /estudiantes/:id` (`matricula.admision.ver` DETALLE +
  `estudianteAlcanceDocenteGuard`, ver MAT-Admisiones).
- Grilla de horario propia: `GET /horarios/docentes/:docenteId/grilla-conflictos` con
  `institucional.horario.conflictos` LISTAR + `docenteSelfOnlyGuard('docenteId')` (solo su propia grilla).
- Licencias estudiantiles: `academico.asistencia.licencia.crear` EDITAR + ELIMINAR con guard
  created_by + estado PENDIENTE en servidor (ver ACA-Asistencia).
- `docentes.licencia.ver` LISTAR + `docentes.licencia.crear` CREAR (menú Licencias docentes;
  deshabilitados temporalmente: página en construcción). Pasantías docentes: retiradas del seed
  2026-07-29 (el dominio vive en Titulación/TUT; lo docente entra por wrappers del portal).
- Supervisión docente: **sin permisos** — tab/wrapper self `GET /supervision-docente/mis-fichas`
  (gate solo `authenticate` + `resolveDocenteIdForUsuario`; solo fichas de SUS cursos).

> **Anti-IDOR (docentes):** `GET /docentes/:id` y `GET /docentes/:id/carga-gestion` llevan
> `docenteSelfOnlyGuard` tras `verificarPermiso` (espejo de `estudianteSelfOnlyGuard`): un usuario
> con vínculo docente solo accede a su propio `:id` (resuelto en servidor); staff sin restricción.
> Los endpoints de escritura de Docentes NO se abren al rol DOCENTE.

> **Licencias de docentes (pendiente):** los permisos `docentes.licencia.*` existen, pero la
> **tabla `licencias_docentes` aún no está creada** (solo licencias de estudiante en schema 17).
> Se diseñará en el dominio Docentes y Asistencia la consumirá para clases no dictadas
> (ver `docs/plan/MODULO-ASISTENCIA.md` §7).

### INST - Institucional (`/institucional/*`)
Permisos: `institucional.*`

Rutas simplificadas vigentes del modulo:
- `/institucional/actual` — ✅ **Gestión actual (Panel, solo lectura)**. Entrada `institucional.gestion.actual` (67) + LISTAR.
  KPIs globales + **cronograma académico** de la gestión vigente + línea de tiempo de bimestres
  (datos de `GET /calificaciones/gestion-bimestres` y `GET /calificaciones/gestion-cronograma`).
  El **cronograma** (calendario académico real, `actividades_calendario` seed 20 + `actividades` seed 17 +
  `periodos_academicos`, vía vista `vista_base_cronograma_gestion`) quedó **integrado en esta página**:
  ya **no existe** el ítem de menú `/institucional/cronogramas`. El endpoint `GET /calificaciones/gestion-cronograma`
  reutiliza `verificarPermisoCualquiera` y acepta `academico.calificacion.gestion_bimestres` O
  `institucional.gestion.actual` (LISTAR) — **no requiere permiso nuevo**.
- **Administración del cronograma** (`/institucional/actual/cronograma`, `…/nueva`, `…/:id` ficha, `…/:id/editar`):
  usa el permiso `institucional.gestion.cronograma` (68) con **LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR**.
  - `GET /calificaciones/cronograma` → LISTAR · `GET /calificaciones/cronograma/:id` → **DETALLE** (ficha y precarga del form)
    · `POST` → CREAR · `PUT /:id` → EDITAR · `DELETE /:id` → ELIMINAR.
  - **RBAC (nueva acción DETALLE del 68):** añadida en seed `56` (id 259) y asignada a RECTOR (2), DIR_ACADEMICO (3)
    y SEC_ACADEMICA (5) en seed `55` (ids 655–657). ADMIN_SISTEMA por derivación. Requiere **re-seed** 56/55.
- `/institucional/actual/bimestres` — ✅ **Control de bimestres (configuración del ciclo lectivo)**. Ruta `institucional.gestion.actual` (67) + **EDITAR**.
  **No es ítem del sidebar**: se accede desde el botón "Control de bimestres" del panel de Gestión actual.
  Acciones: "Habilitar inicio de clases" (`POST /calificaciones/gestion-bimestres/iniciar`), "Cerrar bimestre"
  (`.../bimestre/:n/validar-cierre` + `.../cerrar`; el cierre efectivo en backend está en preparación), y
  **configuración de periodos** (calendario anual + edición de fechas + CRUD de etapas):
  - `GET /calificaciones/gestion-bimestres/periodos` (LISTAR) — periodos/etapas de la gestión vigente.
  - `PUT /calificaciones/gestion-bimestres/periodos/:id/fechas` (EDITAR) — fechas inicio/fin.
  - `POST /calificaciones/gestion-bimestres/periodos` (EDITAR) — alta de etapa (división OTRO).
  - `DELETE /calificaciones/gestion-bimestres/periodos/:id` (EDITAR) — baja de etapa no estructural
    (bimestres/planificación/clausura protegidos en el use case).
  Todos con `verificarPermisoCualquiera` (`academico.calificacion.gestion_bimestres` **o** `institucional.gestion.actual`).
  **Sin permiso nuevo**: reusan el 67 EDITAR ya existente en seeds 55/56.

  **RBAC (nuevo permiso EDITAR del 67):** se añadió la acción `EDITAR` al permiso `institucional.gestion.actual` (67)
  en seed `56` y se asignó a RECTOR (2), DIR_ACADEMICO (3) y SEC_ACADEMICA (5) en seed `55`
  (migración idempotente `05-migrations/25-rbac-institucional-gestion-actual-editar.sql`). Los endpoints de
  `gestion-bimestres` (GET estado, iniciar, validar/cerrar) usan `verificarPermisoCualquiera` y aceptan
  **`academico.calificacion.gestion_bimestres` O `institucional.gestion.actual`** (LISTAR/EDITAR), de modo que
  los opera tanto Calificaciones (coordinación) como Institucional → Gestión actual. ADMIN_SISTEMA por derivación.
- `/institucional/oferta` (wizard oferta; redirect desde `/institucional/oferta-academica`)
- `/institucional/horarios`
- `/institucional/pasadas`

Subrutas operativas de horarios (definidas en `frontend/.../institucional/routes.jsx`):
- `/institucional/horarios/generar` — `institucional.horario.asignar` + CREAR
- `/institucional/horarios/plantilla` — `institucional.horario.plantilla` + LISTAR
- `/institucional/horarios/paralelo/:id/gestion` — `institucional.gestion.horarios` + LISTAR
- `/institucional/horarios/armado` — `institucional.horario.armado` + EDITAR
- `/institucional/horarios/asignacion-docente` — `institucional.horarios.asignacion-docente` + LISTAR
- `/institucional/horarios/carga-docentes/:gestionId` — `institucional.horarios.carga-docente` + LISTAR
- `/institucional/horarios/aulas` — `institucional.gestion.horarios` + LISTAR
- `/institucional/horarios/publicacion` — `institucional.horario.publicacion` + EDITAR

Permisos por etapa (en `62-seed-permisos-inst.sql`):
- `institucional.horario.plantilla`
- `institucional.horario.armado`
- `institucional.horario.conflictos`
- `institucional.horario.publicacion`

> **DOCENTE (2026-07-03):** `institucional.horario.conflictos` **LISTAR** para su propia grilla
> semanal (`GET /horarios/docentes/:docenteId/grilla-conflictos`, portal docente); anti-IDOR
> `docenteSelfOnlyGuard('docenteId')` en servidor (solo su propio id; staff sin restricción).
> Sin EDITAR: la resolución de conflictos sigue siendo staff (REC/DIRA).

#### Oferta académica (Sprint 3)

| Código | Acciones | UI |
|---|---|---|
| `institucional.oferta.gestion-plan` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Paso 1–2 wizard: gestión vigente, habilitar plan |
| `institucional.oferta.paralelo-gestion` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Paso 3: paralelos_gestion, aula, turno, estado |
| `institucional.oferta.cursos` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Generar/validar oferta_cursos, drawer manual |

| Recurso API | Método | Permiso | Acción |
|-------------|--------|---------|--------|
| `/api/v1/gestiones` | GET | `institucional.gestion.actual` **o** `institucional.oferta.gestion-plan` | LISTAR | Wizard paso 1 (cualquiera de los dos) |
| `/api/v1/gestiones/:id/marcar-vigente` | POST | `institucional.oferta.gestion-plan` | ACTIVAR |
| `/api/v1/gestiones/:id/planes-habilitados` | GET | `institucional.oferta.gestion-plan` | LISTAR |
| `/api/v1/gestiones-planes` | POST | `institucional.oferta.gestion-plan` | CREAR |
| `/api/v1/gestiones-planes/:id/estado` | PUT | `institucional.oferta.gestion-plan` | EDITAR |
| `/api/v1/gestiones-planes/:id/paralelos-gestion` | GET | `institucional.oferta.paralelo-gestion` | LISTAR |
| `/api/v1/gestiones-planes/:id/generar-paralelos-gestion` | POST | `institucional.oferta.paralelo-gestion` | CREAR |
| `/api/v1/paralelos-gestion/:id` | GET/PUT | `institucional.oferta.paralelo-gestion` | DETALLE / EDITAR |
| `/api/v1/paralelos-gestion/:id/cambiar-turno` | PUT | `institucional.oferta.paralelo-gestion` | EDITAR |
| `/api/v1/paralelos-gestion/:id/estado` | PUT | `institucional.oferta.paralelo-gestion` | EDITAR |
| `/api/v1/paralelos-gestion/:id/oferta-cursos` | GET | `institucional.oferta.cursos` | LISTAR |
| `/api/v1/paralelos-gestion/:id/generar-oferta` | POST | `institucional.oferta.cursos` | CREAR |
| `/api/v1/paralelos-gestion/:id/validar-oferta` | GET | `institucional.oferta.cursos` | LISTAR |
| `/api/v1/oferta-cursos` | POST | `institucional.oferta.cursos` | CREAR |
| `/api/v1/oferta-cursos/:id/estado` | PUT | `institucional.oferta.cursos` | EDITAR |
| `/api/v1/oferta-cursos/:id` | DELETE | `institucional.oferta.cursos` | ELIMINAR |
| `/api/v1/aulas/catalogo` | GET | `institucional.oferta.paralelo-gestion` | LISTAR |

**Roles:** RECTOR (2) y SEC_ACADEMICA (5) operación completa; DIR_ACADEMICO (3) CREAR/EDITAR/LISTAR/DETALLE sin ACTIVAR masivo.

#### Asignación docente y carga (Sprint 4)

| Código | Acciones | UI |
|---|---|---|
| `institucional.horarios.asignacion-docente` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR | Matriz `/institucional/horarios/asignacion-docente` (A6) |
| `institucional.horarios.color-docente` | LISTAR, EDITAR | Color picker al asignar docente |
| `institucional.horarios.carga-docente` | LISTAR, DETALLE | Dashboard `/institucional/horarios/carga-docentes/:gestionId` (A6) |

| Recurso API | Método | Permiso | Acción | Notas |
|-------------|--------|---------|--------|-------|
| `/api/v1/asignaciones-docentes` | GET | `institucional.horarios.asignacion-docente` | LISTAR | Fallback `docentes.asignar` EDITAR |
| `/api/v1/asignaciones-docentes` | POST | `institucional.horarios.asignacion-docente` | CREAR | Fallback `docentes.asignar` CREAR |
| `/api/v1/asignaciones-docentes/:id` | GET | `institucional.horarios.asignacion-docente` | DETALLE | |
| `/api/v1/asignaciones-docentes/:id` | PUT | `institucional.horarios.asignacion-docente` | EDITAR | |
| `/api/v1/asignaciones-docentes/:id` | DELETE | `institucional.horarios.asignacion-docente` | ELIMINAR | |
| `/api/v1/paralelos-gestion/:id/cobertura-docente` | GET | `institucional.horarios.asignacion-docente` | LISTAR | |
| `/api/v1/paralelos-gestion/:id/grilla-horario` | GET | `institucional.horario.armado` | LISTAR | Lectura grilla + conflictos + cobertura (vistas `122`–`126`) |
| `/api/v1/paralelos-gestion/:id/conflictos` | GET | `institucional.horario.conflictos` | LISTAR | |
| `/api/v1/paralelos-gestion/:id/publicar` | POST | `institucional.horario.publicacion` | EDITAR | |
| `/api/v1/paralelos-gestion/:id/cambiar-turno-con-bloques` | PUT | `institucional.horario.armado` | EDITAR | |
| `/api/v1/gestiones/:id/conflictos` | GET | `institucional.horario.conflictos` | LISTAR | |
| `/api/v1/gestiones/:id/publicar-todos` | POST | `institucional.horario.publicacion` | EDITAR | Publica PG en `OFERTADO` que cumplan pre-condiciones |
| `/api/v1/conflictos/validar` | POST | `institucional.horario.armado` | EDITAR | |
| `/api/v1/asignacion-horarios` | POST | `institucional.horario.armado` | EDITAR | |
| `/api/v1/asignacion-horarios/:id` | PUT, DELETE | `institucional.horario.armado` | EDITAR | |
| `/api/v1/asignacion-horarios/bulk` | POST | `institucional.horario.armado` | EDITAR | |
| `/api/v1/docentes/:id/carga-gestion` | GET | `institucional.horarios.carga-docente` | LISTAR | También acepta asignacion-docente LISTAR |
| `/api/v1/gestiones/:id/carga-docentes` | GET | `institucional.horarios.carga-docente` | LISTAR | Dashboard KPIs |
| `/api/v1/docentes/colores-en-uso` | GET | `institucional.horarios.color-docente` | LISTAR | |
| `/api/v1/docentes/colores-sugeridos` | GET | `institucional.horarios.color-docente` | LISTAR | |
| `/api/v1/docentes/:id/color` | PUT | `institucional.horarios.color-docente` | EDITAR | |
| `/api/v1/docentes/cursos/:cursoId/horarios` | GET | `institucional.horarios.asignacion-docente` | EDITAR | `cursoId` = `oferta_curso_id`; aula efectiva vía vista 54 |

**Roles:** RECTOR (2), DIR_ACADEMICO (3) y SEC_ACADEMICA (5) con acciones operativas sobre `institucional.horarios.{asignacion-docente,color-docente,carga-docente}`. Rutas legacy bajo `/docentes/asignaciones*` mantienen fallback `docentes.asignar` en backend hasta retiro en A6.

Rutas retiradas del router (tabla `cursos` ya no existe): `GET/POST /paralelos/:id/cursos-oferta`, `POST /paralelos/:id/cursos`, `GET/PUT /paralelos/:id/schedule`, montaje `/api/v1/cursos`.

#### APIs alineadas (backend)

| Recurso | Metodo | Permiso | Accion | Notas |
|---------|--------|---------|--------|--------|
| `/api/v1/paralelos` | GET | `institucional.gestion.horarios` | LISTAR | Tablero / listado |
| `/api/v1/paralelos/:id/schedule` | GET | `institucional.gestion.horarios` | LISTAR | Cargar plan |
| `/api/v1/paralelos/:id/schedule` | PUT | `institucional.horario.armado` | EDITAR | Persistir bloques (misma regla que ruta armado) |
| _(retiradas)_ `/paralelos/:id/cursos-oferta`, `/paralelos/:id/cursos`, `/cursos/:id` | — | — | — | Usar API oferta (tabla arriba) |
| `/api/v1/docentes/asignaciones/curso` | POST | `docentes.asignar` | EDITAR | Asignar docente a curso (desde modal en armado) |

UI: botones de **Guardar plan / Añadir bloque** usan `ActionButton` con `institucional.horario.armado` + EDITAR; **Asignar docente** usa `docentes.asignar` + EDITAR (listado en tab Cursos del paralelo).

#### Hook `useHorariosOfertaPermisos`

CREAR/EDITAR/ELIMINAR de la tabla de cursos en armado acepta `institucional.gestion.horarios` **o** las mismas acciones sobre `institucional.horario.plantilla` si el rol las tiene en seed (p. ej. plantilla con CREAR).

### CFG - Configuracion (`/configuracion/*`)

**Arquitectura frontend:** skill `incos-frontend-module`. Permisos del módulo en
`66-seed-permisos-cfg.sql` (códigos `configuracion.*`: plan-estudio, carrera, materia,
plan-estudio.{periodos,asignaturas,prerrequisitos}, paralelo, aula, tipo-evaluacion,
complementario.* (discapacidad, apoderados, idiomas, estado-civil), documentacion.*, convenios,
pagos, historial-actividades), cada uno con sus acciones y grants en el mismo archivo.

#### Académico — Plan de estudio (menu unico, tabs + subruta)

| Ruta UI | Permiso (codigo) | Acciones tipicas | Uso |
|---------|------------------|------------------|-----|
| `/configuracion/academico` | Entrada: `permisoAny` (carrera, materia, plan-estudio) | LISTAR en cada tab visible | Menu "Academico"; tabs filtrados por permiso |
| `?tab=planes` | `configuracion.plan-estudio` | LISTAR, DETALLE, CREAR, EDITAR, ACTIVAR | Tab planes |
| `?tab=carreras` | `configuracion.carrera` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR | Tab carreras |
| `?tab=materias` | `configuracion.materia` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR | Tab materias |
| `/configuracion/academico/plan/:planId` | `configuracion.plan-estudio` | DETALLE (+ EDITAR matriz vía `…asignaturas`) | Matriz del plan; prerrequisitos usan `…prerrequisitos` |
| `/configuracion/academico/plan/nuevo` (`CFG-PLAN-NUEVA`) | `configuracion.plan-estudio` | CREAR | Formulario de alta de plan |
| `/configuracion/academico/plan/:id/editar` (`CFG-PLAN-EDITAR`) | `configuracion.plan-estudio` | EDITAR | Formulario de edición de plan |
| `/configuracion/academico/plan/:id` (`CFG-PLAN-DETALLE`) | `configuracion.plan-estudio` | DETALLE | Ficha-hub del plan (tabs Información / Periodos y asignaturas / Prerrequisitos) |
| (API periodos) | `configuracion.plan-estudio.periodos` | LISTAR, CREAR, EDITAR, ELIMINAR | Anios del plan |
| (API asignaturas) | `configuracion.plan-estudio.asignaturas` | LISTAR, CREAR, EDITAR, ELIMINAR | Celdas matriz |
| (API prerrequisitos) | `configuracion.plan-estudio.prerrequisitos` | LISTAR, DETALLE, CREAR, ELIMINAR | Editor en detalle de plan |

Redirects legacy: `/configuracion/academico/carreras|materias` → tab; no requieren permiso distinto.

**Clonado de plan ("nueva versión por RM"):** `POST /planes-estudios/:id/clonar` reutiliza la acción
`CREAR` ya existente de `configuracion.plan-estudio` (no agrega una acción nueva). Copia
periodos + asignaturas_plan + prerrequisitos del plan origen hacia un plan destino que nace
`vigente=false`; el plan origen queda intacto. Flujo de negocio: clonar → editar la copia
(`CFG-PLAN-EDITAR`) → publicar marcándola vigente (acción `ACTIVAR`, desmarca el plan anterior),
sin afectar a estudiantes ya inscritos en el plan previo.

**Roles:** RECTOR (2), DIR_ACADEMICO (3) y SEC_ACADEMICA (5) tienen bloque amplio de `configuracion.*`; DIR_ADMIN y SEC_ADMIN sin CFG academico salvo casos puntuales. **Nota:** RECTOR incluye `DETALLE` en materia; DIR_ACADEMICO incluye `DETALLE` en plan para abrir matriz; edición de celdas sigue requiriendo `configuracion.plan-estudio.asignaturas` `EDITAR`.

#### Recursos académicos (`/configuracion/recursos`, tabs)

Menú "Recursos académicos": tab 1 Paralelos (maestro, movido desde `configuracion/academico` el
2026-07-07, mismo código de permiso `configuracion.paralelo` sin cambios de negocio/RBAC), tab 2
Aulas, tab 3 Tipos de evaluación (ambos nuevos, 2026-07-07).

| Ruta UI | Permiso (codigo) | Acciones tipicas | Uso |
|---------|------------------|------------------|-----|
| `/configuracion/recursos` | Entrada: `permisoAny` (paralelo, aula, tipo-evaluacion) | LISTAR en cada tab visible | Menu "Recursos académicos"; tabs filtrados por permiso |
| `?tab=paralelos` | `configuracion.paralelo` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Tab paralelos (catálogo maestro); `ruta_sidebar` actualizada de `/configuracion/academico` a `/configuracion/recursos` |
| `?tab=aulas` | `configuracion.aula` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Tab aulas (catálogo maestro; distinto del picker de solo lectura de Institucional/Oferta) |
| `?tab=tipos-evaluacion` | `configuracion.tipo-evaluacion` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | Tab tipos de evaluación (catálogo maestro; distinto de `sistema.catalogo.referencia`, el combo de solo lectura del cuaderno de calificaciones) |

**Roles:** RECTOR y DIR_ACADEMICO con bloque completo en `aula` y `tipo-evaluacion` (LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/ACTIVAR); en `paralelo` ambos con bloque completo (DIR_ACADEMICO igualado con ACTIVAR el 2026-07-08, simetría con su ELIMINAR).

> **Activación rápida de recursos académicos (`ACTIVAR`, 2026-07-08):** los 3 catálogos maestros exponen
> `PATCH /api/v1/{aulas|paralelos|tipos-evaluacion}/:id/estado` con body `{ "activo": boolean }` y
> `verificarPermiso('configuracion.{aula|paralelo|tipo-evaluacion}', 'ACTIVAR')` (mismo patrón que los
> catálogos complementarios). Funciona también sobre ítems ya inactivos (reactivar); el soft-delete
> (`deleted_at`) sigue siendo exclusivo de ELIMINAR. Los 3 GET de listado aceptan
> `?incluirInactivos=true` para incluir ítems con `activo=false` (`deleted_at IS NULL`); cada ítem del
> listado expone el campo `activo` (boolean). Roles con ACTIVAR (simetría con ELIMINAR por código):
> los 3 códigos → RECTOR y DIR_ACADEMICO. ADMIN_SISTEMA hereda por vista (sin filas en
> `roles_permisos`). Seed: `66-seed-permisos-cfg.sql` (requiere re-siembra).

#### Datos complementarios (tabs + ABM/detalle de página completa)

| Ruta UI canonica | Permiso | Notas |
|------------------|---------|--------|
| `/configuracion/complementarios` | `permisoAny` (complementario.*) | Menu "Datos complementarios" |
| `?tab=discapacidad` | `configuracion.complementario.discapacidad` | Listado (`createSimpleCatalogTableColumns`) |
| `?tab=apoderados` | `configuracion.complementario.apoderados` | Listado (tipos de parentesco) |
| `?tab=idiomas` | `configuracion.complementario.idiomas` | Listado (incluye `codigoIso`) |
| `?tab=estado-civil` | `configuracion.complementario.estado-civil` | Listado (`createSimpleCatalogTableColumns`, catálogo `estados_civiles`, 2026-07-07) |
| `/configuracion/complementarios/{discapacidad\|apoderado\|idioma\|estado-civil}/nueva` | mismo codigo, accion `CREAR` | Alta (página completa, patrón CFG académico) |
| `/configuracion/complementarios/{discapacidad\|apoderado\|idioma\|estado-civil}/:id/editar` | mismo codigo, accion `EDITAR` | Edición |
| `/configuracion/complementarios/{discapacidad\|apoderado\|idioma\|estado-civil}/:id` | mismo codigo, accion `DETALLE` | Ficha |
| Switch activar/desactivar en cada tab | mismo codigo, accion `ACTIVAR` (2026-07-08) | PATCH `/{discapacidad\|tipos-parentesco\|idiomas\|estados-civiles}/:id/estado` body `{ activo: boolean }` |

> **Activación rápida de catálogos (`ACTIVAR`, 2026-07-08):** los 4 catálogos complementarios exponen
> `PATCH /api/v1/{discapacidad|tipos-parentesco|idiomas|estados-civiles}/:id/estado` con body
> `{ "activo": boolean }` y `verificarPermiso('<codigo complementario>', 'ACTIVAR')`. Funciona también
> sobre ítems ya inactivos (reactivar); el soft-delete (`deleted_at`) sigue siendo exclusivo de ELIMINAR.
> Los 4 GET de listado aceptan `?incluirInactivos=true` para incluir ítems con `activo=false`
> (`deleted_at IS NULL`); cada ítem del listado expone el campo `activo` (boolean). Roles con ACTIVAR
> (simetría con ELIMINAR por código): discapacidad y apoderados → RECTOR; idiomas y estado-civil →
> RECTOR y DIR_ACADEMICO. ADMIN_SISTEMA hereda por vista (sin filas en `roles_permisos`). Seed:
> `66-seed-permisos-cfg.sql` (requiere re-siembra).

`ruta_sidebar` del permiso aún apunta `/configuracion/datos-complementarios`; la app redirige a `/configuracion/complementarios`. Alinear en el archivo de permisos CFG.

#### Otros items CFG (rutas separadas)

| Menu | Ruta | Permiso (codigo) |
|------|------|------------------|
| Documentacion | `/configuracion/documentacion` (+ `/nueva`, `/:id/editar`, `/:id`) | `configuracion.documentacion` (LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/ACTIVAR) — catálogo ÚNICO de los 9 tipos de documento (ENUM `tipo_documento`); consolida los códigos segmentados `configuracion.documentacion.{inscripcion\|becas\|pasantias\|traslado}` (eliminados junto con `resolverPermisoDocumentacion`). GET de listado sigue como catálogo de referencia transparente (`sistema.catalogo.referencia`) y acepta `?incluirInactivos=true`; `PATCH /:id/estado` usa ACTIVAR. Roles: RECTOR (todas), DIR_ACADEMICO (LISTAR/DETALLE/EDITAR) |
| Convenios | `/configuracion/convenios` | `configuracion.convenios` |
| Actividades | `/configuracion/actividades` (+ `/nueva`, `/:id/editar`, `/:id`) | `configuracion.actividad` (renombrado desde `configuracion.historial-actividades`; LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/ACTIVAR — ACTIVAR solo RECTOR, `PATCH /:id/estado`; GET acepta `?incluirInactivos=true`) |
| Pagos config | `/pagos/configuracion` | ~~`configuracion.pagos`~~ **legacy** — el código real sembrado y usado por los routers es `finanzas.configuracion.pago` (módulo FIN, ver "FIN - Configuración de Finanzas"; hoy con LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/ACTIVAR para RECTOR y DIR_ADMIN) |

Codigos legacy `cfg.academico.*` **no** deben usarse en codigo nuevo; fueron reemplazados por `configuracion.*`.

### REP - Reportes — MÓDULO DISUELTO (2026-07-29)
Los 7 códigos `reportes.*` fueron retirados definitivamente (seed 63 =
tombstone con los DELETE de limpieza). Los reportes viven con su módulo dueño:

| Código REP retirado | Dueño / reemplazo |
|---|---|
| `reportes.avance_academico` | ACA `academico.avance` (rehabilitado; `GET /avance-academico`) |
| `reportes.asistencia` | ACA `academico.asistencia.consolidado.ver` (`GET /asistencia/consolidado`) |
| `reportes.desercion` | ACA `academico.desercion` (nuevo; `GET /desercion`) |
| `reportes.solicitudes.general` | Retirado sin reemplazo (bandeja transversal prematura) |
| `reportes.solicitudes.becas` | FIN `finanzas.beca.reporte` + MAT BecasList (ya construidos) |
| `reportes.solicitudes.traspaso` | Nacerá con ACA `academico.trazabilidad.traspaso.*` |
| `reportes.solicitudes.pasantia` | Módulo Pasantías `tutorias.pasantia.*` (seed 65) |

El esqueleto frontend (`modules/reportes/`, iconos `REP-*`) se borra en la
iteración frontend de la disolución.

### CAP - Capacitación (`/capacitacion/*`) — módulo nuevo 2026-07-16
Dominio `CAPACITACION`, módulo `CAP` (cursos cortos a público externo, sin login). Seed: `64-seed-permisos-cap.sql` (numeración vigente; en el changelog original figuraba como 65; **verificar siembra en BD**, junto al schema `25-cursos-capacitacion.sql`, el seeder de horarios de capacitación y las vistas 154/155). Grupos UI: `cap_cursos`, `cap_participantes`, `cap_inscripciones`. Roles con acceso (primer corte): RECTOR, DIR_ADMIN, SEC_ADMIN; ADMIN_SISTEMA hereda por vista.

| Permiso (codigo) | Acciones | Ruta sidebar | Endpoints | Roles |
|---|---|---|---|---|
| `capacitacion.curso` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | `/capacitacion/cursos` | `GET/POST /cursos-capacitacion`, `GET/PUT/DELETE /cursos-capacitacion/:id`, `PATCH /cursos-capacitacion/:id/estado` | RECTOR, DIR_ADMIN, SEC_ADMIN (SEC_ADMIN **sin** ELIMINAR/ACTIVAR) |
| `capacitacion.participante` | LISTAR, DETALLE, CREAR, EDITAR | `/capacitacion/participantes` | `GET/POST /participantes`, `GET/PUT /participantes/:id` | RECTOR, DIR_ADMIN, SEC_ADMIN |
| `capacitacion.inscripcion` | LISTAR, DETALLE, CREAR, ELIMINAR | `/capacitacion/inscripciones` | `GET/POST /inscripciones-capacitacion`, `GET/DELETE /inscripciones-capacitacion/:id` | RECTOR, DIR_ADMIN, SEC_ADMIN (SEC_ADMIN **sin** ELIMINAR) |
| `capacitacion.pago` | CREAR, EXPORTAR | `/capacitacion/inscripciones` | `POST /inscripciones-capacitacion/:id/pagos` (CREAR; EXPORTAR sembrado, sin endpoint aún) | RECTOR, DIR_ADMIN, SEC_ADMIN (SEC_ADMIN **sin** EXPORTAR) |

> Aislamiento: tablas propias (`participantes`, `capacitaciones`, `capacitacion_*`) sin FK hacia
> `estudiantes`/`usuarios`; reutiliza solo catálogos `aulas`, `horarios` (`tipo_horario='CAPACITACION'`),
> `metodos_pago`, `cuentas_pago`. `DELETE /inscripciones-capacitacion/:id` marca RETIRADO + soft-delete
> en cascada de pagos. Recibo PDF (GENERAR_PDF) diferido a una segunda iteración.
> Gap conocido: el picker de aulas del form de curso reutiliza `GET /aulas/catalogo`
> (`institucional.oferta.paralelo-gestion` LISTAR) que SEC_ADMIN no tiene — la UI degrada con select
> deshabilitado; candidato a `sistema.catalogo.referencia` (`listarCatalogoReferencia`).

### SEG - Seguridad (`/seguridad/*`)
Permisos: `seguridad.usuario.crear`, `seguridad.usuario.administrar`, `seguridad.rol.gestionar`
Endpoint(s): `GET/POST/PUT/PATCH/DELETE /usuarios`, `GET/PUT /roles/:id/permisos`

| Accion | Descripcion | Endpoint | Roles |
|---|---|---|---|
| VER | Ver usuarios/roles/permisos | GET | ADM, REC, DIRM |
| CREAR | Crear usuario | POST /usuarios | ADM, REC, DIRM |
| EDITAR | Editar usuario y rol-permisos | PUT/PATCH | ADM, REC |
| ELIMINAR | Eliminar override de permiso | DELETE /usuarios/:id/permisos/:overrideId | ADM, REC |

## Auditoria backend (API Express)

Revision sobre `backend/src/presentation/routes/*.routes.js` y `permisos.middleware.js`.

**Cadena RBAC:** tras `authenticate`, `verificarPermiso(codigo, accion)` llama a `AuthRepository.tienePermiso(usuarioId, codigo, accion)`. Respuesta tipica si falla: **403** con `{ error: 'Acceso denegado', codigo, accion }`. Para `rol_id = 1` (ADMIN_SISTEMA) la vigencia del par se valida contra el catalogo `permiso_acciones` (vista `vista_catalogo_acciones_permisos_activas`); para el resto, contra `vista_usuario_permisos_efectivos` / `roles_permisos` (poblado por los archivos de permisos por módulo).

### Modulo Seguridad (`/api/v1/usuarios`, `/roles`, `/permisos`)

| Metodo | Ruta | Permiso | Accion |
|--------|------|---------|--------|
| GET | `/usuarios` | `seguridad.usuario.administrar` | LISTAR |
| POST | `/usuarios` | `seguridad.usuario.crear` | CREAR |
| GET | `/usuarios/alta/buscar-estudiantes`, `/alta/buscar-docentes` | `seguridad.usuario.crear` | CREAR |
| GET | `/usuarios/:id` | `seguridad.usuario.administrar` | DETALLE |
| PUT, PATCH `/:id`, `/:id/estado`, `/:id/password` | | `seguridad.usuario.administrar` | EDITAR |
| GET | `/usuarios/:id/permisos` | `seguridad.rol.gestionar` | LISTAR |
| POST, DELETE | `/usuarios/:id/permisos`, `/:id/permisos/:overrideId` | `seguridad.rol.gestionar` | EDITAR |
| GET | `/roles`, `/roles/:id/permisos`, `/roles/:id/permisos-grilla` | `seguridad.rol.gestionar` | LISTAR |
| PUT | `/roles/:id/permisos` | `seguridad.rol.gestionar` | EDITAR |
| GET | `/permisos` | `seguridad.rol.gestionar` | LISTAR |

Los controladores de seguridad deben mantener reglas de negocio extra (p. ej. inmutabilidad de ADMIN_SISTEMA) ademas del middleware.

### Modulos ya cruzados con seeds y frontend

- **Paralelos / horarios:** `GET` paralelos, schedule, cursos-oferta → `institucional.gestion.horarios` (LISTAR o CREAR segun ruta); `PUT /paralelos/:id/schedule` → `institucional.horario.armado` + **EDITAR**.
- **Cursos oferta:** PATCH/DELETE `/cursos/:id` → EDITAR / ELIMINAR sobre `institucional.gestion.horarios`.
- **Docentes:** listado/detalle/CRUD y asignaciones alineados con `docentes.ver`, `docentes.crear`, `docentes.editar`, `docentes.asignar` (POST asignacion curso con mismo stack que **EDITAR** en `docentes.asignar`, coherente con UI).

### Catálogos de referencia (`sistema.catalogo.referencia`, acción **LISTAR**)

**Permiso técnico (transparente para Seguridad).** No tiene `grupo_ui` ni `ruta_sidebar`: **no aparece** en `RolPermisosPage` / `PermisosDominioPicker`. No se asigna a roles en `roles_permisos`.

**Quién lo tiene:** cualquier usuario autenticado con `rol_id` asignado (`AuthRepository.tienePermiso` devuelve true para LISTAR). Así un rol con “crear estudiante” no queda sin combos de país, idioma, método de pago, etc.

**Dónde se declara:** no hace falta un permiso por tabla en los schemas SQL (`02`, `03`, `11`, `13`, …). Las tablas son datos; la regla vive en **cada ruta GET** del backend con `listarCatalogoReferencia` (alias `complementoPaginaLectura`). No se monta middleware global en `routes/index.js`: cada router marca qué lectura es catálogo vs operación de módulo.

**Bloquear datos concretos** (una carrera inactiva, un idioma dado) es configuración de negocio en CFG o estado `activo` en tablas, no este toggle.

Middleware: `listarCatalogoReferencia` (`authenticate` + `verificarPermiso`). Catálogo en `permiso_acciones` para validar que la acción existe en el sistema.

| Archivo | GET |
|---------|-----|
| `paises.routes.js` | `/api/v1/paises` |
| `provincias.routes.js` | `/api/v1/provincias` |
| `municipios.routes.js` | `/api/v1/municipios` |
| `departamentos.routes.js` | `/api/v1/departamentos` |
| `idiomas.routes.js` | `/api/v1/idiomas` |
| `tipos-parentesco.routes.js` | `/api/v1/tipos-parentesco` |
| `estados-civiles.routes.js` | `/api/v1/estados-civiles` |
| `discapacidad.routes.js` | `/api/v1/discapacidad` |
| `documentacion.routes.js` | `/api/v1/documentacion` |
| `metodos-pago.routes.js` | `/api/v1/metodos-pago` |
| `bancos-autorizados.routes.js` | `/api/v1/bancos-autorizados` |
| `cuentas-pago.routes.js` | `/api/v1/cuentas-pago` |
| `dashboard.routes.js` | `/api/v1/dashboard/resumen` |
| `calificaciones.routes.js` | `/api/v1/calificaciones/politica`, `/politica/catalogo`, `/tipos-evaluacion` |

## Hallazgos de la auditoria

- Docentes: permiso dedicado `docentes.editar` (id 59) separa **EDITAR** ficha de **CREAR** alta; **ELIMINAR** en UI queda listo; endpoint `DELETE /docentes/:id` pendiente de implementar.
- Existen `DELETE` activos para estudiantes, becas asignadas, inscripciones, pagos y overrides de usuarios.
- Existen `EXPORTAR` reales en estudiantes (excel) y pagos (recibo PDF).
- `ADMIN_SISTEMA` debe ser inmutable en SEG; se protegio en backend y UI.
- `PUT /api/v1/paralelos/:id/schedule` exige `institucional.horario.armado` + EDITAR (alineado con pantalla armado).

### RBAC en UI (`ActionButton` / `TableActions`)

- `TableActions` sin objeto `permisos` **no muestra** ver/editar/eliminar (fail-closed en `cumplePermisoRef`).
- Tablas con permisos: estudiantes, docentes, becas, pagos, inscripciones (matrícula), roles (seguridad).
- Botones de cabecera y filas en becas, horarios (aulas/armado/publicar), docentes (asignaciones), pagos (registrar), calificaciones y matrícula inscripciones usan `ActionButton` con el permiso+acción del seed.

### Grilla de roles (`grupo_ui` vs rutas)

- Una fila en `PermisosDominioPicker` = un `grupo_ui` (no una fila por cada permiso con distinta `ruta_sidebar`).
- Horarios por etapa: `inst_horarios` (tablero), `inst_horarios_plantilla`, `inst_horarios_armado` (incluye conflictos, perm. 99), `inst_horarios_publicacion`.
- Varias rutas del mismo grupo se muestran concatenadas en la columna de ruta (` · `).
