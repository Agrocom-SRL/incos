/**
 * Alta de una actividad del cronograma (calendario académico).
 * Persiste sobre `actividades_calendario` vía CalendarActivityRepository.
 */

const toDomain = (payload = {}) => ({
  academicPeriodId: payload.periodoAcademicoId ?? null,
  activityId: payload.actividadId ?? null,
  customName: payload.nombrePersonalizado ?? null,
  startDate: payload.fechaInicio,
  endDate: payload.fechaFin ?? null,
  isAllDay: !payload.fechaFin,
  careerIds: payload.carrerasIds ?? null,
});

const validar = (payload) => {
  if (!payload.actividadId && !payload.nombrePersonalizado) {
    const err = new Error('Debe seleccionar una actividad del catálogo o indicar un nombre.');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
};

export class CreateActividadCronogramaUseCase {
  constructor({ calendarActivityRepository, logger }) {
    this.calendarActivityRepository = calendarActivityRepository;
    this.logger = logger;
  }

  async execute(payload, userId = null) {
    validar(payload);
    const entity = await this.calendarActivityRepository.create(toDomain(payload), userId);
    this.logger?.info?.('[Institucional] Actividad de cronograma creada', {
      id: entity?.id,
      periodoAcademicoId: payload.periodoAcademicoId,
    });
    return entity;
  }
}
