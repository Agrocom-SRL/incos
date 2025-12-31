/**
 * Use Case: Obtener Todas las Carreras
 * 
 * Single Responsibility: Orquestar la obtención de todas las carreras (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción ICarreraRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todas las carreras
 * - Buscar carreras (parámetro busqueda)
 * - Filtrar carreras (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/configuracion/academico/carreras
 */

import { ICarreraRepository } from '@repositories/ICarreraRepository';

export class GetTodasCarrerasUseCase {
  /**
   * @param {ICarreraRepository} carreraRepository - Repositorio de carreras
   */
  constructor(carreraRepository) {
    this.carreraRepository = carreraRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todas las carreras
   * 
   * @param {Object} options - Opciones para obtener carreras
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general (nombre, código)
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "nombre", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/carreras?pagina=1&limite=10&busqueda=...&ordenar=nombre
      const result = await this.carreraRepository.obtenerTodos({ params });
      
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
        error: error.message || 'Error al obtener carreras',
      };
    }
  }
}

