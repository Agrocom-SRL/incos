# Módulo Reportes (REP) — diagnóstico y recomendación

> Informe del `arquitecto` (2026-07-29), a pedido del usuario: cruzar el seed
> 63 contra las exportaciones ya existentes en EstudiantesList,
> InscripcionesList, PagosList y BecasList (+ resto del sistema).
> **Recomendación central: disolver REP — los reportes viven con su módulo
> dueño.** Decisión del usuario pendiente al pie.

## 1. Qué define hoy el seed 63

`backend/database/02-seeders/63-seed-permisos-rep.sql`: 4 grupos UI
(`rep_avance`, `rep_asistencia`, `rep_desercion`, `rep_solicitudes`) y **7
permisos** con LISTAR+EXPORTAR (`reportes.avance_academico`,
`reportes.asistencia`, `reportes.desercion`,
`reportes.solicitudes.{general,becas,traspaso,pasantia}`). Roles: RECTOR en
todos; DIR_ADMIN solo en `solicitudes.pasantia`. Bloque final (2026-06-24) de
**deshabilitación total** (`activo=0, deleted_at`). La sección REP de la
matriz (~línea 981) está obsoleta (solo una acción genérica "VER").

Matiz sobre la auditoría: "sin backend ni frontend" es impreciso — existe
esqueleto frontend (`modules/reportes/routes.jsx`, 8 rutas UnderConstruction,
registradas en `presentation/modules/index.js`, iconos `REP-*` en
`menuIcons.js`). Backend: cero.

## 2. Exportaciones/reportes YA construidos (inventario verificado)

| Capacidad | Permiso (acción) | Endpoint / generador |
|---|---|---|
| Estadística de inscritos (EstudiantesList) | `matricula.admision.ver` EXPORTAR | `GET /estudiantes/export/estadistica-inscritos` → vista 06 |
| Lista de inscritos por carrera (InscripcionesList) | `matricula.admision.ver`/`matricula.inscribir` EXPORTAR | `GET /estudiantes/export/lista-inscritos-por-carrera` → vistas 34/88 |
| Excel de aportes por carrera (PagosList) | `finanzas.pago.ver`/`matricula.pago.aporte.ver` EXPORTAR | `GET /pagos-aportes/export/lista-por-carrera` → vistas 89/90 |
| **Becas por carrera** (FIN→Reportes, real) | `finanzas.beca.reporte` | `GET /pagos-aportes/reportes/becas-por-carrera(+/export)` + página |
| **Cuentas por cobrar** (FIN→Reportes, real) | `finanzas.cuenta-cobrar.reporte` | ídem + página |
| Centralizador por paralelo/carrera | `academico.calificacion.centralizador` EXPORTAR | vista 135 |
| Cuaderno pedagógico Excel + boletín PDF | `academico.calificacion.cuaderno` | `BoletinPdfGenerator` |
| Historial académico (kardex) Excel+PDF, self ESTUDIANTE | `academico.historial.academico` EXPORTAR | vistas 141–143 |
| Inscritos de Capacitación | `capacitacion.inscripcion` EXPORTAR | builder propio |
| Panel acompañamiento PDF, bitácora tutor, dictámenes | `tutorias.*` EXPORTAR | vistas 156–158, 163 |

Toolkit consolidado: `excel/shared/` (`ExcelSheetComposer`, `ExcelTheme`) y
`pdf/IncosPDFLibBase.js`. **Deuda detectada de paso:** `docentes.ver`
EXPORTAR, `docentes.supervision.reporte` EXPORTAR y `capacitacion.pago`
EXPORTAR están sembrados **sin endpoint**.

## 3. Cruce seed 63 → estado

| Código seed 63 | Estado | Reemplazo |
|---|---|---|
| `reportes.avance_academico` | Parcial, duplicado | Dueño ACA: `academico.avance` (bloque off del seed 59, ruta `/academico/avance` ya existe con `labelByRole` ESTUDIANTE "Mi avance"); falta vista de % avance sobre la 141 (revisar si la 143 ya trae numerador) + endpoint + Excel + página |
| `reportes.asistencia` | Parcial, duplicado | `academico.asistencia.consolidado.ver` está **ACTIVO** en seed 59; ruta placeholder declarada; falta vista % (agregación de la 133/134) + endpoint + página Consolidado |
| `reportes.desercion` | Falta el reporte; el dato existe | Único sin dueño actual → dueño propuesto ACA (`academico.desercion` nuevo): vistas fila+agregado carrera×gestión espejo de 156/157 pero sobre estados ABANDONO/RETIRADO de `matriculas_materia` |
| `reportes.solicitudes.general` | Falta todo | Bandeja transversal prematura (depende de traspasos y pasantías): retirar y re-evaluar después |
| `reportes.solicitudes.becas` | **Cubierto** | FIN→Reportes Becas + BecasList (vista 137). Retirar |
| `reportes.solicitudes.traspaso` | Falta, dueño definido | Nacerá con el ítem ACA traspasos (bloque off seed 59). Retirar código REP |
| `reportes.solicitudes.pasantia` | Falta, dueño en construcción | Módulo Pasantías (Fase 2) es el dueño. Retirar código REP |

## 4. Recomendación de arquitectura: disolver REP

REP **no** debe existir como módulo con páginas propias. Precedente
inequívoco del repo: los reportes viven con su dominio (`finanzas/reportes/`
con hub propio, centralizador en Calificaciones, historial en Estudiantes,
inscritos en Capacitación). Un dominio REP paralelo duplicaría permisos
EXPORTAR (costo visible en los guards duales existentes), generadores y
entradas de menú — la misma deuda que la regla de vistas prohíbe en SQL,
trasladada a RBAC.

1. **Avance académico** → ítem ACA `academico.avance` (rehabilitar bloque off
   seed 59). Página con dos pestañas: "Avance" (permiso `academico.avance`) y
   "Deserción" (permiso nuevo `academico.desercion`, LISTAR/EXPORTAR,
   RECTOR/DIR_ACADEMICO) — comparten grano; `PermisoGuard` por pestaña.
2. **Asistencia** → ya es el Consolidado % de ACA Asistencia; solo construirlo.
3. **Solicitudes** → nada en REP (becas cubierto; traspaso/pasantía nacen con
   sus dueños; general diferido).
4. Hub transversal de menú: **no recomendado**. Si se quiere descubribilidad
   para RECTOR: tarjetas en su dashboard con `PermisoGuard` de los códigos
   dueños (mejora posterior, cero permisos nuevos).

## 5. Plan por partes (si se aprueba la disolución)

**Iteración 1 — backend** (vistas/seeds en BD requieren aprobación):
- Vistas (números libres al momento del merge, tras Fases 2/3): consolidado
  asistencia (agregación sobre 133/134; revisar si basta GROUP BY sobre la
  133), avance (estudiante×plan sobre 141/143), deserción (fila + agregado,
  espejo estructural de 156/157 — consumidor distinto justificado: métrica
  institucional de abandono, no riesgo por notas).
- Repos arquetipo B, use cases `Get*`/`Export*Excel` en
  `use-cases/academico/`, Excel con toolkit `shared/` (planilla verde),
  endpoints en rutas ACA con permisos ACA.
- Seeds: rehabilitar en el 59 `academico.avance` + añadir
  `academico.desercion`; **del 63 no se rehabilita nada** — retiro definitivo
  de los 7 documentado en el archivo y en la matriz con el reemplazo de cada
  uno. Decidir también los EXPORTAR huérfanos (`docentes.ver`,
  `docentes.supervision.reporte`, `capacitacion.pago`).

**Iteración 2 — frontend:**
- `modules/academico/avance/`: página con tabs Avance/Deserción (reemplaza
  UnderConstruction), hooks api/state, columnas, `ActionButton` EXPORTAR.
- `modules/academico/asistencia/`: página Consolidado % en la ruta declarada.
- Limpieza REP: borrar `modules/reportes/routes.jsx`, su registro en
  `presentation/modules/index.js`, iconos `REP-*`.
- Matriz: sección REP → retiro + punteros a los dueños.

## 6. Riesgos

- No clonar generadores: usar toolkit `shared/` + patrón builder por reporte.
- Los EXPORTAR quedan con el módulo dueño (patrón vigente) — rehabilitar el
  63 crearía pares de códigos y guards `permisoAny` en cascada.
- Numeración de vistas: asignar al integrar (colisión con Fases 2/3).
- **Deserción por bimestre**: ABANDONO/RETIRADO son consolidados anuales; si
  se pide deserción intra-gestión habría que derivarla también de asistencia
  (133) — validar grano con el usuario antes de fijar la vista.
- Código muerto: secuenciar la rehabilitación de `academico.avance` con el
  despliegue de su página (no mostrar menú hacia UnderConstruction).

## Decisión del usuario (2026-07-29)

- [x] **Disolución de REP APROBADA**: retiro de los 7 códigos del seed 63 +
  limpieza del esqueleto frontend; Avance/Deserción y Consolidado de
  asistencia se construyen bajo ACA.
- [x] **Grano de deserción: ANUAL por estados de matrícula**
  (ABANDONO/RETIRADO de `matriculas_materia`, vistas espejo de 156/157).
  La variante intra-gestión por asistencia queda como evolución futura si el
  instituto la pide.

## Estado (2026-07-29) — Iteración 1 (backend) HECHA

Implementado por capas (routes → controllers → use-cases → repositories
arquetipo B), DI registrada, seeds editados. **NADA ejecutado en BD** (gated,
ver "Pendiente BD" abajo). Frontend intacto (`modules/reportes/` sigue igual;
se borra en la iteración 2).

### Vistas SQL (archivos en `backend/database/03-views/`)

| Vista | Contenido | Bases |
|---|---|---|
| 169 `vista_asistencia_consolidado_bimestre_fila` | % asistencia estudiante × curso × bimestre (denominador = sesiones CERRADAS válidas; AUSENTE 1 / TARDANZA 0.5 / licencia neutraliza — misma regla que la actividad ASISTENCIA) | 133 + 130 + 134 + 129 |
| 170 `vista_base_avance_academico_conteo` | numerador estudiante × plan (DISTINCT APROBADO/CONVALIDADO) | GROUP BY sobre la 141 |
| 171 `vista_avance_academico_estudiante` | avance final (identidad + denominador `asignaturas_plan` + promedio) | 170 + 142 + tablas |
| 172 `vista_base_desercion_matricula_fila` | universo de matrícula con flag `es_desercion` (espejo 156; consumidor distinto documentado) | 138 + 139 + tablas |
| 173 `vista_desercion_carrera_gestion` | agregado carrera × gestión con denominadores y % (espejo 157) | 172 |

Ajustes ADITIVOS a vistas existentes (recrear en BD): **138** (+
`matricula_materia_id`, `carrera_id`), **139** (+ `plan_estudio_id`), **141**
(+ `asignatura_plan_id`, `plan_estudio_id`). Consumidores previos no cambian.
La 143 NO traía el numerador del avance (solo promedio vía 142) — por eso la
170 agrega sobre la 141; el consolidado NO salió de un simple GROUP BY de la
133 porque necesita el detalle del curso (130), el estado del registro (134) y
la exclusión de feriados/clases no dictadas (129) para igualar la regla del %.

### RBAC

- Seed 59: `academico.avance` rehabilitado (grupo `aca_avance`); NUEVO
  `academico.desercion` (grupo propio `aca_desercion`, ruta `/academico/avance`,
  LISTAR/EXPORTAR para RECTOR/DIR_ACADEMICO).
- Seed 63: tombstone (solo DELETEs de limpieza + tabla de reemplazos en la
  cabecera). Los EXPORTAR huérfanos (`docentes.ver`,
  `docentes.supervision.reporte`, `capacitacion.pago`) quedan como deuda
  anotada (§2), sin tocar.

### Contrato de handoff → frontend (iteración 2)

| Endpoint | Permiso · acción | `data` (dataKey) |
|---|---|---|
| `GET /api/v1/asistencia/consolidado?paraleloGestionId=<id>[&bimestre=1..4]` | `academico.asistencia.consolidado.ver` · LISTAR | payload directo patrón centralizador: `{ paraleloGestionId, gestionId, gestionAnio, bimestre, asignaturas[], estudiantes[] }`; celda = `estudiantes[].asistencia[ofertaCursoId] = { matriculaMateriaId, sesiones, faltas, ausencias, tardanzas, licencias, pctAsistencia }` + `promedioPct`; sin `bimestre` = acumulado anual |
| `GET /api/v1/asistencia/consolidado/export` (mismos query) | ídem · EXPORTAR | descarga .xlsx (1 hoja, planilla verde) |
| `GET /api/v1/avance-academico[?carreraId=<id>]` | `academico.avance` · LISTAR | **dataKey `avance`**: filas `{ estudianteId, codigo, nombreCompleto, carreraId/Codigo/Nombre/ColorHex, planEstudioId, planNombre, planDuracionAnios, totalAsignaturasPlan, materiasAprobadas, materiasConvalidadas, materiasAvanzadas, materiasRegistradas, pctAvance, primeraGestionAnio, ultimaGestionAnio, promedioHistorial }` + `resumen { totalEstudiantes, promedioPctAvance }` + `alcance` (`GLOBAL`\|`PROPIO`; EST se acota en servidor) |
| `GET /api/v1/avance-academico/export[?carreraId]` | `academico.avance` · EXPORTAR | descarga .xlsx |
| `GET /api/v1/desercion[?gestionId=<id>][&carreraId=<id>]` | `academico.desercion` · LISTAR | **dataKeys `carreras`** (agregado: `{ gestionId, gestionAnio, gestionNombre, carrera*, totalMatriculasMateria, matriculasDesercion, matriculasAbandono, matriculasRetiro, totalEstudiantes, estudiantesDesercion, pctEstudiantesDesercion }`), **`desertores`** (detalle: `{ gestion*, carrera*, estudianteId, codigo, nombreCompleto, matriculaMateriaId, asignaturaSigla/Nombre, periodoNumero/Nombre, estado }`) y **`resumen`** (totales globales) |
| `GET /api/v1/desercion/export[?gestionId][&carreraId]` | `academico.desercion` · EXPORTAR | descarga .xlsx |

Pantallas previstas: `modules/academico/avance/` (página con tabs
**Avance** [`academico.avance`] / **Deserción** [`academico.desercion`],
`PermisoGuard` por pestaña, `ActionButton` EXPORTAR) y página **Consolidado %**
en `modules/academico/asistencia/` (ruta ya declarada
`/academico/asistencia/consolidado`; picker paralelo + selector bimestre/anual,
matriz gemela del centralizador). Limpieza REP: borrar
`modules/reportes/routes.jsx`, su registro en `presentation/modules/index.js` e
iconos `REP-*` de `menuIcons.js`. Nombres siempre APELLIDO_PATERNO
APELLIDO_MATERNO NOMBRES (ya resuelto en vistas/Excel).

### Pendiente BD — EJECUTADO (2026-07-30, aprobado por el usuario)

Vistas 138/139/141 recreadas y 169–173 creadas en BD con datos reales; seeds
59 y 63 resembrados (`academico.avance` activo, `academico.desercion`
sembrado, códigos `reportes.*` eliminados). Nada pendiente en BD.

### Verificación iteración 1

- ESLint: 0 errores en archivos nuevos; los errores restantes en archivos
  compartidos editados son preexistentes (líneas largas/trailing spaces
  anteriores al cambio).
- Arranque en seco sin BD: container DI resuelve los 3 routers; rutas
  montadas `GET /avance-academico(/export)`, `GET /desercion(/export)`,
  `GET /asistencia/consolidado(/export)`.
- Coherencia seed ↔ router verificada (mismos códigos y acciones
  LISTAR/EXPORTAR en 59 y en `verificarPermiso`).

## Estado (2026-07-30) — Iteración 2 (frontend) HECHA

Pantallas ACA construidas contra el contrato de la iteración 1 y esqueleto REP
retirado. Lint dirigido 0 errores en archivos nuevos/tocados; `npm run build`
OK (chunks lazy `AvanceAcademicoConnector` y `ConsolidadoAsistenciaConnector`
emitidos). Con la BD ya sembrada, las tres pantallas quedan operativas.

### Pantallas

- **`/academico/avance?tab=avance|desercion`** (`modules/academico/avance/`):
  página con shell del prototipo CFG (workspace + tabs), pestañas gateadas por
  `hasPermiso` + `PermisoGuard`:
  - «Avance» (`academico.avance` LISTAR): tabla estudiante × plan
    (`IdentidadCelda`/`InfoLinesCell`/`Progress`), filtro de carrera y búsqueda
    en cliente (opciones derivadas del propio listado, sin fetch de catálogos
    con RBAC ajeno), resumen del backend; EXPORTAR con el mismo `carreraId`.
  - «Deserción» (`academico.desercion` LISTAR): agregado carrera × gestión
    (vista 173, `Progress` con rojo semántico `allColors.colorError`) +
    detalle de desertores (vista 172, pills Abandono/Retiro), Selects de
    gestión/carrera que filtran ambas tablas y el resumen; EXPORTAR con los
    mismos filtros.
  - Rol ESTUDIANTE (`alcance: 'PROPIO'` del backend): degrada a la ficha
    «Mi avance» (anillo `Progress` + `DetailInfoCard`), sin tabs ni export.
- **`/academico/asistencia/consolidado`** (ACA-ASI-CONS): matriz gemela del
  Centralizador sobre el shell verde de la grilla de asistencia (clases
  `asi-grid` reutilizadas + sección `asi-consolidado` nueva en
  `asistencia.css`), Select de paralelo (dashboard de paralelos, mismo origen
  del Centralizador P1) + `Segmented` Anual/Bimestre 1..4 (omitido = anual),
  tooltip por celda con sesiones/faltas, riesgo < 61 en rojo semántico,
  leyenda espejo del Excel; EXPORTAR con el mismo alcance. Acceso
  descubrible: botón «Consolidado %» en Coordinación de asistencia
  (fail-closed por permiso).

### Capas (dataKey == dataFieldName literal del contrato)

- Infra: `AVANCE_ACADEMICO_ENDPOINTS`/`DESERCION_ENDPOINTS` + consolidado en
  `ASISTENCIA_ENDPOINTS`; repos `AvanceAcademicoRepository`,
  `DesercionRepository` y `AsistenciaRepository.obtenerConsolidado/
  descargarConsolidadoExcel`; helper compartido nuevo
  `infrastructure/api/binaryDownload.js` (Content-Disposition + error Blob).
- Dominio: `useCases/academico/avance/` (Get{AvanceAcademico,Desercion}) y
  `GetConsolidadoAsistenciaUseCase` en asistencia; registrados en
  `academico.container.js`.
- Aplicación: `application/modules/academico/avance/` (utils `AVANCE_PERMISOS`,
  hooks state `useAvanceAcademicoPage`/`useDesercionPage`, api de export) y en
  asistencia `useConsolidadoAsistenciaPage` + export + util
  `asistenciaConsolidado.js` (umbral 61 espejo de la nota mínima y formato %).

### Limpieza REP (verificada por grep)

`presentation/modules/reportes/` borrado; import/spread retirado de
`presentation/modules/index.js`; iconos `REP-*` y el dominio `REP` fuera de
`menuIcons.js` (incl. import `FallOutlined` sin uso) y de
`dominios/routes.jsx`; alias `@reportes` retirado de `vite.config.js` y
`jsconfig.json`. Solo quedan menciones documentales (`reportes.*` como código
retirado en JSDoc). La matriz ya reflejaba la disolución desde la iteración 1
(sección REP → punteros a dueños); no requirió cambios.
