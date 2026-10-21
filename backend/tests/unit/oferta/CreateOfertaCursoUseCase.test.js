import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

import { CreateOfertaCursoUseCase } from '../../../src/application/use-cases/oferta/CreateOfertaCursoUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ pg = { id: 1, state: 'BORRADOR' }, asignatura = { id: 2, studyPlanId: 5, periodId: 1 }, dup = null, ctx = { studyPlanId: 5, periodId: 1 } } = {}) => {
  const deps = {
    parallelManagementRepository: {
      findById: jest.fn().mockResolvedValue(pg),
      findGenerationContext: jest.fn().mockResolvedValue(ctx),
    },
    planSubjectRepository: { findById: jest.fn().mockResolvedValue(asignatura) },
    courseOfferRepository: {
      findBy: jest.fn().mockResolvedValue(dup),
      create: jest.fn().mockResolvedValue({ id: 30, parallelManagementId: 1, planSubjectId: 2, state: 'PROGRAMADA' }),
    },
    logger: logger(),
  };
  return { deps, useCase: new CreateOfertaCursoUseCase(deps) };
};

describe('CreateOfertaCursoUseCase', () => {
  it('crea la oferta PROGRAMADA bajo el paralelo-gestión', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ paralelo_gestion_id: 1, asignatura_plan_id: 2 }, 4);
    expect(deps.courseOfferRepository.findBy).toHaveBeenCalledWith({ parallelManagementId: 1, planSubjectId: 2 });
    expect(deps.courseOfferRepository.create).toHaveBeenCalledWith(
      { parallelManagementId: 1, planSubjectId: 2, state: 'PROGRAMADA' },
      4
    );
    expect(res.ofertaCurso).toMatchObject({ id: 30, paraleloGestionId: 1, asignaturaPlanId: 2, estado: 'PROGRAMADA' });
  });

  it('acepta claves camelCase', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ paraleloGestionId: 1, asignaturaPlanId: 2 });
    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(1);
    expect(deps.planSubjectRepository.findById).toHaveBeenCalledWith(2);
  });

  it.each([
    [{}],
    [{ paralelo_gestion_id: 1 }],
    [{ asignatura_plan_id: 2 }],
    [{ paralelo_gestion_id: 0, asignatura_plan_id: 2 }],
    [{ paralelo_gestion_id: NaN, asignatura_plan_id: 2 }],
    [{ paralelo_gestion_id: 1, asignatura_plan_id: null }],
  ])('rechaza entrada inválida %j', async (body) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
  });

  it('NotFoundError si el paralelo-gestión no existe', async () => {
    const { deps, useCase } = crear({ pg: null });
    await expect(useCase.execute({ paralelo_gestion_id: 1, asignatura_plan_id: 2 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
  });

  it('NotFoundError si la asignatura del plan no existe', async () => {
    const { deps, useCase } = crear({ asignatura: null });
    await expect(useCase.execute({ paralelo_gestion_id: 1, asignatura_plan_id: 2 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
  });

  it.each([
    [{ asignatura: { id: 2, studyPlanId: 99, periodId: 1 } }],
    [{ asignatura: { id: 2, studyPlanId: 5, periodId: 7 } }],
  ])('rechaza una asignatura de otro plan o periodo (%j)', async (over) => {
    const { deps, useCase } = crear(over);
    await expect(useCase.execute({ paralelo_gestion_id: 1, asignatura_plan_id: 2 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza agregar oferta a un paralelo CERRADO', async () => {
    const { deps, useCase } = crear({ pg: { id: 1, state: 'CERRADO' } });
    await expect(useCase.execute({ paralelo_gestion_id: 1, asignatura_plan_id: 2 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
  });

  it.each([['abc'], ['1x'], [-2], [1.5]])('id %p no numérico: ValidationError sin consultar', async (id) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ paralelo_gestion_id: id, asignatura_plan_id: 2 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.findById).not.toHaveBeenCalled();
  });

  it('convierte ids numéricos en texto a número', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ paralelo_gestion_id: '1', asignatura_plan_id: '2' });
    expect(deps.courseOfferRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ parallelManagementId: 1, planSubjectId: 2 }),
      null
    );
  });

  it('rechaza una asignatura ya ofertada en el paralelo', async () => {
    const { deps, useCase } = crear({ dup: { id: 9 } });
    await expect(useCase.execute({ paralelo_gestion_id: 1, asignatura_plan_id: 2 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
  });
});
