import { NotFoundError } from '../../../domain/errors/AppError.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

/**
 * Listado paginado de usuarios que tienen un rol específico (parte de la ficha
 * de detalle de rol). Separado del GET /:id porque un rol puede tener cientos
 * de usuarios (ej. DOCENTE) y no puede embeberse sin paginar.
 */
export class ListarUsuariosPorRolUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/RoleRepository.js').RoleRepository} deps.roleRepository
   */
  constructor({ userRepository, roleRepository }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  /**
   * @param {number|string} rolId
   * @param {Object} query
   * @param {number} [query.page]
   * @param {number} [query.limit]
   * @param {string} [query.search]
   * @param {string} [query.sort]
   */
  async execute(rolId, query = {}) {
    const rol = await this.roleRepository.findById(rolId);
    if (!rol) {
      throw new NotFoundError('Rol');
    }

    const page = Math.max(1, parseInt(String(query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit), 10) || 20));
    const search = query.search ? String(query.search).trim() : '';
    const sort = query.sort ? String(query.sort) : 'id:ASC';

    const total = await this.userRepository.countAllWithRoleSearch({
      search: search || null,
      rolId,
    });
    const rows = await this.userRepository.findAllPaginatedWithRole({
      page,
      limit,
      search: search || null,
      sort,
      rolId,
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      usuarios: rows.map(mapUsuarioAdminRow),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
