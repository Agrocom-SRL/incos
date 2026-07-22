/**
 * GET /api/v1/cursos-capacitacion/:id/inscritos/exportar
 * Excel (.xlsx, una hoja) del Listado de Inscritos de un curso de capacitación.
 *
 * Permiso: capacitacion.inscripcion EXPORTAR.
 */
export class ExportListadoInscritosCapacitacionController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/capacitacion/ExportListadoInscritosCapacitacionExcelUseCase.js').ExportListadoInscritosCapacitacionExcelUseCase} params.exportListadoInscritosCapacitacionExcelUseCase
   * @param {Object} params.logger
   */
  constructor({ exportListadoInscritosCapacitacionExcelUseCase, logger }) {
    if (!exportListadoInscritosCapacitacionExcelUseCase) {
      throw new Error('exportListadoInscritosCapacitacionExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportListadoInscritosCapacitacionExcelUseCase =
      exportListadoInscritosCapacitacionExcelUseCase;
    this.logger = logger;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async handle(req, res, next) {
    try {
      const capacitacionId = Number(req.params.id);

      this.logger.info('[Capacitación] Request exportación Excel listado de inscritos', {
        capacitacionId,
        path: req.path,
      });

      const { buffer, fileName, mimeType } =
        await this.exportListadoInscritosCapacitacionExcelUseCase.execute({ capacitacionId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Capacitación] Error al exportar Excel listado de inscritos', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportListadoInscritosCapacitacionController;
