/**
 * GET /api/v1/proyectos-grado/reportes/seguimiento-tutoria-docentes/export?docenteId=&carreraId=&anio=&mes=
 * Extensión 2026-08-10 (reemplaza la planilla de avance "10 en 10" de 3er
 * año). Excel del reporte ADMINISTRATIVO de seguimiento de tutorías a
 * docentes: resumen de UN MES (igual que el preview en pantalla), una hoja
 * POR CARRERA con sus docentes-tutores en tabla plana.
 * Permiso: titulacion.proyecto EXPORTAR. Respuesta binaria (.xlsx).
 */
export class ExportSeguimientoTutoriaDocentesExcelController {
  constructor({ exportSeguimientoTutoriaDocentesExcelUseCase, logger }) {
    if (!exportSeguimientoTutoriaDocentesExcelUseCase) {
      throw new Error('exportSeguimientoTutoriaDocentesExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportSeguimientoTutoriaDocentesExcelUseCase =
      exportSeguimientoTutoriaDocentesExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { docenteId, carreraId, anio, mes } = req.query;
      this.logger.info('[Titulación] Request exportación Excel seguimiento de tutorías a docentes', {
        docenteId,
        carreraId,
        anio,
        mes,
      });

      const { buffer, fileName, mimeType } =
        await this.exportSeguimientoTutoriaDocentesExcelUseCase.execute({
          docenteId,
          carreraId,
          anio,
          mes,
        });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Titulación] Error al exportar seguimiento de tutorías a docentes', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
