/**
 * GET /api/v1/docentes/mis-estudiantes
 * Roster de estudiantes de los cursos vigentes del docente de la sesión
 * (portal del rol docente).
 *
 * El docente se resuelve en servidor desde req.usuario.id (lo hace el use case,
 * anti-IDOR). No recibe ningún id del cliente. Gate solo `authenticate`, como
 * /docentes/mis-datos y /dashboard/mi-resumen-docente.
 */
export class GetMisEstudiantesDocenteController {
  /**
   * @param {Object} params
   * @param {Object} params.getMisEstudiantesDocenteUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getMisEstudiantesDocenteUseCase, logger, responseFormatter }) {
    this.getMisEstudiantesDocenteUseCase = getMisEstudiantesDocenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;

      this.logger.info('[Docentes] Mis estudiantes solicitado', { usuarioId });

      const data = await this.getMisEstudiantesDocenteUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mis estudiantes obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Docentes] Error al obtener mis estudiantes', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetMisEstudiantesDocenteController;
