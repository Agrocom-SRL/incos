/**
 * Use Case: ListStudentsUseCase
 * Módulo: Estudiantes
 * Lista estudiantes desde vista_estudiante_datos_personales y enriquece con datos académicos
 * (carrera, gestión de ingreso, tipo de admisión) desde vista_estudiante_datos_academicos.
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { StudentMapper } from '../../mappers/estudiantes/index.js';
import {
  applyResumenAcademico,
  buildResumenAcademicoByStudentId,
} from './support/resumenAcademicoEnricher.js';

export class ListStudentsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes (listFromView)
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos (obtenerDatosAcademicosPorEstudianteIds)
   * @param {ILogger} params.logger - Logger
   */
  constructor({ studentRepository, studentAcademicDataRepository, logger }) {
    super({
      repository: studentRepository,
      logger,
      moduleName: 'Estudiantes',
      resourceName: 'estudiantes',
      collectionFieldName: 'students',
      dataFieldName: 'estudiantes',
    });
    this.studentAcademicDataRepository = studentAcademicDataRepository;
  }

  getMapper() {
    return StudentMapper;
  }

  /**
   * Ejecuta el listado: vista datos personales + enriquecimiento con datos académicos (carrera, gestión, tipo admisión).
   * @override
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const initialFilters = Object.keys(queryParams).length > 0
      ? this.buildSpecificFilters(queryParams, baseFilters)
      : baseFilters;
    const filters = await this.prepareFilters(initialFilters, queryParams);
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    this.logger.info(`[${this.moduleName}] Iniciando listado de ${this.resourceName}`, {
      filters,
      page: pageNum,
      limit: limitNum,
    });

    try {
      const result = await this.repository.listFromView(filters, pageNum, limitNum);
      const data = StudentMapper.viewRowsToPresentation(result.students || []);

      // Enriquecer con datos académicos (carrera, gestión ingreso, tipo admisión) desde vista_estudiante_datos_academicos
      // + resumen académico (periodo/paralelo actual, promedio historial) desde vista_estudiante_resumen_academico
      const studentIds = data.map((s) => s.id).filter((id) => id != null);
      const academicByStudentId = {};
      let resumenByStudentId = {};
      if (studentIds.length > 0 && this.studentAcademicDataRepository) {
        const [academicRows, resumenMap] = await Promise.all([
          this.studentAcademicDataRepository.obtenerDatosAcademicosPorEstudianteIds(studentIds),
          buildResumenAcademicoByStudentId(this.studentAcademicDataRepository, studentIds),
        ]);
        resumenByStudentId = resumenMap;
        academicRows.forEach((row) => {
          const id = row.estudiante_id;
          if (id != null && !academicByStudentId[id]) {
            academicByStudentId[id] = {
              carreraNombre: row.carrera_nombre ?? null,
              carreraCodigo: row.carrera_codigo ?? null,
              carreraColorHex: row.carrera_color_hex ?? null,
              gestionIngresoNombre: row.gestion_ingreso_nombre ?? null,
              gestionIngresoAnio: row.gestion_ingreso_anio ?? null,
              estadoAcademico: row.estado_academico ?? null,
              tipoAdmision: row.tipo_admision ?? null,
            };
          }
        });
      }
      const dataWithAcademic = applyResumenAcademico(
        data.map((item) => ({
          ...item,
          carreraNombre: academicByStudentId[item.id]?.carreraNombre ?? null,
          carreraCodigo: academicByStudentId[item.id]?.carreraCodigo ?? null,
          carreraColorHex: academicByStudentId[item.id]?.carreraColorHex ?? null,
          gestionIngresoNombre: academicByStudentId[item.id]?.gestionIngresoNombre ?? null,
          gestionIngresoAnio: academicByStudentId[item.id]?.gestionIngresoAnio ?? null,
          estadoAcademico: academicByStudentId[item.id]?.estadoAcademico ?? null,
          tipoAdmision: academicByStudentId[item.id]?.tipoAdmision ?? null,
        })),
        resumenByStudentId
      );

      const enrichedData = await this.enrichData(dataWithAcademic, result);
      const totalPages = Math.ceil(result.total / limitNum);

      this.logger.info(`[${this.moduleName}] ${this.resourceName} listados exitosamente`, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        count: enrichedData.length,
      });

      return {
        [this.dataFieldName]: enrichedData,
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`[${this.moduleName}] Error al listar ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
        filters,
        page: pageNum,
        limit: limitNum,
      });
      throw error;
    }
  }
}
