# Plan — Arrastre, choques de horario y centralizador anual

> **Estado: pendiente — verificado 2026-10-20.** Comprobado contra el código: no existe código de las Fases 1-6: no hay `GET /nivelaciones/choques`, ni `vecesReprobada`/regla de 3.ª matrícula, ni `CentralizadorPdfGenerator`, ni «código RITT» en la UI; el estado anual sigue calculándose también en el frontend (`resumenAnualEstudiante` en `CentralizadorAnualGrid.jsx`). Falta: todo el plan (las reglas de negocio R1-R5 siguen vigentes como requisito); los `choques` actuales son solo de horarios docentes.


> Fecha de acuerdo de alcance: 2026-08-14. Complementa (no reemplaza) a
> `docs/plan/centralizador-nivelacion-plan-desarrollo.md` y
> `docs/plan/matricula-wizard-rediseno.md`. Contrato de handoff backend-first:
> cada fase se entrega datos+backend primero, frontend después.

## 0. Reglas de negocio confirmadas por el instituto (2026-08-14)

**R1 — Estado ANUAL del estudiante (hoja del libro / centralizador anual):**
- Reprobadas **> 3** (es decir 4 o más) → `REPROBADO`.
- Reprobadas **≤ 3** → `APROBADO`, sin importar cuántas materias lleve
  (caso confirmado: 3 reprobadas + 1 aprobada = APROBADO).
- `ABANDONO` es **decisión manual** del administrativo (entrevista con el
  instituto); el sistema nunca lo deriva automáticamente.

**R2 — Celdas del centralizador (pantalla, Excel y PDF):**
- Materia **no inscrita** en la gestión → celda **en blanco**.
- Materia inscrita pero **sin asistencia/registro** → **`NP`**.
- Materia **vencida en gestión anterior** → **`AP-<año>`** (p. ej. `AP-2025`;
  equivale al "VENCIDA EN LA GESTIÓN 2025" del Excel oficial
  `1RO-A- CONTADURÍA CENTRA 2026.xlsx`).
- Materia de **arrastre cursándose** → etiqueta de instancia
  (`NIVELA 1RA/2DA INSTANCIA`, como la planilla oficial
  `NIVELACION SISTEMAS-NIVELA_2025.xlsx`) mientras no haya nota; la instancia
  se deriva del conteo de reprobaciones previas (ver R3).
- Pie de planilla: conteos APROBADOS / REPROBADOS / ABANDONO / TOTAL.

**R3 — Tercera matrícula de la misma materia:**
- Si el estudiante reprobó **2 veces la misma materia**, en su siguiente
  matrícula solo puede inscribir **las materias de nivelación del periodo
  inferior** (la aplazada 2 veces + demás arrastres de ese periodo). Queda
  bloqueado inscribir materias de periodos superiores.
- No existe contador en BD (eliminado por diseño, `16-nivelaciones.sql:172`):
  se **deriva** contando filas del kardex (vistas 138/141) por
  `estudiante × materia_id` con estado `REPROBADO`/`ABANDONO`. Agrupar por
  `materia_id` (vía `asignaturas_plan`), NO por `asignatura_plan_id`, para
  sobrevivir cambios de plan.

**R5 — Pautas de la segunda tanda (2026-08-14, tarde):**
- **Flujo de notas (ya existente, se conserva):** docente carga notas por
  evaluación sobre 100 dentro del bimestre → ponderación teórico/práctico →
  nota bimestral (vista 119 `nota_efectiva`) → centralizador bimestral (135)
  → centralizador anual con estados → el libro/folio SOLO recupera datos del
  centralizador y guarda observaciones.
- **Congelar notas bimestrales** al cerrar/aprobar el bimestre (la compuerta
  ya existe); lo nuevo: **Dirección Académica puede corregir directamente la
  nota de UNA asignatura y UN estudiante específico** sin reabrir el curso
  (acción con permiso propio + auditoría).
- **Auto-observación bimestral:** si el estudiante está reprobado en una
  materia en el bimestre, la observación de esa materia se marca
  `REPROBADO/A` automáticamente (hoy es catálogo manual).
- **Código RITT:** el "código de registro" del libro pasa a llamarse
  **código RITT** (valor institucional 81981609, que el front ya sugiere).
  Cambio de terminología en UI + exportaciones del libro
  (`libro_registro.codigo_registro`, sin cambio de columna).
- El estado ABANDONO sigue siendo **manual** (confirmado en entrevista),
  aunque la lista de pautas mencione NP→abandono; prevalece la respuesta
  explícita del instituto.

**R4 — Choques de horario:**
- **El wizard de matriculación NO valida ni bloquea choques**: la matrícula es
  a la asignatura, no a los horarios. Se mantiene el aviso informativo actual
  (`MateriasPlanillaSelector.jsx:268`, `InscripcionSeleccionResumen.jsx:197`).
- La **detección automática** y la **resolución** viven en
  **Académico → Nivelaciones**: ahí se decide qué asignatura mover a otro
  paralelo o retirar.
- Prioridad: **la asignatura de menor nivel (arrastre) no se puede retirar**;
  el bloque del paralelo se mantiene y es la materia del otro nivel la que se
  mueve a otro paralelo disponible o se retira.

## 1. Diagnóstico (estado actual, verificado 2026-08-14)

| Capacidad | Estado | Evidencia |
|---|---|---|
| Detección de choques a grano estudiante | **No existe** (ninguna capa) | Vistas de conflicto 36/79/86/91/92/124-126 son docente/aula/paralelo |
| Registro de choque | Existe pero **manual** | `historial_matricula.tipo_estado='CHOQUE_HORARIO'` vía `POST /nivelaciones/eventos` |
| Ancla B (materia arrastrada no cursada) en vista 185 | **Deshabilitada** | `185-...sql:87-95`; falta aplicar `05-migrations/26-migrate-alter-tablas-existentes.sql` en BD |
| Conteo de repitencia | **No existe** | Derivable de vistas 138/141; única huella = texto libre en `folio_estudiantes.observaciones` |
| Estado anual por estudiante | Existe **4 veces duplicado** | Persistido en `folio_estudiantes.estado_academico`; backend `folioCeldasHelper.js:98,121`; frontend `CentralizadorAnualGrid.jsx:79-95`; Excel `centralizadorExcelDatos.js:74-85`. El endpoint del centralizador NO lo devuelve |
| `AP-<año>` | **No existe** en ninguna capa | El dato vive en kardex (141: rama PREVIO + gestion_anio) pero nunca se compone la etiqueta |
| Export Excel centralizador | Backend completo, **UI sin cablear** | 3 endpoints + builders; hooks `useExportCentralizador*Excel` con 0 consumidores en `presentation/` |
| Export PDF de la matriz | **No existe** | Solo boletín individual; stack pdfkit/pdf-lib; precedente `HistorialAcademicoPdfGenerator.js` |

Cimientos ya disponibles (sin DDL nuevo):
- `matriculas_materia.oferta_curso_id` ancla cada materia a su oferta; puede
  haber paralelos distintos en la misma gestión (caso arrastre, ya soportado).
- Choque = **mismo `horario_id`** entre ofertas (slots discretos de catálogo;
  mismo patrón self-join de todas las vistas de conflicto).
- Vista **54** `vista_base_curso_bloques_horario` (`cursoId` = oferta) y vista
  **122** (grilla enriquecida por paralelo_gestion) para leer bloques.
- Regla de inserción backend: `enrollmentBusinessRules.validarReglasInscripcion`
  (reglas 2-5 hoy; la de 3ra matrícula entra como regla 6).

## 2. Fases

### Fase 1 — Detección de choques a grano estudiante (backend, dominio Nivelaciones)
1. Nueva consulta a grano estudiante (aplicación, reutilizando vista 54; si se
   necesita persistente, vista delgada `matriculas_materia × 54`, patrón §87):
   agrupar bloques por `horario_id` dentro del conjunto de ofertas
   matriculadas del estudiante en la gestión; >1 oferta en el mismo slot = choque.
   Nota: los choques entre materias CURSADAS usan el ancla A
   (`matricula_materia_id`), así que esta fase NO depende de la migración 26.
2. Use case + endpoint `GET /nivelaciones/choques?paraleloGestionId` (y por
   estudiante), permiso `academico.nivelacion.ver` LISTAR. Cada choque
   identifica: materias implicadas, periodo de cada una, cuál es la de menor
   nivel (intocable) y cuál la candidata a mover/retirar. Lectura pura, sin
   efectos secundarios.

### Fase 2 — Resolución de choques en Nivelaciones (backend + frontend)
0. Materializar el evento `CHOQUE_HORARIO` en `historial_matricula` como
   acción explícita (idempotente, sin duplicar eventos activos), reutilizando
   `RegistrarEventoHistorialMatriculaUseCase`; nunca como efecto de un GET.
1. Acción **mover de paralelo**: endpoint que reubica una `matriculas_materia`
   a otra `oferta_curso` de la MISMA materia en la gestión (otro paralelo
   habilitado, validando que el nuevo horario no genere otro choque y que la
   oferta esté ACTIVA). Permiso `academico.nivelacion.aprobar` EDITAR.
2. Acción **retirar materia**: `matriculas_materia.estado='RETIRADO'` +
   evento; **bloqueada si la materia es de arrastre / menor periodo** (R4).
3. UI en `NivelacionParaleloPage`: panel de choques detectados por estudiante,
   con paralelos alternativos sugeridos (horario compatible + cupo) y las dos
   acciones; la materia de arrastre se muestra como fija (pill, sin acción de
   retiro). Registro formal de "usted" en todos los textos.

### Fase 3 — Regla de 3ra matrícula (wizard + backend)
1. `GetMatriculaContextoUseCase`: derivar por materia pendiente el número de
   reprobaciones previas (conteo kardex por `materia_id`) y exponerlo en el
   contexto (`vecesReprobada`, `instancia`).
2. `enrollmentBusinessRules` regla 6: si alguna materia pendiente tiene
   ≥2 reprobaciones, la selección solo puede contener materias de nivelación
   del periodo inferior (R3). Aplica a Create y Update.
3. Wizard (`MateriasPlanillaSelector`): cuando la regla aplique, bloquear las
   filas de periodos superiores con texto formal explicando el motivo; badge
   de instancia (1RA/2DA/3RA) en las materias de arrastre.

### Fase 4 — Centralizador anual: estado único y celdas oficiales
0. **Prerrequisito BD (usuario):** aplicar
   `05-migrations/26-migrate-alter-tablas-existentes.sql` en la BD real y
   habilitar el ancla B comentada en la vista 185 (necesaria para las celdas
   de materias arrastradas NO cursadas y la composición `AP-<año>`). *(Los
   agentes preparan y verifican el SQL; la ejecución contra BD es siempre del
   usuario.)*
1. Estado anual calculado **una sola vez en backend** (extender
   `GetCentralizadorParaleloUseCase` y reutilizar en folio/Excel/PDF):
   `reprobadas > 3 → REPROBADO`, si no `APROBADO`; `ABANDONO` manual prevalece
   cuando el administrativo lo registró. Eliminar la reimplementación frontend
   (`resumenAnualEstudiante` en `CentralizadorAnualGrid.jsx`) y las variantes
   divergentes (`folioCeldasHelper`, `centralizadorExcelDatos`) → una fuente.
2. Celdas según R2: `AP-<año>` (kardex 141 rama PREVIO/CURSADO aprobado de
   gestión anterior, cruzado con las columnas del paralelo), `NP` (inscrita
   sin registro), blanco (no inscrita), etiqueta de instancia (arrastre en
   curso). Alinear vista 185/135 si hace falta columna aditiva (sin duplicar
   vistas; `incos-vistas-y-evolucion`).
3. `dataKey` (front) = `dataFieldName` (back) verificado en todo el contrato.

### Fase 5 — Exportación Excel + PDF de la matriz
1. Cablear en la UI del centralizador los hooks de Excel ya existentes
   (`useExportCentralizadorExcel`, `useExportCentralizadorAnualExcel`) —
   botones EXPORTAR con RBAC `academico.calificacion.centralizador` EXPORTAR.
2. Nuevo `CentralizadorPdfGenerator` (pdfkit, patrón
   `HistorialAcademicoPdfGenerator` + toolkit shared/), formato de la planilla
   oficial: cabecera institucional, matriz estudiante × asignatura, celdas R2,
   columna estado anual y pie APROBADOS/REPROBADOS/ABANDONO/TOTAL.
3. Excel y PDF comparten el mismo mapper de datos que la pantalla (una fuente).

### Fase 6 — Calificaciones y libro: pautas R5
1. Override puntual de nota por Dirección Académica (asignatura + estudiante,
   bimestre cerrado): acción nueva con permiso propio (vocabulario v2) +
   registro de auditoría de quién/cuándo/valor anterior. No reabre el curso
   (la reapertura por curso vía estado REABIERTO ya existe y se mantiene).
2. Auto-observación bimestral `REPROBADO/A` cuando la nota bimestral quede
   bajo la mínima al cierre del bimestre (respetando el catálogo cerrado de
   observaciones; editable después solo por quien tenga permiso).
3. Renombrar "código de registro" → **"código RITT"** en UI del libro y en
   las cabeceras de Excel/PDF (columna BD `codigo_registro` no cambia).

## 3. Trabajos hermanos (dominios Pasantías y Titulación — planes propios)

Pautas confirmadas 2026-08-14; se ejecutan como iteraciones aparte con el
mismo esquema backend-first. Documentos fuente en
`/Users/miguel/Documents/incos/pasantia/`.

**Pasantías (`hoja de seguimiento de pasantía 2026.docx` = plantilla):**
- Descargar el **formulario de seguimiento en blanco** (plantilla PDF): lo
  firma la empresa y se entrega al docente.
- Al finalizar, subir el **documento de finalización de la empresa** +
  indicar qué entrega la empresa (adjunto opcional).
- El sistema **no marca horas**; el estudiante solo recibe/registra el
  certificado de pasantía.
- **Abandono de pasantía**: dar de baja quita las horas acumuladas.

**Titulación (foto del acta:
`pasantia/WhatsApp Image 2026-07-22 at 20.02.00.jpeg`;
formulario: `FORMULARIO 01 DE MODALIDAD DE GRADUACION OK.docx`):**
- El **estudiante** rellena el formulario de modalidad de grado y el
  directivo lo completa; el estudiante lo descarga desde su rol (la
  directiva NO lo imprime).
- Solo estudiantes de **3er año** pueden registrar modalidad; si tiene
  prerrequisito sin avanzar, se bloquea el registro.
- Renombrar **"bitácora" → "cronograma de progreso"**.
- Antes de la predefensa: **informe de suficiencia del docente** (check).
- Nota **> 90**: realiza el proyecto pero queda **exento de defensa**.
- **Acta de defensa** en PDF con el formato exacto de la foto (cabecera
  Ministerio + INCOS, tribunal evaluador, calificación final en literal,
  firmas tribunal/postulante). *(Reportado como "problema al registrar una
  defensa" en el chat 2026-08-17, pero sin error reproducible — SIN ALCANCE
  por ahora; no investigar más salvo que reaparezca con datos concretos.)*

### Titulación — contrato de handoff (acordado 2026-08-17, backend-first)

Decisiones tomadas en el chat del 2026-08-17 (no re-preguntar):

- **Prerrequisito de autorregistro** = `periodo_numero === 3` (año vigente del
  estudiante, mismo campo de la vista 101 que ya usa
  `resolveInscripcionVigenteEstudiante`) **+** sin materias `REPROBADO`/
  `ABANDONO` pendientes de `periodo_numero` 1 o 2 (kardex, vistas 138/141;
  reutilizar el mismo criterio de conteo por `materia_id` de la Fase 3 de
  este documento — "Regla de 3ra matrícula" — sin duplicar la lógica).
- **Exención de defensa** (nota_predefensa > 90): acción SEPARADA del flujo
  lineal "Continuar etapa" (mismo patrón que `CancelarProyectoModal`, no un
  `Select` de destinos — ese patrón se retiró explícitamente el 2026-08-11).
- Bitácora: renombrar SOLO las etiquetas visibles (tabs, títulos, botones,
  encabezados de tabla) — identificadores internos (`bitacora_proyecto`,
  `TIPOS_BITACORA_TUTORIA`, nombres de archivo/componente) NO cambian.
- El generador del FMDG-1 (`ExportFormularioModalidadGradoPdfUseCase` /
  `useExportFormularioModalidadPdf`) YA EXISTE — el autorregistro del
  estudiante reutiliza esa descarga, no crea un generador nuevo.

**Fase B1 — BD (usuario ejecuta):**
- Migración `05-migrations/` (proyectos_grado ya desplegado con datos
  reales): `ALTER TABLE proyectos_grado MODIFY estado ENUM(...)` agregando
  `'SUFICIENCIA'` entre `'DESARROLLO'` y `'PREDEFENSA'` + columna
  `fecha_informe_suficiencia DATE NULL`. Reflejar el mismo `ENUM`/columna en
  `01-schemas/22-modalidades-grado.sql` para instalaciones nuevas. Los
  agentes preparan y verifican el SQL; la ejecución contra BD real es
  siempre del usuario.

**Fase B2 — Backend, máquina de estados** (`titulacion.constants.js`,
`AprobarEtapaProyectoUseCase.js`):
- `ESTADOS_PROYECTO_GRADO.SUFICIENCIA` + `ESTADOS_PROYECTO_GRADO_VIGENTES`.
- `TRANSICIONES_PROYECTO_GRADO`: `DESARROLLO → [SUFICIENCIA, CANCELADO]`,
  `SUFICIENCIA → [PREDEFENSA, CANCELADO]`,
  `APROBADO_PREDEFENSA → [DEFENSA, APROBADO, CANCELADO]`.
- `FECHA_POR_ESTADO[SUFICIENCIA] = 'fechaInformeSuficiencia'`.
- Guard nuevo: transición `APROBADO_PREDEFENSA → APROBADO` (salto directo,
  exención) exige `proyecto.notaPredefensa > 90` (si no, `ConflictError`);
  `notaFinal = notaPredefensa`; no crea acta de defensa.
- **Informe de suficiencia (PDF), agregado 2026-08-17** — documento físico
  real del instituto, foto de referencia:
  `/Users/miguel/Desktop/WhatsApp Image 2026-08-11 at 21.01.37.jpeg`.
  Cabecera "INFORME DE SUFICIENCIA DE MODALIDAD DE GRADUACIÓN" (logo INCOS
  Santa Cruz). Campos: nombres/apellidos del estudiante, cédula de
  identidad + expedido, N.º de celular, instituto (fijo "INSTITUTO TÉCNICO
  INCOS SANTA CRUZ"), carrera, modalidad de graduación + nombre/tema del
  proyecto, nombres/apellidos del tutor/a. Cuerpo: "Como Docente Tutor/a
  emito el presente informe de suficiencia de acuerdo a los siguientes
  criterios" con 3 campos de texto libre — **Aspectos de formato**,
  **Contenido del proyecto**, **Proceso de tutoría**. Cierre: "Por cuanto
  el/la estudiante ___ de la Carrera de ___ se encuentra [ ] APROBADO
  [ ] NO APROBADO para la Defensa de Proyecto de Grado", lugar y fecha
  (Santa Cruz, día/mes/año), firma y sello del Docente Tutor/a.
  Al transicionar `DESARROLLO → SUFICIENCIA` (T11), el tutor completa esos 3
  criterios + el veredicto APROBADO/NO_APROBADO y el sistema EMITE Y
  GUARDA el PDF — mismo patrón que `_emitirViabilidadTecnica` en
  `AprobarEtapaProyectoUseCase.js` (nuevo tipo en `TIPOS_DICTAMEN_TUTORIA`,
  nuevo `IInformeSuficienciaPdfGenerator` en
  `infrastructure/external/pdf/titulacion/`, mismo `dictamenPdfHelpers.js`).
  El veredicto NO_APROBADO no bloquea la transición de estado en sí (el
  tutor decide si igual continúa o corrige antes) — es una decisión de
  diseño abierta para quien implemente: puede quedar como advertencia en
  frontend en vez de bloqueo duro en backend, documentar la decisión que se
  tome.

**Fase B3 — Backend, autorregistro del estudiante:**
- Nuevo use case self-service (reutiliza `CreateProyectoGradoUseCase`,
  resuelve `estudianteId` por token vía `resolveEstudianteIdForUsuario`,
  NUNCA del body) que valida el prerrequisito de arriba antes de crear.
- Endpoint dedicado (p. ej. `POST /proyectos-grado/mi-proyecto`), permiso
  `titulacion.proyecto` CREAR.
- RBAC: agregar `ESTUDIANTE → titulacion.proyecto CREAR` en
  `65-seed-permisos-tit.sql` (sin ids, ref por código).

**Fase B4 — Frontend (después del backend):**
- `ProyectoGradoTimeline.jsx`/`proyectoGradoTimeline.js`: paso "Informe de
  suficiencia" en `ORDEN_ESTADOS_VIGENTES`/`ETAPAS`.
- `titulacionPills.js`: label/color de `SUFICIENCIA`.
- `requisitosTransicionProyecto.js`: requisito manual en `SUFICIENCIA`
  ("Verifique que el docente tutor emitió el informe de suficiencia del
  estudiante").
- `ProyectoGradoDetail.jsx`: acción "Declarar exento de defensa" separada de
  "Continuar etapa", visible solo si `estado === APROBADO_PREDEFENSA &&
  notaPredefensa > 90`.
- `MiProyectoGradoPage.jsx`: cuando `sinProyecto`, botón "Registrar mi
  modalidad de grado" (habilitado solo si cumple el prerrequisito, mensaje
  formal si no) + botón "Descargar formulario FMDG-1" (reutiliza el export
  ya existente).
- Rename visible "Bitácora" → "Cronograma de progreso" y quitar el Alert
  informativo de `ProyectoGradoFormSections.jsx` — ejecutados directo en el
  chat 2026-08-17 (sin dependencia del backend de arriba).

**Fase B4b — Corrección de seguridad hecha en el chat (2026-08-17):** para que
el estudiante descargue SU PROPIO FMDG-1 hacía falta permiso EXPORTAR sobre
`titulacion.proyecto`, pero `GET /:id/formulario-modalidad/pdf` no tenía el
guard anti-IDOR (`proyectoGradoIntegranteGuard`) que sí tienen los demás
satélites que reciben `:id` del cliente — sin el guard, cualquier estudiante
con EXPORTAR podría descargar el FMDG-1 de OTRO estudiante cambiando el id.
Se agregó el guard a esa ruta (`proyectos-grado.routes.js`) ANTES de sumar
`ESTUDIANTE → titulacion.proyecto → EXPORTAR` en `65-seed-permisos-tit.sql`.

**Fase B5 — Verificación:** `verificador` — dataKey==dataFieldName, RBAC 3
capas, prueba con rol ESTUDIANTE con y sin prerrequisito cumplido,
build/lint.

## 4. Riesgos / notas
- **Bloques MAÑANA sin sembrar** en el catálogo `horarios` (solo TARDE/NOCHE/
  SÁBADO, ids 1-60): si se ofertan paralelos de mañana, la detección no
  tendría slots. Sembrar cuando el instituto lo requiera.
- El conteo de repitencia cuenta también `ABANDONO` como intento fallido
  (criterio del Excel oficial: ABANDONO ≠ aprobada). Confirmar con datos
  reales en la verificación de Fase 3.
- La vista 135 solo cubre gestión vigente; `AP-<año>` sale del kardex (141),
  no de ampliar la 135 a multi-gestión.
- RBAC: sin permisos nuevos; todo cuelga de códigos existentes
  (`academico.nivelacion.*`, `matricula.inscribir`,
  `academico.calificacion.centralizador`).

## 5. Verificación por fase
- Backend: pruebas de la regla con datos reales (estudiante con arrastre 2×,
  estudiante multi-paralelo con choque real de `horario_id`).
- `verificador`: lint/build, dataKey==dataFieldName, RBAC 3 capas, estados
  cubiertos (vacío/carga/error) en las pantallas tocadas.
- Prueba con rol sin permiso en cada endpoint nuevo.
