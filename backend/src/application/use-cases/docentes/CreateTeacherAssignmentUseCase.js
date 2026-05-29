/**
 * POST — alta de asignación docente sobre oferta_curso (Sprint 4).
 */

import { TeacherAssignment } from '../../../domain/entities/TeacherAssignment.js';
import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { normalizeDocenteColorHex } from '../../mappers/docentes/DocenteColorMapper.js';
import { TeacherAssignmentPresentationMapper } from '../../mappers/docentes/TeacherAssignmentPresentationMapper.js';
import { todayDateOnlyLocal, defaultWeeklyHoursFromPlan } from '../../utils/teacherAssignmentFieldDefaults.js';
import { normalizeTeacherAssignmentBody } from '../../utils/teacherAssignmentPayload.js';
import { resolveTeacherAssignmentOfferContext } from '../../utils/teacherAssignmentOfferContext.js';
import {
  DEFAULT_MAX_HORAS_SEMANA_DOCENTE,
  SEMANAS_EQUIVALENTES_MES_CARGA_DOCENTE,
} from '../../../domain/constants/docentes.constants.js';

export class CreateTeacherAssignmentUseCase {
  constructor({
    teacherAssignmentRepository,
    teacherRepository,
    courseOfferRepository,
    parallelManagementRepository,
    managementPlanRepository,
    planSubjectRepository,
    logger,
  }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.teacherRepository = teacherRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<{ asignacion: Object }>}
   */
  async execute(body, userId = null) {
    const input = normalizeTeacherAssignmentBody(body);
    const gestionPlanId = input.managementPlanId;
    const offerCourseId = input.offerCourseId;
    const docenteId = input.teacherId;

    this.logger.info('[AsignacionesDocentes] Crear asignación', {
      gestionPlanId,
      offerCourseId,
      docenteId,
      userId,
    });

    if (
      !Number.isFinite(gestionPlanId) ||
      gestionPlanId < 1 ||
      !Number.isFinite(offerCourseId) ||
      offerCourseId < 1 ||
      !Number.isFinite(docenteId) ||
      docenteId < 1
    ) {
      throw new UnprocessableEntityError(
        'gestion_plan_id, oferta_curso_id y docente_id deben ser enteros positivos.',
        [
          { field: 'gestion_plan_id', message: 'Inválido' },
          { field: 'oferta_curso_id', message: 'Inválido' },
          { field: 'docente_id', message: 'Inválido' },
        ]
      );
    }

    const teacher = await this.teacherRepository.findById(docenteId);
    if (!teacher) {
      throw new NotFoundError('Docente');
    }

    const teacherPlain = teacher.toPlainObject ? teacher.toPlainObject() : teacher;
    if (!normalizeDocenteColorHex(teacherPlain.colorHex)) {
      throw new UnprocessableEntityError(
        'El docente debe tener un color asignado antes de vincularlo a un curso.',
        [{ field: 'docente_id', message: 'color_hex requerido' }],
        { requiere_color: true }
      );
    }

    const { planSubject, weeklyHours } = await resolveTeacherAssignmentOfferContext({
      courseOfferRepository: this.courseOfferRepository,
      parallelManagementRepository: this.parallelManagementRepository,
      planSubjectRepository: this.planSubjectRepository,
      managementPlanRepository: this.managementPlanRepository,
      offerCourseId,
      managementPlanId: gestionPlanId,
    });

    const planHours = defaultWeeklyHoursFromPlan(weeklyHours ?? planSubject.weeklyHours);
    let hours;
    if (input.hours !== undefined) {
      if (input.hours === null) {
        hours = planHours ?? undefined;
      } else {
        const carga = Number(input.hours);
        hours = Number.isFinite(carga) && carga >= 0 ? Math.round(carga) : planHours ?? undefined;
      }
    } else {
      hours = planHours ?? undefined;
    }

    await this._assertWorkloadAllowed(docenteId, gestionPlanId, hours ?? 0, input.confirmOverload);

    const vigente = input.active !== undefined ? input.active : true;

    if (vigente) {
      await this.teacherAssignmentRepository.retireVigenteForOffer(offerCourseId, null, userId);
    }

    const assignmentDate =
      input.assignmentDate != null && String(input.assignmentDate).trim() !== ''
        ? input.assignmentDate
        : todayDateOnlyLocal();

    const entity = new TeacherAssignment({
      managementPlanId: gestionPlanId,
      offerCourseId,
      teacherId: docenteId,
      hours,
      active: vigente,
      assignmentDate,
    });

    const created = await this.teacherAssignmentRepository.create(entity, userId);
    const enriched = await this.teacherAssignmentRepository.findEnrichedById(created.id);

    return {
      asignacion: enriched
        ? TeacherAssignmentPresentationMapper.enrichedRowToLegacyPresentation(enriched)
        : TeacherAssignmentPresentationMapper.entityToLegacyPresentation(created),
    };
  }

  async _assertWorkloadAllowed(teacherId, managementPlanId, additionalHours, confirmOverload) {
    const limites = await this.teacherRepository.findCargaLimitesById(teacherId);
    if (!limites) return;

    const managementPlan = await this.managementPlanRepository.findById(managementPlanId);
    const gestionId = managementPlan?.managementId ?? managementPlan?.gestionId;
    if (!gestionId) return;

    const asignaciones = await this.teacherAssignmentRepository.findCargaDetalleByDocenteAndGestion(
      teacherId,
      gestionId
    );
    const currentWeek = asignaciones.reduce((sum, row) => sum + (Number(row.horas) || 0), 0);
    const projected = currentWeek + (Number(additionalHours) || 0);
    const maxWeek = limites.maxHorasSemana ?? DEFAULT_MAX_HORAS_SEMANA_DOCENTE;

    if (projected > maxWeek && !confirmOverload) {
      throw new UnprocessableEntityError(
        `La asignación supera el máximo semanal del docente (${projected}/${maxWeek} h). Confirme para continuar.`,
        [{ field: 'carga_horaria', message: 'Sobrecarga detectada' }],
        {
          sobrecarga: true,
          carga_actual_semana: currentWeek,
          carga_proyectada_semana: projected,
          max_horas_semana: maxWeek,
          max_horas_mes: limites.maxHorasMes ?? maxWeek * SEMANAS_EQUIVALENTES_MES_CARGA_DOCENTE,
        }
      );
    }
  }
}
