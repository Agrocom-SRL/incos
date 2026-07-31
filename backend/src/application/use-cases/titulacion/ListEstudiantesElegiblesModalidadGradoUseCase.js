import { TutoriaAvanceMapper } from '../../mappers/titulacion/index.js';

/**
 * Use Case: ListEstudiantesElegiblesModalidadGradoUseCase
 * Módulo: Titulación (TIT), Requisito 1 — extensión 2026-07-31
 *
 * Estudiantes de 3er año SIN proyecto de grado vigente (vista 178, filtro
 * proyecto_grado_id IS NULL), para el paso "Elegir estudiante" del flujo de
 * creación de proyecto. Si no llega gestionId, usa la gestión vigente (mismo
 * patrón `resolverGestion` de GetPanelAcompanamientoUseCase). Contrato
 * compatible con BaseListController: execute(baseFilters, page, limit,
 * queryParams) → { estudiantesElegibles, total, page, limit, totalPages }.
 */
export class ListEstudiantesElegiblesModalidadGradoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.tutoriaAvanceViewRepository - Vista 178
   * @param {Object} params.calificacionContextoRepository - Gestión vigente
   * @param {ILogger} params.logger
   */
  constructor({ tutoriaAvanceViewRepository, calificacionContextoRepository, logger }) {
    this.tutoriaAvanceViewRepository = tutoriaAvanceViewRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search }
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - { carreraId, gestionId, search }
   * @returns {Promise<{estudiantesElegibles: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const gestionId = queryParams.gestionId
      ? Number(queryParams.gestionId)
      : await this._resolverGestionVigente();

    const { rows, total } = await this.tutoriaAvanceViewRepository.findEstudiantesElegibles(
      {
        carreraId: queryParams.carreraId ? Number(queryParams.carreraId) : undefined,
        gestionId: gestionId ?? undefined,
        search: queryParams.search ?? baseFilters.search,
      },
      pageNum,
      limitNum
    );

    this.logger.info('[Titulación] Estudiantes elegibles de 3er año listados', {
      gestionId,
      carreraId: queryParams.carreraId ?? null,
      total,
    });

    return {
      estudiantesElegibles: TutoriaAvanceMapper.estudiantesElegiblesRowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /** @private */
  async _resolverGestionVigente() {
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    return ctx?.gestion_id != null ? Number(ctx.gestion_id) : null;
  }
}
