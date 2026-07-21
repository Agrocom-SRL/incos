import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { ESTADOS_DERIVADOS_POR_FECHA } from './helpers/cursoEstadoEfectivo.js';

/** Límite usado al filtrar por estado EFECTIVO (recálculo en JS): trae "todo"
 * respetando el mismo cap que ya usa el repositorio de vistas. */
const LIMIT_FILTRO_ESTADO_EFECTIVO = 10000;

/**
 * Use Case: ListCursosCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Lista cursos de capacitación desde la vista 155
 * (`vista_cursos_capacitacion_listado`) con filtros, paginación y agregados
 * (inscritos_count, cupo_disponible, horarios_detalle).
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { cursosCapacitacion, total, page, limit, totalPages }.
 *
 * Filtros específicos: estado, incluirInactivos (el listado soporta el switch
 * activar/desactivar del patrón EstadoTogglePill).
 *
 * El `estado` que expone el mapper es el EFECTIVO (`resolveEstadoEfectivoCurso`),
 * no el crudo de BD. Por eso el filtro por `estado` se resuelve distinto según
 * el valor pedido:
 * - PROPUESTO / CANCELADO: crudo == efectivo siempre → filtro en el WHERE SQL
 *   de la vista, con paginación normal (comportamiento sin cambios).
 * - ABIERTO / EN_CURSO / CERRADO (`ESTADOS_DERIVADOS_POR_FECHA`): se pide el
 *   listado SIN ese filtro en SQL, se mapea (estado ya efectivo) y se filtra/
 *   pagina en JS.
 */
export class ListCursosCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionFichaViewRepository - Repo de lectura (vistas 154/155)
   * @param {ILogger} params.logger
   */
  constructor({ cursoCapacitacionFichaViewRepository, logger }) {
    this.cursoCapacitacionFichaViewRepository = cursoCapacitacionFichaViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search, sort } normalizados por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - Query params originales (estado, incluirInactivos)
   * @returns {Promise<{cursosCapacitacion: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const estadoParam = queryParams.estado || undefined;
    const includeInactive =
      queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const esEstadoDerivadoPorFecha =
      estadoParam !== undefined && ESTADOS_DERIVADOS_POR_FECHA.includes(estadoParam);

    this.logger.info('[Capacitación] Iniciando listado de cursos de capacitación', {
      estado: estadoParam,
      esEstadoDerivadoPorFecha,
      page: pageNum,
      limit: limitNum,
    });

    if (esEstadoDerivadoPorFecha) {
      return this._executeConFiltroEnJs({
        search: baseFilters.search,
        includeInactive,
        estadoParam,
        pageNum,
        limitNum,
      });
    }

    const filters = {
      search: baseFilters.search,
      estado: estadoParam,
      includeInactive,
    };

    const { rows, total } = await this.cursoCapacitacionFichaViewRepository.findListado(
      filters,
      pageNum,
      limitNum
    );

    const totalPages = Math.ceil(total / limitNum);

    this.logger.info('[Capacitación] Cursos de capacitación listados exitosamente', {
      total,
      count: rows.length,
    });

    return {
      cursosCapacitacion: CursoCapacitacionMapper.viewRowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  /**
   * Filtro por estado EFECTIVO (ABIERTO/EN_CURSO/CERRADO): trae el listado sin
   * filtro de estado en SQL, mapea (estado ya efectivo) y filtra/pagina en JS.
   * @private
   */
  async _executeConFiltroEnJs({ search, includeInactive, estadoParam, pageNum, limitNum }) {
    const { rows } = await this.cursoCapacitacionFichaViewRepository.findListado(
      { search, includeInactive },
      1,
      LIMIT_FILTRO_ESTADO_EFECTIVO
    );

    const todos = CursoCapacitacionMapper.viewRowsToPresentation(rows);
    const filtrados = todos.filter((curso) => curso.estado === estadoParam);

    const totalJS = filtrados.length;
    const offset = (pageNum - 1) * limitNum;
    const pagina = filtrados.slice(offset, offset + limitNum);
    const totalPages = Math.ceil(totalJS / limitNum);

    this.logger.info(
      '[Capacitación] Cursos de capacitación listados exitosamente (filtro por estado efectivo)',
      {
        estado: estadoParam,
        total: totalJS,
        count: pagina.length,
      }
    );

    return {
      cursosCapacitacion: pagina,
      total: totalJS,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
