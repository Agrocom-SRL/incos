/**
 * Use Case: ListPasantiasEmpresasUseCase (P7)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Catálogo de empresas para práctica laboral (pasantias_empresas). Patrón
 * catálogo maestro: soporta `incluirInactivos` (switch EstadoTogglePill) y el
 * toggle activo va por PATCH /:empresaId/estado.
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { pasantiasEmpresas, total, page, limit, totalPages }.
 */
export class ListPasantiasEmpresasUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaEmpresaRepository - CRUD pasantias_empresas
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaEmpresaRepository, logger }) {
    this.pasantiaEmpresaRepository = pasantiaEmpresaRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search } normalizados por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - incluirInactivos, tipoSocietario
   * @returns {Promise<{pasantiasEmpresas: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const includeInactive =
      queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true;

    const filters = {
      search: baseFilters.search,
      includeInactive,
      ...(queryParams.tipoSocietario ? { tipoSocietario: queryParams.tipoSocietario } : {}),
    };

    const result = await this.pasantiaEmpresaRepository.findAll(filters, pageNum, limitNum);
    const pasantiasEmpresas = result.pasantiasEmpresas ?? [];
    const total = result.total ?? pasantiasEmpresas.length;

    this.logger.info('[Pasantías] Empresas del catálogo listadas', {
      total,
      includeInactive,
    });

    return {
      pasantiasEmpresas,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
