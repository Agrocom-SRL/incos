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

  /**
   * Las estadísticas de carga/conflictos se añaden DESPUÉS del listado base y la decisión
   * de incluirlas vive en una variable local: guardarla en la instancia se contagiaría entre
   * peticiones concurrentes si el use case es singleton.
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const incluir = queryParams?.incluir_estadisticas;
    const omitirEstadisticas =
      incluir === 'false' ||
      incluir === false ||
      incluir === '0' ||
      incluir === 0;

    const resultado = await super.execute(baseFilters, page, limit, queryParams);
    if (omitirEstadisticas) return resultado;
    return { ...resultado, docentes: await this._conEstadisticas(resultado.docentes) };
  }

  async _conEstadisticas(data) {
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
