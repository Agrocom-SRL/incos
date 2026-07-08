import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ClassroomMapper } from '../../mappers/configuracion/index.js';

/**
 * Use Case: SetEstadoAulaUseCase
 * Módulo: Configuración
 * Activa/desactiva un aula del catálogo maestro (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoAulaUseCase {
  constructor({ classroomRepository, logger }) {
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del aula
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{aula: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.classroomRepository.findById(id);
    if (!existing) throw new NotFoundError('aula');

    const estado = Boolean(activo);
    const updated = await this.classroomRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de aula actualizado', { id, activo: estado });
    return { aula: ClassroomMapper.entityToPresentation(updated) };
  }
}
