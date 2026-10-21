import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import {
  criterioHorarioExacto,
  esHorarioCapacitacion,
  horarioEntityToFila,
  parseDatosHorario,
} from './helpers/horarioCapacitacionInput.js';

/**
 * Use Case: UpdateHorarioCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Edita día y horas de un horario de capacitación. Solo horarios tipo
 * CAPACITACION; rechaza (409) un duplicado exacto (mismo día y horas) de otro
 * horario activo.
 */
export class UpdateHorarioCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.scheduleRepository
   * @param {ILogger} params.logger
   */
  constructor({ scheduleRepository, logger }) {
    this.scheduleRepository = scheduleRepository;
    this.logger = logger;
  }

  /**
   * @param {number|string} id - ID del horario
   * @param {Object} body - { dia, horaInicio, horaFin }
   * @param {number|null} userId - Usuario que edita (auditoría)
   * @returns {Promise<{horario: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    const horarioId = parseIdPositivo(id, 'id del horario');
    const existente = await this.scheduleRepository.findById(horarioId);
    if (!esHorarioCapacitacion(existente)) throw new NotFoundError('horario de capacitación');

    const datos = parseDatosHorario(body);
    const duplicado = await this.scheduleRepository.findBy(criterioHorarioExacto(datos));
    if (duplicado && duplicado.id !== horarioId) {
      throw new ConflictError(
        `Ya existe un horario de capacitación ${datos.dia} ${datos.horaInicio.slice(0, 5)}-${datos.horaFin.slice(0, 5)} (ID ${duplicado.id})`
      );
    }

    const actualizado = await this.scheduleRepository.update(
      horarioId,
      { name: datos.nombre, day: datos.dia, startTime: datos.horaInicio, endTime: datos.horaFin },
      userId
    );

    this.logger.info('[Capacitación] Horario de capacitación actualizado', { id: horarioId });
    return {
      horario: CursoCapacitacionMapper.horarioCatalogoToPresentation(horarioEntityToFila(actualizado)),
    };
  }
}
