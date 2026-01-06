import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IBecaDescuentoRepository
 * Define el contrato que debe cumplir el repositorio de becas y descuentos
 * 
 * NOTA: Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación (buildWhereClause), no en la interfaz.
 * La lógica de negocio (findAutomaticas) debe estar en casos de uso.
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
export class IBecaDescuentoRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
