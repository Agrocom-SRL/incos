/**
 * Use Case: Obtener Todas las Becas Asignadas a Estudiantes
 * 
 * Single Responsibility: Orquestar la obtención de todas las becas asignadas (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IEstudianteBecaRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todas las becas asignadas a estudiantes (con datos enriquecidos)
 * - Buscar becas asignadas (parámetro busqueda)
 * - Filtrar becas asignadas (parámetro filtros: studentId, managementId, state, scholarshipId)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/estudiantes
 */

import { IEstudianteBecaRepository } from '@domain/repositories';

export class ObtenerTodasBecasAsignadasUseCase {
  /**
   * @param {IEstudianteBecaRepository} estudianteBecaRepository - Repositorio de becas asignadas
   */
  constructor(estudianteBecaRepository) {
    this.estudianteBecaRepository = estudianteBecaRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todas las becas asignadas
   * 
   * @param {Object} options - Opciones para obtener becas asignadas
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.page - Número de página (paginación)
   * @param {number} options.params.limit - Cantidad por página (paginación)
   * @param {string} options.params.search - Búsqueda general (nombre estudiante, CI, código, nombre beca, gestión)
   * @param {number} options.params.studentId - Filtrar por ID de estudiante (opcional)
   * @param {number} options.params.managementId - Filtrar por ID de gestión (opcional)
   * @param {string} options.params.state - Filtrar por estado (PENDIENTE, ACTIVA, RECHAZADA, etc.) (opcional)
   * @param {number} options.params.scholarshipId - Filtrar por ID de beca/descuento (opcional)
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "created_at", "-fecha_solicitud")
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/estudiantes/becas?page=1&limit=10&search=...&studentId=1&state=ACTIVA
      // NOTA: No pasar studentId en params para que use el endpoint LIST_ALL
      const queryParams = { ...params };
      delete queryParams.studentId; // Eliminar studentId para usar endpoint de listado general
      
      const result = await this.estudianteBecaRepository.obtenerTodos({ params: queryParams });
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // El backend retorna: { becas: [...], total: number, page: number, limit: number, totalPages: number }
      // No hay lógica adicional de negocio en este caso
      return {
        success: true,
        data: result.data || {},
        pagination: result.pagination ?? null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener becas asignadas',
      };
    }
  }
}
