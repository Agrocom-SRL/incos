import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';
import { ESTADOS_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { resolveEstadoEfectivoCurso } from './helpers/cursoEstadoEfectivo.js';

/**
 * Use Case: AbrirCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Transición manual de negocio: PROPUESTO → ABIERTO ("abrir inscripciones").
 * Solo procede si el estado EFECTIVO actual es PROPUESTO. No confundir con
 * `SetEstadoCursoCapacitacionUseCase` (ese es el toggle booleano `activo`).
 */
export class AbrirCursoCapacitacionUseCase {
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
    if (efectivo !== ESTADOS_CAPACITACION.PROPUESTO) {
      throw new ConflictError(
        `El curso "${curso.titulo}" no puede abrirse desde su estado actual (${efectivo})`
      );
    }

    const updated = await this.cursoCapacitacionRepository.update(
      id,
      { estado: ESTADOS_CAPACITACION.ABIERTO },
      userId
    );

    this.logger.info('[Capacitación] Curso abierto para inscripciones', { id });

    return { cursoCapacitacion: CursoCapacitacionMapper.entityToPresentation(updated) };
  }
}
