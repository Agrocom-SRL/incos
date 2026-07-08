import { NotFoundError } from '../../../domain/errors/AppError.js';
import { DocumentacionMapper } from '../../mappers/referencia/index.js';

/**
 * Use Case: SetEstadoDocumentacionUseCase
 * Módulo: Referencia
 * Activa/desactiva un tipo de documentación (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoDocumentacionUseCase {
  constructor({ documentacionRepository, logger }) {
    this.documentacionRepository = documentacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del tipo de documentación
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{documentacion: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.documentacionRepository.findById(id);
    if (!existing) throw new NotFoundError('tipo de documentación');

    const estado = Boolean(activo);
    const updated = await this.documentacionRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de tipo de documentación actualizado', { id, activo: estado });
    return { documentacion: DocumentacionMapper.entityToPresentation(updated) };
  }
}
