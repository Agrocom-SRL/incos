/**
 * Use Case: Obtener Todas las Inscripciones
 * 
 * Single Responsibility: Orquestar la obtención de todas las inscripciones (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IInscripcionRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todas las inscripciones
 * - Buscar inscripciones (parámetro busqueda)
 * - Filtrar inscripciones (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 */

import { IInscripcionRepository } from '@repositories/IInscripcionRepository';

export class ObtenerTodasInscripcionesUseCase {
  /**
   * @param {IInscripcionRepository} inscripcionRepository - Repositorio de inscripciones
   */
  constructor(inscripcionRepository) {
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todas las inscripciones
   * 
   * @param {Object} options - Opciones para obtener inscripciones
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general
   * @param {number} options.params.student_id - Filtro por ID de estudiante
   * @param {number} options.params.management_id - Filtro por ID de gestión
   * @param {string} options.params.enrollment_type - Filtro por tipo de inscripción
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "fecha_inscripcion", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/inscripciones?pagina=1&limite=10&busqueda=...&student_id=1&ordenar=fecha_inscripcion
      const result = await this.inscripcionRepository.obtenerTodos({ params });
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // No hay lógica adicional de negocio en este caso
      return {
        success: true,
        data: result.data || [],
        pagination: result.pagination ?? null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener inscripciones',
      };
    }
  }
}
