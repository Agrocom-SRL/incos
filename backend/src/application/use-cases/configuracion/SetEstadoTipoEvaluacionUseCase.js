import { NotFoundError } from '../../../domain/errors/AppError.js';
import { EvaluationTypePresentationMapper } from '../../mappers/academico/index.js';

/**
 * Use Case: SetEstadoTipoEvaluacionUseCase
 * Módulo: Configuración
 * Activa/desactiva un tipo de evaluación del catálogo maestro (solo el campo
 * `activo`). Los tipos inactivos dejan de ofrecerse en el combo del cuaderno
 * de calificaciones (que lista solo activos), sin borrar histórico.
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoTipoEvaluacionUseCase {
  constructor({ evaluationTypeRepository, logger }) {
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del tipo de evaluación
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{tipoEvaluacion: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.evaluationTypeRepository.findById(id);
    if (!existing) throw new NotFoundError('tipo de evaluación');

    const estado = Boolean(activo);
    const updated = await this.evaluationTypeRepository.update(id, { active: estado }, userId);

    this.logger.info('Estado de tipo de evaluación actualizado', { id, activo: estado });
    return { tipoEvaluacion: EvaluationTypePresentationMapper.entityToPresentation(updated) };
  }
}
