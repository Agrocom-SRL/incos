import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPermisoRepository
 * Define el contrato que debe cumplir el repositorio de permisos
 *
 * Convención de capas:
 * - Interfaz: IPermisoRepository
 * - Modelo ORM: models/permiso.js → tabla `permisos`
 * - Entidad: domain/entities/Permission.js
 * - Mapper: mappers/PermissionMapper.js
 * - Implementación: repositories/PermissionRepository.js
 *
 * DDL: database/01-schemas/04-sistema-seguridad.sql (tabla permisos)
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
export class IPermisoRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
