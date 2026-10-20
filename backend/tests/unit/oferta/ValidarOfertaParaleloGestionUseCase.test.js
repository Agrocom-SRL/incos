import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

import { ValidarOfertaParaleloGestionUseCase } from '../../../src/application/use-cases/oferta/ValidarOfertaParaleloGestionUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ ctx = { studyPlanId: 2, periodId: 4 }, bundle = { expected: [], actual: [] } } = {}) => {
  const deps = {
    parallelManagementRepository: { findGenerationContext: jest.fn().mockResolvedValue(ctx) },
    courseOfferRepository: { findValidationBundle: jest.fn().mockResolvedValue(bundle) },
    logger: logger(),
  };
  return { deps, useCase: new ValidarOfertaParaleloGestionUseCase(deps) };
};

describe('ValidarOfertaParaleloGestionUseCase', () => {
  it('oferta completa: válida, sin faltantes ni sobrantes', async () => {
    const { deps, useCase } = crear({
      bundle: {
        expected: [{ asignaturaPlanId: 1, horasSemanales: '4' }, { asignaturaPlanId: 2, horasSemanales: 6 }],
        actual: [{ ofertaCursoId: 10, asignaturaPlanId: 1 }, { ofertaCursoId: 11, asignaturaPlanId: 2 }],
      },
    });
    const res = await useCase.execute(3);
    expect(deps.courseOfferRepository.findValidationBundle).toHaveBeenCalledWith(3, 2, 4);
    expect(res).toEqual({
      valido: true, asignaturas_esperadas: 2, oferta_actual: 2, faltantes: [], sobrantes: [], horas_total: 10,
    });
  });

  it('detecta faltantes y sobrantes', async () => {
    const { useCase } = crear({
      bundle: {
        expected: [{ asignaturaPlanId: '1', materiaCodigo: 'MAT', materiaNombre: 'Matemática', horasSemanales: 4 }],
        actual: [{ ofertaCursoId: '20', asignaturaPlanId: '9', materiaCodigo: 'FIS', periodoId: '7' }],
      },
    });
    const res = await useCase.execute(3);
    expect(res.valido).toBe(false);
    expect(res.faltantes).toEqual([
      { asignaturaPlanId: 1, materiaCodigo: 'MAT', materiaNombre: 'Matemática', horasSemanales: 4 },
    ]);
    expect(res.sobrantes).toEqual([
      { ofertaCursoId: 20, asignaturaPlanId: 9, materiaCodigo: 'FIS', materiaNombre: null, periodoId: 7 },
    ]);
  });

  it('horas no numéricas cuentan como 0', async () => {
    const { useCase } = crear({ bundle: { expected: [{ asignaturaPlanId: 1, horasSemanales: 'x' }], actual: [] } });
    const res = await useCase.execute(3);
    expect(res.horas_total).toBe(0);
    expect(res.faltantes[0].horasSemanales).toBe(0);
  });

  it('sin asignaturas esperadas ni oferta es válida', async () => {
    const { useCase } = crear();
    expect((await useCase.execute(3)).valido).toBe(true);
  });

  it.each([99, NaN])('NotFoundError si el paralelo no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ ctx: null });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.findValidationBundle).not.toHaveBeenCalled();
  });
});
