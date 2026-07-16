import { NotFoundError } from '../../../domain/errors/AppError.js';
import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: SetEstadoCursoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Activa/desactiva un curso de capacitación (solo el campo `activo`) — patrón
 * EstadoTogglePill / PATCH /:id/estado, mismo contrato que los catálogos de
 * configuración. No confundir con el `estado` de negocio del curso
 * (PROPUESTO/ABIERTO/...), que se edita por PUT.
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre cursos inactivos (reactivar).
 */
export class SetEstadoCursoCapacitacionUseCase {
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
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{cursoCapacitacion: Object}>}
   */
  async execute(id, activo, userId = null) {
    const existing = await this.cursoCapacitacionRepository.findById(id);
    if (!existing) throw new NotFoundError('curso de capacitación');

    const estado = Boolean(activo);
    const updated = await this.cursoCapacitacionRepository.update(id, { activo: estado }, userId);

    this.logger.info('[Capacitación] Estado (activo) de curso de capacitación actualizado', {
      id,
      activo: estado,
    });

    return { cursoCapacitacion: CursoCapacitacionMapper.entityToPresentation(updated) };
  }
}
