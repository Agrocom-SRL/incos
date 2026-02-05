/**
 * Use Case: Obtener Todas las Gestiones
 * 
 * Single Responsibility: Orquestar la obtención de todas las gestiones (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IGestionRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todas las gestiones
 * - Buscar gestiones (parámetro search)
 * - Filtrar gestiones (parámetro filters)
 * - Paginar resultados (parámetros page, limit)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/academico/gestiones
 */

import { IGestionRepository } from '@repositories/IGestionRepository';

export class GetTodasGestionesUseCase {
  /**
   * @param {IGestionRepository} gestionRepository - Repositorio de gestiones
   */
  constructor(gestionRepository) {
    this.gestionRepository = gestionRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todas las gestiones
   * 
   * @param {Object} options - Opciones para obtener gestiones
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.page - Número de página (paginación)
   * @param {number} options.params.limit - Cantidad por página (paginación)
   * @param {string} options.params.search - Búsqueda general (código, nombre, año)
   * @param {Object} options.params.filters - Filtros específicos (ej: { active: true })
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/gestiones?page=1&limit=50&search=...&filtros={"active":true}
      const result = await this.gestionRepository.obtenerTodos({ params });
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // No hay lógica adicional de negocio en este caso
      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener gestiones',
      };
    }
  }
}
