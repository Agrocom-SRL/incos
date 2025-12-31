/**
 * Use Case: Obtener Todas las Materias
 * 
 * Single Responsibility: Orquestar la obtención de todas las materias (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IMateriaRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todas las materias
 * - Buscar materias (parámetro busqueda)
 * - Filtrar materias (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/configuracion/academico/materias
 */

import { IMateriaRepository } from '@repositories/IMateriaRepository';

export class GetTodasMateriasUseCase {
  /**
   * @param {IMateriaRepository} materiaRepository - Repositorio de materias
   */
  constructor(materiaRepository) {
    this.materiaRepository = materiaRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todas las materias
   * 
   * @param {Object} options - Opciones para obtener materias
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general (nombre, código)
   * @param {number} options.params.carreraId - Filtro por ID de carrera
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "nombre", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/materias?pagina=1&limite=10&busqueda=...&carreraId=1&ordenar=nombre
      const result = await this.materiaRepository.obtenerTodos({ params });
      
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
        error: error.message || 'Error al obtener materias',
      };
    }
  }
}

