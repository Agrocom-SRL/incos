import { ProyectoGradoMapper } from '../../mappers/titulacion/index.js';

/**
 * Use Case: ListProyectosGradoUseCase (T1)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Lista proyectos de grado desde la vista 160 (vista_tutoria_proyectos_listado)
 * con filtros, paginación y agregados de seguimiento.
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { proyectosGrado, total, page, limit, totalPages }.
 */
export class ListProyectosGradoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoListadoViewRepository - Vistas 159/160/163
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoListadoViewRepository, logger }) {
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search } normalizados por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - gestionId, carreraId, modalidadId, estado, tutorId
   * @returns {Promise<{proyectosGrado: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const filters = {
      search: baseFilters.search,
      gestionId: queryParams.gestionId ? Number(queryParams.gestionId) : undefined,
      carreraId: queryParams.carreraId ? Number(queryParams.carreraId) : undefined,
      modalidadId: queryParams.modalidadId ? Number(queryParams.modalidadId) : undefined,
      estado: queryParams.estado || undefined,
      tutorId: queryParams.tutorId ? Number(queryParams.tutorId) : undefined,
    };

    const { rows, total } = await this.proyectoGradoListadoViewRepository.findListado(
      filters,
      pageNum,
      limitNum
    );

    this.logger.info('[Tutorías] Proyectos de grado listados', { total, count: rows.length });

    return {
      proyectosGrado: ProyectoGradoMapper.listadoRowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
