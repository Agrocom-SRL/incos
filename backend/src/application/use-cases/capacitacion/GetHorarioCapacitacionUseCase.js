import { NotFoundError } from '../../../domain/errors/AppError.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import { esHorarioCapacitacion, horarioEntityToFila } from './helpers/horarioCapacitacionInput.js';

/**
 * Use Case: GetHorarioCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Ficha de un horario de capacitación con los cursos vigentes que lo usan
 * (`cursosEnUso` y `cursos[{id, titulo}]`). Un horario que no es de tipo
 * CAPACITACION no pertenece a este recurso (404).
 */
export class GetHorarioCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.scheduleRepository
   * @param {Object} params.bloqueCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ scheduleRepository, bloqueCapacitacionRepository, logger }) {
    this.scheduleRepository = scheduleRepository;
    this.bloqueCapacitacionRepository = bloqueCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number|string} id - ID del horario
   * @returns {Promise<Object>} Horario en presentación + cursos que lo usan
   */
  async execute(id) {
    const horarioId = parseIdPositivo(id, 'id del horario');
    const horario = await this.scheduleRepository.findById(horarioId);
    if (!esHorarioCapacitacion(horario)) throw new NotFoundError('horario de capacitación');

    const cursos = await this.bloqueCapacitacionRepository.findCursosQueUsanHorario(horarioId);
    this.logger.info('[Capacitación] Ficha de horario obtenida', { id: horarioId, cursos: cursos.length });

    return {
      ...CursoCapacitacionMapper.horarioCatalogoToPresentation(
        horarioEntityToFila(horario, cursos.length)
      ),
      cursos,
    };
  }
}
