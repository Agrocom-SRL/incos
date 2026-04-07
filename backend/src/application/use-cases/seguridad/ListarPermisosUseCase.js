export class ListarPermisosUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/PermissionRepository.js').PermissionRepository} deps.permissionRepository
   */
  constructor({ permissionRepository }) {
    this.permissionRepository = permissionRepository;
  }

  /**
   * @param {Object} query
   * @param {string} [query.dominio]
   */
  async execute(query) {
    const dominio = query.dominio ? String(query.dominio).trim() : null;
    const rows = await this.permissionRepository.findAllActivosPlano({
      dominio: dominio || null,
    });

    const porDominio = {};
    for (const p of rows) {
      const d = p.dominio;
      if (!porDominio[d]) {
        porDominio[d] = [];
      }
      porDominio[d].push({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        dominio: p.dominio,
        modulo: p.modulo,
        acciones_validas: p.acciones_validas
          ? String(p.acciones_validas).split(',')
          : ['VER'],
      });
    }

    return porDominio;
  }
}
