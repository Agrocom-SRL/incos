/**
 * PATCH /api/v1/docentes/asignaciones/:id — edición básica de asignación docente.
 */

import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { TeacherAssignment } from '../../../domain/entities/TeacherAssignment.js';
import { TeacherAssignmentListMapper } from '../../mappers/docentes/TeacherAssignmentListMapper.js';

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

export class UpdateTeacherAssignmentUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/TeacherAssignmentRepository.js').TeacherAssignmentRepository} deps.teacherAssignmentRepository
   * @param {import('../../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   * @param {import('../../../infrastructure/repositories/CourseRepository.js').CourseRepository} deps.courseRepository
   * @param {import('../../../infrastructure/repositories/PlanSubjectRepository.js').PlanSubjectRepository} deps.planSubjectRepository
   * @param {import('../../../infrastructure/repositories/ManagementPlanRepository.js').ManagementPlanRepository} deps.managementPlanRepository
   * @param {Object} deps.logger
   */
  constructor({
    teacherAssignmentRepository,
    teacherRepository,
    courseRepository,
    planSubjectRepository,
    managementPlanRepository,
    logger,
  }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.teacherRepository = teacherRepository;
    this.courseRepository = courseRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.logger = logger;
  }

  /**
   * @param {number} assignmentId
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<{ asignacion: Object }>}
   */
  async execute(assignmentId, body, userId = null) {
    const id = Number(assignmentId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('Asignación docente');
    }

    this.logger.info('[Docentes] Actualizar asignación docente', { assignmentId: id, userId });

    const existing = await this.teacherAssignmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Asignación docente');
    }

    const payload = body || {};
    const updateData = {};

    if (hasOwn(payload, 'docenteId')) {
      if (payload.docenteId === null || payload.docenteId === '') {
        updateData.teacherId = null;
      } else {
        const docenteId = Number(payload.docenteId);
        if (!Number.isFinite(docenteId) || docenteId < 1) {
          throw new UnprocessableEntityError('docenteId debe ser un entero positivo.', [
            { field: 'docenteId', message: 'Inválido' },
          ]);
        }
        const teacher = await this.teacherRepository.findById(docenteId);
        if (!teacher) {
          throw new NotFoundError('Docente');
        }
        updateData.teacherId = docenteId;
      }
    }

    if (hasOwn(payload, 'cursoId')) {
      const cursoId = Number(payload.cursoId);
      if (!Number.isFinite(cursoId) || cursoId < 1) {
        throw new UnprocessableEntityError('cursoId debe ser un entero positivo.', [
          { field: 'cursoId', message: 'Inválido' },
        ]);
      }
      const course = await this.courseRepository.findById(cursoId);
      if (!course) {
        throw new NotFoundError('Curso');
      }
      const planSubjectId = course.planSubjectId;
      if (planSubjectId == null) {
        throw new UnprocessableEntityError('El curso no tiene asignatura de plan vinculada.', [
          { field: 'cursoId', message: 'asignatura_plan_id es requerido para validar el plan' },
        ]);
      }
      const planSubject = await this.planSubjectRepository.findById(planSubjectId);
      if (!planSubject) {
        throw new NotFoundError('Asignatura del plan');
      }
      const managementPlanId = existing.managementPlanId ?? null;
      const managementPlan = managementPlanId
        ? await this.managementPlanRepository.findById(managementPlanId)
        : null;
      const enabledPlanId = managementPlan?.studyPlanId ?? null;
      const coursePlanId = planSubject.studyPlanId ?? null;
      if (enabledPlanId == null || coursePlanId == null || enabledPlanId !== coursePlanId) {
        throw new UnprocessableEntityError(
          'El curso no pertenece al mismo plan de estudios que el plan habilitado de la asignación.',
          [
            { field: 'cursoId', message: 'Incoherencia entre plan del curso y plan habilitado' },
          ]
        );
      }
      // Permitir edición libre de curso en PATCH, incluso si ya existe otra asignación activa
      // para el mismo curso en el mismo plan habilitado. Los conflictos acƒadémicos/horarios
      // se reportan en una etapa posterior y no bloquean esta operación.
      updateData.courseId = cursoId;
    }

    if (hasOwn(payload, 'cargaHoraria')) {
      if (payload.cargaHoraria === null || payload.cargaHoraria === '') {
        updateData.hours = null;
      } else {
        const hours = Number(payload.cargaHoraria);
        if (!Number.isFinite(hours) || hours < 0 || hours > 200) {
          throw new UnprocessableEntityError('cargaHoraria debe estar entre 0 y 200.', [
            { field: 'cargaHoraria', message: 'Inválido' },
          ]);
        }
        updateData.hours = Math.round(hours);
      }
    }

    if (hasOwn(payload, 'vigente')) {
      const vigente =
        payload.vigente === true ||
        payload.vigente === 'true' ||
        payload.vigente === 1 ||
        payload.vigente === '1';
      updateData.active = vigente;
    }

    if (hasOwn(payload, 'motivo')) {
      updateData.reason = payload.motivo == null || payload.motivo === '' ? null : String(payload.motivo).trim();
    }

    if (hasOwn(payload, 'fechaAsignacion')) {
      updateData.assignmentDate =
        payload.fechaAsignacion == null || payload.fechaAsignacion === '' ? null : payload.fechaAsignacion;
    }

    if (Object.keys(updateData).length === 0) {
      throw new UnprocessableEntityError('No hay campos válidos para actualizar.', [
        { field: 'body', message: 'Vacío' },
      ]);
    }

    if (updateData.active === false && !hasOwn(updateData, 'reason')) {
      updateData.reason = 'Baja manual de asignación';
    }

    const updated = await this.teacherAssignmentRepository.update(id, new TeacherAssignment(updateData), userId);
    if (!updated) {
      throw new NotFoundError('Asignación docente');
    }

    return {
      asignacion: TeacherAssignmentListMapper.entityToPresentation(updated),
    };
  }
}

