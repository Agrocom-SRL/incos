import { describe, it, expect, jest } from '@jest/globals';
import { CreatePasantiaEmpresaUseCase } from '../../../src/application/use-cases/pasantias/CreatePasantiaEmpresaUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreatePasantiaEmpresaUseCase', () => {
  const crear = () => {
    const deps = {
      pasantiaEmpresaRepository: {
        create: jest.fn().mockResolvedValue({ id: 3, nombre: 'ACME' }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreatePasantiaEmpresaUseCase(deps) };
  };

  it('crea la empresa y la devuelve bajo pasantiaEmpresa', async () => {
    const { useCase, deps } = crear();
    const data = { nombre: 'ACME', nit: '123' };

    const result = await useCase.execute(data, 7);

    expect(deps.pasantiaEmpresaRepository.create).toHaveBeenCalledWith(data, 7);
    expect(result).toEqual({ pasantiaEmpresa: { id: 3, nombre: 'ACME' } });
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('usa userId null por defecto', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ nombre: 'ACME' });
    expect(deps.pasantiaEmpresaRepository.create).toHaveBeenCalledWith({ nombre: 'ACME' }, null);
  });

  it.each([[undefined], [null], [''], ['   ']])(
    'rechaza nombre vacío (%p) sin llamar al repositorio',
    async (nombre) => {
      const { useCase, deps } = crear();
      await expect(useCase.execute({ nombre })).rejects.toBeInstanceOf(ValidationError);
      expect(deps.pasantiaEmpresaRepository.create).not.toHaveBeenCalled();
    }
  );

  it('propaga el error del repositorio', async () => {
    const { useCase, deps } = crear();
    deps.pasantiaEmpresaRepository.create.mockRejectedValue(new Error('db'));
    await expect(useCase.execute({ nombre: 'X' })).rejects.toThrow('db');
  });
});
