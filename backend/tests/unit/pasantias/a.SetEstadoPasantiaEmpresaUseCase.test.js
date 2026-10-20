import { describe, it, expect, jest } from '@jest/globals';
import { SetEstadoPasantiaEmpresaUseCase } from '../../../src/application/use-cases/pasantias/SetEstadoPasantiaEmpresaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoPasantiaEmpresaUseCase', () => {
  const crear = (existente = { id: 5, activo: false }) => {
    const deps = {
      pasantiaEmpresaRepository: {
        findById: jest.fn().mockResolvedValue(existente),
        update: jest.fn().mockResolvedValue({ id: 5, activo: true }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new SetEstadoPasantiaEmpresaUseCase(deps) };
  };

  it('activa una empresa inactiva enviando solo el campo activo', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(5, true, 9);

    expect(deps.pasantiaEmpresaRepository.update).toHaveBeenCalledWith(5, { activo: true }, 9);
    expect(result).toEqual({ pasantiaEmpresa: { id: 5, activo: true } });
  });

  it.each([
    [false, false],
    [0, false],
    [undefined, false],
    ['x', true],
    [1, true],
  ])('normaliza activo %p a booleano %p', async (entrada, esperado) => {
    const { useCase, deps } = crear();
    await useCase.execute(5, entrada);
    expect(deps.pasantiaEmpresaRepository.update).toHaveBeenCalledWith(
      5,
      { activo: esperado },
      null
    );
  });

  it('lanza NotFoundError si la empresa no existe', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute(99, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.pasantiaEmpresaRepository.update).not.toHaveBeenCalled();
  });
});
