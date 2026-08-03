/**
 * GET /api/v1/asistencia/consolidado/export?paraleloGestionId=<entero>[&bimestre=1..4]
 * Descarga Excel del Consolidado % de asistencia (1 hoja, planilla verde).
 * Permiso: academico.asistencia.consolidado.ver · EXPORTAR.
 */
export class ExportConsolidadoAsistenciaController {
  constructor({ exportConsolidadoAsistenciaExcelUseCase, logger }) {
    if (!exportConsolidadoAsistenciaExcelUseCase) {
      throw new Error('exportConsolidadoAsistenciaExcelUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.exportConsolidadoAsistenciaExcelUseCase = exportConsolidadoAsistenciaExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { paraleloGestionId, bimestre } = req.query;

      this.logger.info('[Asistencia] Export consolidado %', { paraleloGestionId, bimestre });

      const { buffer, fileName, mimeType } =
        await this.exportConsolidadoAsistenciaExcelUseCase.execute({
          paraleloGestionId,
          bimestre,
        });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Asistencia] Error export consolidado %', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportConsolidadoAsistenciaController;
