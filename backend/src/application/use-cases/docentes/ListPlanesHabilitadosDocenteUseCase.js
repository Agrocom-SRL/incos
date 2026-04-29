/**
 * GET /api/v1/docentes/planes-habilitados — catálogo para asignación docente.
 */

export class ListPlanesHabilitadosDocenteUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/ManagementPlanRepository.js').ManagementPlanRepository} deps.managementPlanRepository
   * @param {Object} deps.logger
   */
  constructor({ managementPlanRepository, logger }) {
    this.managementPlanRepository = managementPlanRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number|null} params.gestionId
   * @param {number} params.page
   * @param {number} params.limit
   */
  async execute({ gestionId = null, page = 1, limit = 200 } = {}) {
    this.logger.info('[Docentes] Listar planes habilitados (asignación)', { gestionId, page, limit });
    const { rows, total } = await this.managementPlanRepository.findPlanesDocenteAsignacionCatalog({
      gestionId: gestionId && Number(gestionId) > 0 ? Number(gestionId) : null,
      page,
      limit,
    });
    const limitNum = Math.min(10000, Math.max(1, parseInt(String(limit), 10) || 200));
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const totalPages = Math.ceil(total / limitNum) || 0;
    return {
      planes: rows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
