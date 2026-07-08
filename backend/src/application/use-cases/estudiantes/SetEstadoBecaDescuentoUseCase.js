import { NotFoundError } from '../../../domain/errors/AppError.js';
import { BecaDescuentoMapper } from '../../mappers/estudiantes/index.js';

/**
 * Use Case: SetEstadoBecaDescuentoUseCase
 * Módulo: Estudiantes
 * Activa/desactiva una beca o descuento del catálogo maestro (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoBecaDescuentoUseCase {
  constructor({ scholarshipRepository, logger }) {
    this.scholarshipRepository = scholarshipRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de la beca/descuento
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{becaDescuento: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.scholarshipRepository.findById(id);
    if (!existing) throw new NotFoundError('beca o descuento');

    const estado = Boolean(activo);
    const updated = await this.scholarshipRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de beca o descuento actualizado', { id, activo: estado });
    return { becaDescuento: BecaDescuentoMapper.entityToPresentation(updated) };
  }
}
