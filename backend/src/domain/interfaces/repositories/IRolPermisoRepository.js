import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IRolPermisoRepository
 * Define el contrato que debe cumplir el repositorio de roles-permisos
 *
 * Convención de capas: IRolPermisoRepository → models/rol_permiso.js (`roles_permisos`)
 * → RolePermission / RolePermissionMapper / RolePermissionRepository
 * DDL: database/01-schemas/04-sistema-seguridad.sql (tabla roles_permisos)
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
export class IRolPermisoRepository extends IRepository {
  // Solo hereda métodos de IRepository
}
