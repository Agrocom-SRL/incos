/**
 * POST /api/v1/asistencia/cursos/:asignacionId/registro/cerrar?bimestre=
 */
export class CerrarRegistroAsistenciaController {
  constructor({ cerrarRegistroAsistenciaUseCase, logger, responseFormatter }) {
    this.cerrarRegistroAsistenciaUseCase = cerrarRegistroAsistenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.cerrarRegistroAsistenciaUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.query.bimestre,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Registro de asistencia cerrado' },
        req,
      );
    } catch (error) {
      this.logger.error('[Asistencia] Error POST cerrar registro', { error: error.message });
      return next(error);
    }
  }
}
