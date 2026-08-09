/**
 * GET /api/v1/nivelaciones/estudiante/:estudianteId/pendientes (B2, "Gap 2")
 */
export class ListMateriasPendientesEstudianteController {
  constructor({ listMateriasPendientesEstudianteUseCase, logger, responseFormatter }) {
    this.listMateriasPendientesEstudianteUseCase = listMateriasPendientesEstudianteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const estudianteId = parseInt(req.params.estudianteId, 10);

      const materiasPendientesEstudiante =
        await this.listMateriasPendientesEstudianteUseCase.execute({ estudianteId });

      return this.responseFormatter._success(
        res,
        { materiasPendientesEstudiante },
        { message: 'Materias pendientes del estudiante obtenidas correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Nivelaciones] Error materias pendientes de estudiante', {
        error: error.message,
        estudianteId: req.params?.estudianteId,
      });
      return next(error);
    }
  }
}

export default ListMateriasPendientesEstudianteController;
