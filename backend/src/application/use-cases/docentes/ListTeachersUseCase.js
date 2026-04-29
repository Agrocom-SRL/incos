/**
 * Use Case: ListTeachersUseCase
 * Lista docentes desde la tabla docentes con búsqueda, orden y paginación estándar.
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { TeacherListMapper } from '../../mappers/docentes/TeacherListMapper.js';

export class ListTeachersUseCase extends BaseListUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.teacherRepository - Repositorio de docentes (TeacherRepository)
   * @param {Object} params.logger
   */
  constructor({ teacherRepository, logger }) {
    super({
      repository: teacherRepository,
      logger,
      moduleName: 'Docentes',
      resourceName: 'docentes',
      collectionFieldName: 'teachers',
      dataFieldName: 'docentes',
    });
  }

  getMapper() {
    return TeacherListMapper;
  }

  async enrichData(data) {
    const teacherIds = (data || [])
      .map((row) => Number(row?.id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!teacherIds.length) return data;

    const statsByTeacherId = await this.repository.getTeachingLoadAndConflictStats(teacherIds);
    return data.map((row) => {
      const id = Number(row?.id);
      const stats = statsByTeacherId[id] || {
        totalAsignaciones: 0,
        totalMaterias: 0,
        totalParalelos: 0,
        hasAsignaciones: false,
        conflictos: {
          curso: 0,
          horario: 0,
          aula: 0,
          total: 0,
          hasConflictos: false,
        },
      };
      return {
        ...row,
        teachingStats: stats,
      };
    });
  }
}
