/**
 * GET /api/v1/proyectos-grado/reportes/planilla-avance-tercer-anio/export?carreraId=&gestionId=&bimestre=
 * Requisito 3 — extensión 2026-07-31.
 * Excel de la planilla de avance de tutorías "10 en 10" (folios de 10 +
 * hoja de firmas + cuadro de %).
 * Permiso: titulacion.proyecto EXPORTAR. Respuesta binaria (.xlsx).
 */
export class ExportPlanillaAvanceTercerAnioExcelController {
  constructor({ exportPlanillaAvanceTercerAnioExcelUseCase, logger }) {
    if (!exportPlanillaAvanceTercerAnioExcelUseCase) {
      throw new Error('exportPlanillaAvanceTercerAnioExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportPlanillaAvanceTercerAnioExcelUseCase = exportPlanillaAvanceTercerAnioExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { carreraId, gestionId, bimestre } = req.query;
      this.logger.info('[Titulación] Request exportación Excel planilla de avance de tutorías', {
        carreraId,
        gestionId,
        bimestre,
      });

      const { buffer, fileName, mimeType } =
        await this.exportPlanillaAvanceTercerAnioExcelUseCase.execute({
          carreraId,
          gestionId,
          bimestre,
        });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Titulación] Error al exportar planilla de avance de tutorías', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
