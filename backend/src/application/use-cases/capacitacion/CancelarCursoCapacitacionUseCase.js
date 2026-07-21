import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';
import { ESTADOS_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { resolveEstadoEfectivoCurso } from './helpers/cursoEstadoEfectivo.js';

/**
 * Use Case: CancelarCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Transición manual de negocio hacia CANCELADO. Solo permitida si el estado
 * EFECTIVO actual es PROPUESTO o ABIERTO (no se puede cancelar un curso
 * EN_CURSO o CERRADO). No confundir con `SetEstadoCursoCapacitacionUseCase`
 * (ese es el toggle booleano `activo`).
 */
export class CancelarCursoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ cursoCapacitacionRepository, logger }) {
    this.cursoCapacitacionRepository = cursoCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del curso
   * @param {number|null} userId - Usuario que realiza el cambio (auditoría)
   * @returns {Promise<{cursoCapacitacion: Object}>}
   */
  async execute(id, userId = null) {
    const curso = await this.cursoCapacitacionRepository.findById(id);
    if (!curso) throw new NotFoundError('curso de capacitación');

    const efectivo = resolveEstadoEfectivoCurso(curso.estado, curso.fechaInicio, curso.fechaFin);
    if (![ESTADOS_CAPACITACION.PROPUESTO, ESTADOS_CAPACITACION.ABIERTO].includes(efectivo)) {
      throw new ConflictError(
        `El curso "${curso.titulo}" ya no puede cancelarse (estado actual: ${efectivo})`
      );
    }

    const updated = await this.cursoCapacitacionRepository.update(
      id,
      { estado: ESTADOS_CAPACITACION.CANCELADO },
      userId
    );

    this.logger.info('[Capacitación] Curso cancelado', { id });

    return { cursoCapacitacion: CursoCapacitacionMapper.entityToPresentation(updated) };
  }
}
