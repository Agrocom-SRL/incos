import { ESTADOS_CAPACITACION_VALUES } from '../../../domain/constants/capacitacion.constants.js';
import { GrupoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { normalizarPaginacionLista, parseFiltroId } from '../../utils/validacionEntrada.js';
import { ValidationError } from '../../../domain/errors/AppError.js';

/** Tope al filtrar por estado EFECTIVO (se recalcula en JS): trae "todo" con el cap del repositorio. */
const LIMIT_FILTRO_ESTADO_EFECTIVO = 10000;

/**
 * Use Case: ListGruposCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Lista los grupos de TODAS las capacitaciones (el curso es conceptual; los
 * grupos son el curso físico) desde la vista 190, con su curso, aula, cupo
 * efectivo (el del grupo o el del curso si es NULL), inscritos vigentes y
 * horarios.
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { grupos, total, page, limit, totalPages }.
 *
 * Filtros: `search` (grupo o curso), `cursoId`, `estado` (EFECTIVO del curso,
 * calculado por fecha: por eso se filtra y pagina en JS cuando se pide).
 */
export class ListGruposCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.grupoCapacitacionListadoViewRepository - Repo de lectura (vistas 190/154)
   * @param {ILogger} params.logger
   */
  constructor({ grupoCapacitacionListadoViewRepository, logger }) {
    this.grupoCapacitacionListadoViewRepository = grupoCapacitacionListadoViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search } normalizado por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - cursoId, estado
   * @returns {Promise<{grupos: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const { page: pageNum, limit: limitNum } = normalizarPaginacionLista(page, limit);
    const cursoId = parseFiltroId(queryParams.cursoId, 'cursoId');
    const estado = this._parseEstado(queryParams.estado);
    const filters = { search: baseFilters.search, cursoId };

    this.logger.info('[Capacitación] Listando grupos de capacitación', {
      ...filters,
      estado,
      page: pageNum,
      limit: limitNum,
    });

    if (estado) return this._executeConFiltroEstado(filters, estado, pageNum, limitNum);

    const { rows, total } = await this.grupoCapacitacionListadoViewRepository.findListado(
      filters,
      pageNum,
      limitNum
    );
    return {
      grupos: await this._presentar(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /** Filtro por estado efectivo del curso: filtra y pagina en JS. @private */
  async _executeConFiltroEstado(filters, estado, pageNum, limitNum) {
    const { rows } = await this.grupoCapacitacionListadoViewRepository.findListado(
      filters,
      1,
      LIMIT_FILTRO_ESTADO_EFECTIVO
    );
    const filtrados = (await this._presentar(rows)).filter((g) => g.cursoEstado === estado);
    const offset = (pageNum - 1) * limitNum;
    return {
      grupos: filtrados.slice(offset, offset + limitNum),
      total: filtrados.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtrados.length / limitNum),
    };
  }

  /** @private */
  _parseEstado(valor) {
    if (valor === undefined || valor === null || valor === '') return null;
    if (!ESTADOS_CAPACITACION_VALUES.includes(valor)) {
      throw new ValidationError(`estado debe ser uno de: ${ESTADOS_CAPACITACION_VALUES.join(', ')}`);
    }
    return valor;
  }

  /** Filas de la vista + horarios de los grupos → presentación. @private */
  async _presentar(rows) {
    const horarioRows = await this.grupoCapacitacionListadoViewRepository.findHorariosByGrupoIds(
      rows.map((r) => r.grupo_id)
    );
    const porGrupo = new Map();
    horarioRows.forEach((h) => {
      const lista = porGrupo.get(h.grupo_id) ?? [];
      lista.push(GrupoCapacitacionMapper.horarioRowToPresentation(h));
      porGrupo.set(h.grupo_id, lista);
    });
    return rows.map((row) => GrupoCapacitacionMapper.rowToPresentation(row, porGrupo.get(row.grupo_id) ?? []));
  }
}
