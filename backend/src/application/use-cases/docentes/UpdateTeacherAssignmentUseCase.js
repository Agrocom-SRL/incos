/**
 * PATCH/PUT — edición de asignación docente sobre oferta_curso.
 */

import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { TeacherAssignment } from '../../../domain/entities/TeacherAssignment.js';
import { normalizeDocenteColorHex } from '../../mappers/docentes/DocenteColorMapper.js';
import { TeacherAssignmentPresentationMapper } from '../../mappers/docentes/TeacherAssignmentPresentationMapper.js';
import { todayDateOnlyLocal, defaultWeeklyHoursFromPlan } from '../../utils/teacherAssignmentFieldDefaults.js';
import { normalizeTeacherAssignmentBody } from '../../utils/teacherAssignmentPayload.js';
import { resolveTeacherAssignmentOfferContext } from '../../utils/teacherAssignmentOfferContext.js';

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

export class UpdateTeacherAssignmentUseCase {
  constructor({
    teacherAssignmentRepository,
    teacherRepository,
    courseOfferRepository,
    parallelManagementRepository,
    planSubjectRepository,
    managementPlanRepository,
    logger,
  }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.teacherRepository = teacherRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.logger = logger;
  }

  async execute(assignmentId, body, userId = null) {
    const id = Number(assignmentId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('Asignación docente');
    }

    this.logger.info('[AsignacionesDocentes] Actualizar asignación', { assignmentId: id, userId });

    const existing = await this.teacherAssignmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Asignación docente');
    }

    const existingPlain = existing.toPlainObject ? existing.toPlainObject() : existing;
    const payload = body || {};
    const normalized = normalizeTeacherAssignmentBody(payload);
    const updateData = {};

    if (hasOwn(payload, 'docenteId') || hasOwn(payload, 'docente_id')) {
      const docenteId = normalized.teacherId;
      if (!Number.isFinite(docenteId) || docenteId < 1) {
        throw new UnprocessableEntityError('docente_id debe ser un entero positivo.', [
          { field: 'docente_id', message: 'Inválido' },
        ]);
      }
      const teacher = await this.teacherRepository.findById(docenteId);
      if (!teacher) {
        throw new NotFoundError('Docente');
      }
      const tp = teacher.toPlainObject ? teacher.toPlainObject() : teacher;
      if (!normalizeDocenteColorHex(tp.colorHex)) {
        throw new UnprocessableEntityError(
          'El docente debe tener un color asignado.',
          [{ field: 'docente_id', message: 'color_hex requerido' }],
          { requiere_color: true }
        );
      }
      updateData.teacherId = docenteId;
    }

    if (hasOwn(payload, 'ofertaCursoId') || hasOwn(payload, 'oferta_curso_id')) {
      const offerCourseId = normalized.offerCourseId;
      if (!Number.isFinite(offerCourseId) || offerCourseId < 1) {
        throw new UnprocessableEntityError('oferta_curso_id debe ser un entero positivo.', [
          { field: 'oferta_curso_id', message: 'Inválido' },
        ]);
      }
      const managementPlanId = existingPlain.managementPlanId;
      await resolveTeacherAssignmentOfferContext({
        courseOfferRepository: this.courseOfferRepository,
        parallelManagementRepository: this.parallelManagementRepository,
        planSubjectRepository: this.planSubjectRepository,
        managementPlanRepository: this.managementPlanRepository,
        offerCourseId,
        managementPlanId,
      });
      updateData.offerCourseId = offerCourseId;
    }

    if (hasOwn(payload, 'cargaHoraria') || hasOwn(payload, 'carga_horaria')) {
      if (normalized.hours === null) {
        updateData.hours = null;
      } else if (normalized.hours !== undefined) {
        const hours = Number(normalized.hours);
        if (!Number.isFinite(hours) || hours < 0 || hours > 200) {
          throw new UnprocessableEntityError('carga_horaria debe estar entre 0 y 200.', [
            { field: 'carga_horaria', message: 'Inválido' },
          ]);
        }
        updateData.hours = Math.round(hours);
      }
    }

    if (hasOwn(payload, 'vigente')) {
      updateData.active = normalized.active !== undefined ? normalized.active : true;
    }

    if (hasOwn(payload, 'motivo')) {
      updateData.reason = normalized.reason ?? null;
    }

    if (hasOwn(payload, 'fechaAsignacion') || hasOwn(payload, 'fecha_asignacion')) {
      updateData.assignmentDate = normalized.assignmentDate ?? null;
    }

    if (updateData.teacherId !== undefined) {
      const prev = existingPlain.teacherId != null ? Number(existingPlain.teacherId) : null;
      const next = updateData.teacherId != null ? Number(updateData.teacherId) : null;
      const docenteCambio = prev !== next;
      if (docenteCambio && !hasOwn(payload, 'fechaAsignacion') && !hasOwn(payload, 'fecha_asignacion')) {
        updateData.assignmentDate = todayDateOnlyLocal();
      }
      if (
        docenteCambio &&
        !hasOwn(payload, 'cargaHoraria') &&
        !hasOwn(payload, 'carga_horaria') &&
        (existingPlain.hours == null || existingPlain.hours === '')
      ) {
        const offerId = updateData.offerCourseId ?? existingPlain.offerCourseId;
        if (offerId) {
          const ctx = await resolveTeacherAssignmentOfferContext({
            courseOfferRepository: this.courseOfferRepository,
            parallelManagementRepository: this.parallelManagementRepository,
            planSubjectRepository: this.planSubjectRepository,
            managementPlanRepository: this.managementPlanRepository,
            offerCourseId: offerId,
            managementPlanId: existingPlain.managementPlanId,
          });
          const ph = defaultWeeklyHoursFromPlan(ctx.weeklyHours);
          if (ph != null) updateData.hours = ph;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new UnprocessableEntityError('No hay campos válidos para actualizar.', [
        { field: 'body', message: 'Vacío' },
      ]);
    }

    if (updateData.active === false && updateData.reason === undefined) {
      updateData.reason = 'Baja manual de asignación';
    }

    const targetOfferId = updateData.offerCourseId ?? existingPlain.offerCourseId;
    const willBeVigente = updateData.active !== false && existingPlain.active !== false;
    if (willBeVigente && updateData.active === true && targetOfferId) {
      await this.teacherAssignmentRepository.retireVigenteForOffer(targetOfferId, id, userId);
    }

    const updated = await this.teacherAssignmentRepository.update(
      id,
      new TeacherAssignment(updateData),
      userId
    );
    if (!updated) {
      throw new NotFoundError('Asignación docente');
    }

    const enriched = await this.teacherAssignmentRepository.findEnrichedById(id);
    return {
      asignacion: enriched
        ? TeacherAssignmentPresentationMapper.enrichedRowToLegacyPresentation(enriched)
        : TeacherAssignmentPresentationMapper.entityToLegacyPresentation(updated),
    };
  }
}
