import { describe, it, expect, jest } from '@jest/globals';
import { GetPasantiaEmpresaUseCase } from '../../../src/application/use-cases/pasantias/GetPasantiaEmpresaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetPasantiaEmpresaUseCase', () => {
  const crear = (empresa) => {
    const deps = {
      pasantiaEmpresaRepository: { findById: jest.fn().mockResolvedValue(empresa) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetPasantiaEmpresaUseCase(deps) };
  };

  it('devuelve la ficha plana de la empresa', async () => {
    const empresa = { id: 5, nombre: 'ACME', activo: true };
    const { useCase, deps } = crear(empresa);

    const result = await useCase.execute(5);

    expect(deps.pasantiaEmpresaRepository.findById).toHaveBeenCalledWith(5);
    expect(result).toBe(empresa);
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
  });
});
