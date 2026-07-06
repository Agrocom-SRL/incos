/**
 * Use Case: Obtener Todos los Idiomas
 *
 * Single Responsibility: Orquestar la obtención de todos los idiomas
 * (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IIdiomaRepository
 *
 * Retorna datos directamente del backend, sin crear entidades.
 *
 * Ubicación: domain/useCases/configuracion/complementario/idioma
 */

import { IIdiomaRepository } from '@repositories/IIdiomaRepository';

export class GetTodosIdiomasUseCase {
  /**
   * @param {IIdiomaRepository} idiomaRepository - Repositorio de idiomas
   */
  constructor(idiomaRepository) {
    this.idiomaRepository = idiomaRepository;
  }

  /**
   * @param {Object} options - Opciones para obtener idiomas
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      const result = await this.idiomaRepository.obtenerTodos({ params });

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
        error: error.message || 'Error al obtener idiomas',
      };
    }
  }
}
