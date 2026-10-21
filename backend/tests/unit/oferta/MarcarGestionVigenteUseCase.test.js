import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { MarcarGestionVigenteUseCase } = await import(
  '../../../src/application/use-cases/oferta/MarcarGestionVigenteUseCase.js'
);

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
  beforeEach(() => mockTransaction.mockClear());

  it('desmarca las demás gestiones y marca la indicada', async () => {
    const { deps, Model, useCase } = crear();
    const res = await useCase.execute(2, 5);
    expect(Model.update).toHaveBeenCalledWith({ vigente: false, updatedBy: 5 }, { where: { deletedAt: null }, transaction: 'TX' });
    expect(deps.managementRepository.update).toHaveBeenCalledWith(2, { vigente: true }, 5, { transaction: 'TX' });
    expect(Model.update.mock.invocationCallOrder[0]).toBeLessThan(
      deps.managementRepository.update.mock.invocationCallOrder[0]
    );
    expect(res.gestion).toBeDefined();
  });

  it('si falla el segundo paso el error se propaga desde la misma transacción (rollback)', async () => {
    const { deps, useCase } = crear();
    deps.managementRepository.update.mockRejectedValue(new Error('boom'));
    await expect(useCase.execute(2, 5)).rejects.toThrow('boom');
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it.each([99, NaN])('NotFoundError si la gestión no existe (id %p) y no toca vigentes', async (id) => {
    const { deps, Model, useCase } = crear({ gestion: null });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(Model.update).not.toHaveBeenCalled();
    expect(deps.managementRepository.update).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
