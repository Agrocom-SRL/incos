/**
 * Edición de una actividad del cronograma. Solo envía al repositorio los campos
 * presentes en el payload (mapDataToUpdate respeta `in`).
 */

const toDomainUpdate = (payload = {}) => {
  const data = {};
  if ('periodoAcademicoId' in payload) data.academicPeriodId = payload.periodoAcademicoId ?? null;
  if ('actividadId' in payload) data.activityId = payload.actividadId ?? null;
  if ('nombrePersonalizado' in payload) data.customName = payload.nombrePersonalizado ?? null;
  if ('fechaInicio' in payload) data.startDate = payload.fechaInicio;
  if ('fechaFin' in payload) data.endDate = payload.fechaFin ?? null;
  if ('suspendeClases' in payload) data.suspendsClasses = payload.suspendeClases ?? false;
  if ('carrerasIds' in payload) data.careerIds = payload.carrerasIds ?? null;
  return data;
};

export class UpdateActividadCronogramaUseCase {
  constructor({ calendarActivityRepository, logger }) {
    this.calendarActivityRepository = calendarActivityRepository;
    this.logger = logger;
  }

  async execute(id, payload, userId = null) {
    const existente = await this.calendarActivityRepository.findById(id);
    if (!existente) {
      const err = new Error('La actividad de cronograma no existe');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const entity = await this.calendarActivityRepository.update(id, toDomainUpdate(payload), userId);
    this.logger?.info?.('[Institucional] Actividad de cronograma actualizada', { id });
    return entity;
  }
}
