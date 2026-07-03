/**
 * GET /api/v1/estudiantes/:id/historial-academico
 * Devuelve el historial académico (kardex / transcript FORM-SIE-ITT-04) de un
 * estudiante: { estudiante, filas, resumen }.
 */
export class GetHistorialAcademicoController {
  /**
   * @param {Object} params
   * @param {Object} params.getHistorialAcademicoUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getHistorialAcademicoUseCase, logger, responseFormatter }) {
    if (!getHistorialAcademicoUseCase) {
      throw new Error('getHistorialAcademicoUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    if (!responseFormatter) throw new Error('responseFormatter es requerido');
    this.getHistorialAcademicoUseCase = getHistorialAcademicoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const estudianteId = req.params.id;

      this.logger.info('[Estudiantes] Historial académico', { estudianteId });

      const payload = await this.getHistorialAcademicoUseCase.execute({ estudianteId });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Historial académico obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Estudiantes] Error historial académico', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetHistorialAcademicoController;
