import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

import { CreateGestionPlanUseCase } from '../../../src/application/use-cases/oferta/CreateGestionPlanUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({
  gestion = { id: 1, name: '2026' },
  plan = { id: 2, planName: 'Plan A' },
  planRow = { activo: true },
  existing = null,
} = {}) => {
  const deps = {
    managementRepository: { findById: jest.fn().mockResolvedValue(gestion) },
    managementPlanRepository: {
      findBy: jest.fn().mockResolvedValue(existing),
      create: jest.fn().mockResolvedValue({ id: 10, managementId: 1, studyPlanId: 2, state: 'PROPUESTO' }),
    },
    studyPlanRepository: {
      findById: jest.fn().mockResolvedValue(plan),
      getModel: () => ({ findByPk: jest.fn().mockResolvedValue(planRow) }),
    },
    logger: logger(),
  };
  return { deps, useCase: new CreateGestionPlanUseCase(deps) };
};

describe('CreateGestionPlanUseCase', () => {
  it('habilita el plan en estado PROPUESTO con nombre derivado', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ gestionId: 1, planEstudioId: 2 }, 7);
    expect(deps.managementPlanRepository.findBy).toHaveBeenCalledWith({ managementId: 1, studyPlanId: 2 });
    expect(deps.managementPlanRepository.create).toHaveBeenCalledWith(
      { managementId: 1, studyPlanId: 2, name: 'Oferta 2026 - Plan A', state: 'PROPUESTO' },
      7
    );
    expect(res.gestionPlan).toMatchObject({ id: 10, estado: 'PROPUESTO' });
  });

  it('acepta claves snake_case', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ gestion_id: '1', plan_estudio_id: '2' });
    expect(deps.managementRepository.findById).toHaveBeenCalledWith(1);
    expect(deps.studyPlanRepository.findById).toHaveBeenCalledWith(2);
  });

  it('usa el código o el año si la gestión no tiene nombre', async () => {
    const { deps, useCase } = crear({ gestion: { id: 1, code: 'G-1' } });
    await useCase.execute({ gestionId: 1, planEstudioId: 2 });
    expect(deps.managementPlanRepository.create.mock.calls[0][0].name).toBe('Oferta G-1 - Plan A');
  });

  it.each([
    [{}],
    [{ gestionId: 1 }],
    [{ planEstudioId: 2 }],
    [{ gestionId: 0, planEstudioId: 2 }],
    [{ gestionId: -1, planEstudioId: 2 }],
    [{ gestionId: 'abc', planEstudioId: 2 }],
    [{ gestionId: 1, planEstudioId: NaN }],
    [{ gestionId: Infinity, planEstudioId: 2 }],
  ])('rechaza entrada inválida %j', async (body) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementRepository.findById).not.toHaveBeenCalled();
  });

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
  });

  it('NotFoundError si la gestión no existe', async () => {
    const { deps, useCase } = crear({ gestion: null });
    await expect(useCase.execute({ gestionId: 1, planEstudioId: 2 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.managementPlanRepository.create).not.toHaveBeenCalled();
  });

  it('NotFoundError si el plan de estudios no existe', async () => {
    const { deps, useCase } = crear({ plan: null });
    await expect(useCase.execute({ gestionId: 1, planEstudioId: 2 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.managementPlanRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un plan de estudios inactivo', async () => {
    const { deps, useCase } = crear({ planRow: { activo: false } });
    await expect(useCase.execute({ gestionId: 1, planEstudioId: 2 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementPlanRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un plan ya habilitado en la gestión', async () => {
    const { deps, useCase } = crear({ existing: { id: 3 } });
    await expect(useCase.execute({ gestionId: 1, planEstudioId: 2 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementPlanRepository.create).not.toHaveBeenCalled();
  });
});
