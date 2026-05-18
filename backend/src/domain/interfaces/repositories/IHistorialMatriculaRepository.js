import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IHistorialMatriculaRepository
 * Define el contrato que debe cumplir el repositorio de historial de matrícula.
 *
 * Convención de capas:
 * IHistorialMatriculaRepository → models/historial_matricula.js (`historial_matricula`)
 * → SubjectEnrollmentHistory / SubjectEnrollmentHistoryMapper / SubjectEnrollmentHistoryRepository
 *
 * DDL:
 * database/01-schemas/17-historial-matricula.sql
 *
 * NOTA:
 * Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación concreta mediante buildWhereClause().
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
 */
export class IHistorialMatriculaRepository extends IRepository {
    // Solo hereda métodos de IRepository
}