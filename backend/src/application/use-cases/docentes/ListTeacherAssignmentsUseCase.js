/**
 * GET /api/v1/docentes/asignaciones — lista asignaciones docente filtradas.
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { TeacherAssignmentListMapper } from '../../mappers/docentes/TeacherAssignmentListMapper.js';

function parsePositiveInt(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export class ListTeacherAssignmentsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.teacherAssignmentRepository
   * @param {Object} params.logger
   */
  constructor({ teacherAssignmentRepository, logger }) {
    super({
      repository: teacherAssignmentRepository,
      logger,
      moduleName: 'Docentes',
      resourceName: 'asignaciones docentes',
      collectionFieldName: 'teacherAssignments',
      dataFieldName: 'asignaciones',
    });
  }

  getMapper() {
    return TeacherAssignmentListMapper;
  }

  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const merged = { ...baseFilters };
    const gestionPlanId = parsePositiveInt(queryParams.gestionPlanId);
    if (gestionPlanId) merged.managementPlanId = gestionPlanId;
    const cursoId = parsePositiveInt(queryParams.cursoId);
    if (cursoId) merged.courseId = cursoId;
    const docenteId = parsePositiveInt(queryParams.docenteId);
    if (docenteId) merged.teacherId = docenteId;

    const vig = queryParams.vigente;
    if (vig === 'true' || vig === '1') merged.active = true;
    if (vig === 'false' || vig === '0') merged.active = false;

    return merged;
  }
}
