/**
 * PATCH /api/v1/cursos/:id
 */
export class PatchCursoOfertaController {
  constructor({ updateCursoOfertaUseCase, logger, responseFormatter }) {
    if (!updateCursoOfertaUseCase) throw new Error('updateCursoOfertaUseCase es requerido');
    if (!logger) throw new Error('logger es requerido');
    if (!responseFormatter) throw new Error('responseFormatter es requerido');
    this.useCase = updateCursoOfertaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const courseId = Number(req.params.id);
      const b = req.body || {};
      this.logger.info('[Académico] Request actualizar curso', { courseId });
      const result = await this.useCase.execute(
        {
          courseId,
          parallelId: b.parallelId,
          codigo: b.codigo,
          cupoMaximo: b.cupoMaximo,
          cupoMinimo: b.cupoMinimo,
          colorHex: b.colorHex,
        },
        req.user?.id ?? null,
      );
      return this.responseFormatter.updated(res, result, 'curso', courseId, req);
    } catch (err) {
      return next(err);
    }
  }
}
