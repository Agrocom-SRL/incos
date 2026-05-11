import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IParallelRepository
 * Define el contrato que debe cumplir el repositorio de paralelos
 *
 * Métodos heredados de IRepository:
 * - findById(id)
 * - findBy(criteria, options)
 * - findAll(filters, page, limit)
 * - create(data, userId)
 * - update(id, data, userId)
 * - delete(id, userId)
 * - search(searchTerm, options)
 * - count(filters)
 *
 * Métodos específicos:
 * - obtenerEstadisticasYPeriodoPorGestion(parallelIds, managementId) - Consulta vista_estadisticas_paralelos_por_gestion + periodos
 */
export class IParallelRepository extends IRepository {
  /**
   * Obtiene estadísticas de inscripción por paralelo para una gestión y datos del periodo.
   * Consulta la vista vista_estadisticas_paralelos_por_gestion (LEFT JOIN) y periodos.
   *
   * @param {number[]} parallelIds - IDs de paralelos
   * @param {number} managementId - ID de la gestión académica
   * @returns {Promise<Array>} Array de objetos planos: paralelo_id, total_inscritos, total_hombres, total_mujeres, periodo_numero, periodo_nombre
   */
  async obtenerEstadisticasYPeriodoPorGestion(parallelIds, managementId) {
    throw new Error('Method obtenerEstadisticasYPeriodoPorGestion must be implemented by subclass');
  }

  async obtenerParalelosEstadoDashboard(_filters = {}) {
    throw new Error('Method obtenerParalelosEstadoDashboard must be implemented by subclass');
  }

  async obtenerAsignaturasSinCursoDashboard() {
    throw new Error('Method obtenerAsignaturasSinCursoDashboard must be implemented by subclass');
  }

  async obtenerCapacidadTurnoDashboard() {
    throw new Error('Method obtenerCapacidadTurnoDashboard must be implemented by subclass');
  }

  async obtenerBloquesSinAulaDashboard() {
    throw new Error('Method obtenerBloquesSinAulaDashboard must be implemented by subclass');
  }

  async obtenerCursosSinDocenteDashboard() {
    throw new Error('Method obtenerCursosSinDocenteDashboard must be implemented by subclass');
  }

  async obtenerPublicacionBloques(_filters = {}) {
    throw new Error('Method obtenerPublicacionBloques must be implemented by subclass');
  }
}
