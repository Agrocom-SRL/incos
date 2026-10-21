import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

import { ListParalelosGestionByGestionPlanUseCase } from '../../../src/application/use-cases/oferta/ListParalelosGestionByGestionPlanUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ gp = { id: 1 }, rows = [] } = {}) => {
  const deps = {
    managementPlanRepository: { findById: jest.fn().mockResolvedValue(gp) },
    parallelManagementRepository: { findEnrichedByManagementPlanId: jest.fn().mockResolvedValue(rows) },
    logger: logger(),
  };
  return { deps, useCase: new ListParalelosGestionByGestionPlanUseCase(deps) };
};

describe('ListParalelosGestionByGestionPlanUseCase', () => {
  it('lista los paralelos-gestión del plan habilitado', async () => {
    const { deps, useCase } = crear({
      rows: [{ id: 2, gestionPlanId: 1, paraleloId: 7, turno: 'NOCHE', estado: 'BORRADOR', ofertaActual: '5' }],
    });
    const res = await useCase.execute(1);
    expect(deps.parallelManagementRepository.findEnrichedByManagementPlanId).toHaveBeenCalledWith(1);
    expect(res.paralelosGestion[0]).toMatchObject({ id: 2, turno: 'NOCHE', ofertaActual: 5 });
  });

  it('devuelve lista vacía sin paralelos', async () => {
    const { useCase } = crear({ rows: undefined });
    expect(await useCase.execute(1)).toEqual({ paralelosGestion: [] });
  });

  it.each([99, NaN])('NotFoundError si el plan habilitado no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ gp: null });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.parallelManagementRepository.findEnrichedByManagementPlanId).not.toHaveBeenCalled();
  });
});
