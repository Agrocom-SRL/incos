/**
 * GET /api/v1/estudiantes/export/estadistica-inscritos
 * Descarga Excel de estadística de inscritos (vista_reporte_excel_inscritos).
 *
 * Query: gestion_id (opcional; por defecto gestión vigente)
 */
export class ExportEstadisticaInscritosExcelController {
  /**
   * @param {Object} params
   * @param {Object} params.exportStudentEnrollmentStatisticsExcelUseCase
   * @param {Object} params.logger
   */
  constructor({ exportStudentEnrollmentStatisticsExcelUseCase, logger }) {
    if (!exportStudentEnrollmentStatisticsExcelUseCase) {
      throw new Error('exportStudentEnrollmentStatisticsExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    const uc = exportStudentEnrollmentStatisticsExcelUseCase;
    this.exportStudentEnrollmentStatisticsExcelUseCase = uc;
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

      this.logger.info('Request de exportación Excel estadística inscritos', {
        gestion_id: gestionId,
        path: req.path
      });

      const execResult = await this.exportStudentEnrollmentStatisticsExcelUseCase.execute({
        gestionId
      });
      const { buffer, fileName, mimeType } = execResult;

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('Error al exportar Excel estadística inscritos', {
        error: error.message,
        stack: error.stack
      });
      return next(error);
    }
  }
}
