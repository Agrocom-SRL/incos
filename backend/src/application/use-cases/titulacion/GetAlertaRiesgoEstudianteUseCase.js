import { NotFoundError } from '../../../domain/errors/AppError.js';
import { RiesgoAcademicoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: GetAlertaRiesgoEstudianteUseCase (A3)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Detalle de riesgo de UN estudiante: todas sus materias (vista 156, en
 * riesgo o no) + resumen (materias en riesgo / promedio).
 */
export class GetAlertaRiesgoEstudianteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.riesgoAcademicoViewRepository - Vista 156
   * @param {ILogger} params.logger
   */
  constructor({ riesgoAcademicoViewRepository, logger }) {
    this.riesgoAcademicoViewRepository = riesgoAcademicoViewRepository;
    this.logger = logger;
  }

  /**
   * @param {number} estudianteId
   * @param {Object} [queryParams] - { gestionId }
   * @returns {Promise<{alertaEstudiante: Object}>}
   */
  async execute(estudianteId, queryParams = {}) {
    const rows = await this.riesgoAcademicoViewRepository.findByEstudianteId(estudianteId, {
      gestionId: queryParams.gestionId ? Number(queryParams.gestionId) : undefined,
    });

    if (!rows || rows.length === 0) {
      throw new NotFoundError(
        `información de riesgo del estudiante con ID ${estudianteId}`
      );
    }

    const materias = RiesgoAcademicoMapper.alertaRowsToPresentation(rows);
    const primera = materias[0];
    const materiasEnRiesgo = materias.filter((materia) => materia.enRiesgo);

    const alertaEstudiante = {
      estudianteId: primera.estudianteId,
      codigoEstudiante: primera.codigoEstudiante,
      nombreCompleto: primera.nombreCompleto,
      carreraId: primera.carreraId,
      carreraCodigo: primera.carreraCodigo,
      carreraNombre: primera.carreraNombre,
      carreraColorHex: primera.carreraColorHex,
      gestionId: primera.gestionId,
      umbralRiesgo: primera.umbralRiesgo,
      totalMaterias: materias.length,
      materiasEnRiesgo: materiasEnRiesgo.length,
      enRiesgo: materiasEnRiesgo.length > 0,
      materias,
    };

    this.logger.info('[Tutorías] Detalle de riesgo de estudiante obtenido', {
      estudianteId,
      materias: materias.length,
      enRiesgo: materiasEnRiesgo.length,
    });

    return { alertaEstudiante };
  }
}
