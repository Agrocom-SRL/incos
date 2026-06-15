import { NotFoundError } from '../../../domain/errors/AppError.js';

export class ValidarOfertaParaleloGestionUseCase {
  constructor({ parallelManagementRepository, courseOfferRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  async execute(parallelManagementId) {
    const ctx = await this.parallelManagementRepository.findGenerationContext(
      parallelManagementId
    );
    if (!ctx) throw new NotFoundError('paralelo de gestión');

    const { expected, actual } = await this.courseOfferRepository.findValidationBundle(
      parallelManagementId,
      ctx.studyPlanId,
      ctx.periodId
    );

    const expectedIds = new Set(expected.map((r) => Number(r.asignaturaPlanId)));
    const actualBySubject = new Map(
      actual.map((r) => [Number(r.asignaturaPlanId), r])
    );

    const faltantes = expected
      .filter((r) => !actualBySubject.has(Number(r.asignaturaPlanId)))
      .map((r) => ({
        asignaturaPlanId: Number(r.asignaturaPlanId),
        materiaCodigo: r.materiaCodigo ?? null,
        materiaNombre: r.materiaNombre ?? null,
        horasSemanales: Number(r.horasSemanales) || 0,
      }));

    const sobrantes = actual
      .filter((r) => !expectedIds.has(Number(r.asignaturaPlanId)))
      .map((r) => ({
        ofertaCursoId: Number(r.ofertaCursoId),
        asignaturaPlanId: Number(r.asignaturaPlanId),
        materiaCodigo: r.materiaCodigo ?? null,
        materiaNombre: r.materiaNombre ?? null,
        periodoId: r.periodoId != null ? Number(r.periodoId) : null,
      }));

    const horasTotal = expected.reduce(
      (sum, r) => sum + (Number(r.horasSemanales) || 0),
      0
    );

    const valido = faltantes.length === 0 && sobrantes.length === 0;

    return {
      valido,
      asignaturas_esperadas: expected.length,
      oferta_actual: actual.length,
      faltantes,
      sobrantes,
      horas_total: horasTotal,
    };
  }
}
