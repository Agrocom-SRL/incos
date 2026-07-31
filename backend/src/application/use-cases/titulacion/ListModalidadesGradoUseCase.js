/**
 * Use Case: ListModalidadesGradoUseCase (T2)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Catálogo de modalidades de grado (modalidades_grado) para el formulario de
 * proyecto. Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { modalidadesGrado, total, page, limit, totalPages }.
 */
export class ListModalidadesGradoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.modalidadGradoRepository - Catálogo modalidades_grado
   * @param {ILogger} params.logger
   */
  constructor({ modalidadGradoRepository, logger }) {
    this.modalidadGradoRepository = modalidadGradoRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{modalidadesGrado: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const result = await this.modalidadGradoRepository.findAll(
      { search: baseFilters.search },
      pageNum,
      limitNum
    );

    const modalidades = result.modalidadesGrado ?? [];
    const total = result.total ?? modalidades.length;

    this.logger.info('[Tutorías] Modalidades de grado listadas', { total });

    return {
      modalidadesGrado: modalidades,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
