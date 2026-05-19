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
import { ESTADOS_MATERIA_INSCRITA } from '../../../domain/constants/inscripciones.constants.js';
import { ESTADOS_HISTORIAL_PREVIO_VALUES } from '../../../domain/constants/evaluaciones.constants.js';
import { EnrollmentMapper, EnrollmentSubjectMapper } from '../../mappers/inscripciones/index.js';

export class UpdateEnrollmentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas (incluye planSubjectRepository para resolver desde parallelIdsByPeriod + materiaIdsByPeriod)
   */
  constructor({
    enrollmentRepository,
    subjectEnrollmentRepository,
    studentAcademicDataRepository,
    parallelRepository,
    courseRepository,
    teacherAssignmentRepository,
    managementRepository,
    managementPlanRepository,
    studyPlanRepository,
    planSubjectRepository,
    priorEnrollmentHistoryRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.priorEnrollmentHistoryRepository = priorEnrollmentHistoryRepository;
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
        payload.materiaIdsByPeriod
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
        payload.parallelId,
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
      const { managementPlan } = await this._getStudyPlanAndManagementPlan(
        studentAcademicData,
        management
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
   * Resuelve las asignaciones docentes según el modo: paralelo (NUEVO) o lista de IDs (ANTIGUO).
   * @private
   */
  async _resolveTeacherAssignmentsForUpdate(enrollmentPlain, parallelId, teacherAssignmentIds) {
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

    const { managementPlan } = await this._getStudyPlanAndManagementPlan(studentAcademicData, management);

    const useParallelMode = parallelId != null && parallelId !== '';
    if (useParallelMode) {
      const parallel = await this._validateParallel(parallelId);
      return this._getTeacherAssignmentsFromParallel(parallel, managementPlan);
    }

    if (Array.isArray(teacherAssignmentIds) && teacherAssignmentIds.length > 0) {
      return this._validateAndResolveTeacherAssignments(teacherAssignmentIds, managementPlan.id);
    }

    throw new ValidationError(
      'Para actualizar el detalle de inscripción envíe parallelId (NUEVO), teacherAssignmentIds (ANTIGUO) o parallel_ids_by_period con materia_ids_by_period.'
    );
  }

  /**
   * Resuelve teacherAssignmentIds desde parallelIdsByPeriod + materiaIdsByPeriod (misma lógica que Create).
   * @private
   */
  async _resolveTeacherAssignmentIdsFromSelection(enrollmentPlain, parallelIdsByPeriod, materiaIdsByPeriod) {
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

    const { managementPlan } = await this._getStudyPlanAndManagementPlan(studentAcademicData, management);
    const managementPlanId = managementPlan.id;

    const assignmentIds = [];
    const materiaIdSetByPeriod = {};
    for (const pid of periodIds) {
      materiaIdSetByPeriod[pid] = new Set((materiaIdsByPeriod[pid] || []).map(Number));
    }

    for (const periodId of periodIds) {
      const parallelId = parallelIdsByPeriod[periodId];
      if (!parallelId) continue;

      const coursesResult = await this.courseRepository.findAll({ parallelId: Number(parallelId) }, null, null);
      const courses = coursesResult.courses || [];

      for (const course of courses) {
        const coursePlain = course.toPlainObject ? course.toPlainObject() : course;
        const asignaturaPlanId = coursePlain.planSubjectId ?? coursePlain.asignaturaPlanId;
        if (!asignaturaPlanId) continue;

        const planSubject = await this.planSubjectRepository.findById(asignaturaPlanId);
        if (!planSubject) continue;

        const planPlain = planSubject.toPlainObject ? planSubject.toPlainObject() : planSubject;
        const planPeriodId = planPlain.periodId ?? planPlain.periodoId;
        const planMateriaId = planPlain.subjectId ?? planPlain.materiaId;
        if (Number(planPeriodId) !== Number(periodId)) continue;

        const allowedMaterias = materiaIdSetByPeriod[periodId];
        if (!allowedMaterias || !allowedMaterias.has(Number(planMateriaId))) continue;

        const assignmentsResult = await this.teacherAssignmentRepository.findAll(
          { managementPlanId, courseId: coursePlain.id, active: true },
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

  async _getStudyPlanAndManagementPlan(studentAcademicData, management) {
    const careerId = studentAcademicData.careerId ?? studentAcademicData.carreraId;
    const studyPlansResult = await this.studyPlanRepository.findAll(
      { careerId, active: true },
      null,
      { orderBy: 'vigente', orderDirection: 'DESC' }
    );
    const studyPlan = studyPlansResult.studyPlans?.[0];
    if (!studyPlan) {
      throw new NotFoundError(`Plan de estudios vigente para la carrera con ID ${careerId}`);
    }

    const managementPlanResult = await this.managementPlanRepository.findAll(
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
      throw new NotFoundError(
        `Plan habilitado para la gestión ${management.year} y plan de estudios ${studyPlan.id}`
      );
    }
    return { studyPlan, managementPlan };
  }

  async _validateParallel(parallelId) {
    const parallel = await this.parallelRepository.findById(parallelId);
    if (!parallel) {
      throw new NotFoundError(`Paralelo con ID ${parallelId}`);
    }
    return parallel;
  }

  async _getTeacherAssignmentsFromParallel(parallel, managementPlan) {
    const coursesResult = await this.courseRepository.findAll(
      { parallelId: parallel.id },
      null,
      null
    );
    const courses = coursesResult.courses || [];
    const allAssignments = [];
    for (const course of courses) {
      const coursePlain = course.toPlainObject ? course.toPlainObject() : course;
      const assignmentsResult = await this.teacherAssignmentRepository.findAll(
        {
          managementPlanId: managementPlan.id,
          courseId: coursePlain.id,
          active: true,
          vigente: true,
        },
        null,
        null
      );
      if (assignmentsResult.teacherAssignments?.length > 0) {
        allAssignments.push(...assignmentsResult.teacherAssignments);
      }
    }
    this.logger.info('[Inscripciones] Asignaciones docentes obtenidas desde paralelo', {
      parallelId: parallel.id,
      totalAssignments: allAssignments.length,
    });
    return allAssignments;
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

  async _createsubjectEnrollments(enrollment, teacherAssignments) {
    const enrollmentId = enrollment.id ?? enrollment.Id;
    for (const assignment of teacherAssignments) {
      const assignmentId = assignment.id ?? assignment.Id;
      await this.subjectEnrollmentRepository.create({
        enrollmentId,
        teacherAssignmentId: assignmentId,
        status: ESTADOS_MATERIA_INSCRITA.INSCRITO,
        observations: null,
        teacherObservations: null,
      });
    }
    this.logger.info('[Inscripciones] Nuevas materias inscritas creadas', {
      enrollmentId,
      totalSubjects: teacherAssignments.length,
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
      const materiaId = Number(item.materiaId ?? item.materia_id);
      const periodId = Number(item.periodId ?? item.period_id);
      const finalGrade = Number(item.finalGrade ?? item.final_grade ?? item.nota_final);
      const status = String(item.status ?? item.estado ?? 'APROBADO').toUpperCase();

      if (!materiaId || !periodId) {
        throw new ValidationError('Cada fila de historial previo requiere materia_id y period_id');
      }
      if (Number.isNaN(finalGrade) || finalGrade < 0 || finalGrade > 100) {
        throw new ValidationError('La nota del historial previo debe estar entre 0 y 100');
      }
      if (finalGrade < 61) {
        throw new ValidationError('La nota mínima de aprobación en historial previo es 61');
      }
      if (!ESTADOS_HISTORIAL_PREVIO_VALUES.includes(status)) {
        throw new ValidationError(
          `Estado de historial previo inválido. Valores: ${ESTADOS_HISTORIAL_PREVIO_VALUES.join(', ')}`
        );
      }

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
}
