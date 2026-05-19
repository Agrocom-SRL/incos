/**
 * PUT /api/v1/inscripciones/:id
 * Controller para actualizar una inscripción existente
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP PUT para actualizar inscripciones
 * - Preparar datos del body para el use case
 * - Delegar lógica de negocio a UpdateEnrollmentUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Body (todos opcionales - actualización parcial):
 * - observations: Observaciones
 * - enrollment_date: Fecha de inscripción (YYYY-MM-DD)
 * - parallel_id: Para tipo NUEVO, nuevo paralelo (reemplaza materias por las del paralelo)
 * - teacher_assignment_ids: Para ANTIGUO, array de IDs de asignaciones docentes (reemplaza materias)
 */
export class UpdateEnrollmentController {
  constructor({ updateEnrollmentUseCase, logger, responseFormatter }) {
    this.updateEnrollmentUseCase = updateEnrollmentUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    const enrollmentId = Number(req.params.id);
    const body = req.body || {};

    try {
      const data = this.prepareData(body);
      const updated = await this.updateEnrollmentUseCase.execute(enrollmentId, data);
      return this.responseFormatter.updated(
        res,
        { enrollment: updated },
        'inscripción',
        enrollmentId,
        req
      );
    } catch (error) {
      next(error);
    }
  }

  prepareData(body) {
    const data = {
      observations: body.observations ?? body.observaciones ?? undefined,
      enrollmentDate: body.enrollment_date ?? body.enrollmentDate ?? body.fechaInscripcion ?? undefined,
      parallelId: body.parallel_id ?? body.parallelId ?? undefined,
      teacherAssignmentIds: Array.isArray(body.teacher_assignment_ids)
        ? body.teacher_assignment_ids
        : Array.isArray(body.teacherAssignmentIds)
          ? body.teacherAssignmentIds
          : undefined,
    };
    if (body.parallel_ids_by_period != null && typeof body.parallel_ids_by_period === 'object') {
      data.parallelIdsByPeriod = body.parallel_ids_by_period;
    }
    if (body.materia_ids_by_period != null && typeof body.materia_ids_by_period === 'object') {
      data.materiaIdsByPeriod = body.materia_ids_by_period;
    }
    if (body.prior_history !== undefined) {
      data.priorHistory = body.prior_history;
    } else if (body.priorHistory !== undefined) {
      data.priorHistory = body.priorHistory;
    }
    return data;
  }
}
