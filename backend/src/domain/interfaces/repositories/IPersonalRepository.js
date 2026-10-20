import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPersonalRepository
 * Define el contrato que debe cumplir el repositorio de personal
 *
 * Convención de capas: IPersonalRepository → models/personal.js (`personal`)
 * → Staff / StaffMapper / StaffRepository
 * DDL: database/01-schemas/23-personal-usuarios.sql (tabla personal)
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
export class IPersonalRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
