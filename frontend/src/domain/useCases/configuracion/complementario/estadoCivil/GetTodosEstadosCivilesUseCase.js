/**
 * Use Case: Obtener Todos los Estados Civiles
 *
 * Single Responsibility: Orquestar la obtención de todos los estados civiles
 * (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IEstadoCivilRepository
 *
 * Retorna datos directamente del backend, sin crear entidades.
 *
 * Ubicación: domain/useCases/configuracion/complementario/estadoCivil
 */

import { IEstadoCivilRepository } from '@repositories/IEstadoCivilRepository';

export class GetTodosEstadosCivilesUseCase {
  /**
   * @param {IEstadoCivilRepository} estadoCivilRepository - Repositorio de estados civiles
   */
  constructor(estadoCivilRepository) {
    this.estadoCivilRepository = estadoCivilRepository;
  }

  /**
   * @param {Object} options - Opciones para obtener estados civiles
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      const result = await this.estadoCivilRepository.obtenerTodos({ params });

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
        error: error.message || 'Error al obtener estados civiles',
      };
    }
  }
}
