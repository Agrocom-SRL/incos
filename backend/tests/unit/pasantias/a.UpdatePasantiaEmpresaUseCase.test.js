import { describe, it, expect, jest } from '@jest/globals';
import { UpdatePasantiaEmpresaUseCase } from '../../../src/application/use-cases/pasantias/UpdatePasantiaEmpresaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('UpdatePasantiaEmpresaUseCase', () => {
  const crear = (existente = { id: 5 }) => {
    const deps = {
      pasantiaEmpresaRepository: {
        findById: jest.fn().mockResolvedValue(existente),
        update: jest.fn().mockResolvedValue({ id: 5, nombre: 'Nueva' }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdatePasantiaEmpresaUseCase(deps) };
  };

  it('actualiza la empresa existente', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(5, { nombre: 'Nueva' }, 9);

    expect(deps.pasantiaEmpresaRepository.findById).toHaveBeenCalledWith(5);
    expect(deps.pasantiaEmpresaRepository.update).toHaveBeenCalledWith(5, { nombre: 'Nueva' }, 9);
    expect(result).toEqual({ pasantiaEmpresa: { id: 5, nombre: 'Nueva' } });
  });

  it('lanza NotFoundError si la empresa no existe y no actualiza', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute(99, { nombre: 'X' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.pasantiaEmpresaRepository.update).not.toHaveBeenCalled();
  });

  it('usa userId null por defecto', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(5, { nit: '1' });
    expect(deps.pasantiaEmpresaRepository.update).toHaveBeenCalledWith(5, { nit: '1' }, null);
  });
});
