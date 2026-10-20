import { describe, it, expect, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { CambiarPasswordUsuarioUseCase } from '../../../src/application/use-cases/seguridad/CambiarPasswordUsuarioUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('CambiarPasswordUsuarioUseCase', () => {
  const fila = { id: 5, username: 'ana', email: 'a@x', activo: 1, password_hash: 'viejo' };
  const crear = (actual = fila) => {
    const userRepository = {
      findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(actual),
      update: jest.fn().mockResolvedValue(undefined),
    };
    return { userRepository, useCase: new CambiarPasswordUsuarioUseCase({ userRepository }) };
  };

  it('guarda solo el hash bcrypt, nunca la clave en claro, y no devuelve password', async () => {
    const { userRepository, useCase } = crear();
    const res = await useCase.execute(5, 'clave-nueva-1');
    const [id, patch] = userRepository.update.mock.calls[0];
    expect(id).toBe(5);
    expect(Object.keys(patch)).toEqual(['passwordHash']);
    expect(patch.passwordHash).not.toContain('clave-nueva-1');
    expect(await bcrypt.compare('clave-nueva-1', patch.passwordHash)).toBe(true);
    expect(JSON.stringify(res)).not.toMatch(/password|clave-nueva-1|viejo/);
    expect(res).toMatchObject({ id: 5, username: 'ana' });
  });

  it('usuario inexistente: NotFoundError sin actualizar', async () => {
    const { userRepository, useCase } = crear(null);
    await expect(useCase.execute(5, 'clave-nueva-1')).rejects.toBeInstanceOf(NotFoundError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], [''], ['corta'], ['1234567']])('contraseña %p inválida: 422 sin actualizar', async (pwd) => {
    const { userRepository, useCase } = crear();
    await expect(useCase.execute(5, pwd)).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('id NaN: delega en el repositorio y falla si no existe', async () => {
    const { userRepository, useCase } = crear(null);
    await expect(useCase.execute(NaN, 'clave-nueva-1')).rejects.toBeInstanceOf(NotFoundError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
