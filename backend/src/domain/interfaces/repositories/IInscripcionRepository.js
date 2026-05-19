import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IInscripcionRepository
 * Define el contrato que debe cumplir el repositorio de inscripciones.
 *
 * Convención de capas:
 * IInscripcionRepository → models/inscripcion.js (`inscripciones`)
 * → Enrollment / EnrollmentMapper / EnrollmentRepository
 *
 * DDL:
 * database/01-schemas/12-inscripciones.sql
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
 * - obtenerInscripcionActual(filters)
 *   Obtiene la inscripción actual del estudiante desde vista_estudiante_inscripcion_actual.
 * - obtenerListadoMatriculas(baseFilters, page, limit, queryParams)
 *   Listado paginado desde vista_base_matricula_resumen_inscripcion.
 */
export class IInscripcionRepository extends IRepository {
    /**
     * Obtiene inscripción actual del estudiante por gestión desde vista_estudiante_inscripcion_actual.
     * Retorna una fila por materia matriculada con información completa.
     *
     * @param {Object} filters - Filtros opcionales
     *   - estudiante_id: ID del estudiante
     *   - codigo_estudiante: Código único del estudiante
     *   - gestion_id: ID de la gestión académica
     *   - inscripcion_id: ID de la inscripción
     *
     * @returns {Promise<Array>} Array de objetos planos.
     */
    async obtenerInscripcionActual(filters = {}) {
        throw new Error('Method obtenerInscripcionActual must be implemented by subclass');
    }

    /**
     * @param {Object} baseFilters
     * @param {number} page
     * @param {number} limit
     * @param {Object} queryParams
     * @returns {Promise<{enrollments: Array, total: number}>}
     */
    async obtenerListadoMatriculas(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
        throw new Error('Method obtenerListadoMatriculas must be implemented by subclass');
    }
}