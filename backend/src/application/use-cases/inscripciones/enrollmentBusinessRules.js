import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { TIPOS_INSCRIPCION } from '../../../domain/constants/inscripciones.constants.js';

/**
 * Reglas de negocio compartidas de la inscripción de materias (matrícula).
 *
 * Consumidores: CreateEnrollmentUseCase, UpdateEnrollmentUseCase y
 * GetMatriculaContextoUseCase. Las reglas operan sobre las asignaturas del
 * plan (asignaturas_plan) resueltas desde la oferta, sea cual sea el modo de
 * inscripción (paralelo completo, asignaciones docentes o selección por
 * periodo).
 *
 * Fuentes:
 * - Kardex del estudiante: vista 141 (vista_historial_academico_estudiante_fila),
 *   estados APROBADO / CONVALIDADO / REPROBADO con nota efectiva.
 * - Traspasos: tabla traspasos (anio_cursado PRIMERO/SEGUNDO).
 * - prior_history del payload: materias concluidas registradas al inscribir.
 */

/** Estados del kardex que cuentan como materia vencida (aprobada). */
export const ESTADOS_KARDEX_APROBADO = ['APROBADO', 'CONVALIDADO'];

/** Estados del kardex relevantes para el contexto (concluidos). */
export const ESTADOS_KARDEX_CONCLUIDO = ['APROBADO', 'CONVALIDADO', 'REPROBADO'];

/**
 * Deriva el plan de estudios del estudiante desde su kardex (vista 141):
 * plan del último año cursado con plan_estudio_id conocido.
 *
 * @param {Array<Object>} historialFilas - Filas de vista 141 del estudiante
 * @returns {number|null} plan_estudio_id derivado o null si no tiene historial
 */
export function derivarPlanIdDesdeKardex(historialFilas) {
  if (!Array.isArray(historialFilas) || historialFilas.length === 0) return null;

  let mejorAnio = null;
  let planId = null;
  for (const fila of historialFilas) {
    const filaPlanId = fila.plan_estudio_id ?? null;
    if (filaPlanId != null) {
      const anio = Number(fila.gestion_anio ?? 0) || 0;
      if (mejorAnio == null || anio > mejorAnio) {
        mejorAnio = anio;
        planId = Number(filaPlanId);
      }
    }
  }
  return planId;
}

/**
 * Resuelve el plan de estudios y el plan habilitado (gestiones_planes) para
 * una inscripción, según la regla de planes duales (§b del plan de desarrollo):
 *
 * 1. Si el estudiante tiene historial en el sistema, el plan derivado de su
 *    kardex MANDA (RN-3); un plan_estudio_id pedido distinto se ignora.
 *    (Con preferKardexOverRequested=false — contexto — el pedido tiene
 *    prioridad sobre el derivado.)
 * 2. plan_estudio_id pedido: se valida que exista, esté activo, pertenezca a
 *    la carrera y tenga gestion_plan activo en la gestión.
 * 3. Fallback: plan vigente actual de la carrera (comportamiento previo).
 *
 * NO persiste el plan en estudiantes_datos_academicos.
 * TODO planes-duales bloque A: persistir plan_estudio_id en
 * estudiantes_datos_academicos cuando se apruebe el DDL
 * (docs/plan/planes-duales-matricula-plan-desarrollo.md §e).
 *
 * @param {Object} params
 * @param {number|null} params.requestedPlanId - plan_estudio_id del payload (opcional)
 * @param {number} params.careerId - Carrera del estudiante
 * @param {Object} params.management - Entidad Management (gestión vigente)
 * @param {Array<Object>} params.historialFilas - Filas de vista 141 del estudiante
 * @param {boolean} [params.preferKardexOverRequested=true] - true en Create/Update (RN-3)
 * @param {Object} params.studyPlanRepository
 * @param {Object} params.managementPlanRepository
 * @param {Object} [params.logger]
 * @returns {Promise<{studyPlan: Object, managementPlan: Object, origenPlan: 'KARDEX'|'SOLICITADO'|'VIGENTE'}>}
 */
export async function resolverPlanEstudioInscripcion({
  requestedPlanId = null,
  careerId,
  management,
  historialFilas = [],
  preferKardexOverRequested = true,
  studyPlanRepository,
  managementPlanRepository,
  logger = null,
}) {
  const derivedPlanId = derivarPlanIdDesdeKardex(historialFilas);

  let studyPlan = null;
  let origenPlan = 'VIGENTE';

  const cargarPlanDerivado = async () => {
    const plan = await studyPlanRepository.findById(derivedPlanId);
    if (!plan) return null;
    // Si el kardex pertenece a otra carrera (cambio de carrera), el plan
    // derivado no aplica: se sigue con el pedido o el vigente de la carrera.
    const planCareerId = plan.careerId ?? plan.carreraId;
    if (Number(planCareerId) !== Number(careerId)) {
      logger?.warn?.(
        '[Inscripciones] Plan derivado del kardex descartado: pertenece a otra carrera',
        { derivedPlanId, planCareerId, careerId }
      );
      return null;
    }
    return plan;
  };

  const cargarPlanSolicitado = async () => {
    const plan = await studyPlanRepository.findById(requestedPlanId);
    if (!plan) {
      throw new ValidationError('El plan de estudios seleccionado no está disponible.');
    }
    const planCareerId = plan.careerId ?? plan.carreraId;
    if (Number(planCareerId) !== Number(careerId)) {
      throw new ValidationError(
        'El plan de estudios seleccionado no pertenece a la carrera del estudiante.'
      );
    }
    return plan;
  };

  if (preferKardexOverRequested && derivedPlanId != null) {
    studyPlan = await cargarPlanDerivado();
    if (studyPlan) {
      // RN-3: con historial en el sistema el plan registrado/derivado manda.
      if (requestedPlanId != null && Number(requestedPlanId) !== Number(derivedPlanId)) {
        logger?.warn?.(
          '[Inscripciones] plan_estudio_id pedido ignorado: el estudiante tiene historial y su plan derivado manda (RN-3)',
          { requestedPlanId, derivedPlanId }
        );
      }
      origenPlan = 'KARDEX';
    }
  }
  if (!studyPlan && requestedPlanId != null) {
    studyPlan = await cargarPlanSolicitado();
    origenPlan = 'SOLICITADO';
  }
  if (!studyPlan && derivedPlanId != null) {
    studyPlan = await cargarPlanDerivado();
    if (studyPlan) origenPlan = 'KARDEX';
  }

  if (!studyPlan) {
    // Fallback: plan vigente actual de la carrera (comportamiento previo).
    // sort por atributo Sequelize `vigente` DESC (el objeto {orderBy} del código
    // anterior era ignorado por BaseRepository.findAll).
    const studyPlansResult = await studyPlanRepository.findAll(
      { careerId, active: true, sort: 'vigente:DESC' },
      null,
      null
    );
    studyPlan = studyPlansResult.studyPlans?.[0] ?? null;
    origenPlan = 'VIGENTE';
    if (!studyPlan) {
      throw new NotFoundError(`Plan de estudios vigente para la carrera con ID ${careerId}`);
    }
  }

  // Plan habilitado (gestiones_planes) del plan resuelto en la gestión.
  const managementPlanResult = await managementPlanRepository.findAll(
    {
      managementId: management.id,
      studyPlanId: studyPlan.id,
      active: true,
    },
    null,
    null
  );
  const managementPlan = managementPlanResult.managementPlans?.[0];

  if (!managementPlan) {
    if (origenPlan === 'SOLICITADO') {
      throw new ValidationError(
        'El plan de estudios seleccionado no está habilitado en la gestión actual.'
      );
    }
    throw new NotFoundError(
      `Plan habilitado para la gestión ${management.year} y plan de estudios ${studyPlan.id}`
    );
  }

  return { studyPlan, managementPlan, origenPlan };
}

/**
 * Construye los conjuntos de cobertura (aprobado/convalidado) del estudiante:
 * kardex (vista 141) + prior_history (payload o filas ya persistidas).
 *
 * @param {Object} params
 * @param {Array<Object>} params.historialFilas - Filas de vista 141
 * @param {Array<Object>} [params.priorHistoryItems] - Items del payload
 *   ({ materiaId|materia_id, periodId|period_id, status|estado })
 * @param {Array<number>} [params.priorCurriculumSubjectIds] - asignatura_plan_id
 *   ya persistidos en historial_previo (modo edición sin payload)
 * @param {Map<string, Object>} params.planSubjectByMateriaPeriodo - clave
 *   `${materiaId}:${periodoId}` → asignatura del plan
 * @param {Map<number, Object>} params.planSubjectById - asignatura_plan_id → asignatura
 * @param {Map<number, string>} params.siglaByMateriaId - materia_id → sigla
 * @returns {{ aprobadasPlanSubjectIds: Set<number>, aprobadasSiglas: Set<string> }}
 */
export function construirCoberturaAprobadas({
  historialFilas = [],
  priorHistoryItems = null,
  priorCurriculumSubjectIds = null,
  planSubjectByMateriaPeriodo,
  planSubjectById,
  siglaByMateriaId,
}) {
  const aprobadasPlanSubjectIds = new Set();
  const aprobadasSiglas = new Set();

  for (const fila of historialFilas) {
    const estado = String(fila.estado ?? '').toUpperCase();
    if (ESTADOS_KARDEX_APROBADO.includes(estado)) {
      if (fila.asignatura_plan_id != null) {
        aprobadasPlanSubjectIds.add(Number(fila.asignatura_plan_id));
      }
      const sigla = String(fila.asignatura_sigla ?? '').trim().toUpperCase();
      if (sigla) aprobadasSiglas.add(sigla);
    }
  }

  if (Array.isArray(priorHistoryItems)) {
    for (const item of priorHistoryItems) {
      const status = String(item?.status ?? item?.estado ?? 'APROBADO').toUpperCase();
      const materiaId = Number(item?.materiaId ?? item?.materia_id);
      const periodoId = Number(item?.periodId ?? item?.period_id);
      const esValido =
        item &&
        typeof item === 'object' &&
        ESTADOS_KARDEX_APROBADO.includes(status) &&
        Number.isFinite(materiaId) &&
        Number.isFinite(periodoId);
      if (esValido) {
        const planSubject = planSubjectByMateriaPeriodo.get(`${materiaId}:${periodoId}`);
        if (planSubject?.id != null) {
          aprobadasPlanSubjectIds.add(Number(planSubject.id));
        }
        const sigla = String(siglaByMateriaId.get(materiaId) ?? '').trim().toUpperCase();
        if (sigla) aprobadasSiglas.add(sigla);
      }
    }
  }

  if (Array.isArray(priorCurriculumSubjectIds)) {
    for (const id of priorCurriculumSubjectIds) {
      const planSubjectId = Number(id);
      if (Number.isFinite(planSubjectId)) {
        aprobadasPlanSubjectIds.add(planSubjectId);
        const planSubject = planSubjectById.get(planSubjectId);
        const materiaId = planSubject?.subjectId ?? planSubject?.materiaId ?? null;
        const sigla = String(siglaByMateriaId.get(Number(materiaId)) ?? '').trim().toUpperCase();
        if (sigla) aprobadasSiglas.add(sigla);
      }
    }
  }

  return { aprobadasPlanSubjectIds, aprobadasSiglas };
}

/**
 * Calcula el mínimo número de periodo del plan con asignaturas NO
 * aprobadas/convalidadas (periodo pendiente más bajo). null si el plan no
 * tiene asignaturas.
 *
 * @param {Object} params
 * @param {Array<Object>} params.planSubjects - Asignaturas del plan (entidades planas)
 * @param {Map<number, {numero: number}>} params.periodoById
 * @param {(planSubject: Object) => boolean} params.estaAprobada
 * @returns {number|null}
 */
export function calcularMinPeriodoPendiente({ planSubjects, periodoById, estaAprobada }) {
  let minNumero = null;
  for (const ps of planSubjects) {
    if (!estaAprobada(ps)) {
      const periodo = periodoById.get(Number(ps.periodId ?? ps.periodoId));
      const numero = Number(periodo?.numero ?? 0) || 0;
      if (numero > 0 && (minNumero == null || numero < minNumero)) {
        minNumero = numero;
      }
    }
  }
  return minNumero;
}

/**
 * Carga las estructuras del plan (periodos, asignaturas, materias,
 * prerrequisitos) e indexa lo necesario para las validaciones.
 *
 * @param {Object} params
 * @param {number} params.studyPlanId
 * @param {Object} params.periodRepository
 * @param {Object} params.planSubjectRepository
 * @param {Object} params.subjectRepository
 * @param {Object} params.prerequisiteRepository
 * @returns {Promise<Object>} Estructuras indexadas del plan
 */
export async function cargarEstructuraPlan({
  studyPlanId,
  periodRepository,
  planSubjectRepository,
  subjectRepository,
  prerequisiteRepository,
}) {
  const [periodosResult, planSubjectsResult, prereqsResult] = await Promise.all([
    periodRepository.findAll({ studyPlanId, sort: 'numero:ASC' }, null, null),
    planSubjectRepository.findAll({ studyPlanId }, null, null),
    prerequisiteRepository.findAll({ studyPlanId }, null, null),
  ]);

  const periodos = (periodosResult.periods ?? []).map((p) =>
    p.toPlainObject ? p.toPlainObject() : p
  );
  const planSubjects = (planSubjectsResult.planSubjects ?? []).map((ps) =>
    ps.toPlainObject ? ps.toPlainObject() : ps
  );
  const prereqs = (prereqsResult.prerequisites ?? []).map((pr) =>
    pr.toPlainObject ? pr.toPlainObject() : pr
  );

  const materiaIds = [
    ...new Set(
      planSubjects.map((ps) => Number(ps.subjectId ?? ps.materiaId)).filter(Number.isFinite)
    ),
  ];
  let materias = [];
  if (materiaIds.length > 0) {
    const materiasResult = await subjectRepository.findAll({ id: materiaIds }, null, null);
    materias = (materiasResult.subjects ?? []).map((m) =>
      m.toPlainObject ? m.toPlainObject() : m
    );
  }

  const periodoById = new Map();
  for (const p of periodos) {
    periodoById.set(Number(p.id), {
      id: Number(p.id),
      numero: Number(p.number ?? p.numero ?? 0) || 0,
      nombre: p.name ?? p.nombre ?? null,
    });
  }

  const siglaByMateriaId = new Map();
  const materiaById = new Map();
  for (const m of materias) {
    materiaById.set(Number(m.id), m);
    siglaByMateriaId.set(Number(m.id), m.acronym ?? m.sigla ?? null);
  }

  const planSubjectById = new Map();
  const planSubjectByMateriaPeriodo = new Map();
  for (const ps of planSubjects) {
    const id = Number(ps.id);
    planSubjectById.set(id, ps);
    const materiaId = Number(ps.subjectId ?? ps.materiaId);
    const periodoId = Number(ps.periodId ?? ps.periodoId);
    if (Number.isFinite(materiaId) && Number.isFinite(periodoId)) {
      planSubjectByMateriaPeriodo.set(`${materiaId}:${periodoId}`, ps);
    }
  }

  // prerrequisitos: asignatura_id y prerrequisito_id referencian asignaturas_plan(id)
  const prereqPlanSubjectIdByPlanSubjectId = new Map();
  for (const pr of prereqs) {
    const subjectPlanId = Number(pr.subjectId ?? pr.asignaturaId);
    const prereqPlanId = Number(pr.prerequisiteId ?? pr.prerrequisitoId);
    if (Number.isFinite(subjectPlanId) && Number.isFinite(prereqPlanId)) {
      prereqPlanSubjectIdByPlanSubjectId.set(subjectPlanId, prereqPlanId);
    }
  }

  return {
    periodos,
    planSubjects,
    periodoById,
    planSubjectById,
    planSubjectByMateriaPeriodo,
    siglaByMateriaId,
    materiaById,
    prereqPlanSubjectIdByPlanSubjectId,
  };
}

/** Helpers internos de presentación de mensajes. */
function siglaDePlanSubject(planSubjectId, estructura) {
  const ps = estructura.planSubjectById.get(Number(planSubjectId));
  const materiaId = Number(ps?.subjectId ?? ps?.materiaId);
  const sigla = estructura.siglaByMateriaId.get(materiaId);
  return sigla || `asignatura ${planSubjectId}`;
}

function periodoDePlanSubject(planSubjectId, estructura) {
  const ps = estructura.planSubjectById.get(Number(planSubjectId));
  return estructura.periodoById.get(Number(ps?.periodId ?? ps?.periodoId)) ?? null;
}

/**
 * Valida las reglas de negocio de la inscripción sobre las asignaturas del
 * plan a matricular (reglas 2-5 del rediseño del wizard):
 *
 * 2. Prerrequisitos: toda materia cuyo prerrequisito no esté aprobado/
 *    convalidado en el kardex ni cubierto por prior_history se rechaza.
 * 3. Regla de periodo por tipo (solo estudiantes sin inscripciones previas):
 *    NUEVO → solo periodo 1; TRASPASO → sin periodos ≤ anio_cursado;
 *    TRANSITABILIDAD → sin periodo 1 (esas materias se registran como
 *    convalidadas en prior_history, no se matriculan).
 * 4. Salto máximo (estudiante con historial): sin materias de periodo
 *    numero > minPeriodoPendiente + 1.
 * 5. Sin materias ya APROBADO/CONVALIDADO en su kardex.
 *
 * Lanza UNA ValidationError con todos los incumplimientos juntos.
 *
 * @param {Object} params
 * @param {Array<number>} params.curriculumSubjectIds - asignatura_plan_id a matricular
 * @param {string} params.enrollmentType - NUEVO|ANTIGUO|TRASPASO|TRANSITABILIDAD
 * @param {boolean} params.esNuevoSistema - true si el estudiante no tiene inscripciones previas
 * @param {string|null} params.traspasoAnioCursado - PRIMERO|SEGUNDO|null (tabla traspasos)
 * @param {Array<Object>} params.historialFilas - Filas de vista 141 del estudiante
 * @param {Array<Object>|null} [params.priorHistoryItems] - prior_history del payload
 * @param {Array<number>|null} [params.priorCurriculumSubjectIds] - historial_previo persistido (edición)
 * @param {Object} params.estructura - Resultado de cargarEstructuraPlan()
 * @throws {ValidationError} con todos los mensajes en un solo error
 */
export function validarReglasInscripcion({
  curriculumSubjectIds,
  enrollmentType,
  esNuevoSistema,
  traspasoAnioCursado = null,
  historialFilas = [],
  priorHistoryItems = null,
  priorCurriculumSubjectIds = null,
  estructura,
}) {
  const ids = [...new Set((curriculumSubjectIds ?? []).map(Number).filter(Number.isFinite))];
  if (ids.length === 0) return;

  const errores = [];

  const { aprobadasPlanSubjectIds, aprobadasSiglas } = construirCoberturaAprobadas({
    historialFilas,
    priorHistoryItems,
    priorCurriculumSubjectIds,
    planSubjectByMateriaPeriodo: estructura.planSubjectByMateriaPeriodo,
    planSubjectById: estructura.planSubjectById,
    siglaByMateriaId: estructura.siglaByMateriaId,
  });

  // Kardex puro (sin prior_history) para la regla 5: duplicado de aprobadas.
  const kardexAprobadasIds = new Set();
  const kardexAprobadasSiglas = new Set();
  for (const fila of historialFilas) {
    const estado = String(fila.estado ?? '').toUpperCase();
    if (ESTADOS_KARDEX_APROBADO.includes(estado)) {
      if (fila.asignatura_plan_id != null) kardexAprobadasIds.add(Number(fila.asignatura_plan_id));
      const sigla = String(fila.asignatura_sigla ?? '').trim().toUpperCase();
      if (sigla) kardexAprobadasSiglas.add(sigla);
    }
  }

  const estaCubierta = (planSubjectId) => {
    if (aprobadasPlanSubjectIds.has(Number(planSubjectId))) return true;
    const sigla = String(siglaDePlanSubject(planSubjectId, estructura)).trim().toUpperCase();
    return sigla ? aprobadasSiglas.has(sigla) : false;
  };

  const estaAprobadaEnKardex = (planSubjectId) => {
    if (kardexAprobadasIds.has(Number(planSubjectId))) return true;
    const sigla = String(siglaDePlanSubject(planSubjectId, estructura)).trim().toUpperCase();
    return sigla ? kardexAprobadasSiglas.has(sigla) : false;
  };

  // Regla 5: rechazar materias ya APROBADO/CONVALIDADO en su kardex.
  for (const planSubjectId of ids) {
    if (estaAprobadaEnKardex(planSubjectId)) {
      errores.push(
        `No puede inscribir ${siglaDePlanSubject(planSubjectId, estructura)}: ya figura como aprobada o convalidada en su historial académico.`
      );
    }
  }

  // Regla 2: prerrequisitos.
  for (const planSubjectId of ids) {
    const prereqPlanSubjectId =
      estructura.prereqPlanSubjectIdByPlanSubjectId.get(Number(planSubjectId));
    if (prereqPlanSubjectId != null && !estaCubierta(prereqPlanSubjectId)) {
      errores.push(
        `No puede inscribir ${siglaDePlanSubject(planSubjectId, estructura)}: requiere ${siglaDePlanSubject(prereqPlanSubjectId, estructura)} aprobada.`
      );
    }
  }

  // Regla 3: periodo por tipo de admisión (solo estudiantes sin inscripciones previas).
  if (esNuevoSistema) {
    const idsConPeriodo = ids
      .map((planSubjectId) => ({
        planSubjectId,
        numero: Number(periodoDePlanSubject(planSubjectId, estructura)?.numero ?? 0) || 0,
      }))
      .filter((item) => item.numero > 0);

    for (const { planSubjectId, numero } of idsConPeriodo) {
      const sigla = siglaDePlanSubject(planSubjectId, estructura);

      if (enrollmentType === TIPOS_INSCRIPCION.NUEVO && numero !== 1) {
        errores.push(
          `No puede inscribir ${sigla}: los estudiantes nuevos solo pueden inscribir materias del primer periodo.`
        );
      }

      if (enrollmentType === TIPOS_INSCRIPCION.TRASPASO && traspasoAnioCursado) {
        const bloqueadoHasta = traspasoAnioCursado === 'SEGUNDO' ? 2 : 1;
        if (numero <= bloqueadoHasta) {
          errores.push(
            `No puede inscribir ${sigla}: según el traspaso registrado, ese periodo ya fue cursado en la institución de origen y debe registrarse como convalidado en el historial previo.`
          );
        }
      }

      if (enrollmentType === TIPOS_INSCRIPCION.TRANSITABILIDAD && numero === 1) {
        errores.push(
          `No puede inscribir ${sigla}: por transitabilidad las materias del primer periodo se registran como convalidadas en el historial previo, no se matriculan.`
        );
      }
    }
  }

  // Regla 4: salto máximo (solo estudiantes con historial en el sistema).
  if (!esNuevoSistema) {
    const minPendiente = calcularMinPeriodoPendiente({
      planSubjects: estructura.planSubjects,
      periodoById: estructura.periodoById,
      estaAprobada: (ps) => estaCubierta(ps.id),
    });
    if (minPendiente != null) {
      const maxPermitido = minPendiente + 1;
      for (const planSubjectId of ids) {
        const periodo = periodoDePlanSubject(planSubjectId, estructura);
        const numero = Number(periodo?.numero ?? 0) || 0;
        if (numero > maxPermitido) {
          errores.push(
            `No puede inscribir ${siglaDePlanSubject(planSubjectId, estructura)} (${periodo?.nombre ?? `periodo ${numero}`}): primero debe regularizar las materias pendientes de periodos anteriores.`
          );
        }
      }
    }
  }

  if (errores.length > 0) {
    throw new ValidationError([...new Set(errores)].join(' '));
  }
}
