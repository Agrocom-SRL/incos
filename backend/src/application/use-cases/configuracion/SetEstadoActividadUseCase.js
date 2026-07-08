import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ActivityMapper } from '../../mappers/configuracion/index.js';

/**
 * Use Case: SetEstadoActividadUseCase
 * Módulo: Configuración
 * Activa/desactiva una actividad del catálogo maestro (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoActividadUseCase {
  constructor({ activityRepository, logger }) {
    this.activityRepository = activityRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de la actividad
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{actividad: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.activityRepository.findById(id);
    if (!existing) throw new NotFoundError('actividad');

    const estado = Boolean(activo);
    const updated = await this.activityRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de actividad actualizado', { id, activo: estado });
    return { actividad: ActivityMapper.entityToPresentation(updated) };
  }
}
