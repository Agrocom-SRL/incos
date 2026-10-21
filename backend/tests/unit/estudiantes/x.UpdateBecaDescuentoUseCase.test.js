import { jest } from '@jest/globals';
import { UpdateBecaDescuentoUseCase } from '../../../src/application/use-cases/estudiantes/UpdateBecaDescuentoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateBecaDescuentoUseCase', () => {
  const crear = (existing = { id: 1 }) => {
    const deps = {
      scholarshipRepository: {
        findById: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockResolvedValue({ id: 1, name: 'Nueva', percentage: 25, active: true }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateBecaDescuentoUseCase(deps) };
  };

  it('actualiza mapeando campos en español y devuelve becaDescuento', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(1, { nombre: 'Nueva', porcentaje: 25 }, 6);
    expect(deps.scholarshipRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Nueva', percentage: 25, description: undefined }),
      6
    );
    expect(res.becaDescuento).toEqual(expect.objectContaining({ id: 1, nombre: 'Nueva', porcentaje: 25 }));
  });

  it.each([['abc'], [-1], [101], [Infinity], ['']])('porcentaje %p inválido: ValidationError sin actualizar', async (porcentaje) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(1, { porcentaje })).rejects.toThrow(ValidationError);
    expect(deps.scholarshipRepository.update).not.toHaveBeenCalled();
  });

  it('conserva porcentaje 0 y activo false (no los trata como vacíos)', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(1, { porcentaje: 0, activo: false });
    expect(deps.scholarshipRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ percentage: 0, active: false }),
      null
    );
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute(7, { nombre: 'X' })).rejects.toThrow(NotFoundError);
    expect(deps.scholarshipRepository.update).not.toHaveBeenCalled();
  });
});
