/**
 * PUT /api/v1/paralelos/:id/schedule
 *
 * Persiste el plan semanal del paralelo (bloques) en `cursos_horarios`.
 * Por ahora se omiten aulas (`aula_id` siempre NULL).
 */
export class PutParaleloScheduleController {
  constructor({ putParaleloScheduleUseCase, logger, responseFormatter }) {
    if (!putParaleloScheduleUseCase) throw new Error('putParaleloScheduleUseCase es requerido');
    if (!logger) throw new Error('logger es requerido');
    if (!responseFormatter) throw new Error('responseFormatter es requerido');
    this.useCase = putParaleloScheduleUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const paraleloId = Number(req.params.id);
      const body = req.body || {};
      const schedules = body.schedules ?? body.schedule ?? body.courseSchedules ?? null;

      this.logger.info('[Académico] Request persistir plan semanal de paralelo', {
        paraleloId,
        schedulesCount: Array.isArray(schedules) ? schedules.length : null,
      });

      const result = await this.useCase.execute({ paraleloId, schedules });
      return this.responseFormatter.updated(res, result, 'plan semanal del paralelo', paraleloId, req);
    } catch (err) {
      return next(err);
    }
  }
}

