/**
 * Use Case: Obtener Lista de Estudiantes
 * 
 * Single Responsibility: Orquestar la obtención de estudiantes (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IEstudianteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todos los estudiantes
 * - Buscar estudiantes (parámetro busqueda)
 * - Filtrar estudiantes (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 */

import { IEstudianteRepository } from '@repositories/IEstudianteRepository';

export class GetEstudiantesUseCase {
  /**
   * @param {IEstudianteRepository} estudianteRepository - Repositorio de estudiantes
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener estudiantes
   * 
   * @param {Object} options - Opciones para obtener estudiantes
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general (nombre, CI, código)
   * @param {number} options.params.carreraId - Filtro por ID de carrera
   * @param {string} options.params.estado - Filtro por estado académico
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "apellidoPaterno", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/estudiantes?pagina=1&limite=10&busqueda=...&carreraId=1&ordenar=apellidoPaterno
      const result = await this.estudianteRepository.obtenerTodos({ params });
      
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
        error: error.message || 'Error al obtener estudiantes',
      };
    }
  }
}

