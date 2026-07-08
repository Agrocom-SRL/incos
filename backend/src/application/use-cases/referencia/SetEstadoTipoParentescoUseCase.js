import { NotFoundError } from '../../../domain/errors/AppError.js';
import { RelationshipTypeMapper } from '../../mappers/referencia/index.js';

/**
 * Use Case: SetEstadoTipoParentescoUseCase
 * Módulo: Referencia
 * Activa/desactiva un tipo de parentesco (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoTipoParentescoUseCase {
  constructor({ relationshipTypeRepository, logger }) {
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del tipo de parentesco
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{tipoParentesco: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.relationshipTypeRepository.findById(id);
    if (!existing) throw new NotFoundError('tipo de parentesco');

    const estado = Boolean(activo);
    const updated = await this.relationshipTypeRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de tipo de parentesco actualizado', { id, activo: estado });
    return { tipoParentesco: RelationshipTypeMapper.entityToPresentation(updated) };
  }
}
