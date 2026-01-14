/**
 * Use Case: Obtener Todos los Paralelos
 * 
 * Single Responsibility: Orquestar la obtención de todos los paralelos (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IParaleloRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todos los paralelos
 * - Buscar paralelos (parámetro busqueda)
 * - Filtrar paralelos (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/academico/paralelos
 */

import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class GetTodosParalelosUseCase {
  /**
   * @param {IParaleloRepository} paraleloRepository - Repositorio de paralelos
   */
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todos los paralelos
   * 
   * @param {Object} options - Opciones para obtener paralelos
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general (nombre, código)
   * @param {number} options.params.periodo - Filtro por número de periodo (1, 2, 3...)
   * @param {number} options.params.periodo_id - Filtro por ID único del periodo
   * @param {number} options.params.carrera_id - Filtro por ID de carrera (snake_case, según validador del backend)
   * @param {number} options.params.materiaId - Filtro por ID de materia
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "nombre", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/paralelos?pagina=1&limite=10&busqueda=...&carrera_id=1&materiaId=1&ordenar=nombre
      const result = await this.paraleloRepository.obtenerTodos({ params });
      
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
        error: error.message || 'Error al obtener paralelos',
      };
    }
  }
}
