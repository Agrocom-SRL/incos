import { NotFoundError } from '../../../domain/errors/AppError.js';
import { CivilStatusMapper } from '../../mappers/referencia/index.js';

/**
 * Use Case: SetEstadoEstadoCivilUseCase
 * Módulo: Referencia
 * Activa/desactiva un estado civil (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoEstadoCivilUseCase {
  constructor({ civilStatusRepository, logger }) {
    this.civilStatusRepository = civilStatusRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del estado civil
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{estadoCivil: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.civilStatusRepository.findById(id);
    if (!existing) throw new NotFoundError('estado civil');

    const estado = Boolean(activo);
    const updated = await this.civilStatusRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de estado civil actualizado', { id, activo: estado });
    return { estadoCivil: CivilStatusMapper.entityToPresentation(updated) };
  }
}
