import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

import { UpdateGestionPlanEstadoUseCase } from '../../../src/application/use-cases/oferta/UpdateGestionPlanEstadoUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ plan = { id: 1, state: 'PROPUESTO' } } = {}) => {
  const deps = {
    managementPlanRepository: {
      findById: jest.fn().mockResolvedValue(plan),
      update: jest.fn().mockResolvedValue({ id: 1, state: 'APROBADO' }),
    },
    logger: logger(),
  };
  return { deps, useCase: new UpdateGestionPlanEstadoUseCase(deps) };
};

describe('UpdateGestionPlanEstadoUseCase', () => {
  it.each([
    ['PROPUESTO', 'APROBADO'], ['PROPUESTO', 'CANCELADO'],
    ['APROBADO', 'VIGENTE'], ['APROBADO', 'CANCELADO'],
    ['VIGENTE', 'CERRADO'], ['VIGENTE', 'CANCELADO'],
  ])('permite %s -> %s', async (desde, estado) => {
    const { deps, useCase } = crear({ plan: { id: 1, state: desde } });
    const res = await useCase.execute(1, { estado }, 3);
    expect(deps.managementPlanRepository.update).toHaveBeenCalledWith(1, { state: estado }, 3);
    expect(res.gestionPlan).toMatchObject({ id: 1, estado: 'APROBADO' });
  });

  it.each([
    ['PROPUESTO', 'VIGENTE'], ['PROPUESTO', 'CERRADO'], ['APROBADO', 'PROPUESTO'],
    ['APROBADO', 'CERRADO'], ['VIGENTE', 'PROPUESTO'], ['VIGENTE', 'APROBADO'],
    ['CERRADO', 'VIGENTE'], ['CERRADO', 'CANCELADO'], ['CANCELADO', 'PROPUESTO'], ['CANCELADO', 'VIGENTE'],
  ])('rechaza %s -> %s', async (desde, estado) => {
    const { deps, useCase } = crear({ plan: { id: 1, state: desde } });
    await expect(useCase.execute(1, { estado })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementPlanRepository.update).not.toHaveBeenCalled();
  });

  it('repetir el mismo estado no es una transición y se acepta', async () => {
    const { deps, useCase } = crear({ plan: { id: 1, state: 'CERRADO' } });
    await useCase.execute(1, { estado: 'CERRADO' });
    expect(deps.managementPlanRepository.update).toHaveBeenCalled();
  });

  it.each([undefined, null, '', 'BORRADOR', 'vigente'])('rechaza estado inválido %p', async (estado) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(1, { estado })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementPlanRepository.findById).not.toHaveBeenCalled();
  });

  it.each([99, NaN])('NotFoundError si el plan habilitado no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ plan: null });
    await expect(useCase.execute(id, { estado: 'VIGENTE' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.managementPlanRepository.update).not.toHaveBeenCalled();
  });
});
