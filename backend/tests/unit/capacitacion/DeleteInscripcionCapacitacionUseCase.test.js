import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { DeleteInscripcionCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/DeleteInscripcionCapacitacionUseCase.js'
);

describe('DeleteInscripcionCapacitacionUseCase', () => {
  const crear = ({ inscripcion = { id: 5 }, pagos = { pagosCapacitacion: [{ id: 1 }, { id: 2 }] } } = {}) => {
    const deps = {
      inscripcionCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(inscripcion),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue(true),
      },
      pagoCapacitacionRepository: {
        findAll: jest.fn().mockResolvedValue(pagos),
        delete: jest.fn().mockResolvedValue(true),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new DeleteInscripcionCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('marca RETIRADO, elimina pagos en cascada y luego la inscripción', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, 8)).resolves.toBe(true);
    expect(deps.pagoCapacitacionRepository.findAll).toHaveBeenCalledWith(
      { capacitacionInscritoId: 5 },
      null,
      null
    );
    expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(
      5,
      { estado: 'RETIRADO' },
      8,
      { transaction: 'TX' }
    );
    expect(deps.pagoCapacitacionRepository.delete).toHaveBeenCalledWith(1, 8);
    expect(deps.pagoCapacitacionRepository.delete).toHaveBeenCalledWith(2, 8);
    expect(deps.inscripcionCapacitacionRepository.delete).toHaveBeenCalledWith(5, 8);
  });

  it('sin pagos solo elimina la inscripción', async () => {
    const { deps, useCase } = crear({ pagos: {} });
    await useCase.execute(5);
    expect(deps.pagoCapacitacionRepository.delete).not.toHaveBeenCalled();
    expect(deps.inscripcionCapacitacionRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si la inscripción no existe', async () => {
    const { deps, useCase } = crear({ inscripcion: null });
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundError);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.inscripcionCapacitacionRepository.delete).not.toHaveBeenCalled();
  });
});
