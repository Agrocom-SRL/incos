# Rediseño del wizard de inscripción de materias (matrícula) — plan de desarrollo

> Plan (2026-08-13) para revisar, mejorar y adaptar `/matricula/nueva`
> (`InscripcionesNueva.jsx`) siguiendo el precedente de los formularios ya
> refactorizados (aporte voluntario, becas, nuevo estudiante).
> **Entrega por partes:** Fase A = backend (contrato verificable);
> Fases B/C = frontend; Fase D = verificación.
> Relación con `planes-duales-matricula-plan-desarrollo.md`: este rediseño
> implementa la parte de wizard (D1-D3) y el núcleo B2/B3 de aquel plan,
> **sin** ejecutar su DDL (bloque A sigue ⛔ pendiente de aprobación; el
> use case usa derivación como fallback mientras tanto).

## 1. Requisito del usuario (síntesis)

- Dos entradas al wizard: botón «Nueva inscripción» de la lista de matriculados
  (flujo completo) y botón desde el detalle del estudiante (se saltan pasos ya
  resueltos). Ambos comparten diseño.
- **Paso Buscar:** input de búsqueda `span=24`; las instrucciones dejan de ser
  un Alert protagonista; al entrar desde la lista se muestra de inicio una
  lista de ~10 estudiantes **completamente nuevos en el sistema** (sin ninguna
  matriculación) para no adivinar quién está libre. La pill «Ya matriculado»
  se mantiene para los ocupados.
- **Paso Carrera:** estilo del picker de tarjetas del formulario de paralelos
  (`ParaleloCarreraPicker`, design system). Estudiante sin carrera: elige
  libremente. Estudiante con carrera: la suya marcada, las demás «No
  disponible». Estudiante **ya registrado** (con historial de inscripciones en
  el sistema): el paso NO se muestra. Se eliminan los Alerts «Estudiante
  seleccionado» / «Estudiante nuevo». En este paso se fusiona la elección de
  **plan de estudio** (solo nuevos al sistema, solo si la carrera tiene >1 plan
  habilitado; si hay 1 se usa el vigente sin preguntar) y se precargan
  periodos/asignaturas del plan.
- **Paso Periodo y materias:** sin Alerts; selección sobre una **planilla
  estilo plan de estudio** (`PlanEstudioDocumentoView`: tabla por periodo con
  CÓDIGO / ASIGNATURA / HORAS / PRE REQUISITO) **sin** el color de carrera,
  con checkbox por fila y «marcar todo» junto al nombre del periodo. Reglas:
  - NUEVO (sin historial): solo primer periodo, bloque completo.
  - ANTIGUO (sin historial en sistema): cualquier periodo.
  - TRANSITABILIDAD: comienza en 2.º periodo (1.º convalidado/bloqueado).
  - TRASPASO: según `anio_cursado` (PRIMERO → bloquea 1.º; SEGUNDO → bloquea
    1.º y 2.º).
  - Con historial en el sistema: las aprobadas quedan marcadas (según vista
    141), no se pueden elegir materias de un periodo superior dejando
    pendientes dos niveles abajo (arrastre máximo: periodo principal =
    mínimo periodo con pendientes + 1), y se bloquean materias con
    prerrequisito no aprobado. Materias de periodos inferiores al principal =
    arrastre/nivelación (etiqueta informativa).
- **Paso Paralelo:** sin títulos duplicados ni Alert de resumen; resumen como
  panel; cards de paralelo por periodo (diseño actual se conserva).
- **Paso Historial de notas:** solo aplica a nuevos-en-el-sistema con tipo
  ANTIGUO/TRASPASO/TRANSITABILIDAD (si ya tiene historial digital, se omite).

## 2. Conceptos derivados (vocabulario del código)

| Concepto | Definición operativa | Fuente |
|---|---|---|
| `esNuevoSistema` | 0 inscripciones activas en cualquier gestión | vista 153 ampliada (`total_inscripciones = 0`) |
| `tieneHistorialSistema` | `!esNuevoSistema` | ídem |
| `tipoAdmision` | `NUEVO\|ANTIGUO\|TRASPASO\|TRANSITABILIDAD` | `estudiantes_datos_academicos.tipo_admision` |
| Carrera fija | tiene `datos_academicos.carrera_id` | vista 153 / `GET /estudiantes/:id` |
| Periodo principal | mayor periodo con materias seleccionadas | estado del wizard |
| Periodo que le toca | `minPeriodoPendiente + 1` (con historial) | contexto (kardex 141) |
| Materias a nivelar | pendientes (reprobadas/no cursadas) de periodos < que le toca | contexto (kardex 141) |
| Arrastre/nivelación | materia seleccionada de periodo < principal | derivado |
| Aprobada | `estado IN (APROBADO, CONVALIDADO)` en kardex | vista 141 |

Reglas de nivelación (aclaración 2026-08-13, segunda pasada del usuario):

- Un esNuevoSistema con `tipoAdmision=ANTIGUO` solo tiene la carrera
  registrada: aplica la lógica de nuevos pero con **todos los periodos y
  asignaturas libres** (sin selector de plan: usa el vigente).
- Si la selección final abarca **más de 1 periodo**, el estudiante queda en
  régimen de **nivelación**: el wizard lo comunica (aviso informativo, no
  bloqueo) — «El estudiante quedará en nivelación; los choques de horario se
  gestionan en Académico → Nivelaciones». El wizard **NO valida choques de
  horario**: eso vive en `academico/nivelaciones` (ahí se obliga a cursar o
  se retiran las asignaturas nuevas habilitadas).
- Con historial en el sistema: el wizard habilita el **periodo que le toca**
  y **pre-marca** las materias a nivelar (pendientes de periodos anteriores)
  como sugerencia «sí o sí en esta gestión». Desmarcarlas NO bloquea el
  submit (la exigencia dura la aplica Nivelaciones después), pero muestra
  advertencia visible en el paso y en el resumen del paso Paralelo.

Matriz de pasos visibles (el array `steps` se construye dinámico):

| Perfil | Buscar | Carrera+Plan | Periodo/Materias | Paralelo | Historial |
|---|---|---|---|---|---|
| esNuevoSistema + NUEVO | ✔ (reemplazado si viene con studentId) | ✔ (elige carrera; plan si >1) | ✔ (solo periodo 1, bloque completo) | ✔ | — |
| esNuevoSistema + ANTIGUO | ✔ | ✔ (carrera fija si la tiene; sin selector de plan → vigente) | ✔ (libre) | ✔ | ✔ |
| esNuevoSistema + TRASPASO | ✔ | ✔ (carrera fija, read-only; plan si >1) | ✔ (bloqueos por anio_cursado) | ✔ | ✔ (bloqueados = CONVALIDADO) |
| esNuevoSistema + TRANSITABILIDAD | ✔ | ✔ (carrera fija, read-only; plan si >1) | ✔ (periodo 1 bloqueado) | ✔ | ✔ |
| tieneHistorialSistema (cualquier tipo) | ✔ | **omitido** (carrera y plan del historial) | ✔ (marcas por kardex + prerrequisitos + salto máx.) | ✔ | **omitido** |

Nota planes duales: ANTIGUO nunca elige plan (RN-3). Para esNuevoSistema con
tipo ANTIGUO tampoco se muestra selector (usa el vigente); TRASPASO y
TRANSITABILIDAD sí eligen en su primera inscripción (RN-4 resuelta).

## 3. Contrato backend (Fase A) — dataFieldName == dataKey

### A1. Vista 153 ampliada (`03-views/153-vista-estudiante-busqueda-inscripcion.sql`)

Añadir columnas (misma vista, sin duplicarla): `datos_academicos_id`,
`carrera_id`, `tipo_admision`, `total_inscripciones` (COUNT de inscripciones
activas del estudiante en cualquier gestión, vía subconsulta agregada por
`datos_academicos_id`). ⛔ **Recrear la vista en BD la hace el usuario** (dejar
el `.sql` listo y reportar el comando).

### A2. Búsqueda para inscripción

`GET /v1/estudiantes/buscar-para-inscripcion` — nuevo query param
`solo_nuevos=1` (con `preliminar=1` implícito: sin mínimo de caracteres,
`limit` por defecto 10): devuelve solo estudiantes con
`total_inscripciones = 0`, orden `created_at DESC`. Cada fila del DTO suma:
`carreraId`, `tipoAdmision`, `esNuevoSistema` (bool), `totalInscripciones`.
Sin cambio de dataFieldName ni de las columnas existentes.

### A3. Contexto de matrícula (endpoint nuevo)

`GET /v1/inscripciones/contexto-matricula?estudiante_id=&carrera_id=&plan_estudio_id=`
— permiso `matricula.inscribir` + `CREAR` (cero permisos nuevos; resuelve la
fricción actual: el wizard deja de llamar `GET /materias`
[`configuracion.materia LISTAR`] y de derivar periodos de paralelos).

- `carrera_id` requerido solo si el estudiante no tiene carrera fija.
- `plan_estudio_id` opcional; default = plan del estudiante (derivado del
  kardex si tiene historial) o plan vigente de la carrera.
- Use case nuevo `GetMatriculaContextoUseCase` compone repos existentes
  (StudyPlan, Periodo/AsignaturaPlan, Prerrequisito, HistorialAcademico
  [vista 141], GestionPlan [vista 56], Traspaso). **Sin vistas SQL nuevas.**
- `dataFieldName: 'contexto'`:

```
contexto: {
  estudiante: { id, nombreCompleto, codigoEstudiante, ci, tipoAdmision,
                carreraId, carreraNombre, esNuevoSistema,
                traspasoAnioCursado,            // 'PRIMERO'|'SEGUNDO'|null
                yaMatriculadoGestionActual },
  gestion:    { id, anio, nombre },
  carrera:    { id, nombre, codigo },
  planes:     [ { id, nombre, resolucionMinisterial, vigente } ],  // habilitados en la gestión para la carrera
  plan:       { id, nombre, vigente },          // el resuelto/solicitado
  periodos:   [ { id, numero, nombre, asignaturas: [ {
                  asignaturaPlanId, materiaId, sigla, nombre,
                  horasSemanales, modalidad,
                  prerrequisito: { asignaturaPlanId, materiaId, sigla } | null,
                  estadoHistorial: 'APROBADO'|'CONVALIDADO'|'REPROBADO'|null,
                  notaFinal: number|null } ] } ],
  resumenHistorial: { totalAprobadas, totalPendientes,
                      minPeriodoPendiente: number|null },
  notaMinimaAprobacion: number   // política institucional vigente
                                 // (configuracion_evaluacion, fallback 61)
}
```

### A4. `POST /v1/inscripciones` — validaciones de negocio (coherencia 3 capas)

En `CreateEnrollmentUseCase` (mensajes en «usted», patrón de errores actual):

1. **`plan_estudio_id` opcional en payload** (validator + regla de resolución
   del doc planes-duales §(b): pedido→validado contra carrera + gestion_plan;
   con historial → plan derivado del kardex manda; fallback vigente). Sin
   persistencia en datos académicos hasta que se apruebe el DDL (bloque A de
   aquel plan); dejar `TODO` referenciado.
2. **Prerrequisitos:** toda materia a inscribir cuyo prerrequisito (tabla
   `prerrequisitos` del plan) no esté aprobado/convalidado en kardex (141) ni
   incluido en `prior_history` del payload → `ValidationError` listando
   siglas («No puede inscribir SIGLA: requiere SIGLA-PRE aprobada.»).
3. **Regla de periodo por tipo** (solo esNuevoSistema): NUEVO → solo periodo
   `numero=1`; ANTIGUO → sin restricción de periodo; TRASPASO (con traspaso
   registrado) → sin periodos ≤ anio_cursado; TRANSITABILIDAD → sin periodo 1.
   **Implementado (Fase A):** las materias bloqueadas por TRASPASO/
   TRANSITABILIDAD nunca se matriculan — llegan como CONVALIDADO vía
   `prior_history` (flujo normal del wizard); el backend rechaza el intento
   con mensaje que remite al historial previo. TRASPASO sin fila en
   `traspasos` (sin anio_cursado) no aplica bloqueo de periodo.
4. **Salto máximo** (tieneHistorialSistema): rechazar materias de periodo
   `numero > minPeriodoPendiente + 1`.
5. **Duplicado de aprobadas:** rechazar materias ya APROBADO/CONVALIDADO en
   su kardex.

Importante: el backend NO exige que las materias pendientes de periodos
anteriores estén incluidas (el estudiante puede inscribir solo el periodo que
le toca; la exigencia de nivelación la aplica después el módulo
`academico/nivelaciones`). Tampoco valida choques de horario (fuera de
alcance del wizard, se resuelven en Nivelaciones).

### Tabla de contrato

| Endpoint | Cambio | dataFieldName |
|---|---|---|
| `GET /estudiantes/buscar-para-inscripcion` | + `solo_nuevos`; filas + `carreraId, tipoAdmision, esNuevoSistema, totalInscripciones` | sin cambio |
| `GET /inscripciones/contexto-matricula` | **nuevo** | `contexto` |
| `POST /inscripciones` | + `plan_estudio_id`; validaciones 2-5 | `enrollment` (sin cambio) |
| `PUT /inscripciones/:id` | mismas validaciones (reutilizar helpers) | sin cambio |
| Vista 153 | + 4 columnas | — (recrea el usuario) |

## 4. Diseño frontend (Fases B y C)

Principios: `incos-ui-system` (tokens, sin hex/px sueltos), Alerts con
moderación (hints como `Typography.Text type="secondary"`, estados con pills y
`Empty`), registro «usted», motion motivado, dark mode vía tokens.

### B1. Paso «Buscar estudiante»

- Field búsqueda `span: 24`; el Alert «Instrucciones de búsqueda» se elimina:
  el texto pasa a la descripción de la sección (ya existe) + `placeholder`
  del input («Busque por C.I., código, nombres o apellidos»).
- Estado inicial (solo entrada desde la lista, sin `studentId`): carga
  `solo_nuevos=1&limit=10` y muestra «Estudiantes nuevos sin matrícula» como
  lista de resultados normal, cada fila con pill `--info` «Nuevo en el
  sistema». Al escribir ≥2 caracteres se pasa a la búsqueda normal (pill
  «Ya matriculado (año)» se conserva). Al limpiar el input vuelven las
  sugerencias.
- La fila seleccionada queda resaltada; se elimina el Alert de selección.

### B2. Franja del estudiante (organismo nuevo, reemplaza 4 Alerts)

`InscripcionStudentStrip` — banda compacta visible en todos los pasos ≥ 2
(y en el paso 0 cuando viene con `studentId`, reemplazando al Alert del
`step0EnrichmentStrategy`): avatar/iniciales, nombre completo (orden
APELLIDOS NOMBRES via `buildFullName`), código + C.I., pills: tipo de
admisión, carrera (cuando fija), plan (cuando resuelto), gestión vigente,
«Nuevo en el sistema» si aplica. Sin Alert; estilo `sd-profile`/pills del
design system.

### B3. Paso «Carrera y plan» (solo esNuevoSistema)

- Sustituir `InscripcionesCarreraSelectionSection` (estilos inline) por el
  patrón design-system de `ParaleloCarreraPicker` (clases
  `cfg-paralelo-carrera-picker__*`): promover el picker a organismo
  compartido `@organisms/CarreraCardPicker` (patrón páginas gemelas) y que
  `ParaleloCarreraPicker` lo reutilice. Prop `disabledIds`/`readOnly`: carrera
  fija = la suya seleccionada, las demás con overlay «No disponible».
- Debajo, selector de plan **solo si `contexto.planes.length > 1`** y tipo ∈
  {NUEVO, TRASPASO, TRANSITABILIDAD}: cards/radio con nombre + R.M. + pill
  Vigente/Anterior (gris, nunca rojo). Con 1 plan: pill informativa.
- Al elegir carrera (o al entrar con carrera fija) se dispara
  `GET contexto-matricula` — la data de periodos/materias queda lista antes
  de avanzar (la «fusión» pedida).
- Para `tieneHistorialSistema` el paso se excluye del array `steps`.

### C1. Paso «Periodo y materias» — planilla seleccionable

Organismo nuevo `MateriasPlanillaSelector` + CSS
`presentation/styles/components/organisms/materias-planilla.css` (registrado
en `styles/index.css`), adaptando el patrón visual de `plan-documento.css`
con acento **neutro institucional** (tokens `--ant-color-primary`/verde, sin
`buildPlanDocumentoThemeVars` de carrera):

- Grid de periodos (3 columnas → colapsa por contenedor). Cabecera de periodo:
  `Checkbox` «marcar todo» + nombre («PRIMER AÑO») + subtítulo de estado del
  periodo cuando aplique («Convalidado por traspaso», «Bloqueado: primero
  concluya periodos anteriores», «Su periodo actual»).
- Tabla por periodo: `[check] CÓDIGO | ASIGNATURA | HORAS | PRE REQ.`.
  Estados de fila:
  - **aprobada** (kardex): check verde fijo + nota, fila atenuada, no
    clickeable, tooltip «Aprobada en gestión AAAA (nota N)».
  - **bloqueada por prerrequisito**: candado + tooltip «Requiere SIGLA
    aprobada», no clickeable.
  - **seleccionada** / normal: toggle por click en la fila (checkbox
    accesible).
  - **arrastre/nivelación**: seleccionada de periodo < principal → tag
    discreto «Arrastre» en la fila y conteo en el resumen.
  - **a nivelar (pre-marcada)**: con historial, las pendientes de periodos
    anteriores al que le toca arrancan marcadas con tag «Nivelar en esta
    gestión»; se pueden desmarcar (advertencia discreta, sin bloqueo).
- Aviso de régimen de nivelación: cuando la selección abarca >1 periodo,
  banda informativa (no Alert apilado) «Quedará en nivelación — los choques
  de horario se gestionan en Académico → Nivelaciones».
- Periodo deshabilitado por tipo de admisión: sección atenuada completa con
  el motivo en el subtítulo; sus filas no interactivas.
- Selección de periodos implícita: `selectedPeriodIds` = periodos con ≥1
  materia marcada (se elimina el checkboxGroup `periodo`). NUEVO: periodo 1
  todo marcado y bloqueado, demás deshabilitados.
- Regla de salto en vivo: al marcar materias, los periodos >
  `minPeriodoPendiente + 1` se deshabilitan con motivo visible.
- Fuente de datos: `contexto.periodos` (se eliminan
  `useInscripcionNuevaMateriasByPeriods`, `useInscripcionNuevaMaterias`
  [legacy sin uso], `useInscripcionNuevaParaleloHorarios` [sin uso] y la
  derivación de periodos desde paralelos).

### C2. Paso «Paralelo» (ajuste 2026-08-13, tercera pasada del usuario)

- Eliminar el field-Alert `resumenInscripcion` y el doble título «Paralelos
  por periodo»: un solo encabezado de sección, con título/descripción en el
  mismo lenguaje que los pasos nuevos. La descripción NO menciona
  «horas/horarios»: en matrícula solo se ve el **turno** del paralelo
  (p. ej. «Revise el resumen por periodo y elija un paralelo —turno— para
  cada uno.»).
- Resumen como panel compacto (mismo lenguaje de la franja B2 + por periodo:
  n.º materias, carga horaria semanal, tag arrastre/nivelación, advertencia
  si quedaron pendientes a nivelar desmarcadas) encima de las cards.
- Cards de paralelo: rediseño visual con tokens del design system (hoy el
  paso se siente plano), manteniendo TODOS los datos actuales: nombre,
  pill de turno (MAÑANA/TARDE/NOCHE diferenciadas), descripción y los
  totales de inscritos (Total / Hombres / Mujeres); estado seleccionado con
  acento primario. Una columna por periodo seleccionado.

### C4. Paso «Historial de notas» (bugs reportados 2026-08-13)

Aplica a esNuevoSistema con tipo ANTIGUO/TRASPASO/TRANSITABILIDAD. Cambios:

1. **Bug a corregir:** al inscribir el 3.er periodo solo aparecen las notas
   del 1.º (falta el 2.º); en traspaso tampoco sale el 2.º. La fuente de
   materias del historial pasa a ser `contexto.periodos` (ya trae TODOS los
   periodos del plan con sigla/nombre): se listan **todos los periodos
   anteriores** al mínimo seleccionado (ANTIGUO/TRANSITABILIDAD) y todos los
   bloqueados por traspaso — sin depender de la carga legacy
   `materiasByPeriodsData`.
2. **Sin estado «Pendiente»** (decisión del usuario 2026-08-13): las filas
   solo son Aprobado/Convalidado. El **default por fila es CONVALIDADO**;
   si la fila pasa a Aprobado (lleva nota), se precarga la **nota mínima de
   aprobación de la configuración del sistema de evaluación**
   (`configuracion_evaluacion` → `notaMinimaAprobacion`, hoy 61), NO un 61
   quemado. El contexto-matrícula expone `notaMinimaAprobacion` (backend:
   util `politicaInstitucionalPayload.js`); fallback frontend 61 si el dato
   no llega.
3. La validación del paso exige nota 0-100 solo en filas APROBADO;
   CONVALIDADO sin nota permitido (igual que hoy).

### C3. Historial y submit

- `requiereHistorialPrevio(tipo)` pasa a considerar también
  `esNuevoSistema` (skip si tiene historial digital).
- `buildInscripcionPayload` añade `plan_estudio_id` (cuando el selector
  aplique) — `dataKey == dataFieldName` según §3.
- Modo edición: `contexto-matricula` sirve igual (estudiante ya con
  inscripción en la gestión: el guard de «ya matriculado» no aplica en modo
  edición); los pasos read-only conservan su comportamiento actual.
- Mantener el flujo del modal «Pago de aporte requerido» intacto.

## 5. Fases y verificación

- **Fase A** (agente backend): A1-A4 + lint backend. Entregable: contrato §3
  verificado con curl/SQL en seco (sin tocar BD real; la vista la recrea el
  usuario).
- **Fase B** (agente frontend): B1-B3 + steps dinámicos + limpieza de hooks.
- **Fase C** (agente frontend): C1-C3 + CSS planilla + estados
  vacío/carga/error de cada paso.
- **Fase D**: `verificador` (lint/build, dataKey==dataFieldName, RBAC 3
  capas, estados) + `revisor-ui` (planilla, strip, dark mode, contraste,
  motion). Prueba manual guiada: NUEVO / ANTIGUO con historial / TRASPASO
  PRIMERO / TRANSITABILIDAD / edición / rol sin permiso.

Compuertas: recrear vista 153 en BD (usuario); DDL planes duales sigue
pausado y NO bloquea (fallback por derivación). Al cerrar, actualizar
`estado-avance-y-proximos-pasos.md`.

### Estado Fase A — HECHA en código (2026-08-13, agente backend)

A1-A4 implementados y verificados en seco (lint + DI resuelve + smoke de
reglas con fixtures). ⛔ Pendiente del usuario: recrear la vista 153 en BD:

```bash
mysql -u root -p < backend/database/03-views/153-vista-estudiante-busqueda-inscripcion.sql
```

Hasta recrearla, `solo_nuevos=1` falla (columna `total_inscripciones`
inexistente) y los campos nuevos del DTO de búsqueda llegan como
`esNuevoSistema=true / totalInscripciones=0 / carreraId=null / tipoAdmision=null`.
El endpoint `contexto-matricula` NO depende de la vista 153 (compone repos).
Notas de implementación: reglas compartidas en
`backend/src/application/use-cases/inscripciones/enrollmentBusinessRules.js`
(usadas por Create/Update/Contexto); el «aprobado» del kardex se cruza por
`asignatura_plan_id` con fallback por sigla (cubre planes duales); en PUT la
validación excluye del kardex las filas de la gestión de la inscripción en
edición y descuenta esa inscripción de `esNuevoSistema`.

### Estado Fase C — HECHA en código (2026-08-13, agente frontend)

C1-C4 implementados (`npm run build` OK; los archivos tocados lintan sin
errores nuevos — se limpiaron además varios preexistentes del área). Piezas:

- **C1** `MateriasPlanillaSelector` (organismo) + `materias-planilla.css`
  (tokens, dark-safe, colapso 3→1 por `@container`) + reglas puras en
  `application/modules/matricula/registro/utils/materiasPlanillaRules.js`
  (modelo de planilla, selección inicial, poda en vivo, resumen). El «periodo
  que le toca» se calcula como `min(primer periodo sin cursar,
  minPeriodoPendiente + 1)` para cubrir el caso limpio (1.º completo → le toca
  2.º) sin romper el tope de salto del backend.
- **C1b** Paso «Periodo y materias» reescrito sobre el contexto (skeleton /
  error con reintento vía `refetchContexto` / hint sin carrera); se eliminó el
  checkboxGroup `periodo`: `selectedPeriodIds` se deriva de las materias
  marcadas (`useInscripcionNuevaPeriodos` reescrito sin GET /paralelos).
- **C2** Resumen compacto `InscripcionSeleccionResumen` (materias + carga
  horaria por periodo, tags Arrastre/Nivelación, aviso de desmarcadas) y cards
  de paralelo re-tokenizadas (pill de turno MAÑANA/TARDE/NOCHE por color,
  seleccionado = acento primario, sin relleno sólido).
- **C3** `plan_estudio_id` en el payload (planEstudioId efectivo del
  contexto); borrados `useInscripcionNuevaMateriasByPeriods`,
  `useInscripcionNuevaMaterias`, `useInscripcionNuevaParaleloHorarios`,
  `MateriasList`, enrichers de periodo/materia/horario y CSS huérfano.
- **C4** Historial de notas desde `contexto.periodos` (fix del 2.º año
  faltante; TRASPASO = unión bloqueados + anteriores al mínimo seleccionado),
  default por fila CONVALIDADO y nota precargada con
  `contexto.notaMinimaAprobacion` al cambiar a APROBADO
  (`resolveDefaultNotaHistorial`, fallback 61).

Pendientes para Fase D: prueba manual guiada de los 6 perfiles (la vista 153
sigue sin recrear en BD → sugerencias `solo_nuevos` caen al fallback),
`revisor-ui` sobre planilla/cards/dark mode, y verificación en vivo del modo
edición ANTIGUO (poda desactivada a propósito en edición).

## Hallazgos de verificación técnica pendientes de corregir

Veredicto general del agente verificador: **APTO, sin bloqueantes**. Quedan
estos hallazgos menores sin corregir (token budget agotado en la sesión que
los detectó):

1. **Lint nuevo trivial** en
   `backend/src/application/use-cases/inscripciones/UpdateEnrollmentUseCase.js`:
   - línea 215 y línea 298: `prefer-destructuring`.
   - línea 325: `prefer-const` (`priorHistoryItems`, nunca reasignada).
2. **Lint "desenmascarado"** en
   `frontend/src/application/modules/matricula/registro/hooks/features/useInscripcionNuevaStudentSearch.js:138,173`
   (`react-hooks/set-state-in-effect`, `setSelectedStudent` dentro de un
   `useEffect`). El patrón ya existía en `HEAD`; se hizo visible al eliminar
   el antipatrón de memoización con `useRef` que antes generaba 20 errores
   distintos en el mismo archivo. No es una regresión de comportamiento,
   pero conviene resolverlo (derivar con `useMemo`/callback en vez de
   `setState` en efecto).
3. **Duplicado de tracking en git** (no introducido por este refactor):
   `frontend/src/presentation/components/organisms/WizardForm/` y
   `Wizardform/` son el mismo archivo físico en disco (macOS,
   filesystem case-insensitive) pero dos rutas distintas en el índice de
   git. Cualquier edición a una ruta se refleja en la otra por accidente
   del filesystem. Limpiar con `git rm --cached` de la ruta huérfana en
   una tarea aparte.
4. **Pendiente del usuario** (ya señalizado arriba, se repite aquí por
   completitud): recrear en la BD real
   `backend/database/03-views/153-vista-estudiante-busqueda-inscripcion.sql`
   (4 columnas aditivas) — nadie ejecutó el DDL, según política del
   proyecto de que los agentes preparan/verifican `.sql` pero nunca lo
   corren contra la base real.
