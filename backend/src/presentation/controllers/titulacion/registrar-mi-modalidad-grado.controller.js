/**
 * POST /api/v1/proyectos-grado/mi-proyecto (Fase B3, autorregistro del
 * estudiante, extensión 2026-08-17)
 * Crea el proyecto de grado del estudiante de la SESIÓN (individual, con
 * prerrequisito de 3er año + sin pendientes de 1º/2º). El estudiante se
 * resuelve en servidor (anti-IDOR). dataFieldName: 'proyectoGrado'.
 */
export class RegistrarMiModalidadGradoController {
  constructor({ registrarMiModalidadGradoUseCase, logger, responseFormatter }) {
    this.registrarMiModalidadGradoUseCase = registrarMiModalidadGradoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      this.logger.info('[Titulación] Autorregistro de modalidad de grado solicitado', {
        usuarioId,
      });

      const result = await this.registrarMiModalidadGradoUseCase.execute({
        usuarioId,
        body: req.body || {},
      });

      return this.responseFormatter.created(
        res,
        result.proyectoGrado,
        'proyecto de grado',
        result.proyectoGrado?.id ?? 'nuevo',
        req
      );
    } catch (error) {
      this.logger.error('[Titulación] Error en autorregistro de modalidad de grado', {
        error: error.message,
        stack: error.stack,
        usuarioId: req.usuario?.id,
      });
      return next(error);
    }
  }
}
