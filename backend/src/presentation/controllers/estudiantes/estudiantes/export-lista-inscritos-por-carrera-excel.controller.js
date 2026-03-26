/**
 * GET /api/v1/estudiantes/export/lista-inscritos-por-carrera
 * Descarga Excel de lista de inscritos por carrera con hojas por paralelo.
 *
 * Query:
 * - carrera_id (requerido)
 * - gestion_id (opcional; por defecto gestión vigente)
 */
export class ExportListaInscritosPorCarreraExcelController {
  /**
   * @param {Object} params
   * @param {Object} params.exportStudentEnrollmentStudentListExcelUseCase
   * @param {Object} params.logger
   */
  constructor({ exportStudentEnrollmentStudentListExcelUseCase, logger }) {
    if (!exportStudentEnrollmentStudentListExcelUseCase) {
      throw new Error('exportStudentEnrollmentStudentListExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportStudentEnrollmentStudentListExcelUseCase = exportStudentEnrollmentStudentListExcelUseCase;
    this.logger = logger;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async handle(req, res, next) {
    try {
      const gestionId = req.query?.gestion_id;
      const carreraId = req.query?.carrera_id;

      this.logger.info('Request de exportación Excel lista inscritos por carrera', {
        gestion_id: gestionId,
        carrera_id: carreraId,
        path: req.path
      });

      const execResult = await this.exportStudentEnrollmentStudentListExcelUseCase.execute({
        gestionId,
        carreraId
      });
      const { buffer, fileName, mimeType } = execResult;

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('Error al exportar Excel lista inscritos por carrera', {
        error: error.message,
        stack: error.stack
      });
      return next(error);
    }
  }
}
