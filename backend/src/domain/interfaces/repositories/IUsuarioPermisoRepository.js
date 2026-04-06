import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IUsuarioPermisoRepository
 * Contrato para la tabla usuarios_permisos (overrides GRANT/REVOKE por usuario).
 *
 * Convención de capas: IUsuarioPermisoRepository → models/usuario_permiso.js (`usuarios_permisos`)
 * → UserPermission / UserPermissionMapper / UserPermissionRepository
 * DDL: database/01-schemas/04-sistema-seguridad.sql (tabla usuarios_permisos)
 *
 * Métodos heredados de IRepository:
 * - findById, findBy, findAll, create, update, delete, search, count
 */
export class IUsuarioPermisoRepository extends IRepository {
  // Solo hereda métodos de IRepository; filtros en UserPermissionRepository.buildWhereClause
}
