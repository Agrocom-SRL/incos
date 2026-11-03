import { ValidationError } from '../../../domain/errors/AppError.js';
import { parseFechaISO, parseIdOpcional } from '../../utils/validacionEntrada.js';
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

const esVacio = (v) => v == null || v === '';

/** Normaliza y valida fechas/ids presentes; comprueba el rango con lo ya guardado. */
const validar = (payload = {}, existente = {}) => {
  const data = { ...payload };
  if ('fechaInicio' in data) {
    if (esVacio(data.fechaInicio)) throw new ValidationError('fechaInicio no puede estar vacía');
    data.fechaInicio = parseFechaISO(data.fechaInicio, 'fechaInicio');
  }
  if ('fechaFin' in data && !esVacio(data.fechaFin)) {
    data.fechaFin = parseFechaISO(data.fechaFin, 'fechaFin');
  } else if ('fechaFin' in data) {
    data.fechaFin = null;
  }
  if ('periodoAcademicoId' in data) data.periodoAcademicoId = parseIdOpcional(data.periodoAcademicoId, 'periodoAcademicoId');
  if ('actividadId' in data) data.actividadId = parseIdOpcional(data.actividadId, 'actividadId');

  const inicio = data.fechaInicio ?? (existente.startDate ? parseFechaISO(existente.startDate, 'fechaInicio') : null);
  const fin = 'fechaFin' in data
    ? data.fechaFin
    : (existente.endDate ? parseFechaISO(existente.endDate, 'fechaFin') : null);
  if (inicio && fin && fin < inicio) {
    throw new ValidationError('fechaFin no puede ser anterior a fechaInicio');
  }
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
    const entity = await this.calendarActivityRepository.update(
      id,
      toDomainUpdate(validar(payload, existente)),
      userId,
    );
    this.logger?.info?.('[Institucional] Actividad de cronograma actualizada', { id });
    return entity;
  }
}
