/**
 * Use Case: Obtener Todas las Actividades
 *
 * Single Responsibility: Orquestar la obtención de todas las actividades del
 * catálogo maestro (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IActividadRepository
 *
 * Retorna datos directamente del backend, sin crear entidades.
 *
 * Ubicación: domain/useCases/configuracion/actividades
 */

import { IActividadRepository } from '@repositories/IActividadRepository';

export class GetTodasActividadesUseCase {
  /**
   * @param {IActividadRepository} actividadRepository - Repositorio de actividades
   */
  constructor(actividadRepository) {
    this.actividadRepository = actividadRepository;
  }

  /**
   * @param {Object} options - Opciones para obtener actividades
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      const result = await this.actividadRepository.obtenerTodos({ params });

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
        error: error.message || 'Error al obtener actividades',
      };
    }
  }
}
