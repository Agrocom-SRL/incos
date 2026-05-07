/**
 * POST /api/v1/paralelos/:id/cursos
 */
export class PostParaleloCursoController {
  constructor({ createParaleloCursoOfertaUseCase, logger, responseFormatter }) {
    if (!createParaleloCursoOfertaUseCase) throw new Error('createParaleloCursoOfertaUseCase es requerido');
    if (!logger) throw new Error('logger es requerido');
    if (!responseFormatter) throw new Error('responseFormatter es requerido');
    this.useCase = createParaleloCursoOfertaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const parallelId = Number(req.params.id);
      const b = req.body || {};
      this.logger.info('[Académico] Request crear curso en paralelo', {
        parallelId,
        asignaturaPlanId: b.asignaturaPlanId,
      });
      const result = await this.useCase.execute(
        {
          parallelId,
          asignaturaPlanId: b.asignaturaPlanId,
          codigo: b.codigo,
          cupoMaximo: b.cupoMaximo,
          cupoMinimo: b.cupoMinimo,
          colorHex: b.colorHex,
        },
        req.user?.id ?? null,
      );
      const curso = result?.curso;
      const resourceId = curso?.cursoId ?? 'nuevo';
      return this.responseFormatter.created(res, result, 'curso del paralelo', resourceId, req);
    } catch (err) {
      return next(err);
    }
  }
}
