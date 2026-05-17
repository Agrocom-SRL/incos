import { TeacherAssignment } from '../../../domain/entities/TeacherAssignment.js';
import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { TeacherAssignmentListMapper } from '../../mappers/docentes/TeacherAssignmentListMapper.js';
import {
  todayDateOnlyLocal,
  defaultWeeklyHoursFromPlan,
} from '../../utils/teacherAssignmentFieldDefaults.js';

export class AssignTeacherToCourseUseCase {
  constructor({
    teacherAssignmentRepository,
    teacherRepository,
    courseRepository,
    courseScheduleRepository,
    planSubjectRepository,
    managementPlanRepository,
    managementRepository,
    syncMatriculasTeacherAssignmentUseCase,
    logger,
  }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.teacherRepository = teacherRepository;
    this.courseRepository = courseRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.managementRepository = managementRepository;
    this.syncMatriculasTeacherAssignmentUseCase = syncMatriculasTeacherAssignmentUseCase;
    this.logger = logger;
  }

  async execute(body, userId = null) {
    const cursoId = Number(body?.cursoId);
    const docenteId = Number(body?.docenteId);
    const requestedGestionPlanId = Number(body?.gestionPlanId);

    if (!Number.isFinite(cursoId) || cursoId < 1 || !Number.isFinite(docenteId) || docenteId < 1) {
      throw new UnprocessableEntityError('cursoId y docenteId deben ser enteros positivos.', [
        { field: 'cursoId', message: 'Inválido' },
        { field: 'docenteId', message: 'Inválido' },
      ]);
    }

    const [course, teacher] = await Promise.all([
      this.courseRepository.findById(cursoId),
      this.teacherRepository.findById(docenteId),
    ]);
    if (!course) throw new NotFoundError('Curso');
    if (!teacher) throw new NotFoundError('Docente');

    const planSubjectId = course.planSubjectId;
    if (!planSubjectId) {
      throw new UnprocessableEntityError('El curso no tiene asignatura de plan vinculada.', [
        { field: 'cursoId', message: 'asignatura_plan_id es requerido' },
      ]);
    }

    const planSubject = await this.planSubjectRepository.findById(planSubjectId);
    if (!planSubject) throw new NotFoundError('Asignatura del plan');

    const managementPlanId = await this.resolveManagementPlanId({
      requestedGestionPlanId,
      courseStudyPlanId: planSubject.studyPlanId,
    });

    const vigente =
      body?.vigente === undefined || body?.vigente === null
        ? true
        : body.vigente === true || body.vigente === 'true' || body.vigente === 1 || body.vigente === '1';

    const existing = await this.teacherAssignmentRepository.findBy({
      managementPlanId,
      courseId: cursoId,
      active: true,
    });

    const planHours = defaultWeeklyHoursFromPlan(planSubject.weeklyHours);

    let asignacion;
    if (existing) {
      const patch = {
        teacherId: docenteId,
        active: vigente,
      };

      const prevDocente = existing.teacherId != null ? Number(existing.teacherId) : null;
      const docenteCambio = prevDocente !== docenteId;
      const sinFecha =
        existing.assignmentDate == null ||
        existing.assignmentDate === '' ||
        (typeof existing.assignmentDate === 'string' && String(existing.assignmentDate).trim() === '');

      if (docenteCambio || sinFecha) {
        patch.assignmentDate = todayDateOnlyLocal();
      }

      const sinCarga = existing.hours == null || existing.hours === '';
      if (sinCarga && planHours != null) {
        patch.hours = planHours;
      }

      const updated = await this.teacherAssignmentRepository.update(
        existing.id,
        new TeacherAssignment(patch),
        userId
      );
      asignacion = TeacherAssignmentListMapper.entityToPresentation(updated);
    } else {
      const created = await this.teacherAssignmentRepository.create(
        new TeacherAssignment({
          managementPlanId,
          courseId: cursoId,
          teacherId: docenteId,
          active: vigente,
          hours: planHours ?? undefined,
          assignmentDate: todayDateOnlyLocal(),
        }),
        userId
      );
      await this.syncMatriculasTeacherAssignmentUseCase.repointAfterAssignmentCreated({
        managementPlanId,
        courseId: cursoId,
        newTeacherAssignmentId: created.id,
        userId,
      });
      asignacion = TeacherAssignmentListMapper.entityToPresentation(created);
    }

    const warnings = await this.collectWarnings(cursoId);
    return { asignacion, warnings };
  }

  async resolveManagementPlanId({ requestedGestionPlanId, courseStudyPlanId }) {
    if (!courseStudyPlanId) {
      throw new UnprocessableEntityError('No se pudo resolver el plan de estudios del curso.', [
        { field: 'cursoId', message: 'No existe plan_estudio_id relacionado' },
      ]);
    }

    if (Number.isFinite(requestedGestionPlanId) && requestedGestionPlanId > 0) {
      const requested = await this.managementPlanRepository.findById(requestedGestionPlanId);
      if (!requested) throw new NotFoundError('Plan habilitado (gestión-plan)');
      if (Number(requested.studyPlanId) !== Number(courseStudyPlanId)) {
        throw new UnprocessableEntityError(
          'El curso no pertenece al mismo plan de estudios que el plan habilitado enviado.',
          [{ field: 'gestionPlanId', message: 'Incoherencia con el curso' }]
        );
      }
      return requested.id;
    }

    const management = await this.managementRepository.findBy({ vigente: true, isActive: true });
    if (management?.id) {
      const fromCurrentManagement = await this.managementPlanRepository.findBy({
        managementId: management.id,
        studyPlanId: courseStudyPlanId,
        state: 'VIGENTE',
      });
      if (fromCurrentManagement?.id) return fromCurrentManagement.id;
    }

    const candidates = await this.managementPlanRepository.findAll({
      studyPlanId: courseStudyPlanId,
      state: 'VIGENTE',
      includeInactive: true,
    });
    const rows = candidates?.managementPlans || [];
    const fallback = rows.sort((a, b) => Number(b.id || 0) - Number(a.id || 0))[0];
    if (!fallback?.id) {
      throw new UnprocessableEntityError(
        'No existe un plan habilitado vigente para el plan de estudios del curso.',
        [{ field: 'cursoId', message: 'Sin gestion_plan vigente' }]
      );
    }
    return fallback.id;
  }

  async collectWarnings(cursoId) {
    const warnings = [];
    const scheduleResult = await this.courseScheduleRepository.findAll({
      courseId: cursoId,
      includeInactive: false,
    });
    const rows = scheduleResult?.courseSchedules || [];
    if (!rows.length) {
      warnings.push({
        code: 'COURSE_WITHOUT_SCHEDULE',
        message:
          'La materia no tiene bloques horarios asignados. Podés continuar, pero revisá "Gestión de cursos" y luego "Plan semanal".',
        suggestedTab: 'gestion',
      });
    }
    return warnings;
  }
}
