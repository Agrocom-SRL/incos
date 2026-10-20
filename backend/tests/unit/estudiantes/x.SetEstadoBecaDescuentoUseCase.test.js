import { jest } from '@jest/globals';
import { SetEstadoBecaDescuentoUseCase } from '../../../src/application/use-cases/estudiantes/SetEstadoBecaDescuentoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoBecaDescuentoUseCase', () => {
  const crear = (existing = { id: 1, active: true }) => {
    const deps = {
      scholarshipRepository: {
        findById: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockImplementation(async (id, data) => ({ id, name: 'B', ...data })),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new SetEstadoBecaDescuentoUseCase(deps) };
  };

  it('desactiva y devuelve el ítem actualizado', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(1, false, 4);
    expect(deps.scholarshipRepository.findById).toHaveBeenCalledWith(1);
    expect(deps.scholarshipRepository.update).toHaveBeenCalledWith(1, { active: false }, 4);
    expect(res.becaDescuento).toEqual(expect.objectContaining({ id: 1, activo: false }));
  });

  it('reactiva un ítem inactivo', async () => {
    const { useCase, deps } = crear({ id: 1, active: false });
    const res = await useCase.execute(1, true);
    expect(deps.scholarshipRepository.update).toHaveBeenCalledWith(1, { active: true }, null);
    expect(res.becaDescuento.activo).toBe(true);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute(9, true)).rejects.toThrow(NotFoundError);
    expect(deps.scholarshipRepository.update).not.toHaveBeenCalled();
  });
});
