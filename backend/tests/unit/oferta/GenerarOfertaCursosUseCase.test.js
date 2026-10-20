import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { GenerarOfertaCursosUseCase } = await import('../../../src/application/use-cases/oferta/GenerarOfertaCursosUseCase.js');

const crear = ({
  ctx = { studyPlanId: 2, periodId: 4 },
  materias = [{ id: 1 }, { id: 2 }, { id: 3 }],
  existing = [],
} = {}) => {
  let n = 100;
  const deps = {
    parallelManagementRepository: {
      findGenerationContext: jest.fn().mockResolvedValue(ctx),
      findExistingPlanSubjectIds: jest.fn().mockResolvedValue(existing),
    },
    planSubjectRepository: { findAll: jest.fn().mockResolvedValue({ planSubjects: materias }) },
    courseOfferRepository: {
      create: jest.fn(async (data) => ({ id: n++, ...data })),
    },
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  };
  return { deps, useCase: new GenerarOfertaCursosUseCase(deps) };
};

describe('GenerarOfertaCursosUseCase', () => {
  beforeEach(() => mockTransaction.mockClear());

  it('crea una oferta PROGRAMADA por asignatura del plan y periodo, en transacción', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(3, 7);
    expect(deps.planSubjectRepository.findAll).toHaveBeenCalledWith({
      studyPlanId: 2, periodId: 4, pagina: 1, limite: 500,
    });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(deps.courseOfferRepository.create).toHaveBeenCalledTimes(3);
    expect(deps.courseOfferRepository.create).toHaveBeenCalledWith(
      { parallelManagementId: 3, planSubjectId: 1, state: 'PROGRAMADA' }, 7
    );
    expect(res.resumen).toEqual({ creados: 3, existentes: 0, totalEsperadas: 3 });
    expect(res.ofertaCursos).toHaveLength(3);
  });

  it('es idempotente: omite asignaturas ya ofertadas', async () => {
    const { deps, useCase } = crear({ existing: [1, 3] });
    const res = await useCase.execute(3);
    expect(deps.courseOfferRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.courseOfferRepository.create.mock.calls[0][0].planSubjectId).toBe(2);
    expect(res.resumen).toEqual({ creados: 1, existentes: 2, totalEsperadas: 3 });
  });

  it('con todo ya ofertado no crea nada', async () => {
    const { deps, useCase } = crear({ existing: [1, 2, 3] });
    const res = await useCase.execute(3);
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
    expect(res.ofertaCursos).toEqual([]);
    expect(res.resumen.creados).toBe(0);
  });

  it.each([99, NaN])('NotFoundError si el paralelo no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ ctx: null });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.planSubjectRepository.findAll).not.toHaveBeenCalled();
  });

  it.each([
    [{ studyPlanId: null, periodId: 4 }],
    [{ studyPlanId: 2, periodId: null }],
  ])('ValidationError si no se resuelve plan/periodo %j', async (ctx) => {
    const { deps, useCase } = crear({ ctx });
    await expect(useCase.execute(3)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.planSubjectRepository.findAll).not.toHaveBeenCalled();
  });

  it.each([[[]]])('ValidationError si el plan no tiene asignaturas en el periodo (%p)', async (materias) => {
    const { deps, useCase } = crear({ materias });
    await expect(useCase.execute(3)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
  });
});
