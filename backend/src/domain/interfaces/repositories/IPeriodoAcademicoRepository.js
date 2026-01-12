import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPeriodoAcademicoRepository
 * Define el contrato que debe cumplir el repositorio de periodos académicos
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
export class IPeriodoAcademicoRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
