/**
 * GET /api/v1/estudiantes/mi-matricula
 * "Mi matrícula" del estudiante de la sesión (portal del estudiante):
 * materias matriculadas + horario semanal (gestión vigente), solo lectura.
 *
 * El estudiante se resuelve en servidor desde req.usuario.id (el use case lo hace).
 * No recibe ningún id del cliente.
 */
export class GetMiMatriculaEstudianteController {
  /**
   * @param {Object} params
   * @param {Object} params.getMiMatriculaEstudianteUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getMiMatriculaEstudianteUseCase, logger, responseFormatter }) {
    this.getMiMatriculaEstudianteUseCase = getMiMatriculaEstudianteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;

      this.logger.info('[Estudiantes] Mi matrícula solicitada', { usuarioId });

      const data = await this.getMiMatriculaEstudianteUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mi matrícula obtenida correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Estudiantes] Error al obtener mi matrícula', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetMiMatriculaEstudianteController;
