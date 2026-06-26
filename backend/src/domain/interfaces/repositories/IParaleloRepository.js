import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IParaleloRepository
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
export class IParaleloRepository extends IRepository {
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

  async obtenerDocentesConflictosDetalleDashboard() {
    throw new Error('Method obtenerDocentesConflictosDetalleDashboard must be implemented by subclass');
  }

  async obtenerPublicacionBloques(_filters = {}) {
    throw new Error('Method obtenerPublicacionBloques must be implemented by subclass');
  }

  async obtenerEstadoParaleloGestionPorIds(_paraleloGestionIds = []) {
    throw new Error('Method obtenerEstadoParaleloGestionPorIds must be implemented by subclass');
  }

  /**
   * Cabecera del paralelo (vista 87): carrera, periodo/curso, paralelo, turno,
   * gestión y color de carrera — para encabezados de reportes (p. ej. centralizador).
   * @param {number} _paraleloGestionId
   * @returns {Promise<Object|null>}
   */
  async obtenerCabeceraParaleloGestion(_paraleloGestionId) {
    throw new Error('Method obtenerCabeceraParaleloGestion must be implemented by subclass');
  }

  /**
   * Lista los paralelos de una carrera en la gestión vigente (vista 87), para
   * armar el centralizador por carrera (un libro, una hoja por paralelo).
   * Devuelve por paralelo: paralelo_gestion_id, carrera_id/nombre, periodo_nombre,
   * paralelo_nombre, turno, gestión y conteos (estudiantes/docentes).
   * @param {number} _carreraId
   * @returns {Promise<Array<Object>>}
   */
  async listarParalelosPorCarreraGestionVigente(_carreraId) {
    throw new Error(
      'Method listarParalelosPorCarreraGestionVigente must be implemented by subclass'
    );
  }

  /**
   * Cursos de un paralelo cuya asignación docente vigente participa en choque de franja (misma horario_id con otro curso del mismo docente).
   * @param {number} _paraleloId
   * @returns {Promise<Array<{ curso_id: number }>>}
   */
  async obtenerCursoIdsChoqueDocenteHorarioPorParalelo(_paraleloId) {
    throw new Error('Method obtenerCursoIdsChoqueDocenteHorarioPorParalelo must be implemented by subclass');
  }
}
