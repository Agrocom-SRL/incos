import { ValidationError } from '../../../domain/errors/AppError.js';
import { parseFechaISO, parseIdOpcional } from '../../utils/validacionEntrada.js';
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
  // "Todo el día" se deriva de no tener fechaFin (no se persiste). Solo se guarda si
  // el día suspende clases (feriado/receso/vacaciones).
  suspendsClasses: payload.suspendeClases ?? false,
  careerIds: payload.carrerasIds ?? null,
});

const validar = (payload) => {
  if (!payload.actividadId && !payload.nombrePersonalizado) {
    const err = new Error('Debe seleccionar una actividad del catálogo o indicar un nombre.');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (payload.fechaInicio == null || payload.fechaInicio === '') {
    throw new ValidationError('fechaInicio es obligatoria');
  }
  const fechaInicio = parseFechaISO(payload.fechaInicio, 'fechaInicio');
  const tieneFin = payload.fechaFin != null && payload.fechaFin !== '';
  const fechaFin = tieneFin ? parseFechaISO(payload.fechaFin, 'fechaFin') : null;
  if (fechaFin && fechaFin < fechaInicio) {
    throw new ValidationError('fechaFin no puede ser anterior a fechaInicio');
  }
  return {
    ...payload,
    fechaInicio,
    fechaFin,
    periodoAcademicoId: parseIdOpcional(payload.periodoAcademicoId, 'periodoAcademicoId'),
    actividadId: parseIdOpcional(payload.actividadId, 'actividadId'),
  };
};

export class CreateActividadCronogramaUseCase {
  constructor({ calendarActivityRepository, logger }) {
    this.calendarActivityRepository = calendarActivityRepository;
    this.logger = logger;
  }

  async execute(payload, userId = null) {
    const normalizado = validar(payload);
    const entity = await this.calendarActivityRepository.create(toDomain(normalizado), userId);
    this.logger?.info?.('[Institucional] Actividad de cronograma creada', {
      id: entity?.id,
      periodoAcademicoId: payload.periodoAcademicoId,
    });
    return entity;
  }
}
