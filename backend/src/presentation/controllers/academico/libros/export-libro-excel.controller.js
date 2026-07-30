/**
 * GET /api/v1/libros/:id/export — descarga el libro completo en Excel
 * (binario; una hoja por paralelo, folios apilados + firmas de docentes).
 */
export class ExportLibroExcelController {
  constructor({ exportLibroExcelUseCase, logger }) {
    this.exportLibroExcelUseCase = exportLibroExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { buffer, fileName, mimeType } = await this.exportLibroExcelUseCase.execute({
        id: Number(req.params.id),
      });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Libros] Error export Excel', { error: error.message });
      return next(error);
    }
  }
}

export default ExportLibroExcelController;
