import { NotFoundError } from '../../../domain/errors/AppError.js';
import { StudyPlanMapper } from '../../mappers/configuracion/index.js';

/**
 * Use Case: SetEstadoPlanEstudiosUseCase
 * Módulo: Configuración
 * Activa/desactiva un plan de estudios (solo el campo `activo`, independiente
 * de `vigente` — un plan puede desactivarse manualmente sin que otro pase a
 * vigente, y viceversa).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoPlanEstudiosUseCase {
  constructor({ studyPlanRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del plan de estudios
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{plan_estudio: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.studyPlanRepository.findById(id);
    if (!existing) throw new NotFoundError('plan de estudios');

    const estado = Boolean(activo);
    const updated = await this.studyPlanRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de plan de estudios actualizado', { id, activo: estado });
    return { plan_estudio: StudyPlanMapper.entityToPresentation(updated) };
  }
}
