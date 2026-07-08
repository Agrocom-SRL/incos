/**
 * Use Case: Obtener Todos los Tipos de Parentesco
 *
 * Single Responsibility: Orquestar la obtención de todos los tipos de parentesco
 * (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción ITipoParentescoRepository
 *
 * Retorna datos directamente del backend, sin crear entidades.
 *
 * Ubicación: domain/useCases/configuracion/complementario/tipoParentesco
 */

import { ITipoParentescoRepository } from '@repositories/ITipoParentescoRepository';

export class GetTodosTiposParentescoUseCase {
  /**
   * @param {ITipoParentescoRepository} tipoParentescoRepository - Repositorio de tipos de parentesco
   */
  constructor(tipoParentescoRepository) {
    this.tipoParentescoRepository = tipoParentescoRepository;
  }

  /**
   * @param {Object} options - Opciones para obtener tipos de parentesco
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      const result = await this.tipoParentescoRepository.obtenerTodos({ params });

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
        error: error.message || 'Error al obtener tipos de parentesco',
      };
    }
  }
}
