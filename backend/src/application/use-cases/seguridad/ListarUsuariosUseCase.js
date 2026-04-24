import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

export class ListarUsuariosUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   */
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} query
   * @param {number} [query.page]
   * @param {number} [query.limit]
   * @param {string} [query.search]
   * @param {string} [query.sort]
   */
  async execute(query) {
    const page = Math.max(1, parseInt(String(query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit), 10) || 20));
    const search = query.search ? String(query.search).trim() : '';
    const sort = query.sort ? String(query.sort) : 'id:ASC';

    const total = await this.userRepository.countAllWithRoleSearch({
      search: search || null,
    });
    const rows = await this.userRepository.findAllPaginatedWithRole({
      page,
      limit,
      search: search || null,
      sort,
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
