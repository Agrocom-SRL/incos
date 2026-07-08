import { NotFoundError } from '../../../domain/errors/AppError.js';
import { LanguageMapper } from '../../mappers/referencia/index.js';

/**
 * Use Case: SetEstadoIdiomaUseCase
 * Módulo: Referencia
 * Activa/desactiva un idioma (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoIdiomaUseCase {
  constructor({ languageRepository, logger }) {
    this.languageRepository = languageRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del idioma
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{idioma: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.languageRepository.findById(id);
    if (!existing) throw new NotFoundError('idioma');

    const estado = Boolean(activo);
    const updated = await this.languageRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de idioma actualizado', { id, activo: estado });
    return { idioma: LanguageMapper.entityToPresentation(updated) };
  }
}
