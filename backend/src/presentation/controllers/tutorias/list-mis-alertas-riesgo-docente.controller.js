/**
 * GET /api/v1/acompanamiento/alertas/mis-alumnos (A2)
 * Alertas de riesgo de los cursos vigentes del docente de la SESIÓN.
 * dataFieldName: 'misAlumnosEnRiesgo'. El docente se resuelve en servidor
 * (anti-IDOR).
 */
export class ListMisAlertasRiesgoDocenteController {
  constructor({ listMisAlertasRiesgoDocenteUseCase, logger, responseFormatter }) {
    this.listMisAlertasRiesgoDocenteUseCase = listMisAlertasRiesgoDocenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      this.logger.info('[Tutorías] Mis alumnos en riesgo solicitado', { usuarioId });

      const data = await this.listMisAlertasRiesgoDocenteUseCase.execute({
        usuarioId,
        queryParams: req.query,
      });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mis alumnos en riesgo obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al obtener mis alumnos en riesgo', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
