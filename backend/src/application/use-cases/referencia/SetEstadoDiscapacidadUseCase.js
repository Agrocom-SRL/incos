import { NotFoundError } from '../../../domain/errors/AppError.js';
import { DisabilityTypeMapper } from '../../mappers/referencia/index.js';

/**
 * Use Case: SetEstadoDiscapacidadUseCase
 * Módulo: Referencia
 * Activa/desactiva un tipo de discapacidad (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoDiscapacidadUseCase {
  constructor({ disabilityTypeRepository, logger }) {
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del tipo de discapacidad
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{discapacidad: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.disabilityTypeRepository.findById(id);
    if (!existing) throw new NotFoundError('tipo de discapacidad');

    const estado = Boolean(activo);
    const updated = await this.disabilityTypeRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de tipo de discapacidad actualizado', { id, activo: estado });
    return { discapacidad: DisabilityTypeMapper.entityToPresentation(updated) };
  }
}
