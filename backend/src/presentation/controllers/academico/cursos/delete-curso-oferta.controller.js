/**
 * DELETE /api/v1/cursos/:id
 */
export class DeleteCursoOfertaController {
  constructor({ deleteCursoOfertaUseCase, logger, responseFormatter }) {
    if (!deleteCursoOfertaUseCase) throw new Error('deleteCursoOfertaUseCase es requerido');
    if (!logger) throw new Error('logger es requerido');
    if (!responseFormatter) throw new Error('responseFormatter es requerido');
    this.useCase = deleteCursoOfertaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const courseId = Number(req.params.id);
      const parallelId = req.query?.paraleloId != null ? Number(req.query.paraleloId) : undefined;
      this.logger.info('[Académico] Request eliminar curso', { courseId, parallelId });
      await this.useCase.execute(
        {
          courseId,
          parallelId: Number.isFinite(parallelId) && parallelId > 0 ? parallelId : undefined,
        },
        req.user?.id ?? null,
      );
      return this.responseFormatter.deleted(res, 'curso', courseId, req);
    } catch (err) {
      return next(err);
    }
  }
}
