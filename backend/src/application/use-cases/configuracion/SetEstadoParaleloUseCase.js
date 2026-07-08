import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ParallelMapper } from '../../mappers/academico/index.js';

/**
 * Use Case: SetEstadoParaleloUseCase
 * Módulo: Configuración
 * Activa/desactiva un paralelo del catálogo maestro (solo el campo `activo`).
 * No toca `paralelos_gestion` (la oferta por gestión se administra en INST).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoParaleloUseCase {
  constructor({ parallelRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del paralelo
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{paralelo: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.parallelRepository.findById(id);
    if (!existing) throw new NotFoundError('paralelo');

    const estado = Boolean(activo);
    const updated = await this.parallelRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de paralelo actualizado', { id, activo: estado });
    return { paralelo: ParallelMapper.entityToPresentation(updated) };
  }
}
