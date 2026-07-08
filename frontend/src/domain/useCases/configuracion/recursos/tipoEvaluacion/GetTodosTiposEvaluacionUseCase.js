/**
 * Use Case: Obtener Todos los Tipos de Evaluación (catálogo de administración)
 *
 * Single Responsibility: Orquestar la obtención de todos los tipos de evaluación
 * (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción ITipoEvaluacionAdminRepository
 *
 * NOTA: distinto de `GetTiposEvaluacionUseCase` (combo de solo lectura del
 * cuaderno de calificaciones, no se toca).
 *
 * Ubicación: domain/useCases/configuracion/recursos/tipoEvaluacion
 */

import { ITipoEvaluacionAdminRepository } from '@repositories/ITipoEvaluacionAdminRepository';

export class GetTodosTiposEvaluacionUseCase {
  /**
   * @param {ITipoEvaluacionAdminRepository} tipoEvaluacionRepository - Repositorio del catálogo
   */
  constructor(tipoEvaluacionRepository) {
    this.tipoEvaluacionRepository = tipoEvaluacionRepository;
  }

  /**
   * @param {Object} options - Opciones para obtener tipos de evaluación
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      const result = await this.tipoEvaluacionRepository.obtenerTodos({ params });

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener tipos de evaluación',
      };
    }
  }
}
