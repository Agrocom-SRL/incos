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
 * database/01-schemas/17-inscripciones-parte1.sql
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
}