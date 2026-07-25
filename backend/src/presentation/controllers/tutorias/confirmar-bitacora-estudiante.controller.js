/**
 * POST /api/v1/proyectos-grado/:id/bitacora/:entradaId/confirmar (T17)
 * Confirmación digital del estudiante (firma de la planilla). RBAC: acción
 * LISTAR de bitácora + guard de pertenencia en servidor (integrante ACTIVO,
 * lo aplica el use case con resolveEstudianteIdForUsuario).
 * dataFieldName: 'bitacoraEntrada'.
 */
export class ConfirmarBitacoraEstudianteController {
  constructor({ confirmarBitacoraEstudianteUseCase, logger, responseFormatter }) {
    this.confirmarBitacoraEstudianteUseCase = confirmarBitacoraEstudianteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const entradaId = parseInt(req.params.entradaId, 10);
      const usuarioId = req.usuario?.id;
      this.logger.info('[Tutorías] Request de confirmación de bitácora por estudiante', {
        proyectoGradoId,
        entradaId,
        usuarioId,
      });

      const result = await this.confirmarBitacoraEstudianteUseCase.execute({
        usuarioId,
        proyectoGradoId,
        entradaId,
      });

      return this.responseFormatter.updated(
        res,
        result.bitacoraEntrada,
        'entrada de bitácora',
        entradaId,
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al confirmar entrada de bitácora', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
