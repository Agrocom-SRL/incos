/**
 * POST /api/v1/docentes/asignaciones/curso — asignación rápida sobre oferta_curso.
 */

import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { TeacherAssignment } from '../../../domain/entities/TeacherAssignment.js';
import { TeacherAssignmentPresentationMapper } from '../../mappers/docentes/TeacherAssignmentPresentationMapper.js';
import { todayDateOnlyLocal, defaultWeeklyHoursFromPlan } from '../../utils/teacherAssignmentFieldDefaults.js';
import { normalizeTeacherAssignmentBody } from '../../utils/teacherAssignmentPayload.js';
import { resolveTeacherAssignmentOfferContext } from '../../utils/teacherAssignmentOfferContext.js';
import { normalizeDocenteColorHex } from '../../mappers/docentes/DocenteColorMapper.js';

export class AssignTeacherToCourseUseCase {
  constructor({
    teacherAssignmentRepository,
    teacherRepository,
    courseOfferRepository,
    parallelManagementRepository,
    planSubjectRepository,
    managementPlanRepository,
    managementRepository,
    createTeacherAssignmentUseCase,
    logger,
  }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.teacherRepository = teacherRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.managementRepository = managementRepository;
    this.createTeacherAssignmentUseCase = createTeacherAssignmentUseCase;
    this.logger = logger;
  }

  async execute(body, userId = null) {
    const input = normalizeTeacherAssignmentBody(body);
    const offerCourseId = input.offerCourseId;
    const docenteId = input.teacherId;

    if (!Number.isFinite(offerCourseId) || offerCourseId < 1 || !Number.isFinite(docenteId) || docenteId < 1) {
      throw new UnprocessableEntityError(
        'oferta_curso_id y docente_id deben ser enteros positivos.',
        [
          { field: 'oferta_curso_id', message: 'Inválido' },
          { field: 'docente_id', message: 'Inválido' },
        ]
      );
    }

    const teacher = await this.teacherRepository.findById(docenteId);
    if (!teacher) throw new NotFoundError('Docente');

    const tp = teacher.toPlainObject ? teacher.toPlainObject() : teacher;
    if (!normalizeDocenteColorHex(tp.colorHex)) {
      throw new UnprocessableEntityError(
        'El docente debe tener color asignado.',
        [{ field: 'docente_id', message: 'color_hex requerido' }],
        { requiere_color: true }
      );
    }

    let gestionPlanId = input.managementPlanId;
    if (!Number.isFinite(gestionPlanId) || gestionPlanId < 1) {
      gestionPlanId = await this._resolveManagementPlanIdFromOffer(offerCourseId);
    }

    const ctx = await resolveTeacherAssignmentOfferContext({
      courseOfferRepository: this.courseOfferRepository,
      parallelManagementRepository: this.parallelManagementRepository,
      planSubjectRepository: this.planSubjectRepository,
      managementPlanRepository: this.managementPlanRepository,
      offerCourseId,
      managementPlanId: gestionPlanId,
    });

    const existing = await this.teacherAssignmentRepository.findBy({
      managementPlanId: gestionPlanId,
      offerCourseId,
      active: true,
    });

    if (!existing) {
      const created = await this.createTeacherAssignmentUseCase.execute(
        {
          gestion_plan_id: gestionPlanId,
          oferta_curso_id: offerCourseId,
          docente_id: docenteId,
          carga_horaria: input.hours,
          vigente: input.active ?? true,
          confirmar_sobrecarga: input.confirmOverload,
        },
        userId
      );
      return { asignacion: created.asignacion, warnings: [] };
    }

    const planHours = defaultWeeklyHoursFromPlan(ctx.weeklyHours);
    const patch = {
      teacherId: docenteId,
      active: input.active !== undefined ? input.active : true,
    };

    const prevDocente = existing.teacherId != null ? Number(existing.teacherId) : null;
    if (prevDocente !== docenteId) {
      patch.assignmentDate = todayDateOnlyLocal();
    }
    if (input.hours !== undefined) {
      patch.hours = input.hours;
    } else if (existing.hours == null || existing.hours === '') {
      patch.hours = planHours ?? undefined;
    }

    const updated = await this.teacherAssignmentRepository.update(
      existing.id,
      new TeacherAssignment(patch),
      userId
    );

    const enriched = await this.teacherAssignmentRepository.findEnrichedById(existing.id);
    return {
      asignacion: enriched
        ? TeacherAssignmentPresentationMapper.enrichedRowToLegacyPresentation(enriched)
        : TeacherAssignmentPresentationMapper.entityToLegacyPresentation(updated),
      warnings: [],
    };
  }

  async _resolveManagementPlanIdFromOffer(offerCourseId) {
    const offer = await this.courseOfferRepository.findById(offerCourseId);
    if (!offer) throw new NotFoundError('Oferta de curso');

    const offerPlain = offer.toPlainObject ? offer.toPlainObject() : offer;
    const pgId = offerPlain.parallelManagementId ?? offerPlain.paraleloGestionId;
    const pg = await this.parallelManagementRepository.findById(pgId);
    if (!pg) throw new NotFoundError('Paralelo-gestión');

    const pgPlain = pg.toPlainObject ? pg.toPlainObject() : pg;
    const gpId = pgPlain.managementPlanId ?? pgPlain.gestionPlanId;
    if (!gpId) {
      throw new UnprocessableEntityError('No se pudo resolver gestion_plan_id desde la oferta.', [
        { field: 'oferta_curso_id', message: 'Sin plan habilitado' },
      ]);
    }
    return Number(gpId);
  }
}
