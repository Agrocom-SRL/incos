import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

/**
 * Categorías de usuario → conjunto de rol_codigo de la vista vista_usuarios_admin_base.
 * Si la categoría recibida no está en este mapa, no se aplica filtro (comportamiento actual).
 */
const CATEGORIA_ROL_CODIGOS = {
  sistema: ['ADMIN_SISTEMA'],
  estudiante: ['ESTUDIANTE'],
  docente: ['DOCENTE'],
  personal: ['RECTOR', 'DIR_ACADEMICO', 'DIR_ADMIN', 'SEC_ACADEMICA', 'SEC_ADMIN'],
};

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
   * @param {string} [query.categoria] sistema|estudiante|docente|personal
   */
  async execute(query) {
    const page = Math.max(1, parseInt(String(query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit), 10) || 20));
    const search = query.search ? String(query.search).trim() : '';
    const sort = query.sort ? String(query.sort) : 'id:ASC';

    const categoria = query.categoria
      ? String(query.categoria).trim().toLowerCase()
      : '';
    const rolCodigos = CATEGORIA_ROL_CODIGOS[categoria] || null;

    const total = await this.userRepository.countAllWithRoleSearch({
      search: search || null,
      rolCodigos,
    });
    const rows = await this.userRepository.findAllPaginatedWithRole({
      page,
      limit,
      search: search || null,
      sort,
      rolCodigos,
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
