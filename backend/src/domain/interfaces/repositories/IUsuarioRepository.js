import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IUsuarioRepository
 * Define el contrato que debe cumplir el repositorio de usuarios
 *
 * Convención de capas (mismo criterio que IEstudianteRepository / StudentRepository):
 * - Interfaz (español): IUsuarioRepository
 * - Modelo ORM: infrastructure/database/models/usuario.js → tabla `usuarios`
 * - Entidad (inglés): domain/entities/User.js
 * - Mapper: infrastructure/mappers/UserMapper.js
 * - Implementación: infrastructure/repositories/UserRepository.js
 *
 * DDL: database/01-schemas/04-sistema-seguridad.sql (tabla usuarios)
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
export class IUsuarioRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
