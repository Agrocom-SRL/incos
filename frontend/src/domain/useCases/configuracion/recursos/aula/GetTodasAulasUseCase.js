/**
 * Use Case: Obtener Todas las Aulas
 *
 * Single Responsibility: Orquestar la obtención de todas las aulas
 * (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IAulaRepository
 *
 * Retorna datos directamente del backend, sin crear entidades.
 *
 * Ubicación: domain/useCases/configuracion/recursos/aula
 */

import { IAulaRepository } from '@repositories/IAulaRepository';

export class GetTodasAulasUseCase {
  /**
   * @param {IAulaRepository} aulaRepository - Repositorio de aulas
   */
  constructor(aulaRepository) {
    this.aulaRepository = aulaRepository;
  }

  /**
   * @param {Object} options - Opciones para obtener aulas
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      const result = await this.aulaRepository.obtenerTodos({ params });

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
        error: error.message || 'Error al obtener aulas',
      };
    }
  }
}
