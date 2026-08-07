# Calificaciones → Centralizador → Nivelación → Libros — rediseño por etapas

> Auditoría base + hoja de ruta (2026-08-06), persistida para retomar en
> sesión nueva sin depender de la memoria de la conversación. Continúa el
> trabajo de `centralizador-nivelacion-plan-desarrollo.md` (ese ciclo quedó
> HECHO y cerrado — no se reabre, solo se referencia), pero esta vez el
> usuario pidió ir a la BASE del flujo (Calificaciones) en vez de seguir
> ajustando Centralizador de arriba hacia abajo.
>
> **Estado:** ✔ Fases A, B, C2, D (backend + frontend), C y "riesgo por
> inasistencia" (extensión de Fase D, ver bitácora) HECHAS. Fase E
> (verificación cruzada final) sigue pendiente. Vistas 130/135/116/119/156/176
> (modificadas), 185/187/188/189 (nuevas) preparadas, sin aplicar en BD real
> — nada de esto mostrará datos reales hasta que se apliquen + se re-siembre
> los seeds 54 y 59 (RBAC de Nivelación ya rehabilitado).

## Contexto

El usuario pidió: en vez de seguir "yendo de atrás para adelante" parcheando
Centralizador, revisar desde la base: lógica de Calificaciones (registro de
evaluaciones, separación de notas por bimestre, ponderación teórico/práctico
con la excepción de asistencia), luego abrir/cerrar bimestre, habilitación de
bimestres cerrados para docente/materia específica, el "centro" del
Centralizador bimestral, los casos de gestión anual con notas parciales, el
boletín del estudiante (impresión cuando el bimestre está cerrado, casos
aprobado/reprobado/abandono), y los estados de Nivelación — preguntando
explícitamente si Centralizador debería unificarse/ser absorbido por
Nivelación, y todo esto basado en el schema real o modificándolo si la
documentación de `/Users/miguel/Documents/incos` lo exige.

Se hizo una auditoría de solo lectura: 3 agentes Explore (Calificaciones,
bimestre abrir/cerrar/reabrir, boletín+Nivelación/Traspasos/Transitabilidad) +
1 Plan agent (síntesis y hoja de ruta) + verificación directa línea por línea
de los hallazgos más importantes. Se leyó además un documento real nuevo:
`/Users/miguel/Documents/incos/transabilidad/1RO-A- CONTADURÍA CENTRA 2026.xlsx`.

## Hallazgos — Calificaciones (cuaderno del docente)

Base sólida, ya construida completa:

- **Modelo**: `evaluaciones` (columna del cuaderno; el docente elige
  `componente` TEORICO|PRACTICO al crearla) → `evaluaciones_notas` (celda
  estudiante×evaluación, carga perezosa) → `bimestres_matricula`
  (`nota_teorico`/`nota_practico`/`nota_bimestre`/`estado`, por
  estudiante×materia×bimestre) → `matriculas_materia.nota_final` (caché).
- **Ponderación real**: NO es un promedio ponderado por peso — es un modelo
  de **presupuesto de puntos**. La política institucional
  (`configuracion_evaluacion`, seed 54) fija `cuotaTeorico`/`cuotaPractico`
  (30/70 por defecto) como el TOPE de puntos que el docente puede repartir
  entre columnas de cada componente en un bimestre.
  `nota_bimestre = nota_teorico + nota_practico` (suma directa, tope 100).
  `pesosBimestres` ([25,25,25,25] por defecto) solo entra al ponderar los 4
  bimestres entre sí para la nota anual/final.
- **Asistencia — la excepción confirmada**: tipo de evaluación especial
  (`TIPO_EVALUACION_ASISTENCIA`), única por bimestre, SIEMPRE componente
  PRACTICO, nota = `round(%asistencia × puntos)` calculada por el sistema
  (`recalcularNotasAsistenciaCurso.js`), SIEMPRE read-only para el docente
  (no depende de RBAC — es la única celda cuyo bloqueo no es de permisos sino
  de naturaleza), color magenta en el cuaderno.
- **Flujo de guardado**: `POST .../cuaderno/:bimestre/guardar` (lote)
  recalcula asistencia→bimestre→nota final en CADA guardado, no solo al
  cerrar. El cierre de bimestre repite el mismo recálculo y además marca
  `bimestres_matricula.estado = CERRADO` + `evaluaciones.notas_cerradas = TRUE`.
  El upsert de celda individual (`PUT .../notas`) NO dispara estos recálculos.
- **Hallazgo de duplicación de fórmula** (el más importante de esta
  auditoría): existen DOS funciones de "nota final ponderada" con semántica
  distinta en `backend/src/application/utils/cuadernoNotasCalculo.js`:
  - `calcularNotaFinalPonderada` — la que REALMENTE usa
    `recalcularNotaFinalMatriculaCurso.js` en producción al cerrar bimestre
    (escribe `matriculas_materia.nota_final`) — ignora bimestres sin nota
    tanto en numerador como en el divisor de pesos.
  - `calcularNotaFinalGestion` — usada por pantallas de LECTURA
    (Centralizador, Consolidado) — SIEMPRE divide entre el 100% de los pesos
    anuales, así un bimestre faltante SÍ diluye el número.
  Pueden divergir numéricamente cuando falta algún bimestre.

## Hallazgos — Abrir/cerrar/reabrir bimestre

**Ya resuelve lo que el usuario pidió** ("habilitar bimestre cerrado para
docente y materia específica"):

- Dos niveles: institucional (`gestion_bimestres`, TODA la gestión,
  `PENDIENTE→EN_CURSO→CERRADO`) y por CURSO (`asignacion_docente_id` =
  docente+materia+paralelo+gestión — ya es exactamente esa granularidad —
  `→REABIERTO→CERRADO`).
- Compuerta `assertBimestreEditable.js`: permite editar si el bimestre está
  institucionalmente EN_CURSO O fue REABIERTO por curso; bloquea si PENDIENTE
  o CERRADO.
- UI: institucional en `institucional/actual/pages/ControlBimestresPage.jsx`;
  por curso en `academico/calificaciones/pages/BimestreConsolidadoPage.jsx`
  (toggle "Reabrir bimestre para editar el cuaderno", permiso
  `academico.calificacion.bimestre.ajuste_admin`), vía navegación jerárquica
  Coordinación→Mis cursos→curso→bimestre (no hay un picker directo
  Docente+Materia en una sola pantalla, pero el resultado final ya es el
  correcto — no hace falta construir nada nuevo aquí).
- **No existe** reapertura a nivel de un estudiante individual dentro de un
  curso — el grano mínimo es siempre el curso completo. No se detectó
  necesidad real de ese grano más fino en la documentación revisada.

## Hallazgos — Boletín del estudiante

- `MiBoletinPage.jsx` ya permite descargar PDF anual o de cualquier bimestre
  (1-4), **sin bloqueo de acceso** aunque el bimestre siga abierto.
- El contenido SÍ diferencia: bimestre CERRADO → APROBADO/REPROBADO
  calculado; bimestre abierto → total corriente con ESTADO en blanco (gate de
  CONTENIDO, no de acceso).
- **Gap real**: el boletín bimestral NUNCA muestra ABANDONO. Causa raíz más
  profunda de lo esperado: la vista 119
  (`vista-base-calificacion-resumen-curso-bimestre-fila.sql`, línea 77) tiene
  `WHERE mm.estado IN ('INSCRITO', 'CURSANDO')` — una matrícula en
  ABANDONO/RETIRADO **nunca llega** a `boletinPdfDatos.js`. No alcanza con
  lógica JS, hay que tocar el filtro de la vista (ver Fase C).

## Hallazgos — Nivelación / Traspasos / Transitabilidad (3 dominios distintos)

Los tres tienen su RBAC apagado el mismo día (2026-06-24,
`59-seed-permisos-aca.sql`), pero son cosas diferentes:

- **Nivelación** (`16-nivelaciones.sql`: `historial_matricula`+`nivelaciones`):
  tracking de MATERIAS ARRASTRADAS de gestiones anteriores dentro de la MISMA
  carrera. ENUM `historial_matricula.tipo_estado` (NIVELACION_1RA/2DA,
  ARTICULO_18, VENCIDA, CHOQUE_HORARIO, PRE_REQUISITO, NO_LLEVA_POR_VOLUNTAD,
  HOMOLOGACION, REINCORPORACION, LLEVA_EN_GESTION, ABANDONO, RETIRADO, OTRO)
  — domain+infra completos, CERO controller/router/use-case/pantalla real.
- **Traspasos/Transitabilidad** (`19-traspasos.sql`/`18-transitabilidades.sql`):
  procesos de ADMISIÓN de estudiantes EXTERNOS (Formulario ANEXO 2 del
  Ministerio). Su captura de datos YA FUNCIONA hoy vía el wizard de admisión
  del módulo Estudiantes/MAT (`RegisterStudentUseCase.js`); solo falta la
  pantalla de revisión/aprobación bajo `academico/`. **No tienen relación**
  con "materias arrastradas dentro de la misma carrera" — son sobre
  estudiantes que vienen de afuera. Decisión YA CERRADA de no fusionarlos con
  Libros (`estado-avance-y-proximos-pasos.md:138`).

### Evidencia clave — documento real `1RO-A- CONTADURÍA CENTRA 2026.xlsx`

"PLANILLA CENTRALIZADORA DE CALIFICACIONES" real del instituto, 4 bimestres +
ANUAL en UNA sola hoja, por curso. Por cada bimestre: 9 columnas de materia +
1 columna "OBSERVACIONES" (verdicto ÚNICO de catálogo fijo: APROBADO/A,
REPROBADO/A, ABANDONO, NO SE PRESENTO — no libre). Para estudiantes con
materias arrastradas, las columnas de MATERIA (no la de observaciones) llevan
texto de nivelación en vez de nota numérica (mismo valor repetido en los 4
bloques, porque esa materia no se cursa este año). Columna ANUAL (mismo
catálogo) + P1-P4 (% de avance) + PARALELO.

## Decisión de arquitectura: Centralizador ↔ Nivelación

**Recomendación: mantenerlos SEPARADOS**, conectados solo por un badge
("N estudiantes con nivelación pendiente" + CTA a
`/academico/nivelaciones/listar`), igual patrón que
`CentralizadorLibroBadge.jsx`.

**Fundamento:**
1. **Obstáculo técnico real**: `GetCentralizadorParaleloUseCase` pivota
   estrictamente sobre `oferta_curso_id` de la gestión ACTUAL. Una materia
   arrastrada de una gestión anterior no tiene `oferta_curso_id` en la
   gestión vigente — no hay celda natural en la matriz pivotada actual sin
   agregar una segunda dimensión de columnas. Fusionar celda-a-celda exige
   rediseñar el pivote entero.
2. **Precedente ya sentado dos veces**: Libros de registro replica el mismo
   documento oficial que Centralizador y no se fusionó (menú/RBAC/export
   separados); Traspasos/Transitabilidad tienen decisión cerrada de no
   fusionarse con Libros.
3. **Naturaleza de producto distinta**: Centralizador es lectura/agregación
   con edición liviana; Nivelación es un flujo transaccional propio
   (`PROGRAMADA→EN_CURSO→APROBADA/REPROBADA/CANCELADA`, o decisión
   administrativa con `nota_forzada`).
4. La separación de menú/RBAC ya es una decisión de diseño previa (schema 16,
   seed 59, 2026-07-28).

**Pendiente de confirmación explícita del usuario** antes de construir la
Fase D — no es algo que se ejecute solo con esta recomendación.

## Fases

### Fase A — Cerrar el tercer consumidor divergente de nota final (bajo riesgo) ✔ HECHA
**Hallazgo nuevo, no cubierto por el ciclo anterior**: `GetRegistroNotasCursoUseCase.js`
(pantalla "Consolidado"/`BimestreConsolidadoPage.jsx`) sigue recalculando con
`calcularNotaFinalGestion` en vez de usar `nota_final`/`calcularVeredictoMateria`
como ya hacen Centralizador y el Libro. Verificado línea por línea: calcula
`est.notaFinal` desde el caché correcto (línea 26) pero lo **descarta** y
recalcula de cero (líneas 69-78), sin `calcularVeredictoMateria` ni detección
de ABANDONO. La vista 116 tampoco selecciona `mm.estado` — verificado, no
está en el SELECT.

Archivos:
- `backend/database/03-views/116-vista-base-calificacion-registro-notas-curso.sql`
  — agregar `mm.estado AS estado_materia` (aditivo).
- `backend/src/infrastructure/repositories/views/CalificacionCoordinacionRepository.js`
  (`listarEstudiantesRegistroNotas`) — sumar la columna nueva.
- `backend/src/application/use-cases/academico/GetRegistroNotasCursoUseCase.js`
  (`agruparEstudiantes`, líneas 69-78) — usar `est.notaFinal` +
  `calcularVeredictoMateria({ nota_final: est.notaFinal, estado: row.estado_materia }, notaMinima)`
  (mismo import que ya usa `GetCentralizadorParaleloUseCase.js`); conservar
  `calcularNotaFinalGestion` solo para `gestionCompleta`.

Riesgo: BAJO (mismo patrón aplicado 2 veces ya en el ciclo anterior). Requiere
aprobación de BD mínima (redefinir vista 116, sin tocar tablas).

Verificación: abrir `BimestreConsolidadoPage` de un curso con un bimestre
faltante → "Nota final"/"Observación" deben coincidir con Centralizador P2/P3
y con el Folio del Libro para el mismo estudiante×materia.

### Fase B — Verdicto único por bimestre en P3 (`CentralizadorGrid.jsx`) ✔ HECHA
Reemplazar el `TextArea` libre de "Observación del bimestre" por un `Select`
con el catálogo fijo (APROBADO/A, REPROBADO/A, ABANDONO, NO SE PRESENTO —
sin tilde, mismo literal que ya usan `ConsolidadoSheetBuilder.js` /
`PlanillaCalificacionesSheetBuilder.js` y el documento oficial).
- **B1 (recomendada, aplicada)**: sin tocar esquema, validado el catálogo en
  `SaveObservacionCentralizadorBimestreUseCase.js`.
- Nota relacionada: P2 (`GetCentralizadorParaleloUseCase.js` líneas ~152-159)
  hoy descarta ABANDONO en `observacion` (solo deja pasar
  APROBADO/REPROBADO) — corregido en el mismo momento.

Riesgo: BAJO (B1).

### Fase C — ABANDONO en el boletín bimestral ✔ HECHA (rediseñada, ver bitácora)
- `backend/database/03-views/119-vista-base-calificacion-resumen-curso-bimestre-fila.sql`
  — evaluar ampliar el `WHERE` (hoy excluye ABANDONO/RETIRADO; auditar antes
  qué otros consumidores dependen del filtro restringido).
- `backend/src/application/utils/boletinPdfDatos.js` (rama `esBimestral`,
  líneas ~94-116) — agregar el caso ABANDONO.
- Nota de diseño: hoy NINGÚN caso de uso escribe
  `matriculas_materia.estado = ABANDONO` — el único camino de escritura ya
  diseñado es `historial_matricula.tipo_estado = ABANDONO` + `nota_forzada`
  (dominio Nivelación). El "cómo se marca" real probablemente depende de la
  Fase D; para esta fase alcanza con que el boletín sepa mostrarlo cuando el
  dato exista.

Riesgo: MEDIO (auditar blast radius de la vista 119 antes de tocarla).

**Corrección de alcance (2026-08-06):** al auditar el blast radius se
encontró que la causa real NO es la vista 119 sino la vista **110**
(`vista_base_calificacion_estudiante_matricula_curso`), un nivel más arriba
en la cadena (135 la usa como base) — mismo filtro
`WHERE mm.estado IN ('INSCRITO','CURSANDO')`. Tocar solo 119 no resuelve el
gap: el estudiante ni siquiera llega a `matriz.estudiantes`. Pero la 110
ALIMENTA TAMBIÉN el roster vivo del cuaderno de notas (`CuadernoRepository`)
y la planilla de asistencia (vista 133) — ensancharla reintroduciría
estudiantes retirados al roster de carga activa de notas/asistencia, una
regresión real. Sumado a que hoy ningún caso de uso escribe
`matriculas_materia.estado = ABANDONO/RETIRADO` (gap 100% teórico por
ahora), el usuario decidió **posponer la Fase C tal como estaba planteada**
y resolver primero dos bugs reales encontrados en el camino (ver Fase C2),
dejando el diseño correcto de la vista 119/110 para cuando la Fase D defina
el flujo de escritura real.

### Fase C2 — Guardia de cierre de libro + visibilidad de pendientes ✔ HECHA
Dos bugs reales de HOY (no dependen de ABANDONO ni de Fase D), encontrados
al auditar el blast radius de la Fase C:
1. **Cierre de libro sin ninguna guardia**: `EditarLibroUseCase.js` permitía
   `estado: CERRADO` aunque hubiera estudiantes con materias sin
   `nota_final` (CURSANDO) — el libro oficial quedaba cerrado con notas
   faltantes, sin ningún aviso.
2. **Estadísticas congeladas que pueden mostrar 0 aprobados para todo un
   paralelo**: como una asignación docente cubre el paralelo ENTERO, si un
   solo docente no cargó ninguna nota, `derivarEstadoAcademico` marca a
   TODOS los estudiantes del paralelo como CURSANDO (aunque sus demás
   materias estén aprobadas), y el bucket `total_cursando` no existía en
   ningún lado — invisible, parecía un bug de datos en vez de "falta un
   docente por cargar notas".

Riesgo: BAJO (aditivo, no toca vista 110/119/135, no cambia el documento
Excel impreso oficial).

Verificación: ver bitácora abajo.

### Fase D — Capa de aplicación de Nivelación (boceto, bloqueada hasta confirmar la decisión de arquitectura)

**Nota de diseño añadida 2026-08-06 (conversación de usuario, antes de ejecutar):**
quién marca ABANDONO/RETIRADO y cómo se entera el docente.

- **Quién decide, verificado en código**: el schema (`16-nivelaciones.sql:57-74`)
  ya clasifica ABANDONO/RETIRADO como "DECISIONES ADMINISTRATIVAS" (sin
  examen, sin `docente_evaluador_id`, sin fila en `nivelaciones`). El RBAC
  (seed 59, líneas 237-244) ya asigna `academico.nivelacion.*` únicamente a
  RECTOR y DIR_ACADEMICO — el docente no tiene ningún permiso sobre este
  dominio hoy. Confirmado: es y debe seguir siendo decisión administrativa
  pura, nunca una acción del docente ni algo que dispare Asistencia sola.
- **Cómo se detecta el abandono de facto (por inasistencia) y llega a la
  directiva**: NO existe hoy ninguna conexión entre Asistencia y
  ABANDONO/RETIRADO. El único radar existente es el riesgo pedagógico (TUT/
  Acompañamiento, vista 156, tab dentro de "Seguimiento académico") y es
  100% por notas (`nota_ultimo_bimestre`/`promedio_anual` vs
  `umbralRiesgo` de `configuracion_evaluacion`, clave
  `ACOMPANAMIENTO_PEDAGOGICO`) — nunca mira asistencia. Extensión natural
  para Fase D: agregar una segunda dimensión "riesgo por inasistencia" en
  la MISMA pantalla de Acompañamiento, reutilizando `pct_asistencia` ya
  calculado en la vista 169 (`vista_asistencia_consolidado_bimestre_fila`),
  con su propio umbral configurable — mismo patrón que el riesgo por notas,
  sin infraestructura nueva. Sigue siendo solo informativo: la directiva ve
  la alerta y decide, en el peor caso marcando RETIRADO — nunca automático.
  **✔ HECHA 2026-08-07** — ver bitácora "riesgo por inasistencia" al pie.
- **Cómo se protege al docente de seguir tomando asistencia/notas a un
  estudiante ya retirado**: NO hace falta notificación nueva. La vista 110
  (`vista_base_calificacion_estudiante_matricula_curso`), que alimenta
  TANTO el cuaderno de notas (`CuadernoRepository`) COMO la planilla de
  asistencia (vista 133), ya filtra `mm.estado IN ('INSCRITO', 'CURSANDO')`
  — el estudiante desaparece solo del roster vivo en cuanto Fase D escriba
  `matriculas_materia.estado = ABANDONO/RETIRADO` (hoy ningún caso de uso lo
  hace). Punto a resolver en el diseño de Fase D: el use case de decisión
  administrativa debe escribir ESE campo, no solo la bitácora de
  `historial_matricula` — y el cuaderno/asistencia debería mostrar un aviso
  chico ("N estudiantes retirados — ver detalle") en vez de que el
  estudiante desaparezca sin explicación.
Domain/infra ya existen (`historial_matricula`+`nivelaciones`,
`LevelingRepository`, `SubjectEnrollmentHistoryRepository`), faltan use cases
compuestos:
- `ListHistorialMatriculaParaleloUseCase` (listado por curso/gestión, análogo
  a `GetCentralizadorParaleloUseCase`).
- `RegistrarEventoHistorialMatriculaUseCase` (crear fila `historial_matricula`,
  con la validación de anclaje mutuamente excluyente que el schema documenta:
  `matricula_materia_id` XOR `inscripcion_id`+`asignatura_plan_id`).
- `ProgramarNivelacionUseCase` / `RegistrarResultadoNivelacionUseCase` (CRUD
  sobre `nivelaciones`, transición `PROGRAMADA→EN_CURSO→APROBADA/REPROBADA/CANCELADA`).
- `RegistrarDecisionAdministrativaUseCase` (ABANDONO/RETIRADO con
  `nota_forzada=TRUE` — cierra el gap de la Fase C).

Pantalla: reemplaza los 3 `<UnderConstruction />` de
`frontend/src/presentation/modules/academico/nivelaciones/routes.jsx` (rutas
y permisos YA existen, sin tocar RBAC/menú); grilla propia inspirada en el
Excel real (estudiante × 4 bimestres × ANUAL, celdas = nota O estado de
nivelación), con su propia query — NO reutiliza el pivote de Centralizador.

### Fase E — Verificación de coherencia Libro/Folio tras A-C
Re-ejecutar la verificación de la bitácora de
`centralizador-nivelacion-plan-desarrollo.md`, más un caso nuevo: mismo
estudiante×materia comparado en `BimestreConsolidadoPage` (post Fase A) vs
Centralizador P2/P3 vs Folio del Libro — deben coincidir siempre, incluso con
gestión incompleta. Si Fase C tocó la vista 119, confirmar que
`ExportBoletinEstudiantePdfUseCase.js` y otros consumidores no cambiaron de
comportamiento donde no correspondía.

## Verificación general (al ejecutar las fases de código)
- `cd backend && npx eslint <archivos tocados>` por fase.
- Casos cruzados: mismo estudiante×materia → mismo número/veredicto en
  Consolidado, Centralizador P2/P3 y Folio del Libro.
- Fase C: confirmar que ampliar la vista 119 no cambia comportamiento de
  otros consumidores.

## Bitácora

- **2026-08-06**: auditoría completa (3 Explore + 1 Plan + verificación
  directa de 3 archivos clave) y hoja de ruta aprobada por el usuario.
  Decisión de arquitectura (Centralizador↔Nivelación separados) recomendada,
  documentada y CONFIRMADA por el usuario (ver
  `centralizador-nivelacion-frontend-diseno.md`).
- **2026-08-06 (continuación, Fase A ejecutada):** el usuario marcó esta Fase
  A como la primera a ejecutar, por delante del plan de diseño frontend.
  Aplicado:
  - [x] Vista 116: agregado `mm.estado AS estado_materia` al SELECT
        (aditivo). ⛔ Pendiente aprobación de BD: recrear la vista.
  - [x] `CalificacionCoordinacionRepository.listarEstudiantesRegistroNotas`:
        suma `estado_materia` a las columnas leídas.
  - [x] `GetRegistroNotasCursoUseCase.agruparEstudiantes`: usa
        `est.notaFinal` (caché, ya no se descarta) +
        `calcularVeredictoMateria({ nota_final, estado }, notaMinima)` para
        `observacion`; `calcularNotaFinalGestion` se conserva solo para el
        flag `gestionCompleta`.
  - Verificado: lint limpio en los 3 archivos tocados (3 violaciones
    preexistentes en `GetRegistroNotasCursoUseCase.js` — `no-continue`
    L36, `max-len` L220, `no-nested-ternary` L259 — ninguna en el código
    tocado, no se tocaron); dry-run del container DI (el use case resuelve).
  - Fases B-E siguen pendientes.
- **2026-08-06 (continuación, Fase B ejecutada):**
  - **Verificación previa de datos**: se consultó por lectura la BD local
    (MAMP, `localhost:8889`) — `bimestres_matricula` tiene 0 filas (aunque
    `estudiantes`=384 y `matriculas_materia`=2919 sí tienen datos maestros).
    No hay servidor de producción/staging accesible desde el repo. El usuario
    confirmó que esto es correcto: el módulo de Calificaciones está en
    construcción/refacción en desarrollo local, sin datos reales cargados
    todavía — la única fuente real es la documentación oficial en
    `/Users/miguel/Documents/incos`. Con esto se descartó B2: se procedió
    con **B1** sin ningún riesgo de pérdida de datos.
  - **Backend**: catálogo `VERDICTOS_OBSERVACION_BIMESTRE` nuevo en
    `evaluaciones.constants.js` (`APROBADO/A`, `REPROBADO/A`, `ABANDONO`,
    `NO SE PRESENTO` — mismos literales que ya usan
    `ConsolidadoSheetBuilder.js`/`PlanillaCalificacionesSheetBuilder.js`, no
    un catálogo inventado). `SaveObservacionCentralizadorBimestreUseCase.js`
    ahora valida contra ese catálogo (antes solo limitaba longitud a 2000
    caracteres de texto libre); columna `bimestres_matricula.observaciones`
    sigue siendo TEXT, sin ENUM en schema.
  - **Frontend**: `CentralizadorGrid.jsx` — `TextArea` reemplazado por
    `Select` (options desde `centralizadorDoc.js`,
    `VERDICTOS_OBSERVACION_BIMESTRE_OPTIONS`, espejo del catálogo backend);
    en modo lectura, el valor se pinta como pill reutilizando la misma clase
    `cal-centralizador-grid__estado--*` que ya usaba la columna Estado de P2
    (se agregaron variantes `--abandono` y `--no-presento`); valores viejos
    que no calzan con el catálogo (no debería haber ninguno, ver punto
    anterior) caen a texto plano en vez de romper. `onChange` del Select
    dispara guardado inmediato (no hace falta debounce de tipeo como con el
    TextArea) reusando el mismo hook `useCentralizadorObservacionesBimestre`
    sin tocarlo.
  - **Hallazgo relacionado corregido**: `GetCentralizadorParaleloUseCase.js`
    (P2, celda `notas[ofertaCursoId].observacion`) descartaba ABANDONO
    porque estaba gateado detrás de `gestionCompleta` (4 bimestres
    cargados) — pero un estudiante en ABANDONO/RETIRADO nunca completa los
    4 bimestres, así que el gate lo escondía siempre, no solo a veces.
    Corregido: `calcularVeredictoMateria` (que decide por `row.estado`, no
    por bimestres cargados) se evalúa primero; ABANDONO pasa siempre,
    APROBADO/REPROBADO siguen gateados por `gestionCompleta` como antes.
    Verificado con smoke test aislado (6 casos, incluido el caso real de
    ABANDONO con gestión incompleta).
  - **Hallazgo NUEVO, no corregido (fuera de alcance de esta fase)**: el fix
    anterior no cambia nada visible todavía — el único consumidor de esa
    celda es `CentralizadorAnualGrid.jsx` (`resumenAnualEstudiante`, P2), que
    (a) arma `celdas` filtrando `c.notaAnual != null` ANTES de mirar
    `observacion` — y `notaAnual` es `null` para una celda en ABANDONO sin
    los 4 bimestres, así que la celda se descarta antes de llegar al chequeo;
    y (b) aunque no se descartara, sigue evaluando
    `celdas.some(c => !c.gestionCompleta)` → `'EN CURSO'` antes de mirar el
    veredicto. Resultado: el pill "Estado" de la fila del estudiante en P2
    sigue mostrando "EN CURSO" para un estudiante en abandono real. Corregir
    esto bien exige tocar también la semántica del promedio (¿entra
    ABANDONO al promedio anual o se excluye?) — no es un cambio trivial de
    una línea, así que se deja documentado para decidir en una fase futura
    (probablemente junto con Fase C, que ya toca ABANDONO en el boletín) en
    vez de improvisarlo ahora.
  - Verificado: lint limpio en los 5 archivos tocados (mismas 3 violaciones
    preexistentes en `GetRegistroNotasCursoUseCase.js` de la Fase A, más 2
    preexistentes en `GetCentralizadorParaleloUseCase.js` —`max-len`/
    `no-continue` en el bloque de `listarObservacionesBimestrePorParaleloGestion`,
    desplazadas de línea por la inserción pero no tocadas por este cambio—
    ninguna nueva); smoke test funcional del use case de guardado (acepta
    los 4 valores del catálogo + `null`, rechaza texto libre y variantes de
    mayúsculas/tilde); `npx vite build` del frontend sin errores (solo
    warnings preexistentes de tamaño de chunk, no relacionados).
  - Fases C-E siguen pendientes.
- **2026-08-06 (continuación, limpieza de lint preexistente):** a pedido del
  usuario, se corrigieron los 6 errores de lint preexistentes que quedaron
  anotados como "no tocados" en Fase A/B (no eran parte del código nuevo,
  pero quedaban arrastrados). Todos son refactors mecánicos de forma, sin
  cambio de comportamiento (verificado con equivalencia lógica aislada +
  smoke tests):
  - `GetCentralizadorParaleloUseCase.js`: `max-len` (repo extraído a
    `bimesterRepo` para acortar la línea) + `no-continue` (condición
    invertida en vez de `continue` dentro del loop de observaciones).
  - `SaveObservacionCentralizadorBimestreUseCase.js`: `max-len` (mismo
    patrón, `repo` extraído antes de la llamada).
  - `GetRegistroNotasCursoUseCase.js`: `no-continue` (condición invertida en
    `agruparEstudiantes`), `max-len` (repo extraído fuera del loop de
    bimestres reabiertos), `no-nested-ternary` (`gestionVigente` calculado
    con `if/else` antes del `return` en vez de ternario anidado).
  - Verificado: `npx eslint` limpio (0 errores) en los 3 archivos; import
    dry-run sin errores de sintaxis; equivalencia lógica confirmada con
    casos aislados (filtro de bimestre 0/5/NaN excluidos igual que antes,
    las 4 combinaciones de `gestionVigente` con gestión/año presente o
    nulo devuelven el mismo valor); smoke test del use case de guardado
    repetido sin cambios de comportamiento.
- **2026-08-06 (continuación, Fase C auditada → repriorizada a Fase C2):**
  auditoría de blast radius de la vista 119 (pedida por el usuario antes de
  tocarla) reveló que el fix real es más profundo (vista 110, compartida con
  cuaderno/asistencia — ver nota de "Corrección de alcance" arriba). El
  usuario, en la misma conversación, planteó además cómo se notifica al
  docente cuando un estudiante es retirado (para que deje de tomarle
  asistencia/ponerle notas) y cómo se detecta el abandono de facto por
  inasistencia — investigado y documentado como nota de diseño bajo Fase D
  (ver esa sección): confirmado por schema+RBAC que ABANDONO/RETIRADO ya es
  decisión 100% administrativa (RECTOR/DIR_ACADEMICO, seed 59); confirmado
  que la vista 110 ya protegería al docente automáticamente en cuanto Fase D
  escriba `matriculas_materia.estado`; identificada la vista 169
  (`pct_asistencia`) como base reutilizable para una futura alerta de
  riesgo por inasistencia en Seguimiento académico (mismo patrón que la
  156 de riesgo por notas). El usuario decidió ejecutar primero los 2 bugs
  reales encontrados (Fase C2) y dejar la Fase C (vista 119/110) y la Fase D
  para después.
  - **Fase C2 implementada:**
    - Vista 176 (`vista-base-libro-folio-fila.sql`): agregado
      `total_cursando` al SELECT (aditivo, mismo patrón que
      `total_aprobados`/`total_reprobados`/`total_abandonos`, filtrando
      `estado_academico = 'CURSANDO'`).
    - `LibroRegistroPresentationMapper.js` (`toFolioDTO`): agregado
      `totalCursando`.
    - `estadisticasParaleloHelper.js`: agregado
      `estudiantesPendientes`/`porcentajePendientes` al resultado de
      `calcularEstadisticasParalelo` — deliberadamente NO se agregó a
      `LIBRO_REGISTRO_DOC.estadisticas.filas` (ese bloque espeja el
      documento físico oficial impreso, no se altera su formato); queda
      disponible para la ficha del libro en pantalla.
    - `EditarLibroUseCase.js`: nuevo método `_asegurarSinPendientes`,
      invocado solo al transicionar `estado → CERRADO`; suma
      `total_cursando` de los folios NO anulados (filtra `ANULADO`, que
      sigue devolviendo `activo=TRUE` en la vista) y lanza `ConflictError`
      (409) con el conteo si hay pendientes. Verificado que el frontend
      (`useEditarLibroApi.js`) ya propaga cualquier `result.error` del
      backend genéricamente — sin cambios de frontend necesarios.
  - Verificado: `npx eslint` limpio (0 errores) en los 4 archivos backend
    tocados; smoke test de la guardia con 4 escenarios (pendientes en folio
    BORRADOR → rechaza; pendientes solo en folio ANULADO → permite;
    sin pendientes → permite; cambio que no toca `estado` → no consulta
    folios); smoke test de `calcularEstadisticasParalelo` confirmando que
    aprobados+reprobados+abandono+pendientes ahora suman exactamente el
    total de inscritos (antes el pendiente quedaba invisible).
  - Fases C (vista 119/110) y D siguen pendientes, con las notas de diseño
    ya documentadas para cuando se retomen.
- **2026-08-06 (continuación, Fase D backend ejecutada):** a pedido explícito
  del usuario ("procede"), se construyó la capa de aplicación de Nivelación
  completa en el backend (datos+RBAC ya existían). Backend-first: frontend
  queda para una sesión aparte (los 3 `<UnderConstruction />` de
  `nivelaciones/routes.jsx` siguen sin tocar).
  - **Diseño resuelto antes de codear** (ver nota bajo el encabezado de esta
    fase, más arriba): quién marca ABANDONO/RETIRADO (RECTOR/DIR_ACADEMICO,
    nunca el docente — confirmado por schema+RBAC), cómo se protege al
    docente (vista 110 ya lo hace sola en cuanto se escriba
    `matriculas_materia.estado`), y que la "nota efectiva" del Historial
    Académico (vista 138) YA cascada por precedencia
    (`historial_matricula.nota_resultante` → `nivelaciones.nota_nivelacion`
    → `matriculas_materia.nota_final`) — por eso las escrituras de esta fase
    NO tocan `nota_final`, solo `estado`.
  - **`SubjectEnrollmentHistoryRepository`/`IHistorialMatriculaRepository`**:
    el repo/interfaz ya existían (arquetipo A completo) pero solo cubrían el
    ancla `matricula_materia_id`; se agregaron (aditivo)
    `findCurrentByAlternateAnchor`/`expireCurrentByAlternateAnchor` +
    soporte de filtro en `buildWhereClause`, espejo de los métodos existentes,
    para completar el ancla alterna (`inscripcion_id`+`asignatura_plan_id`,
    materia arrastrada NO cursada) que el schema documenta pero el repo no
    cubría todavía.
  - **`RegistrarEventoHistorialMatriculaUseCase`** (nuevo): writer genérico
    de `historial_matricula`, valida el anclaje mutuamente excluyente (schema
    16-nivelaciones.sql) y reusa `SubjectEnrollmentHistory.getBusinessRuleErrors()`
    (entidad de dominio ya rica, ya validaba nota_resultante/forcedGrade
    restringidos a ABANDONO/RETIRADO — no se tocó). Acepta `options.transaction`
    para componerse dentro de la transacción de un use case llamador.
  - **`RegistrarDecisionAdministrativaUseCase`** (nuevo): ABANDONO/RETIRADO
    específico. Dentro de UNA transacción (`sequelize.transaction`, patrón
    ya usado en `CreateSesionRefuerzoUseCase.js`): (1) evento de historial
    vía el use case anterior, `forcedGrade: true` siempre; (2) actualiza
    `matriculas_materia.estado` (repo `subjectEnrollmentRepository` ya
    existente) — esta segunda escritura es la que activa la protección
    automática del docente vía vista 110. Rollback verificado con smoke
    test (fallo a mitad de camino → el `update` de estado nunca se llama).
  - **`ProgramarNivelacionUseCase` + `RegistrarResultadoNivelacionUseCase`**
    (nuevos): intento académico (NIVELACION_1RA/2DA, PRUEBA_EXCEPCIONAL,
    RECUPERATORIO_ANUAL, ARTICULO_18) + CRUD de `nivelaciones` con máquina
    de estados nueva `TRANSICIONES_NIVELACION`
    (`evaluaciones.constants.js`, mismo patrón que `TRANSICIONES_FOLIO` de
    libros.constants.js): PROGRAMADA→EN_CURSO→APROBADA/REPROBADA/CANCELADA.
    Bug encontrado y corregido en desarrollo (no llegó a producción): pasar
    `observations: undefined` explícito hacía que el mapper lo interpretara
    como "limpiar observaciones" en vez de "no tocar" — corregido para solo
    incluir la clave cuando el llamador la manda.
  - **`ListHistorialMatriculaParaleloUseCase`** (nuevo) + **vista 185**
    (`vista_base_nivelacion_paralelo_fila`, ⛔ preparada, NO aplicada en BD
    real): listado por paralelo, NO reutiliza el pivote de Centralizador
    (decisión de arquitectura ya confirmada). v1 deliberadamente más simple
    que "grilla estudiante×4 bimestres×ANUAL" del plan original: lista
    plana de eventos agrupados por estudiante (el Excel real solo repite UN
    estado en las 4 columnas de una materia arrastrada, así que una grilla
    de bimestres sería matemáticamente equivalente a una sola columna de
    estado — no se justificaba el riesgo de un pivote nuevo sin validar el
    diseño visual con el usuario). UNION ALL de dos ramas (reutilizando la
    vista 135 para resolver contexto estudiante/paralelo en ambas, patrón
    vista final delgada): materia cursada (ancla directa) vs. materia
    arrastrada (ancla alterna, paralelo inferido vía cualquier otra materia
    cursada de la misma inscripción). Limitación conocida documentada en el
    propio archivo SQL: si un estudiante no tiene ninguna otra materia
    cursándose este año, no hay paralelo que inferir y la fila no aparece.
  - **Wiring completo**: 5 controllers, `nivelaciones.validator.js`
    (express-validator), `nivelaciones.routes.js`
    (`buildNivelacionesRouter`, RBAC `academico.nivelacion.ver/inscribir/aprobar`
    ya sembrado), `nivelaciones.container.js` (mismo patrón que
    `libros.container.js`), tokens nuevos en `academico.tokens.js`/
    `repositorios.tokens.js`, montado en `routes/index.js` y
    `academico/index.js`. Mapeo de permisos: LISTAR→ver, CREAR→inscribir
    (evento genérico + programar examen), APROBAR→aprobar (decisión
    administrativa + resultado de examen) — coincide con las 3 rutas
    frontend ya sembradas (`listar`/`inscribir`/`aprobar`).
  - Verificado: `npx eslint` limpio en TODOS los archivos nuevos (0 errores
    propios; 53 errores preexistentes confirmados en `repositories.container.js`/
    `academico/index.js`/`SubjectEnrollmentHistoryRepository.js`/`routes/index.js`
    vía comparación `git stash`, ninguno introducido por esta fase — no se
    tocaron, fuera de alcance); un bug real detectado y corregido durante el
    lint (`replace_all` había duplicado un sufijo `_VALUES_VALUES` en 2
    imports); smoke tests funcionales exhaustivos con repos mockeados en los
    5 use cases (~30 casos: anclaje XOR, validaciones de negocio de la
    entidad de dominio, máquina de estados de nivelación, rollback
    transaccional real contra la BD local); **dry-run de TODO el contenedor
    DI real** (los 11 tokens nuevos —5 use cases, 5 controllers, 1 router—
    resuelven sin error, incluido el router completo con todos los
    validators). No se tocó la BD real en ningún momento (ni schema ni
    datos): la vista 185 queda preparada, pendiente de aprobación explícita
    para aplicarse.
  - Pendiente: frontend (reemplazar los 3 `<UnderConstruction />`), y
    decidir si la vista 185 se aplica ya o se espera a validar el diseño de
    pantalla con el usuario primero.
- **2026-08-06 (continuación, Fase D backend — ronda 2, alineada al diseño
  frontend aprobado):** al pedir revisar `libros/routes.jsx` y
  `configuracion/routes.jsx` como base de estilo antes del frontend, apareció
  `docs/plan/centralizador-nivelacion-frontend-diseno.md` (Parte B, ya
  aprobada en sesión previa) — pide una grilla completa estudiante×9 materias
  (como Centralizador), no la lista plana de eventos de la ronda 1. El
  usuario confirmó rehacer el backend para calzar con ese diseño en vez de
  simplificar el diseño para calzar con lo ya construido.
  - **Vistas 130/135 extendidas (aditivo)**: `asignatura_plan_id` (130,
    columna ya estaba en el JOIN, solo faltaba seleccionarla; 135 la
    propaga) + `inscripcion_id` (135, `mm.inscripcion_id`, `mm` ya estaba en
    el JOIN) — necesarias para matchear un evento de historial ANCLADO a una
    materia arrastrada (sin matrícula) contra la columna correcta del
    pivote del paralelo actual. Sin impacto en consumidores existentes de
    130/135 (confirmado: ninguno usa `SELECT *` sensible a columnas nuevas
    excepto Centralizador, que ya ignora columnas no usadas).
  - **Vista 185 REDISEÑADA** (ya no UNION ALL de eventos, ahora LEFT JOIN
    sobre el pivote completo): base = TODAS las filas de la 135 (no solo las
    que tienen evento), `LEFT JOIN historial_matricula` por ancla directa
    (`matricula_materia_id`) O alterna (`inscripcion_id`+`asignatura_plan_id`
    contra la MISMA columna), `LEFT JOIN nivelaciones`. Invariante que evita
    duplicar filas: los use cases de escritura siempre expiran el evento
    vigente anterior de la misma ancla antes de crear uno nuevo (máximo un
    vigente por ancla, ya lo hacía la ronda 1).
  - **`ListHistorialMatriculaParaleloUseCase` REESCRITO**: ahora pivota
    igual que `GetCentralizadorParaleloUseCase` (asignaturas + estudiantes
    con `celdas[ofertaCursoId]`), cada celda lleva `notaFinal`/
    `estadoMatricula` (normal) y `evento` (null si no hay, con `nivelacion`
    anidada si corresponde) — el frontend decide nota vs. StatusPill. Agrega
    `totalPendientes`/`totalEstudiantes` a nivel de paralelo.
  - **Gap 1 cerrado — contador P1 nivel 1**: nuevo método de repo
    `contarPendientesPorParalelo()` (agregado sobre la 185, agrupado por
    paralelo) + `ListPendientesNivelacionParaleloUseCase` +
    `GET /nivelaciones/pendientes-por-paralelo`. Diseñado para que el
    frontend lo FUSIONE con el dataset YA compartido de paralelos
    (`useParalelosEstadoApi`, el mismo que usa Centralizador P1) por
    `paraleloGestionId` — no reconstruye el listado de paralelos.
  - **Gap 3 cerrado — bandeja cruzada B3**: vista nueva 187
    (`vista_base_nivelacion_bandeja_fila`, ⛔ preparada, sin aplicar): grano
    1 fila por `nivelaciones`, ancla directa a `historial_matricula` →
    estudiante/materia SIN pasar por el pivote de paralelo (evita su
    limitación conocida — una nivelación sin columna coincidente en el plan
    vigente igual aparece acá). `ListNivelacionesPendientesUseCase` +
    `GET /nivelaciones/pendientes` filtra `PROGRAMADA`/`EN_CURSO`.
    `paraleloGestionId` viene null en materias arrastradas (no hay
    oferta_curso para una materia que no se cursa este año) — el frontend
    debe manejar ese caso.
  - **Gap 2 (lookup materias arrastradas de un estudiante sin contexto, B2
    landing sin deep-link) NO cerrado todavía** — se resuelve al construir
    el frontend de B2, reusando la MISMA vista 185 filtrada por estudiante
    en vez de por paralelo (no requiere vista nueva, solo un método de repo
    adicional) — queda para cuando se construya esa pantalla.
  - Verificado: `npx eslint` limpio (0 errores) en los 13 archivos nuevos/
    tocados de esta ronda; smoke test del pivote confirmando overlay
    correcto en ambas anclas (nota normal sin evento, evento+nivelación
    anidada con evento, `totalPendientes` contando estudiantes únicos);
    smoke tests de los 2 use cases de agregación nuevos; **dry-run de los 5
    tokens nuevos contra el contenedor DI real** (2 use cases, 2
    controllers, más el router ya resuelto de la ronda 1 ahora con 7
    controllers en vez de 5). No se tocó la BD real: vistas 130/135/185/187
    quedan como diffs de archivo, pendientes de aprobación explícita para
    aplicarse.
  - Siguiente: frontend completo (B0-B3) siguiendo
    `centralizador-nivelacion-frontend-diseno.md` Parte B al pie de la
    letra, con Libros (`routes.jsx`+P1→P2) y Configuración
    (`academico/routes.jsx`) como referencia de estilo/arquitectura ya
    revisada.
- **2026-08-06 (continuación, Fase D frontend ejecutada):** reemplazados los
  3 `<UnderConstruction />` de `nivelaciones/routes.jsx` por las pantallas
  reales, siguiendo `centralizador-nivelacion-frontend-diseno.md` Parte B
  (B0-B4) al pie de la letra, con Libros/Centralizador como referencia de
  estilo.
  - **Capa completa nueva**: `NivelacionRepository.js` (7 métodos, unwrap
    `dataFieldName`) + 7 use cases `domain/useCases/academico/nivelaciones/`
    + wiring en `academico.container.js` (7 factory methods) +
    `application/modules/academico/nivelaciones/` (utils: paths/permisos/
    estados/breadcrumbs/paralelo-normalizer/contexto-querystring; hooks:
    4 de estado + 4 de mutación en `hooks/api/`, más
    `useNivelacionPendientesBadge.js` para el badge cruzado) +
    `presentation/modules/academico/nivelaciones/` (4 páginas, 4
    connectors, `NivelacionGrid.jsx` + duplicados locales
    `CabeceraAsignatura`/`CeldaEstudiante`, 2 Drawers, 3 config de columnas,
    `nivelaciones.css`, `nivelacionDrawerLayout.js` copiado con prefijo
    `niv-`).
  - **B1**: nivel 1 (`CarreraTabsListView` + `useParalelosEstadoApi` fusionado
    con `listarNivelacionesPendientesPorParalelo` por `paraleloGestionId`,
    sin reconstruir el listado de paralelos) → nivel 2 (`/listar/:id`, nueva
    ruta `ACA-NIV-GRID`, `menu:null`, mismo permiso `.ver`) con
    `NivelacionGrid.jsx` (N°/Nómina/[asignaturas], sin columna C.I. — el
    endpoint no la trae, se omitió en vez de fabricarla) y
    `CentralizadorContextoHeader.jsx` reutilizado TAL CUAL (cross-import
    directo, no duplicado, incluida su CSS) tal como pide el documento.
  - **B2/B3 — decisión de diseño no 100% explícita en el documento**: el
    Select de tipo de evento de `EventoHistorialDrawer` (B2, permiso
    `inscribir`·CREAR) EXCLUYE el grupo "decisión administrativa"
    (ABANDONO/RETIRADO) — esa acción vive únicamente en
    `ResultadoNivelacionDrawer` (B3, permiso `aprobar`·APROBAR), espejo
    exacto del gate real del backend (`POST /decisiones-administrativas`
    exige `aprobar`, no `inscribir`). El documento mencionaba "nota forzada"
    en el paso 3 de ambos drawers; se resolvió a favor de la coherencia RBAC
    ruta↔UI↔backend en vez de duplicar la acción en dos permisos distintos.
  - **Click en StatusPill de la grilla (B1 nivel 2)**: solo celdas CON
    evento son clicables (conforme al documento). Si el evento tiene
    nivelación PROGRAMADA/EN_CURSO → `/aprobar?nivelacionId=` (la página
    busca la fila real, con su `subjectEnrollmentId` si aplica, en la
    bandeja que ya carga — no duplica contexto por querystring). Si no →
    `/inscribir?historialMatriculaId=...` en modo SOLO LECTURA: la grilla no
    expone `subjectEnrollmentId`/`enrollmentId`+`planSubjectId` de la celda
    (gap real del contrato, no solo del B2 sin contexto), así que no hay
    ancla para reescribir un evento nuevo desde ahí.
  - **Gap B2 sin contexto**: la landing por buscador (`useNivelacionSelector`,
    calcada de `useHistorialSelector`) es 100% funcional para BUSCAR/listar
    estudiantes (reusa `useEstudiantesApi`/`useBuscarEstudiantesHistorial`,
    ambos reales), pero seleccionar un estudiante muestra un `Alert`
    "próximamente" en vez de fabricar materias pendientes — falta el
    endpoint de materias arrastradas por estudiante (Gap 2, ya documentado
    arriba). `EventoHistorialDrawer` sí soporta modo `crear` con ancla real
    vía querystring (`parseCrearEventoContexto`) para cuando ese endpoint
    exista; hoy no tiene ningún llamador real.
  - **Badge cruzado bidireccional**: `CentralizadorNivelacionBadge.jsx`
    (nuevo, en `centralizador/components/`) en `CentralizadorAnualPage.jsx`
    junto al badge de Libro ya existente, alimentado por
    `useNivelacionPendientesBadge.js` (llamada propia a
    `listarNivelacionesPendientesPorParalelo`, ya que
    `GET /calificaciones/centralizador` no embebe ese conteo y no se tocó
    el backend). Sentido inverso ya existía como "Ver en Centralizador" en
    la cabecera de B1 nivel 2.
  - **Observación fuera de alcance de esta fase**: al revisar
    `CentralizadorPage.jsx`/`CentralizadorExportSection.jsx` como referencia
    se detectó que la Parte A de `centralizador-nivelacion-frontend-diseno.md`
    (P1 con `CarreraTabsListView`, quitar botones de exportar) quedó anotada
    como HECHA en esa bitácora pero el código en disco todavía usa
    `CursosDocenteView` y conserva `CentralizadorExportSection.jsx` — no se
    tocó (fuera del alcance de esta tarea), queda señalado para que el
    usuario decida si retomarlo.
  - Verificado: `npx eslint` limpio (0 errores) en todos los archivos nuevos/
    tocados; `npx vite build` sin errores (4 chunks nuevos de Nivelación +
    chunk de Centralizador actualizado); smoke E2E con navegador real
    (Playwright headless, sin instalar nada en el repo): login con el único
    usuario sembrado (`admin`, ADMIN_SISTEMA) y verificación NEGATIVA de RBAC
    — las 3 rutas `/academico/nivelaciones/*` redirigen a `/dashboard` sin
    errores de consola (admin no tiene `academico.nivelacion.*`, coherente
    con el seed 59: solo RECTOR/DIR_ACADEMICO) y el ítem "Nivelaciones" no
    aparece en el menú Académico; `GET /nivelaciones/pendientes-por-paralelo`
    responde 401 sin token y 403 con token de `admin` (`codigo:
    "academico.nivelacion.ver"`). No se pudo hacer la verificación POSITIVA
    (pantallas con datos) porque no existe ningún usuario RECTOR/DIR_ACADEMICO
    sembrado en la BD local y no se creó uno (evita tocar la BD real sin
    autorización expresa) — pendiente para cuando el usuario cree/indique
    una credencial con ese rol, o apruebe aplicar las vistas 130/135/185/187
    y sembrar un usuario de prueba.
- **2026-08-07 (continuación, RBAC de Nivelación rehabilitado en el seed):**
  causa raíz de la verificación NEGATIVA anterior confirmada y corregida en
  `backend/database/02-seeders/59-seed-permisos-aca.sql`: el bloque
  "DESHABILITACIÓN TEMPORAL · páginas aún no construidas (2026-06-24)" seguía
  marcando `academico.nivelacion.ver/inscribir/aprobar` y el grupo
  `aca_nivelaciones` como `activo=0` ("se ocultan hasta que las pantallas
  existan") — por eso ni siquiera RECTOR/DIR_ACADEMICO habría visto el menú
  tras sembrar, aunque backend+frontend ya estén completos. Corregido
  siguiendo EXACTAMENTE el mismo patrón ya usado para rehabilitar
  `academico.avance`/`aca_avance` (2026-07-29) e `historial.academico`
  (2026-07-02): se quitaron los 3 códigos de permiso y `aca_nivelaciones` de
  las listas `WHERE codigo IN (...)` que los desactivan (dejan de perder
  `activo`/`deleted_at` al re-sembrar), con comentario inline explicando la
  fecha y el motivo. Traspasos/Transitabilidad **se dejaron intactos**
  (siguen desactivados) — su baja es definitiva por ahora (A6 del diseño
  frontend: menús de Académico eliminados, función migra a una tab de
  Inscripción en sesión aparte), no un "todavía no construido" a revertir.
  No se tocó la BD real (solo el archivo `.sql` del seeder, sin ejecutarlo).
  - Verificado: diff acotado a los 3 bloques exactos (comentario de cabecera +
    2 listas `IN (...)`), sin tocar la cascada de `permiso_acciones`/
    `roles_permisos` (que ya sigue automáticamente al `deleted_at IS NOT NULL`
    de `permisos`, sin necesitar cambios propios) ni las asignaciones RECTOR/
    DIR_ACADEMICO de las líneas 237-244 (ya correctas desde la Fase D).
  - Pendiente para desbloquear la verificación POSITIVA completa: (1) el
    usuario re-ejecute el seeder 59 (resiembra ACA completo) contra la BD
    local; (2) apruebe aplicar las vistas 130/135/176/116/185/187 (siguen
    como diffs de archivo, no aplicadas); (3) exista o se cree un usuario de
    prueba con rol RECTOR o DIR_ACADEMICO.
- **2026-08-07 (continuación, Fase C ejecutada — rediseñada, más amplia que
  el alcance original):** al retomar la Fase C se encontró que el problema
  real era mucho más grande que "el boletín no muestra ABANDONO": en cuanto
  `RegistrarDecisionAdministrativaUseCase` (Fase D) escribe
  `matriculas_materia.estado = ABANDONO/RETIRADO` de verdad (antes del cierre
  de la Fase D esto era 100% teórico, ningún caso de uso lo hacía), el
  estudiante desaparecía POR COMPLETO de Centralizador (135) y Consolidado
  (116) — no solo perdía el texto "ABANDONO" en el boletín — porque ambas
  vistas heredan de la 110 (`vista_base_calificacion_estudiante_matricula_curso`),
  restringida a `INSCRITO/CURSANDO`. El folio del Libro también habría
  perdido la celda "NP" que `folioCeldasHelper.js` ya tenía programada para
  este caso (comentario propio del helper: "Sin filas... → ABANDONO" — una
  rama hasta ahora inalcanzable). Diseño confirmado con el usuario antes de
  codear (ver hoja de ruta de la conversación): mantener la 110 intacta
  (protege el roster vivo de cuaderno/asistencia) y abrir un camino paralelo
  para las pantallas de registro/reporte, siguiendo el precedente YA
  existente en el propio repo: la vista 177 (`vista_base_libro_paralelo_estudiante`)
  resolvió el mismo problema hace tiempo componiendo las vistas base 04
  (`vista_base_asignaciones_inscripciones`, sin filtro de estado) + 03
  (`vista_base_inscripciones_estudiantes`), en vez de duplicar la 110.
  - **Vista nueva 188** (`vista_base_calificacion_estudiante_matricula_curso_completa`):
    mismo grano/columnas que la 110, compuesta de 04+03 (reutilización, no
    vista duplicada), SIN filtro de `mm.estado`. La 110 no se tocó.
  - **Vistas 135 y 116**: un solo JOIN cambia de fuente (110→188), sin tocar
    el resto de la cadena. La 116 cierra un gap real de la Fase A que había
    quedado "muerto": `GetRegistroNotasCursoUseCase` ya sabía calcular el
    veredicto ABANDONO (`calcularVeredictoMateria`) pero la fila nunca podía
    llegar a existir mientras `emc` viniera de la 110.
  - **Vista 119** (`vista_base_calificacion_resumen_curso_bimestre_fila`):
    se agregó `estado_matricula` (`mm.estado`) y se amplió su propio `WHERE`
    a incluir ABANDONO/RETIRADO — necesario para NO perder las notas de
    bimestres YA cargados antes del retiro (el filtro usa el estado ACTUAL
    de la matrícula, no uno histórico; sin esto, un estudiante retirado en el
    bimestre 3 también habría perdido sus notas reales de los bimestres 1-2
    en Consolidado/boletín). Efecto colateral corregido en el mismo cambio:
    `CalificacionCoordinacionRepository.listarResumenBimestresCursosPorDocente`
    (KPI "Mis cursos" del docente) ahora excluye explícitamente
    `estado_matricula NOT IN ('ABANDONO', 'RETIRADO')` en su propio WHERE,
    para que el tablero del docente no absorba a estos estudiantes en sus
    totales (mismo patrón que el bucket `total_cursando` de la Fase C2:
    aditivo en la vista + exclusión explícita en el consumidor agregado que
    lo necesitaba).
  - **`boletinPdfDatos.js`** (rama `esBimestral`): cuando el bimestre pedido
    NO tiene registro real (`tiene_registro=0`, el retiro ocurrió antes de
    que el docente cargara ese bimestre) Y la matriz ya trae
    `observacion === 'ABANDONO'` para esa celda (dato que llega gratis desde
    la 135 ya ensanchada, sin recalcular nada), se muestra "ABANDONO" en vez
    de dejar el estado en blanco. Un bimestre con nota real ya cargada ANTES
    del retiro conserva su nota tal cual (no se pisa historia real) — caso
    verificado explícitamente en el smoke test.
  - **`CentralizadorAnualGrid.jsx`** (frontend, P2): corregido el bug que la
    propia bitácora de la Fase B había dejado señalado y sin resolver
    ("el pill Estado sigue mostrando EN CURSO para un estudiante en abandono
    real"). Causa: `resumenAnualEstudiante` filtraba las celdas por
    `notaAnual != null` ANTES de mirar `observacion` (una celda ABANDONO
    nunca tiene `notaAnual`, así que se descartaba siempre) y además
    evaluaba `gestionCompleta` antes que el veredicto. Reescrito con la
    MISMA prioridad que `derivarEstadoAcademico` del folio del Libro
    (backend, `folioCeldasHelper.js`) para que ambas pantallas emitan
    siempre el mismo veredicto: REPROBADO > EN CURSO > ABANDONO (todas) >
    APROBADO. Se agregó la variante `abandono` al pill `CeldaEstado`
    reutilizando la clase CSS `cal-centralizador-grid__estado--abandono`
    que la Fase B ya había dejado lista (sin usar) en `centralizador.css`.
  - Verificado: `npx eslint` limpio (0 errores) en los 2 archivos backend
    tocados (`CalificacionCoordinacionRepository.js`, `boletinPdfDatos.js`) y
    en `CentralizadorAnualGrid.jsx`; `npx vite build` sin errores nuevos;
    balance de paréntesis/comillas verificado en las 4 vistas SQL
    tocadas/creadas; smoke test aislado de `construirDatosBoletinEstudiante`
    (3 casos: bimestre con nota real antes del retiro → conserva la nota;
    bimestre sin registro tras el retiro → ABANDONO; estudiante normal sin
    registro → sigue en blanco, no inventa ABANDONO); smoke test aislado de
    `resumenAnualEstudiante` (7 casos: todas aprobadas, una reprobada,
    gestión incompleta sin abandono, todas abandono —el caso que antes
    fallaba—, abandono+reprobado, abandono+en curso, sin celdas). No se tocó
    la BD real: las 4 vistas (135/116/119 modificadas, 188 nueva) quedan
    como diffs/archivo nuevo, pendientes de aprobación explícita para
    aplicarse junto con las de la Fase D.
  - Pendiente: Fase E (verificación cruzada final Consolidado↔Centralizador
    P2/P3↔Folio del Libro, ahora también con un caso ABANDONO real una vez
    se apliquen las vistas y exista un usuario RECTOR/DIR_ACADEMICO de
    prueba).
- **2026-08-07 (continuación, KPI del docente convertido a vista SQL):** a
  pedido del usuario, se sacó el JOIN que había quedado embebido como SQL
  crudo dentro de `CalificacionCoordinacionRepository.listarResumenBimestresCursosPorDocente`
  (agregado en el punto anterior para excluir ABANDONO/RETIRADO) y se llevó a
  una vista nueva **189** (`vista_calificacion_resumen_bimestre_docente_fila`,
  reutiliza 119+107, mismo patrón "vista final delgada" que `108
  vista_calificacion_cursos_docente`) — así todas las vistas de esta ronda
  quedan en `03-views/` para aplicarse juntas, en vez de una quedar oculta en
  código de aplicación. El repositorio queda con una consulta mucho más
  delgada: filtra `docente_id` y agrega aprobados/reprobados contra el umbral
  de nota mínima, que sigue llegando por parámetro desde
  `cargarCuotasPoliticaGestion` a propósito — ese umbral vive en un documento
  JSON de `configuracion_evaluacion` parseado en JS
  (`politicaInstitucionalPayload.js`, con *fallback* a 61 si falta o está mal
  formado); bakearlo en SQL habría duplicado ese parseo en dos lenguajes y
  arriesgado la misma clase de bug que ya cerró la Fase A (dos fuentes de
  verdad divergentes para el mismo número). La vista 189 sí incluye la
  exclusión de ABANDONO/RETIRADO (regla de negocio fija, no un parámetro).
  - Verificado: `npx eslint` limpio en el repositorio tocado; balance de
    paréntesis/comillas en la vista nueva; los 3 `?` de la consulta siguen en
    el mismo orden (`min`, `min`, `docenteId`) que sus `replacements`. No se
    tocó la BD real: la 189 queda como archivo nuevo, para aplicarse junto
    con el resto de esta ronda (135/116/119/188 + las de la Fase D).
- **2026-08-07 (continuación, "riesgo por inasistencia" — cierre de la
  extensión de Fase D pendiente):** a pedido explícito del usuario, se
  construyó la segunda dimensión de riesgo que había quedado solo diseñada
  (nota de Fase D, arriba) y nunca implementada — confirmado por `grep`
  exhaustivo de `pct_asistencia`/`umbralRiesgo` en todo el repo antes de
  empezar: la vista 156 seguía siendo 100% por notas.
  - **Vista 156 ampliada (aditivo, misma vista, sin vista nueva)**: se agregó
    un `LEFT JOIN` a un pivote de la vista 169
    (`vista_asistencia_consolidado_bimestre_fila`, agrupado por
    `oferta_curso_id`+`estudiante_id`, mismo patrón MAX/CASE que el pivote de
    `cuad` en la 119) + un segundo `LEFT JOIN` a `configuracion_evaluacion`
    (nueva clave `ACOMPANAMIENTO_ASISTENCIA`, alias `ce_asi` para no chocar
    con el `ce` de `ACOMPANAMIENTO_PEDAGOGICO`). 3 columnas nuevas:
    `pct_asistencia_ultimo_bimestre` (mismo criterio COALESCE que
    `nota_ultimo_bimestre`), `umbral_asistencia` (fallback 75, mismo valor
    institucional que `politicaAsistenciaDefault.minimoAsistencia`) y
    `en_riesgo_asistencia`. `en_riesgo` (nota) no se tocó — aditivo puro, sin
    renombrar ni redefinir semántica existente.
  - **Seed 54** (`54-seed-configuracion-evaluacion.sql`): fila nueva `id=4`,
    clave `ACOMPANAMIENTO_ASISTENCIA`, `{"umbralAsistencia":75,"criterio":
    "ULTIMO_BIMESTRE"}`, vigente para la gestión 2026.
  - **`RiesgoAcademicoViewRepository.findAlertas`**: `soloEnRiesgo` ahora
    filtra `(en_riesgo = 1 OR en_riesgo_asistencia = 1)` — un estudiante con
    notas normales pero mala asistencia ahora SÍ aparece en el listado de
    alertas, "Mis alumnos en riesgo" y el top de casos críticos del panel
    (los 3 consumen el mismo método, ningún cambio adicional en esos 2 use
    cases). **Alcance documentado, no un olvido**: las vistas agregadas 157
    (por carrera) y 158 (por materia) del panel siguen agregando solo la
    dimensión de nota — la de asistencia se ve en el listado/detalle de
    alertas, no en los totales agregados del panel.
  - **`GetAlertaRiesgoEstudianteUseCase`**: el resumen por estudiante (A3)
    ahora cuenta `materiasEnRiesgoAsistencia` y `materiasEnRiesgoTotal`
    (unión de ambas dimensiones) además del `materiasEnRiesgo` (nota) que ya
    existía; `enRiesgo` de nivel estudiante pasa a considerar cualquiera de
    las 2. Verificado que ningún otro consumidor leía esos campos con la
    semántica vieja (`grep` sin resultados) antes de ensancharlos.
  - **Frontend**: `NotaRiesgoText.jsx` gana un `suffix` opcional (retrocompatible,
    default `''`) para poder mostrar el % de asistencia con el mismo átomo
    que ya pinta notas en rojo bajo el umbral. Nuevos helpers
    `formatSituacionRiesgo`/`getSituacionRiesgoPillClass` en
    `acompanamientoPills.js` (un solo lugar para la combinación de las 2
    dimensiones, evita repetir la lógica 4 veces) — reemplazan el pill
    binario `enRiesgo ? 'En riesgo' : 'Regular'` en los 4 lugares que lo
    usaban (`alertasRiesgoTableColumns.jsx`, `misAlumnosEnRiesgoTableColumns.jsx`,
    `panelCasosCriticosTableColumns.jsx` —que antes ni siquiera evaluaba la
    condición, todas sus filas ya estaban pre-filtradas a `en_riesgo=1`, y
    ahora sí necesita mirar ambas dimensiones— y
    `alertaEstudianteMateriasColumns.jsx`), cada uno con una columna
    "Asistencia" nueva junto a "Último bim."/"Promedio". `alertaRiesgoMapper.js`
    propaga los 3 campos nuevos por materia + `materiasEnRiesgoAsistencia`/
    `materiasEnRiesgoTotal` a nivel estudiante. `AlertaEstudianteDrawer.jsx`
    usa `materiasEnRiesgoTotal` para el pill de cabecera y el texto de pie
    menciona ahora también el criterio de asistencia.
  - Verificado: `npx eslint` limpio (0 errores) en los 4 archivos backend y
    los 8 archivos frontend tocados; balance de paréntesis/comillas en la
    vista 156 y el seed 54; dry-run del contenedor DI (los 4 use cases de
    Acompañamiento resuelven sin cambios de wiring, ninguno necesitó tokens
    nuevos); `npx vite build` sin errores; smoke test aislado (mapper backend
    con una fila mixta nota-regular/asistencia-en-riesgo; las 4 combinaciones
    de `formatSituacionRiesgo`/`getSituacionRiesgoPillClass`; conteo
    combinado de `materiasEnRiesgoTotal` en un caso con 1 materia solo-nota +
    1 solo-asistencia + 1 sin riesgo). No se tocó la BD real: vista 156 y
    seed 54 quedan como diffs de archivo, para aplicarse junto con el resto
    de esta ronda.
  - Sigue siendo 100% informativo, tal como pedía el diseño original: ninguna
    escritura nueva, ningún cambio de estado automático — el radar solo
    alimenta las mismas pantallas de Acompañamiento que ya usa la directiva
    para decidir.
