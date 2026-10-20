/**
 * Use Case: UpdateEnrollmentUseCase
 * Módulo: Inscripciones
 * Actualiza una inscripción existente (datos generales y/o detalle inscripciones_materias).
 *
 * Responsabilidades:
 * - Validar que la inscripción exista
 * - Actualizar campos de la inscripción (observaciones, fecha_inscripcion)
 * - Actualizar inscripciones_materias: mismo flujo que CreateEnrollmentUseCase
 *   - NUEVO: con parallelId se reemplazan las materias por todas las del nuevo paralelo
 *   - ANTIGUO: con teacherAssignmentIds se reemplazan por las asignaciones docentes indicadas
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la actualización de inscripciones
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 */

import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_MATERIA_INSCRITA,
  TIPOS_INSCRIPCION,
} from '../../../domain/constants/inscripciones.constants.js';
import { parsePriorHistoryItem } from './priorHistoryItemValidation.js';
import { EnrollmentMapper, EnrollmentSubjectMapper } from '../../mappers/inscripciones/index.js';
import {
  cargarEstructuraPlan,
  derivarCarreraPlanDesdeMatriculas,
  resolverPlanEstudioInscripcion,
  validarReglasInscripcion,
} from './enrollmentBusinessRules.js';

export class UpdateEnrollmentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas (incluye planSubjectRepository para resolver desde parallelIdsByPeriod + materiaIdsByPeriod)
   */
  constructor({
    enrollmentRepository,
    subjectEnrollmentRepository,
    studentAcademicDataRepository,
    parallelRepository,
    courseOfferRepository,
    parallelManagementRepository,
    teacherAssignmentRepository,
    managementRepository,
    managementPlanRepository,
    studyPlanRepository,
    planSubjectRepository,
    priorEnrollmentHistoryRepository,
    periodRepository,
    subjectRepository,
    prerequisiteRepository,
    transferRepository,
    historialAcademicoRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.parallelRepository = parallelRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.priorEnrollmentHistoryRepository = priorEnrollmentHistoryRepository;
    this.periodRepository = periodRepository;
    this.subjectRepository = subjectRepository;
    this.prerequisiteRepository = prerequisiteRepository;
    this.transferRepository = transferRepository;
    this.historialAcademicoRepository = historialAcademicoRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta la actualización de una inscripción.
   *
   * @param {number} enrollmentId - ID de la inscripción a actualizar
   * @param {Object} payload - Datos a actualizar (parcial)
   * @param {string} [payload.observations] - Observaciones
   * @param {string} [payload.enrollmentDate] - Fecha de inscripción (YYYY-MM-DD)
   * @param {number} [payload.parallelId] - Para tipo NUEVO: nuevo paralelo (reemplaza todas las materias del paralelo)
   * @param {number[]} [payload.teacherAssignmentIds] - Para ANTIGUO: IDs de asignaciones docentes (reemplaza materias por estas)
   * @returns {Promise<Object>} Inscripción actualizada en formato de presentación (con subjectEnrollments si se actualizaron materias)
   */
  async execute(enrollmentId, payload = {}) {
    this.logger.info('[Inscripciones] Iniciando actualización de inscripción', {
      enrollmentId,
    });

    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError(`Inscripción con ID ${enrollmentId}`);
    }

    const enrollmentPlain = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;

    // Auto-reparación del vínculo datos académicos → carrera: si la fila quedó
    // sin carrera (inscripciones "sin carrera" del listado), se completa con la
    // carrera derivada de las materias ya matriculadas ANTES de resolver el
    // plan — sin carrera, resolverPlanEstudioInscripcion caía al plan vigente
    // de una carrera arbitraria. Guardar la edición sana el dato de forma
    // permanente sin intervención manual en la base.
    await this._repararCarreraDatosAcademicos(enrollmentPlain);

    const updateData = {};

    if (payload.observations !== undefined) {
      updateData.observations = payload.observations ?? null;
    }
    if (payload.enrollmentDate !== undefined) {
      updateData.enrollmentDate = payload.enrollmentDate ?? null;
    }

    let resolvedTeacherAssignmentIds = payload.teacherAssignmentIds;
    if (
      !resolvedTeacherAssignmentIds?.length &&
      payload.parallelIdsByPeriod &&
      typeof payload.parallelIdsByPeriod === 'object' &&
      payload.materiaIdsByPeriod &&
      typeof payload.materiaIdsByPeriod === 'object' &&
      Object.keys(payload.materiaIdsByPeriod).some(
        (k) => Array.isArray(payload.materiaIdsByPeriod[k]) && payload.materiaIdsByPeriod[k].length > 0
      )
    ) {
      resolvedTeacherAssignmentIds = await this._resolveTeacherAssignmentIdsFromSelection(
        enrollmentPlain,
        payload.parallelIdsByPeriod,
        payload.materiaIdsByPeriod,
        payload.requestedPlanId ?? null
      );
      this.logger.info('[Inscripciones] teacherAssignmentIds resueltos desde selección por periodo (update)', {
        count: resolvedTeacherAssignmentIds?.length ?? 0,
      });
    }

    const hasMateriasUpdate =
      (payload.parallelId != null && payload.parallelId !== '') ||
      (Array.isArray(resolvedTeacherAssignmentIds) && resolvedTeacherAssignmentIds.length > 0);

    let newsubjectEnrollments = null;

    if (hasMateriasUpdate) {
      const teacherAssignments = await this._resolveTeacherAssignmentsForUpdate(
        enrollmentPlain,
        payload,
        resolvedTeacherAssignmentIds
      );
      await this._replacesubjectEnrollments(enrollmentId, enrollment, teacherAssignments);
      newsubjectEnrollments = await this._findsubjectEnrollments(enrollmentId);
    }

    if (payload.priorHistory !== undefined && Array.isArray(payload.priorHistory)) {
      const academicDataId = enrollmentPlain.academicDataId ?? enrollmentPlain.studentAcademicData_id;
      const managementId = enrollmentPlain.managementId ?? enrollmentPlain.management_id;
      const studentAcademicData = await this.studentAcademicDataRepository.findById(academicDataId);
      const management = await this.managementRepository.findById(managementId);
      const historialFilas = await this._getHistorialFilas(studentAcademicData?.studentId);
      const { managementPlan } = await this._getStudyPlanAndManagementPlan(
        studentAcademicData,
        management,
        payload.requestedPlanId ?? null,
        historialFilas
      );
      await this._replacePriorEnrollmentHistory(enrollmentId, payload.priorHistory, managementPlan);
    }

    if (Object.keys(updateData).length > 0) {
      await this.enrollmentRepository.update(enrollmentId, updateData);
      this.logger.info('[Inscripciones] Inscripción actualizada', {
        enrollmentId,
        updatedFields: Object.keys(updateData),
      });
    }

    const updated = await this.enrollmentRepository.findById(enrollmentId);
    const result = EnrollmentMapper.entityToPresentation(updated);
    if (newsubjectEnrollments && newsubjectEnrollments.length > 0) {
      result.subjectEnrollments = EnrollmentSubjectMapper.entitiesToPresentation(newsubjectEnrollments);
    }
    return result;
  }

  /**
   * Resuelve las asignaciones docentes según el modo: paralelo (NUEVO) o lista
   * de IDs (ANTIGUO), y aplica las reglas de negocio 2-5 del rediseño del
   * wizard (prerrequisitos, periodo por tipo, salto máximo, duplicado de
   * aprobadas) sobre las asignaturas del plan resueltas.
   * @private
   * @param {Object} enrollmentPlain - Inscripción en edición (plana)
   * @param {Object} payload - Payload de la actualización (parallelId, requestedPlanId, priorHistory, ...)
   * @param {number[]|undefined} teacherAssignmentIds - IDs resueltos (ANTIGUO)
   * @returns {Promise<Array<{offerCourseId: number, curriculumSubjectId: number|null}>>}
   */
  async _resolveTeacherAssignmentsForUpdate(enrollmentPlain, payload, teacherAssignmentIds) {
    const academicDataId = enrollmentPlain.academicDataId ?? enrollmentPlain.studentAcademicData_id;
    const managementId = enrollmentPlain.managementId ?? enrollmentPlain.management_id;
    if (!academicDataId || !managementId) {
      throw new ValidationError(
        'La inscripción no tiene datos académicos o gestión asociados; no se puede actualizar el detalle de materias.'
      );
    }

    const studentAcademicData = await this.studentAcademicDataRepository.findById(academicDataId);
    if (!studentAcademicData) {
      throw new NotFoundError(`Datos académicos con ID ${academicDataId}`);
    }
    const management = await this.managementRepository.findById(managementId);
    if (!management) {
      throw new NotFoundError(`Gestión con ID ${managementId}`);
    }

    const historialFilas = await this._getHistorialFilas(studentAcademicData.studentId);
    const { studyPlan, managementPlan } = await this._getStudyPlanAndManagementPlan(
      studentAcademicData,
      management,
      payload.requestedPlanId ?? null,
      historialFilas
    );

    const parallelId = payload.parallelId;
    const useParallelMode = parallelId != null && parallelId !== '';
    let offerRows;
    if (useParallelMode) {
      const parallel = await this._validateParallel(parallelId);
      offerRows = await this._getCourseOfferRowsFromParallel(parallel, managementPlan);
    } else if (Array.isArray(teacherAssignmentIds) && teacherAssignmentIds.length > 0) {
      const assignments = await this._validateAndResolveTeacherAssignments(
        teacherAssignmentIds,
        managementPlan.id
      );
      offerRows = await this._offerRowsFromTeacherAssignments(assignments);
    } else {
      throw new ValidationError(
        'Para actualizar el detalle de inscripción envíe parallelId (NUEVO), teacherAssignmentIds (ANTIGUO) o parallel_ids_by_period con materia_ids_by_period.'
      );
    }

    await this._validarReglasNegocio({
      enrollmentPlain,
      studentAcademicData,
      management,
      studyPlan,
      offerRows,
      priorHistory: payload.priorHistory,
      historialFilas,
    });

    return offerRows;
  }

  /**
   * Filas del kardex del estudiante (vista 141). [] si el repositorio no está inyectado.
   * @private
   */
  async _getHistorialFilas(studentId) {
    if (!this.historialAcademicoRepository || !studentId) return [];
    return this.historialAcademicoRepository.listarFilasHistorialPorEstudiante(studentId);
  }

  /**
   * anio_cursado (PRIMERO/SEGUNDO) del traspaso activo más reciente del estudiante.
   * @private
   */
  async _getTraspasoAnioCursado(studentId) {
    if (!this.transferRepository || !studentId) return null;
    const result = await this.transferRepository.findAll({ studentId }, null, null);
    const transfers = result.transfers ?? [];
    if (transfers.length === 0) return null;
    const ultimo = transfers[transfers.length - 1];
    const plain = ultimo.toPlainObject ? ultimo.toPlainObject() : ultimo;
    return plain.anioCursado ?? plain.anio_cursado ?? null;
  }

  /**
   * Reglas de negocio 2-5 en modo edición (mismos helpers que Create):
   * - El kardex excluye las filas de la gestión de la inscripción en edición
   *   (son las materias que se están reemplazando).
   * - esNuevoSistema excluye del conteo la propia inscripción editada.
   * - prior_history: usa el del payload si viene; si no, el persistido.
   * @private
   */
  async _validarReglasNegocio({
    enrollmentPlain,
    studentAcademicData,
    management,
    studyPlan,
    offerRows,
    priorHistory,
    historialFilas,
  }) {
    if (!this.periodRepository || !this.prerequisiteRepository || !this.subjectRepository) {
      this.logger.warn(
        '[Inscripciones] Validaciones de negocio omitidas (update): faltan repositorios de plan (period/prerequisite/subject)'
      );
      return;
    }

    const curriculumSubjectIds = (offerRows ?? [])
      .map((row) => row.curriculumSubjectId)
      .filter((id) => id != null);
    if (curriculumSubjectIds.length === 0) return;

    const studentId = studentAcademicData.studentId;
    const enrollmentType =
      enrollmentPlain.enrollmentType ?? enrollmentPlain.tipoInscripcion ?? TIPOS_INSCRIPCION.ANTIGUO;

    // Total de inscripciones activas en cualquier gestión, excluyendo la editada.
    const edaTodos = await this.studentAcademicDataRepository.findAll(
      { studentId, includeInactive: true },
      null,
      null
    );
    const conteos = await Promise.all(
      (edaTodos.studentAcademicData ?? []).map((eda) =>
        this.enrollmentRepository.count({ academicDataId: eda.id })
      )
    );
    const totalInscripciones = Math.max(
      0,
      conteos.reduce((acc, n) => acc + (Number(n) || 0), 0) - 1
    );

    // Kardex sin las filas de la gestión de esta inscripción (se reemplazan).
    const anioGestion = Number(management.year ?? 0) || null;
    const historialFilasPrevias = (historialFilas ?? []).filter(
      (fila) => anioGestion == null || Number(fila.gestion_anio) !== anioGestion
    );

    // prior_history: payload (reemplazo) o el persistido de la inscripción.
    const priorHistoryItems = Array.isArray(priorHistory) ? priorHistory : null;
    let priorCurriculumSubjectIds = null;
    if (!priorHistoryItems && this.priorEnrollmentHistoryRepository) {
      const existing = await this.priorEnrollmentHistoryRepository.findAll(
        { enrollmentId: enrollmentPlain.id },
        null,
        null
      );
      priorCurriculumSubjectIds = (existing.priorEnrollmentHistories ?? [])
        .map((row) => {
          const plain = row.toPlainObject ? row.toPlainObject() : row;
          return plain.curriculumSubjectId ?? plain.asignaturaPlanId ?? null;
        })
        .filter((id) => id != null);
    }

    const [traspasoAnioCursado, estructura] = await Promise.all([
      this._getTraspasoAnioCursado(studentId),
      cargarEstructuraPlan({
        studyPlanId: studyPlan.id,
        periodRepository: this.periodRepository,
        planSubjectRepository: this.planSubjectRepository,
        subjectRepository: this.subjectRepository,
        prerequisiteRepository: this.prerequisiteRepository,
      }),
    ]);

    validarReglasInscripcion({
      curriculumSubjectIds,
      enrollmentType,
      esNuevoSistema: totalInscripciones === 0,
      traspasoAnioCursado,
      historialFilas: historialFilasPrevias,
      priorHistoryItems,
      priorCurriculumSubjectIds,
      estructura,
    });

    this.logger.info('[Inscripciones] Reglas de negocio de matrícula validadas (update)', {
      enrollmentId: enrollmentPlain.id,
      studentId,
      studyPlanId: studyPlan.id,
      materias: curriculumSubjectIds.length,
      esNuevoSistema: totalInscripciones === 0,
      enrollmentType,
    });
  }

  /**
   * Resuelve teacherAssignmentIds desde parallelIdsByPeriod + materiaIdsByPeriod (misma lógica que Create).
   * @private
   */
  async _resolveTeacherAssignmentIdsFromSelection(
    enrollmentPlain,
    parallelIdsByPeriod,
    materiaIdsByPeriod,
    requestedPlanId = null
  ) {
    const periodIds = Object.keys(materiaIdsByPeriod).filter(
      (k) => Array.isArray(materiaIdsByPeriod[k]) && materiaIdsByPeriod[k].length > 0
    );
    if (periodIds.length === 0) return [];

    const academicDataId = enrollmentPlain.academicDataId ?? enrollmentPlain.studentAcademicData_id;
    const managementId = enrollmentPlain.managementId ?? enrollmentPlain.management_id;
    if (!academicDataId || !managementId) return [];

    const studentAcademicData = await this.studentAcademicDataRepository.findById(academicDataId);
    const management = await this.managementRepository.findById(managementId);
    if (!studentAcademicData || !management) return [];

    const historialFilas = await this._getHistorialFilas(studentAcademicData.studentId);
    const { managementPlan } = await this._getStudyPlanAndManagementPlan(
      studentAcademicData,
      management,
      requestedPlanId,
      historialFilas
    );
    const managementPlanId = managementPlan.id;

    const assignmentIds = [];
    const materiaIdSetByPeriod = {};
    for (const pid of periodIds) {
      materiaIdSetByPeriod[pid] = new Set((materiaIdsByPeriod[pid] || []).map(Number));
    }

    for (const periodId of periodIds) {
      const parallelId = parallelIdsByPeriod[periodId];
      if (!parallelId) continue;

      const parallelManagement = await this.parallelManagementRepository.findByParallelAndManagementPlan(
        Number(parallelId),
        managementPlanId
      );
      if (!parallelManagement) continue;

      const pgPlain = parallelManagement.toPlainObject
        ? parallelManagement.toPlainObject()
        : parallelManagement;
      const offers = await this.courseOfferRepository.findEnrichedByParallelManagementId(pgPlain.id);

      for (const offer of offers) {
        if (Number(offer.periodoId) !== Number(periodId)) continue;

        const allowedMaterias = materiaIdSetByPeriod[periodId];
        if (!allowedMaterias || !allowedMaterias.has(Number(offer.materiaId))) continue;

        const assignmentsResult = await this.teacherAssignmentRepository.findAll(
          { managementPlanId, offerCourseId: offer.id, active: true },
          1,
          null
        );
        const list = assignmentsResult.teacherAssignments ?? assignmentsResult.teacherAssignment ?? [];
        if (list.length > 0) {
          const assign = list[0];
          const assignId = assign.id ?? assign.toPlainObject?.()?.id;
          if (assignId) assignmentIds.push(assignId);
        }
      }
    }

    return assignmentIds;
  }

  /**
   * Plan de estudios + plan habilitado según la regla de planes duales
   * (enrollmentBusinessRules): con historial el plan derivado del kardex MANDA
   * (RN-3 — la edición NO cambia el plan del estudiante); fallback vigente.
   *
   * TODO planes-duales bloque A: leer plan_estudio_id persistido en
   * estudiantes_datos_academicos cuando se apruebe el DDL.
   * @private
   */
  /**
   * Repara `estudiantes_datos_academicos.carrera_id` cuando quedó NULL: deriva
   * la carrera de las materias matriculadas de la inscripción (fuente de
   * verdad: asignatura de plan → plan de estudio → carrera) y la persiste.
   * Sin efecto cuando la fila ya tiene carrera o no hay matrículas resolubles.
   * @private
   * @param {Object} enrollmentPlain - Inscripción en edición (plana)
   */
  async _repararCarreraDatosAcademicos(enrollmentPlain) {
    const academicDataId = enrollmentPlain.academicDataId ?? enrollmentPlain.studentAcademicData_id;
    if (!academicDataId) return;

    const studentAcademicData = await this.studentAcademicDataRepository.findById(academicDataId);
    if (!studentAcademicData) return;
    const plain = studentAcademicData.toPlainObject
      ? studentAcademicData.toPlainObject()
      : studentAcademicData;
    const currentCareerId = plain.careerId ?? plain.carreraId ?? null;
    if (currentCareerId != null) return;

    const derivado = await derivarCarreraPlanDesdeMatriculas({
      enrollmentId: enrollmentPlain.id,
      subjectEnrollmentRepository: this.subjectEnrollmentRepository,
      courseOfferRepository: this.courseOfferRepository,
      planSubjectRepository: this.planSubjectRepository,
      studyPlanRepository: this.studyPlanRepository,
      logger: this.logger,
    });
    if (!derivado?.careerId) return;

    await this.studentAcademicDataRepository.update(academicDataId, {
      careerId: derivado.careerId,
    });
    this.logger.info('[Inscripciones] Carrera de datos académicos reparada desde materias matriculadas', {
      enrollmentId: enrollmentPlain.id,
      academicDataId,
      careerId: derivado.careerId,
      studyPlanId: derivado.studyPlanId,
    });
  }

  async _getStudyPlanAndManagementPlan(
    studentAcademicData,
    management,
    requestedPlanId = null,
    historialFilas = []
  ) {
    const { studyPlan, managementPlan } = await resolverPlanEstudioInscripcion({
      requestedPlanId,
      careerId: studentAcademicData.careerId ?? studentAcademicData.carreraId,
      management,
      historialFilas,
      preferKardexOverRequested: true,
      studyPlanRepository: this.studyPlanRepository,
      managementPlanRepository: this.managementPlanRepository,
      logger: this.logger,
    });
    return { studyPlan, managementPlan };
  }

  async _validateParallel(parallelId) {
    const parallel = await this.parallelRepository.findById(parallelId);
    if (!parallel) {
      throw new NotFoundError(`Paralelo con ID ${parallelId}`);
    }
    return parallel;
  }

  async _getCourseOfferRowsFromParallel(parallel, managementPlan) {
    const parallelManagement = await this.parallelManagementRepository.findByParallelAndManagementPlan(
      parallel.id,
      managementPlan.id
    );
    if (!parallelManagement) {
      throw new ValidationError(
        `El paralelo ${parallel.name ?? parallel.id} no está instanciado en la gestión actual`
      );
    }

    const pgPlain = parallelManagement.toPlainObject
      ? parallelManagement.toPlainObject()
      : parallelManagement;
    const offers = await this.courseOfferRepository.findEnrichedByParallelManagementId(pgPlain.id);
    const activeOffers = offers.filter((o) => o.activo !== false && o.activo !== 0);

    if (activeOffers.length === 0) {
      throw new ValidationError(
        'El paralelo no tiene materias ofertadas en la gestión actual. Configure la oferta académica primero.'
      );
    }

    return activeOffers.map((offer) => ({
      offerCourseId: offer.id,
      curriculumSubjectId: offer.asignaturaPlanId,
    }));
  }

  async _offerRowsFromTeacherAssignments(teacherAssignments) {
    const rows = [];
    const seenOfferIds = new Set();

    for (const assignment of teacherAssignments) {
      const plain = assignment.toPlainObject ? assignment.toPlainObject() : assignment;
      const offerCourseId = plain.offerCourseId ?? plain.ofertaCursoId;
      if (!offerCourseId) {
        throw new ValidationError(
          `La asignación docente ${plain.id} no está vinculada a una oferta de curso`
        );
      }
      if (seenOfferIds.has(offerCourseId)) continue;
      seenOfferIds.add(offerCourseId);

      const offer = await this.courseOfferRepository.findById(offerCourseId);
      if (!offer) {
        throw new NotFoundError(`Oferta de curso con ID ${offerCourseId}`);
      }
      const offerPlain = offer.toPlainObject ? offer.toPlainObject() : offer;
      rows.push({
        offerCourseId,
        curriculumSubjectId: offerPlain.planSubjectId ?? offerPlain.asignaturaPlanId,
      });
    }

    return rows;
  }

  async _validateAndResolveTeacherAssignments(teacherAssignmentIds, managementPlanId) {
    const assignments = [];
    for (const id of teacherAssignmentIds) {
      const assignment = await this.teacherAssignmentRepository.findById(id);
      if (!assignment) {
        throw new NotFoundError(`Asignación docente con ID ${id}`);
      }
      const plain = assignment.toPlainObject ? assignment.toPlainObject() : assignment;
      const planId = plain.managementPlanId ?? plain.gestionPlanId;
      if (planId !== managementPlanId) {
        throw new ValidationError(
          `La asignación docente ${id} no pertenece al plan habilitado de la gestión de esta inscripción`
        );
      }
      assignments.push(assignment);
    }
    this.logger.info('[Inscripciones] Asignaciones docentes validadas (modo materias)', {
      count: assignments.length,
      managementPlanId,
    });
    return assignments;
  }

  /**
   * Reemplaza todas las inscripciones_materias de la inscripción: elimina las actuales y crea las nuevas.
   * @private
   */
  async _replacesubjectEnrollments(enrollmentId, enrollment, teacherAssignments) {
    await this._deletesubjectEnrollments(enrollmentId);
    await this._createsubjectEnrollments(enrollment, teacherAssignments);
  }

  async _deletesubjectEnrollments(enrollmentId) {
    const result = await this.subjectEnrollmentRepository.findAll(
      { enrollmentId, active: true },
      null,
      null
    );
    const list = result.subjectEnrollments || result.enrollmentMaterias || [];
    for (const es of list) {
      const plain = es.toPlainObject ? es.toPlainObject() : es;
      if (plain.id) {
        await this.subjectEnrollmentRepository.delete(plain.id);
      }
    }
    this.logger.info('[Inscripciones] Materias inscritas anteriores eliminadas', {
      enrollmentId,
      count: list.length,
    });
  }

  async _createsubjectEnrollments(enrollment, offerRows) {
    const enrollmentId = enrollment.id ?? enrollment.Id;
    for (const row of offerRows) {
      await this.subjectEnrollmentRepository.create({
        enrollmentId,
        offerCourseId: row.offerCourseId,
        curriculumSubjectId: row.curriculumSubjectId ?? null,
        status: ESTADOS_MATERIA_INSCRITA.INSCRITO,
        observations: null,
      });
    }
    this.logger.info('[Inscripciones] Nuevas materias inscritas creadas', {
      enrollmentId,
      totalSubjects: offerRows.length,
    });
  }

  async _findsubjectEnrollments(enrollmentId) {
    const result = await this.subjectEnrollmentRepository.findAll(
      { enrollmentId, active: true },
      null,
      null
    );
    return result.subjectEnrollments || result.enrollmentMaterias || [];
  }

  /**
   * Reemplaza historial_previo de la inscripción (soft delete + alta).
   * @private
   */
  async _replacePriorEnrollmentHistory(enrollmentId, priorHistory, managementPlan) {
    if (!this.priorEnrollmentHistoryRepository) return;

    const existing = await this.priorEnrollmentHistoryRepository.findAll(
      { enrollmentId },
      null,
      null
    );
    const list = existing.priorEnrollmentHistories || [];
    for (const row of list) {
      const plain = row.toPlainObject ? row.toPlainObject() : row;
      if (plain.id) {
        await this.priorEnrollmentHistoryRepository.delete(plain.id);
      }
    }

    if (!priorHistory.length) {
      this.logger.info('[Inscripciones] Historial previo vaciado', { enrollmentId });
      return;
    }

    const planPlain = managementPlan?.toPlainObject ? managementPlan.toPlainObject() : managementPlan;
    const studyPlanId = planPlain?.studyPlanId ?? planPlain?.planEstudioId;
    if (!studyPlanId) {
      throw new ValidationError(
        'No se pudo resolver el plan de estudios para actualizar el historial previo'
      );
    }

    for (const item of priorHistory) {
      const { materiaId, periodId, finalGrade, status } = parsePriorHistoryItem(item);

      const planSubjectsResult = await this.planSubjectRepository.findAll(
        { studyPlanId, periodId, subjectId: materiaId },
        null,
        null
      );
      const planSubjects = planSubjectsResult?.planSubjects ?? [];
      if (!planSubjects.length) {
        throw new ValidationError(
          `No se encontró asignatura de plan para materia ${materiaId} en periodo ${periodId}`
        );
      }
      const ps = planSubjects[0];
      const psPlain = ps.toPlainObject ? ps.toPlainObject() : ps;

      await this.priorEnrollmentHistoryRepository.create({
        enrollmentId,
        curriculumSubjectId: psPlain.id,
        finalGrade,
        status,
      });
    }

    this.logger.info('[Inscripciones] Historial previo actualizado', {
      enrollmentId,
      count: priorHistory.length,
    });
  }

  /**
   * Actualiza solo historial_previo de una inscripción (PUT dedicado).
   * @param {number} enrollmentId
   * @param {Array} priorHistory - Filas { materiaId, periodId, finalGrade, status }
   */
  async executePriorHistoryOnly(enrollmentId, priorHistory) {
    this.logger.info('[Inscripciones] Actualización de historial previo', { enrollmentId });

    if (!Array.isArray(priorHistory)) {
      throw new ValidationError('prior_history debe ser un arreglo');
    }

    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError(`Inscripción con ID ${enrollmentId}`);
    }

    const enrollmentPlain = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;
    const academicDataId = enrollmentPlain.academicDataId ?? enrollmentPlain.studentAcademicData_id;
    const managementId = enrollmentPlain.managementId ?? enrollmentPlain.management_id;
    const studentAcademicData = await this.studentAcademicDataRepository.findById(academicDataId);
    const management = await this.managementRepository.findById(managementId);
    const historialFilas = await this._getHistorialFilas(studentAcademicData?.studentId);
    const { managementPlan } = await this._getStudyPlanAndManagementPlan(
      studentAcademicData,
      management,
      null,
      historialFilas
    );

    await this._replacePriorEnrollmentHistory(enrollmentId, priorHistory, managementPlan);

    const updated = await this.enrollmentRepository.findById(enrollmentId);
    return EnrollmentMapper.entityToPresentation(updated);
  }
}
