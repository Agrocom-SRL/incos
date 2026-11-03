/**
 * GET — listado enriquecido de asignaciones docentes (oferta + materia + paralelo).
 */

import { parseFiltroId } from '../../utils/validacionEntrada.js';
import { TeacherAssignmentPresentationMapper } from '../../mappers/docentes/TeacherAssignmentPresentationMapper.js';

/** Filtro por id: vacío ⇒ null (sin filtro); '5x', 0, -1 o 'abc' ⇒ ValidationError. */
function parsePositiveInt(value, nombre) {
  return parseFiltroId(value, nombre) ?? null;
}

function parseBoolQuery(value) {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return null;
}

export class ListTeacherAssignmentsUseCase {
  constructor({ teacherAssignmentRepository, logger }) {
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} _baseFilters - ignorado; filtros desde queryParams
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams
   * @param {{ snakeCase?: boolean }} [options]
   */
  async execute(_baseFilters = {}, page = 1, limit = 50, queryParams = {}, options = {}) {
    const filters = this.buildFilters(queryParams);
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    this.logger.info('[AsignacionesDocentes] Listado', { filters, page: pageNum, limit: limitNum });

    const result = await this.teacherAssignmentRepository.findEnriched(
      filters,
      pageNum,
      limitNum
    );

    const mapFn = options.snakeCase
      ? TeacherAssignmentPresentationMapper.enrichedRowsToPresentation
      : (rows) => rows.map(TeacherAssignmentPresentationMapper.enrichedRowToLegacyPresentation);

    const rows = mapFn(result.rows);
    const total = result.total ?? 0;
    const totalPages = Math.ceil(total / limitNum) || 0;

    return {
      asignaciones: rows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  buildFilters(queryParams = {}) {
    const filters = {};

    const gestionPlanId = parsePositiveInt(
      queryParams.gestionPlanId ?? queryParams.gestion_plan_id,
      'gestionPlanId'
    );
    if (gestionPlanId) filters.managementPlanId = gestionPlanId;

    const offerCourseId = parsePositiveInt(
      queryParams.offerCourseId ??
        queryParams.oferta_curso_id ??
        queryParams.ofertaCursoId ??
        queryParams.cursoId ??
        queryParams.curso_id,
      'ofertaCursoId'
    );
    if (offerCourseId) filters.offerCourseId = offerCourseId;

    const parallelManagementId = parsePositiveInt(
      queryParams.parallelManagementId ?? queryParams.paralelo_gestion_id,
      'paraleloGestionId'
    );
    if (parallelManagementId) filters.parallelManagementId = parallelManagementId;

    const docenteId = parsePositiveInt(queryParams.docenteId ?? queryParams.docente_id, 'docenteId');
    if (docenteId) filters.teacherId = docenteId;

    const vig = parseBoolQuery(queryParams.vigente);
    if (vig !== null) filters.vigente = vig;

    return filters;
  }
}
