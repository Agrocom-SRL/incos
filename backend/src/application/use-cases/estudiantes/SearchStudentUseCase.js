/**
 * Use Case: SearchStudentUseCase
 * Módulo: Estudiantes
 * Busca estudiantes por texto libre
 *
 * Busca en: codigo_estudiante, ci, apellido_paterno, apellido_materno, nombres
 * (campos definidos en StudentRepository.getSearchFields())
 *
 * Usa StudentMapper para convertir entidades a formato de presentación (campos en español)
 * manteniendo consistencia con ListStudentsUseCase.
 *
 * Enriquecimiento aditivo (landing Historial académico, docs/plan/HISTORIAL-ACADEMICO.md):
 * tras la búsqueda añade gestionIngresoAnio (vista_estudiante_datos_academicos) y
 * periodoActualNumero/periodoActualNombre/paraleloActual/promedioHistorial
 * (vista_estudiante_resumen_academico), con los MISMOS nombres que el listado.
 */
import { BaseSearchUseCase } from '../base/BaseSearchUseCase.js';
import { StudentMapper } from '../../mappers/estudiantes/index.js';
import {
  applyResumenAcademico,
  buildResumenAcademicoByStudentId,
} from './support/resumenAcademicoEnricher.js';

export class SearchStudentUseCase extends BaseSearchUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} [params.studentAcademicDataRepository] - Repo de datos académicos (enriquecimiento aditivo)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ studentRepository, studentAcademicDataRepository, logger }) {
    super({
      repository: studentRepository,
      logger,
      moduleName: 'Estudiantes',
      resourceName: 'estudiante',
    });
    this.studentAcademicDataRepository = studentAcademicDataRepository ?? null;
  }

  /**
   * Retorna el mapper a usar para convertir entidades Student a presentación
   * @returns {StudentMapper}
   */
  getMapper() {
    return StudentMapper;
  }

  /**
   * Ejecuta la búsqueda base y enriquece los resultados con los campos
   * académicos aditivos del contrato de la landing del Historial académico.
   *
   * @override
   * @param {string} searchTerm - Término de búsqueda (ya validado)
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Resultados formateados y enriquecidos
   */
  async execute(searchTerm, limit = 50) {
    const results = await super.execute(searchTerm, limit);
    if (!Array.isArray(results) || results.length === 0 || !this.studentAcademicDataRepository) {
      return results;
    }

    const studentIds = results.map((s) => s.id).filter((id) => id != null);
    const [academicRows, resumenByStudentId] = await Promise.all([
      this.studentAcademicDataRepository.obtenerDatosAcademicosPorEstudianteIds(studentIds),
      buildResumenAcademicoByStudentId(this.studentAcademicDataRepository, studentIds),
    ]);

    const gestionAnioByStudentId = {};
    const carreraByStudentId = {};
    (academicRows || []).forEach((row) => {
      const id = row?.estudiante_id;
      if (id == null) return;
      if (gestionAnioByStudentId[id] === undefined) {
        gestionAnioByStudentId[id] = row.gestion_ingreso_anio ?? null;
      }
      if (carreraByStudentId[id] === undefined) {
        carreraByStudentId[id] = {
          carreraId: row.carrera_id ?? null,
          carreraNombre: row.carrera_nombre ?? null,
        };
      }
    });

    return applyResumenAcademico(results, resumenByStudentId).map((item) => ({
      ...item,
      gestionIngresoAnio: gestionAnioByStudentId[item.id] ?? null,
      carreraId: carreraByStudentId[item.id]?.carreraId ?? null,
      carreraNombre: carreraByStudentId[item.id]?.carreraNombre ?? null,
    }));
  }
}
