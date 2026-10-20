import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

import { MarcarGestionVigenteUseCase } from '../../../src/application/use-cases/oferta/MarcarGestionVigenteUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ gestion = { id: 2 } } = {}) => {
  const Model = { update: jest.fn().mockResolvedValue([3]) };
  const deps = {
    managementRepository: {
      findById: jest.fn().mockResolvedValue(gestion),
      getModel: () => Model,
      update: jest.fn().mockResolvedValue({ id: 2, vigente: true }),
    },
    logger: logger(),
  };
  return { deps, Model, useCase: new MarcarGestionVigenteUseCase(deps) };
};

describe('MarcarGestionVigenteUseCase', () => {
  it('desmarca las demás gestiones y marca la indicada', async () => {
    const { deps, Model, useCase } = crear();
    const res = await useCase.execute(2, 5);
    expect(Model.update).toHaveBeenCalledWith({ vigente: false, updatedBy: 5 }, { where: { deletedAt: null } });
    expect(deps.managementRepository.update).toHaveBeenCalledWith(2, { vigente: true }, 5);
    expect(Model.update.mock.invocationCallOrder[0]).toBeLessThan(
      deps.managementRepository.update.mock.invocationCallOrder[0]
    );
    expect(res.gestion).toBeDefined();
  });

  it.each([99, NaN])('NotFoundError si la gestión no existe (id %p) y no toca vigentes', async (id) => {
    const { deps, Model, useCase } = crear({ gestion: null });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(Model.update).not.toHaveBeenCalled();
    expect(deps.managementRepository.update).not.toHaveBeenCalled();
  });
});
