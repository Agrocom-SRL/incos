import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IGestionRepository
 * Define el contrato que debe cumplir el repositorio de gestiones académicas
 *
 * NOTA: Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación (buildWhereClause), no en la interfaz.
 * La lógica de negocio (findActive) debe estar en casos de uso.
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
export class IGestionRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
