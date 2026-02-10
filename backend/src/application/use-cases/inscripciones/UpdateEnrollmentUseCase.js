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
import { EnrollmentMapper, EnrollmentSubjectMapper } from '../../mappers/inscripciones/index.js';

export class UpdateEnrollmentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.enrollmentSubjectRepository - Repositorio de materias inscritas (inscripciones_materias)
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.parallelRepository - Repositorio de paralelos
   * @param {Object} params.courseRepository - Repositorio de cursos
   * @param {Object} params.teacherAssignmentRepository - Repositorio de asignaciones docentes
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {Object} params.managementPlanRepository - Repositorio de planes habilitados
   * @param {Object} params.studyPlanRepository - Repositorio de planes de estudios
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    enrollmentSubjectRepository,
    studentAcademicDataRepository,
    parallelRepository,
    courseRepository,
    teacherAssignmentRepository,
    managementRepository,
    managementPlanRepository,
    studyPlanRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.enrollmentSubjectRepository = enrollmentSubjectRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.studyPlanRepository = studyPlanRepository;
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
   * @returns {Promise<Object>} Inscripción actualizada en formato de presentación (con enrollmentSubjects si se actualizaron materias)
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

    const hasMateriasUpdate =
      (payload.parallelId != null && payload.parallelId !== '') ||
      (Array.isArray(payload.teacherAssignmentIds) && payload.teacherAssignmentIds.length > 0);

    let newEnrollmentSubjects = null;

    if (hasMateriasUpdate) {
      const teacherAssignments = await this._resolveTeacherAssignmentsForUpdate(
        enrollmentPlain,
        payload.parallelId,
        payload.teacherAssignmentIds
      );
      await this._replaceEnrollmentSubjects(enrollmentId, enrollment, teacherAssignments);
      newEnrollmentSubjects = await this._findEnrollmentSubjects(enrollmentId);
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
    if (newEnrollmentSubjects && newEnrollmentSubjects.length > 0) {
      result.enrollmentSubjects = EnrollmentSubjectMapper.entitiesToPresentation(newEnrollmentSubjects);
    }
    return result;
  }

  /**
   * Resuelve las asignaciones docentes según el modo: paralelo (NUEVO) o lista de IDs (ANTIGUO).
   * @private
   */
  async _resolveTeacherAssignmentsForUpdate(enrollmentPlain, parallelId, teacherAssignmentIds) {
    const studentAcademicDataId = enrollmentPlain.studentAcademicDataId ?? enrollmentPlain.studentAcademicData_id;
    const managementId = enrollmentPlain.managementId ?? enrollmentPlain.management_id;
    if (!studentAcademicDataId || !managementId) {
      throw new ValidationError(
        'La inscripción no tiene datos académicos o gestión asociados; no se puede actualizar el detalle de materias.'
      );
    }

    const studentAcademicData = await this.studentAcademicDataRepository.findById(studentAcademicDataId);
    if (!studentAcademicData) {
      throw new NotFoundError(`Datos académicos con ID ${studentAcademicDataId}`);
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
      'Para actualizar el detalle de inscripción envíe parallelId (NUEVO) o teacherAssignmentIds (ANTIGUO).'
    );
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
  async _replaceEnrollmentSubjects(enrollmentId, enrollment, teacherAssignments) {
    await this._deleteEnrollmentSubjects(enrollmentId);
    await this._createEnrollmentSubjects(enrollment, teacherAssignments);
  }

  async _deleteEnrollmentSubjects(enrollmentId) {
    const result = await this.enrollmentSubjectRepository.findAll(
      { enrollmentId, active: true },
      null,
      null
    );
    const list = result.enrollmentSubjects || result.enrollmentMaterias || [];
    for (const es of list) {
      const plain = es.toPlainObject ? es.toPlainObject() : es;
      if (plain.id) {
        await this.enrollmentSubjectRepository.delete(plain.id);
      }
    }
    this.logger.info('[Inscripciones] Materias inscritas anteriores eliminadas', {
      enrollmentId,
      count: list.length,
    });
  }

  async _createEnrollmentSubjects(enrollment, teacherAssignments) {
    const enrollmentId = enrollment.id ?? enrollment.Id;
    for (const assignment of teacherAssignments) {
      const assignmentId = assignment.id ?? assignment.Id;
      await this.enrollmentSubjectRepository.create({
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

  async _findEnrollmentSubjects(enrollmentId) {
    const result = await this.enrollmentSubjectRepository.findAll(
      { enrollmentId, active: true },
      null,
      null
    );
    return result.enrollmentSubjects || result.enrollmentMaterias || [];
  }
}
