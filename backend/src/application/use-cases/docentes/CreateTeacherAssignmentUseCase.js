/**
 * POST /api/v1/docentes/asignaciones — alta de asignación docente a curso en plan habilitado.
 */

import { TeacherAssignment } from '../../../domain/entities/TeacherAssignment.js';
import {
  NotFoundError,
  UnprocessableEntityError,
  ConflictError,
} from '../../../domain/errors/index.js';
import { TeacherAssignmentListMapper } from '../../mappers/docentes/TeacherAssignmentListMapper.js';
import { todayDateOnlyLocal, defaultWeeklyHoursFromPlan } from '../../utils/teacherAssignmentFieldDefaults.js';

export class CreateTeacherAssignmentUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/TeacherAssignmentRepository.js').TeacherAssignmentRepository} deps.teacherAssignmentRepository
   * @param {import('../../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   * @param {import('../../../infrastructure/repositories/CourseRepository.js').CourseRepository} deps.courseRepository
   * @param {import('../../../infrastructure/repositories/ManagementPlanRepository.js').ManagementPlanRepository} deps.managementPlanRepository
   * @param {import('../../../infrastructure/repositories/PlanSubjectRepository.js').PlanSubjectRepository} deps.planSubjectRepository
   * @param {Object} deps.logger
   */
  constructor({
    teacherAssignmentRepository,
    teacherRepository,
    courseRepository,
    managementPlanRepository,
    planSubjectRepository,
    syncMatriculasTeacherAssignmentUseCase,
    logger,
  }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.teacherRepository = teacherRepository;
    this.courseRepository = courseRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.syncMatriculasTeacherAssignmentUseCase = syncMatriculasTeacherAssignmentUseCase;
    this.logger = logger;
  }

  /**
   * @param {Object} body - gestionPlanId, cursoId, docenteId, cargaHoraria?, fechaAsignacion?, vigente?
   * @param {number|null} userId
   * @returns {Promise<{ asignacion: Object }>}
   */
  async execute(body, userId = null) {
    const gestionPlanId = Number(body?.gestionPlanId);
    const cursoId = Number(body?.cursoId);
    const docenteId = Number(body?.docenteId);

    this.logger.info('[Docentes] Crear asignación docente', { gestionPlanId, cursoId, docenteId, userId });

    if (!Number.isFinite(gestionPlanId) || gestionPlanId < 1 || !Number.isFinite(cursoId) || cursoId < 1 || !Number.isFinite(docenteId) || docenteId < 1) {
      throw new UnprocessableEntityError('gestionPlanId, cursoId y docenteId deben ser enteros positivos.', [
        { field: 'gestionPlanId', message: 'Inválido' },
        { field: 'cursoId', message: 'Inválido' },
        { field: 'docenteId', message: 'Inválido' },
      ]);
    }

    const teacher = await this.teacherRepository.findById(docenteId);
    if (!teacher) {
      throw new NotFoundError('Docente');
    }

    const managementPlan = await this.managementPlanRepository.findById(gestionPlanId);
    if (!managementPlan) {
      throw new NotFoundError('Plan habilitado (gestión-plan)');
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

    const coursePlanId = planSubject.studyPlanId ?? null;
    const enabledPlanId = managementPlan.studyPlanId ?? null;
    if (coursePlanId == null || enabledPlanId == null || coursePlanId !== enabledPlanId) {
      throw new UnprocessableEntityError(
        'El curso no pertenece al mismo plan de estudios que el plan habilitado en la gestión.',
        [
          { field: 'gestionPlanId', message: 'Incoherencia entre plan del curso y plan habilitado' },
          { field: 'cursoId', message: 'Incoherencia entre plan del curso y plan habilitado' },
        ]
      );
    }

    const existing = await this.teacherAssignmentRepository.findBy({
      managementPlanId: gestionPlanId,
      courseId: cursoId,
      active: true,
    });
    if (existing) {
      throw new ConflictError(
        'Ya existe una asignación vigente para este curso en el plan habilitado. Revise o cancele la anterior antes de crear otra.'
      );
    }

    const planHours = defaultWeeklyHoursFromPlan(planSubject.weeklyHours);
    let hours;
    if (body.cargaHoraria != null && body.cargaHoraria !== '') {
      const carga = Number(body.cargaHoraria);
      hours =
        Number.isFinite(carga) && carga >= 0 ? Math.round(carga) : planHours ?? undefined;
    } else {
      hours = planHours ?? undefined;
    }

    const vigente =
      body.vigente === undefined || body.vigente === null
        ? true
        : body.vigente === true || body.vigente === 'true' || body.vigente === 1 || body.vigente === '1';

    const assignmentDate =
      body.fechaAsignacion != null && String(body.fechaAsignacion).trim() !== ''
        ? body.fechaAsignacion
        : todayDateOnlyLocal();

    const entity = new TeacherAssignment({
      managementPlanId: gestionPlanId,
      courseId: cursoId,
      teacherId: docenteId,
      hours,
      active: vigente,
      assignmentDate,
    });

    const created = await this.teacherAssignmentRepository.create(entity, userId);

    await this.syncMatriculasTeacherAssignmentUseCase.repointAfterAssignmentCreated({
      managementPlanId: gestionPlanId,
      courseId: cursoId,
      newTeacherAssignmentId: created.id,
      userId,
    });

    return {
      asignacion: TeacherAssignmentListMapper.entityToPresentation(created),
    };
  }
}
