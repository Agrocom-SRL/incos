import { normalizarPaginacionLista, parseFiltroId } from '../../utils/validacionEntrada.js';
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
    const { page: pageNum, limit: limitNum } = normalizarPaginacionLista(page, limit);

    const filters = {
      search: baseFilters.search,
      gestionId: parseFiltroId(queryParams.gestionId, 'gestionId'),
      carreraId: parseFiltroId(queryParams.carreraId, 'carreraId'),
      modalidadId: parseFiltroId(queryParams.modalidadId, 'modalidadId'),
      estado: queryParams.estado || undefined,
      tutorId: parseFiltroId(queryParams.tutorId, 'tutorId'),
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
