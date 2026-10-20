import { describe, it, expect, jest } from '@jest/globals';
import { CrearRolUseCase } from '../../../src/application/use-cases/seguridad/CrearRolUseCase.js';
import { ConflictError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('CrearRolUseCase', () => {
  const crear = (existe = false) => {
    const rolRepository = {
      existsCodigo: jest.fn().mockResolvedValue(existe),
      crear: jest.fn().mockResolvedValue({ id: 9, code: 'AUDITOR', name: 'Auditor', tipo: null, isSystem: false }),
    };
    return { rolRepository, useCase: new CrearRolUseCase({ rolRepository }) };
  };

  it('normaliza código (trim + mayúsculas) y crea rol no sistema', async () => {
    const { rolRepository, useCase } = crear();
    const res = await useCase.execute({ codigo: '  auditor ', nombre: ' Auditor ', tipo: '  ' });
    expect(rolRepository.existsCodigo).toHaveBeenCalledWith('AUDITOR');
    expect(rolRepository.crear).toHaveBeenCalledWith({ codigo: 'AUDITOR', nombre: 'Auditor', tipo: null });
    expect(res).toEqual({ id: 9, codigo: 'AUDITOR', nombre: 'Auditor', tipo: null, is_system: false });
  });

  it('conserva tipo cuando viene informado', async () => {
    const { rolRepository, useCase } = crear();
    await useCase.execute({ codigo: 'a', nombre: 'b', tipo: ' PERSONAL ' });
    expect(rolRepository.crear).toHaveBeenCalledWith({ codigo: 'A', nombre: 'b', tipo: 'PERSONAL' });
  });

  it.each([
    [{ nombre: 'x' }],
    [{ codigo: '   ', nombre: 'x' }],
    [{ codigo: 'X' }],
    [{ codigo: 'X', nombre: '   ' }],
  ])('entrada inválida %j: 422 sin tocar el repositorio', async (body) => {
    const { rolRepository, useCase } = crear();
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(rolRepository.existsCodigo).not.toHaveBeenCalled();
    expect(rolRepository.crear).not.toHaveBeenCalled();
  });

  it('código duplicado: ConflictError y no crea', async () => {
    const { rolRepository, useCase } = crear(true);
    await expect(useCase.execute({ codigo: 'admin_sistema', nombre: 'x' })).rejects.toBeInstanceOf(ConflictError);
    expect(rolRepository.crear).not.toHaveBeenCalled();
  });
});
