import { describe, it, expect, jest } from '@jest/globals';
import { DeletePasantiaEmpresaUseCase } from '../../../src/application/use-cases/pasantias/DeletePasantiaEmpresaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeletePasantiaEmpresaUseCase', () => {
  const crear = (existente = { id: 5 }) => {
    const deps = {
      pasantiaEmpresaRepository: {
        findById: jest.fn().mockResolvedValue(existente),
        delete: jest.fn().mockResolvedValue(true),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeletePasantiaEmpresaUseCase(deps) };
  };

  it('elimina la empresa existente con el usuario de auditoría', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(5, 9);

    expect(deps.pasantiaEmpresaRepository.findById).toHaveBeenCalledWith(5);
    expect(deps.pasantiaEmpresaRepository.delete).toHaveBeenCalledWith(5, 9);
    expect(result).toBeUndefined();
  });

  it('lanza NotFoundError si no existe y no elimina', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.pasantiaEmpresaRepository.delete).not.toHaveBeenCalled();
  });

  it('usa userId null por defecto', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(5);
    expect(deps.pasantiaEmpresaRepository.delete).toHaveBeenCalledWith(5, null);
  });
});
