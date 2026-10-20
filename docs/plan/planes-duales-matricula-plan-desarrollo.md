# Planes de estudio duales por gestión + selector de plan en matrícula — plan de desarrollo

> **Estado: parcial — verificado 2026-10-20.** Comprobado contra el código: el wizard ya elige plan y envía `plan_estudio_id` con derivación como respaldo (ver `matricula-wizard-rediseno.md`). Falta: el DDL del bloque A (`plan_estudio_id` en `estudiantes_datos_academicos`) NO está en `01-schemas/` (pendiente de aprobación), el backfill y el gate de habilitación C2 (pospuesto por decisión).


> Plan del `planificador` (2026-08-01), persistido para ejecutar por iteraciones.
> **Entrega por partes:** Iteración 1 = datos + backend (bloques A, B, C, E).
> Iteración 2 = frontend + verificación (bloques D, F, G). Nada se ejecuta en BD
> sin aprobación explícita del usuario (DDL del bloque A y backfill).
> Contexto INCOS: 3 carreras (SIS-INF / ADM-EMP / CON-GEN), grano académico
> ANUAL (3 años por carrera, `periodos` = años del plan).

## Requisito del usuario (verbatim) e interpretación

> «en la creación de plan de estudio, cuando se cree o clone uno en base a otro
> anterior, puede haber 2 planes de estudio habilitados en una gestión; y cuando
> se esté matriculando a un estudiante podría elegir qué plan de estudio cuando
> sea un estudiante NUEVO; solo los antiguos se quedan con el plan registrado a
> su inicio».

Interpretación validada contra el modelo real (escenario de transición por
nueva R.M.): al clonar un plan («Nueva versión (RM)») y marcarlo vigente, la
gestión en curso o la siguiente convive con **dos planes habilitados por
carrera** — el nuevo (para cohortes entrantes) y el anterior (para que 2.º y
3.º año terminen su malla). Reglas de negocio resultantes:

- **RN-1** — `gestiones_planes` admite N planes habilitados por gestión y
  carrera (en la práctica 2 durante la transición). Cada uno con su propia
  cadena `paralelos_gestion → oferta_cursos → asignaciones_docentes`.
- **RN-2** — Estudiante **NUEVO**: al matricularse elige el plan **solo si su
  carrera tiene >1 plan habilitado en la gestión** (si hay 1, se asigna sin
  preguntar). El plan elegido queda **registrado como su plan de origen**.
- **RN-3** — Estudiante **ANTIGUO**: su plan es **inmutable** = el registrado a
  su inicio; la matrícula lo resuelve desde su registro, **nunca** desde el
  plan vigente del catálogo. Cambiar de plan sería un proceso aparte de
  convalidación interna (fuera de alcance de este plan).
- **RN-4** — TRASPASO / TRANSITABILIDAD en su primera inscripción se comportan
  como NUEVO a efectos de fijar plan de origen (su `historial_previo` se carga
  contra `asignaturas_plan` de ese plan). Pendiente de confirmar si también
  eligen o siempre reciben el vigente (pregunta abierta n.º 1).

---

## (a) Qué soporta YA el modelo — hallazgos verificados

| Pieza | Estado | Evidencia |
|---|---|---|
| `gestiones_planes` sin UNIQUE: N planes por gestión | ✅ ya soporta | `backend/database/01-schemas/07-estructura-academica-parte3.sql:101-130` — solo índices, sin restricción; la carrera llega vía `planes_estudios.carrera_id` |
| Cadena de oferta por plan habilitado | ✅ ya soporta | `paralelos_gestion.gestion_plan_id` (`01-schemas/08:58`) — dos planes = dos juegos de paralelos/oferta en paralelo |
| Clonar plan («Nueva versión (RM)») | ✅ existe completo | `ClonarPlanEstudiosUseCase.js` (copia periodos + asignaturas_plan + prerrequisitos, nace `vigente=false`), botón en `PlanDetailPage.jsx:113-124`, `POST /planes-estudios/:id/clonar` |
| Un solo vigente por carrera (catálogo) | ✅ garantizado | `MarcarPlanEstudiosVigenteUseCase.js:16-21` desmarca los demás de la carrera. Correcto y se mantiene: «vigente» = plan para cohortes NUEVAS |
| Habilitar plan en gestión | ✅ existe (con gate) | `CreateGestionPlanUseCase.js` — bloquea duplicado por (gestión, plan) y exige `vigente=TRUE` (`:35-37`) |
| Renovar oferta gestión→gestión | ✅ existe y ya trae el plan anterior | `RenovarOfertaGestionUseCase.js` — copia el gestion_plan origen **sin exigir vigente** y soporta `plan_estudio_destino_id` por carrera (re-resuelve asignaturas por materia + **número de periodo**) |
| Avance académico por plan | ✅ ya es plan-aware | vistas `170`/`171`: grano (estudiante × plan_estudio) derivado de las asignaturas realmente cursadas — no requiere cambios |
| UI de oferta con tabs por plan | ✅ soportaría 2 tabs de la misma carrera | `OfertaGestionPlanesPage.jsx:22-42` + `ofertaPlanesTableColumns.jsx` (`"${carreraNombre} — ${nombre}"`) |

**Conclusión (a):** la coexistencia de 2 planes habilitados por carrera en una
gestión **ya es creable hoy** combinando: renovación (arrastra el plan
anterior) + clonar/marcar vigente + habilitar el plan nuevo
(`POST /gestiones-planes`). El gap NO es de datos: es de **flujo de matrícula**
y de un puñado de resoluciones «plan = el vigente de la carrera» en backend.

## Brechas detectadas (el gap real)

1. **El plan del estudiante no se persiste en ningún lado.**
   `estudiantes_datos_academicos` solo tiene `carrera_id` + `gestion_ingreso_id`
   (`01-schemas/10:98-152`); el plan es implícito vía
   `matriculas_materia → oferta_curso → paralelo_gestion → gestion_plan`.
2. **La matrícula infiere el plan con una heurística que asume 1 plan por
   carrera:** `_getStudyPlanAndManagementPlan` toma `studyPlans[0]` ordenado
   `vigente DESC` (`CreateEnrollmentUseCase.js:693-738`, replicado en
   `UpdateEnrollmentUseCase.js:266-280`). **Todas** las ramas del POST (NUEVO
   por paralelo, ANTIGUO por selección, resolución de asignaciones) pasan por
   ahí. Con 2 planes habilitados: el NUEVO no puede elegir, y el ANTIGUO del
   plan anterior **falla** («La asignación docente X no pertenece al plan
   habilitado» / «El paralelo no está instanciado en la gestión actual»).
   Riesgo extra: con dos planes `activo=TRUE` y empate de `vigente`, `[0]` es
   no determinista.
3. **El concepto "plan de estudios" es invisible en todo el wizard de
   matrícula** (0 ocurrencias funcionales en `presentation/modules/matricula/`
   + `application/modules/inscripciones/`): ni selector, ni pill, ni dato.
4. **`GET /v1/paralelos` lista el catálogo maestro por carrera+periodo, sin
   noción de plan** (`ListParalelosUseCase.js`, `ParallelRepository.js:60-69`).
   Nota: el mismo paralelo maestro puede instanciarse en ambos gestion_planes,
   así que la lista puede seguir siendo plan-agnóstica; el plan entra al POST.
5. **`GenerarOfertaCursosUseCase` cruza plan y periodo por ID, no por
   número:** `findGenerationContext` devuelve `gp.plan_estudio_id` (plan nuevo)
   + `p.periodo_id` del paralelo maestro (periodo del plan viejo)
   (`ParallelManagementRepository.js:97-115`) → para el plan clonado la
   búsqueda `{studyPlanId: nuevo, periodId: viejo}` da vacío («No hay
   asignaturas del plan para el periodo del paralelo»). La renovación ya
   resuelve esto por **número de periodo** (`RenovarOfertaGestionUseCase`
   `buildAsignaturaPlanMap`); generar-oferta debe usar el mismo criterio.
6. **La UI de habilitación es «todo o nada» y filtra `vigente=1`:**
   `ofertaStateShared.js:151-215` + `useOfertaAcademicaApi.js:138-148`. No hay
   picker por plan; el plan anterior solo entra a una gestión vía renovación.
7. **El listado de planes en CFG muestra solo el vigente por carrera**
   (`usePlanesTabPanel.js:28-46`): el plan clonado (borrador) y el plan
   anterior (histórico con estudiantes en curso) no son navegables desde el
   listado.

---

## (b) Dónde se persiste la elección — decisión de diseño

**Recomendación: columna `plan_estudio_id` en `estudiantes_datos_academicos`**
(la «carrera académica» del estudiante, relación 1:1 con `estudiantes`).

- Se fija en la **primera inscripción** (NUEVO elige; con 1 solo plan
  habilitado se fija sin preguntar) y NO se vuelve a tocar en inscripciones
  ANTIGUO — esto materializa «solo los antiguos se quedan con el plan
  registrado a su inicio» como dato, no como heurística.
- Excepción coherente con el código actual: `_getOrCreateStudentAcademicData`
  ya resetea `carrera_id` + `gestion_ingreso_id` cuando el estudiante cambia
  de carrera al inscribir (`CreateEnrollmentUseCase.js:616-634`); en ese mismo
  branch se resetea también `plan_estudio_id` al plan elegido/vigente de la
  carrera nueva.
- Alternativa descartada (derivación pura desde `matriculas_materia`): evita
  DDL pero deja la regla como consulta implícita en cada lectura/escritura,
  no cubre al estudiante recién admitido sin matrícula y mantiene el riesgo
  no determinista de la brecha 2. El estilo del schema (FKs NULL, redundancia
  controlada documentada) favorece la columna.

**Regla de resolución del plan en Create/UpdateEnrollment (reemplaza la
heurística `vigente DESC`):**

```
1. ANTIGUO (o datos_academicos.plan_estudio_id ya fijado):
   plan = datos_academicos.plan_estudio_id
   (fallback una sola vez para datos legacy sin backfill: derivar de su
    última matrícula/historial; último recurso: plan vigente de la carrera)
2. NUEVO / primera inscripción (plan_estudio_id aún NULL):
   plan = payload.plan_estudio_id si viene (validado: activo, de la carrera,
          con gestion_plan activo en la gestión)
        | si no viene: plan vigente de la carrera (comportamiento actual)
3. En ambos casos: managementPlan = gestiones_planes(gestion, plan) activo;
   si no existe → NotFoundError (mensaje actual se conserva).
4. Tras crear la inscripción NUEVO: persistir plan_estudio_id en
   estudiantes_datos_academicos si estaba NULL.
```

El resto de validaciones existentes no cambia: las asignaciones/paralelos se
siguen contrastando contra ese `managementPlan.id`, que ahora es el correcto
para cada estudiante.

## (c) Impacto en cadena

| Área | Impacto | Acción |
|---|---|---|
| Oferta de cursos / paralelos | Dos gestion_planes por carrera = dos juegos de `paralelos_gestion`. Los paralelos maestros (`paralelos.periodo_id`) apuntan a periodos del plan viejo | Brecha 5: `GenerarOfertaCursosUseCase` resuelve el periodo destino por **número** (patrón renovación). `GenerarParalelosGestionUseCase` ya filtra solo por carrera — sin cambios |
| Avance académico (`/academico/avance`) | Vistas 170/171 ya son (estudiante × plan); denominador = asignaturas del plan real del estudiante | Sin cambios. Opcional It.2: preferir la fila del plan registrado si un estudiante tuviera filas en 2 planes |
| Traspasos / convalidaciones | `historial_previo.asignatura_plan_id` ya ancla al plan del destino; `19-traspasos.sql:44-45` declara que carrera/plan NO se duplican allí | La primera inscripción TRASPASO/TRANSITABILIDAD fija `plan_estudio_id` igual que NUEVO (RN-4). Convalidación plan viejo→nuevo de un mismo estudiante: **fuera de alcance**, proceso futuro |
| Calificaciones / centralizador / boletín | Cuelgan de `oferta_cursos`/`matriculas_materia` — plan-agnósticos | Sin cambios |
| Titulación / tutorías (3.er año) | Vistas 179/181 agregan por carrera, no por plan | Sin cambios |
| Portal estudiante / ficha | Hoy no muestran plan | Opcional It.2: pill del plan en ficha (dato ya disponible tras DDL) |
| Renovación de oferta | Ya copia el plan anterior y soporta plan destino distinto | Sin cambios. La transición típica: renovar (plan viejo, opcionalmente sin sus paralelos de 1.er año — pregunta abierta n.º 2) + habilitar plan nuevo |

## (e) DDL propuesto — ⛔ PENDIENTE DE APROBACIÓN — NO EJECUTAR

Archivo nuevo `backend/database/05-migrations/27-migrate-eda-plan-estudio.sql`
(+ actualizar la fuente de verdad `01-schemas/10-estudiantes-parte1.sql` con la
columna, para instalaciones limpias):

```sql
-- ⛔ PENDIENTE DE APROBACIÓN — NO EJECUTAR
USE instituto_incos;

-- 1) Plan de estudios de origen del estudiante (regla RN-2/RN-3)
ALTER TABLE estudiantes_datos_academicos
    ADD COLUMN plan_estudio_id INT NULL
        COMMENT 'Plan de estudios registrado al inicio del estudiante (elegido en su primera inscripción; inmutable salvo cambio de carrera). NULL = legacy pendiente de backfill.'
        AFTER carrera_id,
    ADD CONSTRAINT fk_eda_plan_estudio
        FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudios(id) ON DELETE SET NULL,
    ADD INDEX idx_plan_estudio_id (plan_estudio_id)
        COMMENT 'Búsqueda por plan de origen',
    ADD INDEX idx_carrera_plan (carrera_id, plan_estudio_id, activo, deleted_at)
        COMMENT 'Estudiantes por carrera y plan de origen';

-- 2) Backfill (borrador — validar con el agente `datos` sobre datos reales):
--    plan del último año cursado según el transcript (vista 141, misma fuente
--    que avance académico). Estudiantes sin registro académico quedan NULL y
--    se resuelven en su próxima inscripción (fallback del use case).
UPDATE estudiantes_datos_academicos eda
JOIN (
    SELECT f.estudiante_id, f.plan_estudio_id
    FROM vista_historial_academico_estudiante_fila f
    JOIN (
        SELECT estudiante_id, MAX(gestion_anio) AS max_anio
        FROM vista_historial_academico_estudiante_fila
        WHERE plan_estudio_id IS NOT NULL
        GROUP BY estudiante_id
    ) ult ON ult.estudiante_id = f.estudiante_id AND ult.max_anio = f.gestion_anio
    GROUP BY f.estudiante_id, f.plan_estudio_id
) src ON src.estudiante_id = eda.estudiante_id
SET eda.plan_estudio_id = src.plan_estudio_id
WHERE eda.plan_estudio_id IS NULL;
```

Sin vistas SQL nuevas (siguiente libre: 182). Cambio de vista **opcional y
diferido** a It.2 si se quiere mostrar el plan en listados de matrícula:
añadir `LEFT JOIN planes_estudios` vía `eda.plan_estudio_id` a la vista 99
(`vista_base_matricula_inscripcion_nucleo`) — se decide al implementar D4.

---

## ITERACIÓN 1 — datos + backend (bloques A, B, C, E)

### Bloque A — Datos ⛔ ejecución en BD requiere aprobación

- **A1.** Redactar `05-migrations/27-migrate-eda-plan-estudio.sql` (DDL de
  arriba) + editar `01-schemas/10-estudiantes-parte1.sql` (columna + FK +
  índices en el CREATE TABLE).
- **A2.** Validar el backfill en seco con el agente `datos` (¿algún estudiante
  con filas en 2 planes? criterio: plan del último año; empate → pregunta
  abierta n.º 5).
- **A3.** Ejecutar en BD — **solo con aprobación explícita**.

### Bloque B — Backend matrícula (núcleo del requisito)

- **B1. Modelo + mapper:** `infrastructure/database/models/` modelo de
  `estudiantes_datos_academicos` + `StudentAcademicDataMapper`/entidad:
  campo `planEstudioId` (dominio) ↔ `plan_estudio_id` (BD).
- **B2. Validators:** `presentation/validators/inscripciones/create.validator.js`
  y `update.validator.js`: aceptar `plan_estudio_id` opcional (entero ≥1).
- **B3. `CreateEnrollmentUseCase`:** reemplazar `_getStudyPlanAndManagementPlan`
  por la regla de resolución de (b): firma pasa a recibir
  `(studentAcademicData, management, requestedPlanId)`; validar que el plan
  pedido pertenece a la carrera, está activo y tiene gestion_plan activo en la
  gestión; ANTIGUO ignora `requestedPlanId` (el registrado manda); persistir
  `plan_estudio_id` en datos académicos tras la primera inscripción; resetear
  plan junto con carrera en `_getOrCreateStudentAcademicData` (branch
  `needsCareerUpdate`). Mensajes de error en «usted», p. ej. «El plan de
  estudios seleccionado no está habilitado en la gestión actual».
- **B4. `UpdateEnrollmentUseCase`:** misma sustitución de la heurística
  (`:266-280`); la edición NO cambia el plan registrado.
- **B5. Catálogo para el selector:** ampliar el guard de
  `GET /gestiones/:id/planes-habilitados` (`gestiones.routes.js:115-122`) a
  `verificarPermisoCualquiera([['institucional.gestion.oferta','LISTAR'],
  ['matricula.inscribir','LISTAR']])` — mismo patrón que `paralelos.routes.js:19-26`.
  Sin endpoint nuevo; respuesta y `dataFieldName` intactos.
- **B6. Lectura del plan del estudiante:** exponer `planEstudioId` (+
  `planNombre`) en la respuesta de búsqueda del wizard
  (`SearchStudentsForInscripcionUseCase.mapRowToDto` +
  `StudentRepository.buscarParaInscripcion`) para que el frontend sepa si debe
  mostrar selector (NUEVO sin plan) o pill informativa (ANTIGUO).

### Bloque C — Backend oferta/configuración (desbloqueo operativo del plan dual)

- **C1. `GenerarOfertaCursosUseCase`:** resolver el periodo destino por
  **número**: si `asignaturas_plan(studyPlanId, periodId)` da vacío, buscar el
  periodo del plan del gestion_plan con el mismo `numero` que el periodo del
  paralelo maestro (reutilizar el criterio de
  `RenovarOfertaGestionUseCase.buildAsignaturaPlanMap`; extraer helper
  compartido si queda duplicado).
- **C2. `CreateGestionPlanUseCase` (gate `vigente`):** mantener el bloqueo por
  defecto y permitir el caso de transición: aceptar habilitar un plan
  `activo=TRUE` no vigente **solo si** su carrera ya tiene estudiantes con ese
  `plan_estudio_id` (datos académicos) — cubre gestiones creadas sin renovación.
  Confirmar con el usuario antes de implementar (pregunta abierta n.º 4); si se
  pospone, la vía del plan anterior queda solo por renovación (suficiente para
  el flujo estándar).
- **C3. Sin cambios** en `GET /v1/paralelos` (la lista maestra sigue
  plan-agnóstica; el plan elegido viaja en el POST y se cruza contra
  `findByParallelAndManagementPlan`). Si al armar D2 se detecta que el paso
  «Periodo y materias» muestra materias del plan equivocado para NUEVO, las
  materias/periodos del plan elegido se leen de los endpoints existentes
  `GET /planes-estudios/:id/periodos` y `/:id/asignaturas` (ampliar guard con
  `verificarPermisoCualquiera` + `matricula.inscribir` LISTAR, igual que B5).

### Bloque E — Documentación

- **E1.** `docs/referencia/matriz-permisos-sistema.md`: sin permisos nuevos;
  anotar los guards ampliados (`gestiones/:id/planes-habilitados` y, si aplica
  C3, `planes-estudios/:id/periodos|asignaturas` legibles con
  `matricula.inscribir` LISTAR).
- **E2.** `docs/plan/estado-avance-y-proximos-pasos.md`: registrar esta fase y
  su estado al cerrar cada iteración.

### Contrato de endpoints (Iteración 1 — `dataFieldName` == `dataKey`)

| Endpoint | Cambio | dataFieldName |
|---|---|---|
| `POST /api/v1/inscripciones` | payload acepta `plan_estudio_id` (opcional; solo surte efecto en primera inscripción) | `enrollment` (sin cambio) |
| `PUT /api/v1/inscripciones/:id` | ídem | `enrollment` (sin cambio) |
| `GET /api/v1/inscripciones` | sin cambio | `inscripciones` |
| `GET /api/v1/gestiones/:id/planes-habilitados` | guard ampliado (B5) | `planesHabilitados` (sin cambio) |
| `GET /api/v1/paralelos` | sin cambio | `paralelos` |
| `GET /api/v1/estudiantes/buscar-para-inscripcion` | + `planEstudioId`, `planNombre` por fila (B6) | (colección existente, sin cambio de nombre) |
| `POST /api/v1/gestiones-planes` | C2 condicional (gate) | `gestionPlan` (sin cambio) |

---

## ITERACIÓN 2 — frontend + verificación (bloques D, F, G)

### Bloque D — Frontend matrícula (wizard `/matricula/nueva`)

- **D1. Catálogo:** hook api en `application/modules/inscripciones/hooks/api/`
  para `GET /gestiones/:id/planes-habilitados` de la gestión vigente
  (`dataKey: 'planesHabilitados'`), filtrado por `carreraId` en el feature.
- **D2. Selector de plan (solo NUEVO, solo si >1):** en el paso «Seleccionar
  carrera» (`step2SeleccionarCarrera.js`) o inmediatamente después de elegir
  carrera: `Radio.Group`/cards con `nombre_plan` + R.M. + pill
  Vigente/Anterior (pill gris para el anterior, nunca rojo). Default: el plan
  vigente. Con 1 solo plan habilitado el control **no se muestra** (se envía
  implícito). Estudiante ANTIGUO: sin selector; pill informativa de su plan
  (dato de B6). Estado en `useMatriculaWizardCatalogos`/contexto del wizard;
  `buildInscripcionPayload.js` añade `plan_estudio_id`.
- **D3. Consistencia del paso periodo/materias para NUEVO con plan no-default:**
  si el plan elegido no es el vigente, resolver periodos/materias mostrados
  desde el plan elegido (C3) en vez de `extractPeriodosFromParalelos`; el
  paralelo se sigue eligiendo del catálogo maestro (mismo paralelo sirve a
  ambos planes; el backend lo instancia contra el gestion_plan correcto).
- **D4. Visibilidad del plan (opcional, si el usuario lo pide):** columna/pill
  de plan en el listado de matrícula (requiere el JOIN opcional en vista 99) y
  en la ficha del estudiante.
- **D5. Configuración académica:** en `PlanesTabPanel` dejar de colapsar a «1
  fila por carrera» (`usePlanesTabPanel.js:28-46`): listar todos los planes
  activos agrupados por carrera con pill Vigente/Borrador/Anterior, para que el
  clonado y el histórico sean navegables. El botón «Nueva versión (RM)» queda
  como está (ficha del plan vigente).
- **D6. Institucional / oferta:** ninguna pantalla nueva. Verificar que
  `OfertaGestionPlanesPage` renderiza 2 tabs de la misma carrera con nombres
  distinguibles (ya usa `"${carreraNombre} — ${nombre}"`). Si se aprueba C2,
  añadir al dashboard de oferta un picker «Habilitar plan…» además del lote
  «habilitar todos» (`ofertaStateShared.js`).

### Bloque F — Datos de prueba (sin seeder nuevo)

- **F1.** Con la BD de desarrollo: clonar el plan de SIS-INF vía UI, marcarlo
  vigente, habilitarlo en la gestión 2026 (`POST /gestiones-planes`), generar
  paralelos + oferta del 1.er año del plan nuevo (valida C1).
- **F2.** Matricular un estudiante NUEVO eligiendo el plan nuevo y otro
  eligiendo el anterior; re-inscribir un ANTIGUO del plan anterior (2.º año) y
  verificar que NO se le ofrece selector y su matrícula cae en la oferta del
  plan viejo.

### Bloque G — Verificación final (compuerta `verificador`)

1. Lint backend + lint/build frontend.
2. `dataKey` == `dataFieldName` según la tabla de contrato (sin cambios de
   nombres: verificación de no-regresión).
3. RBAC 3 capas: operador de matrícula (sin permisos INST) ve el selector y
   puede leer `planes-habilitados`; rol sin `matricula.inscribir` → 403.
   **Confirmado: cero permisos nuevos, cero resiembra RBAC** (solo guards
   `verificarPermisoCualquiera` en código).
4. Regresión con 1 solo plan habilitado (estado actual de la BD): el wizard no
   muestra selector y el POST funciona igual que hoy (payload sin
   `plan_estudio_id`).
5. ANTIGUO del plan anterior: inscripción exitosa contra su plan; intento de
   forzar `plan_estudio_id` distinto en el payload → ignorado (RN-3).
6. Avance académico: estudiante del plan nuevo aparece con denominador del
   plan nuevo; estudiante del plan viejo mantiene el suyo (vistas 170/171 sin
   tocar).

## Grafo de dependencias y compuertas

- **Compuerta de aprobación del usuario:** A3 (DDL + backfill). B3/B4 pueden
  desarrollarse antes (fallback por derivación cubre `plan_estudio_id` NULL),
  pero la Iteración 2 no se cierra sin A3.
- Orden: A1-A2 → B1-B2 → B3-B4 → B5-B6 → C1 (→ C2 si se aprueba) → E →
  [It.2: D1-D3 → D5-D6 → aprobación A3 → F1-F2 → G]. D4 opcional al final.
- Módulos de referencia: guard multi-permiso `paralelos.routes.js`; resolución
  por número de periodo `RenovarOfertaGestionUseCase.buildAsignaturaPlanMap`;
  catálogo por gestion_plan `ListCursosDisponiblesDocenteUseCase`.

## Preguntas abiertas — TODAS RESUELTAS (2026-08-08)

1. **TRASPASO / TRANSITABILIDAD**: ✔ RESUELTO — eligen plan en su primera
   inscripción, igual que NUEVO. Su `historial_previo` se carga contra el
   plan elegido.
2. **1.er año del plan anterior**: ✔ RESUELTO — sigue ofertándose. Los
   repitentes de 1.º continúan en el plan viejo; la renovación NO excluye
   sus paralelos; el selector del NUEVO puede ofrecer ambos planes.
3. **¿Selector limitado a 2 planes o N?**: ✔ RESUELTO — todos los planes
   habilitados de la carrera (N), sin límite artificial en código.
4. **Gate de habilitación (C2)**: ✔ RESUELTO — **pospuesto**. No se
   implementa en esta iteración; el plan anterior entra a una gestión
   únicamente vía renovación (ya cubre el flujo estándar). Bloque C queda
   reducido a C1 (resolución por número de periodo) + C3 (sin cambios).
5. **Backfill (empate de plan)**: ✔ RESUELTO por datos reales — verificado
   en la BD local (`vista_historial_academico_estudiante_fila`, 2026-08-08):
   **0 estudiantes con historial en 2 planes distintos**. El criterio "plan
   del último año cursado" no tiene ningún caso de empate que resolver hoy;
   el backfill del bloque A2 puede ejecutarse tal cual está redactado, sin
   necesitar una regla de desempate adicional.
6. **Cambio de plan de un ANTIGUO (convalidación interna plan viejo→nuevo) —
   RESUELTO (2026-08-01):** **NO queda fuera de alcance.** El usuario indica
   que si se produce un cambio de plan de un estudiante ANTIGUO, el sistema
   debe permitir **convalidar sus notas** contra el plan nuevo («si llega el
   cambio de plan se debe permitir convalidar notas»). Reconfirma además la
   premisa base del diseño: solo los estudiantes NUEVOS eligen plan al
   matricularse; los ANTIGUOS no migran de plan por defecto («no se debe
   mezclar los planes, los antiguos no eligen plan, solo los nuevos»).
   **Alcance a definir en una iteración aparte** (no bloquea la Iteración 1
   de este plan, que solo cubre matrícula de estudiantes NUEVOS): investigar
   si el flujo de convalidación ya existente (`academico.trazabilidad
   .traspaso.convalidar` / `transitabilidad.convalidar`, seed 59) es
   reutilizable para "convalidar contra otro plan de la misma carrera", o si
   este caso (cambio de plan sin traspaso de carrera) necesita su propio
   caso de uso. Pendiente de planificar en un documento propio cuando se
   priorice — no se toca en la Iteración 1 de matrícula.

**Estado:** diseño completo, sin bloqueos de decisión. Sigue pendiente la
**aprobación explícita del DDL** (bloque A, `ALTER TABLE
estudiantes_datos_academicos ADD COLUMN plan_estudio_id...`) antes de
implementar — el usuario pausó esta implementación el 2026-08-08 para
priorizar una revisión de UX del módulo de Titulación (proyecto de
grado/pasantías, flujo de cambio de estado). Retomar cuando se priorice.
6. **Cambio de plan de un ANTIGUO (convalidación interna plan viejo→nuevo) —
   RESUELTO (2026-08-01):** **NO queda fuera de alcance.** El usuario indica
   que si se produce un cambio de plan de un estudiante ANTIGUO, el sistema
   debe permitir **convalidar sus notas** contra el plan nuevo («si llega el
   cambio de plan se debe permitir convalidar notas»). Reconfirma además la
   premisa base del diseño: solo los estudiantes NUEVOS eligen plan al
   matricularse; los ANTIGUOS no migran de plan por defecto («no se debe
   mezclar los planes, los antiguos no eligen plan, solo los nuevos»).
   **Alcance a definir en una iteración aparte** (no bloquea la Iteración 1
   de este plan, que solo cubre matrícula de estudiantes NUEVOS): investigar
   si el flujo de convalidación ya existente (`academico.trazabilidad
   .traspaso.convalidar` / `transitabilidad.convalidar`, seed 59) es
   reutilizable para "convalidar contra otro plan de la misma carrera", o si
   este caso (cambio de plan sin traspaso de carrera) necesita su propio
   caso de uso. Pendiente de planificar en un documento propio cuando se
   priorice — no se toca en la Iteración 1 de matrícula.
