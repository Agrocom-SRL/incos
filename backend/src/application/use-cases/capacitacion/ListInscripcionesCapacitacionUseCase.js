import { InscripcionCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { ESTADOS_INSCRIPCION_CAPACITACION_VALUES } from '../../../domain/constants/capacitacion.constants.js';

/**
 * Use Case: ListInscripcionesCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Lista inscripciones a capacitaciones con datos del participante, del curso
 * y estado de pago derivado (total pagado vs costo del curso).
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { inscripcionesCapacitacion, total, page, limit, totalPages }.
 *
 * Filtros específicos: capacitacionId, participanteId, estado, incluirInactivos.
 */
export class ListInscripcionesCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ inscripcionCapacitacionRepository, logger }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search, sort } normalizados por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - Query params originales
   * @returns {Promise<{inscripcionesCapacitacion: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const filters = {
      search: baseFilters.search,
      capacitacionId: queryParams.capacitacionId ? Number(queryParams.capacitacionId) : undefined,
      participanteId: queryParams.participanteId ? Number(queryParams.participanteId) : undefined,
      estado: ESTADOS_INSCRIPCION_CAPACITACION_VALUES.includes(queryParams.estado)
        ? queryParams.estado
        : undefined,
      includeInactive:
        queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true,
    };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    this.logger.info('[Capacitación] Iniciando listado de inscripciones', {
      filters,
      page: pageNum,
      limit: limitNum,
    });

    const { rows, total } = await this.inscripcionCapacitacionRepository.findListadoRows(
      filters,
      pageNum,
      limitNum
    );

    const totalPages = Math.ceil(total / limitNum);

    this.logger.info('[Capacitación] Inscripciones listadas exitosamente', {
      total,
      count: rows.length,
    });

    return {
      inscripcionesCapacitacion: InscripcionCapacitacionMapper.rowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
