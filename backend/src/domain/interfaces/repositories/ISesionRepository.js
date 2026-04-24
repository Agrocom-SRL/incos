import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ISesionRepository
 * Define el contrato que debe cumplir el repositorio de sesiones
 *
 * Convención de capas: ISesionRepository → models/sesion.js (`sesiones`)
 * → Session / SessionMapper / SessionRepository
 * DDL: database/01-schemas/04-sistema-seguridad.sql (tabla sesiones)
 *
 * NOTA: Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación (buildWhereClause), no en la interfaz.
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
export class ISesionRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
