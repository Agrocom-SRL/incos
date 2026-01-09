import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IDocumentationRepository
 * Define el contrato que debe cumplir el repositorio de documentación
 * 
 * NOTA: Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación (buildWhereClause), no en la interfaz.
 * La lógica de negocio (findRequeridos) debe estar en casos de uso.
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
export class IDocumentacionRepository extends IRepository {
  // Solo hereda métodos de IRepository
  // NOTA: El nombre de la clase se mantiene en español por compatibilidad con código existente
  // pero representa la entidad Documentation (en inglés)
}

