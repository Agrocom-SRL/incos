/**
 * Baja (soft delete) de una actividad del cronograma.
 */
export class DeleteActividadCronogramaUseCase {
  constructor({ calendarActivityRepository, logger }) {
    this.calendarActivityRepository = calendarActivityRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const existente = await this.calendarActivityRepository.findById(id);
    if (!existente) {
      const err = new Error('La actividad de cronograma no existe');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    await this.calendarActivityRepository.delete(id, userId);
    this.logger?.info?.('[Institucional] Actividad de cronograma eliminada', { id });
    return { id };
  }
}
