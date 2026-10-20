import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteOrigenRepository
 * Define el contrato que debe cumplir el repositorio de orígenes de estudiantes
 *
 * NOTA: Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación (buildWhereClause), no en la interfaz.
 * La lógica de múltiples operaciones (createMultiple, deleteByEstudianteId) y lógica de negocio
 * (determinarTipoNacionalidadEstudiante) debe estar en casos de uso.
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
export class IEstudianteOrigenRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
