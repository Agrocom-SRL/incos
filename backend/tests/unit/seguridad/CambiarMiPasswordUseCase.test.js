import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { CambiarMiPasswordUseCase } from '../../../src/application/use-cases/auth/CambiarMiPasswordUseCase.js';
import { NotFoundError, UnauthorizedError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('CambiarMiPasswordUseCase', () => {
  let hashActual;
  beforeAll(async () => {
    hashActual = await bcrypt.hash('clave-actual-1', 4);
  });

  const crear = (usuario) => {
    const deps = {
      authRepository: {
        findUsuarioParaLogin: jest.fn().mockResolvedValue(usuario === undefined ? { id: 5, password_hash: hashActual } : usuario),
        invalidarSesionesUsuario: jest.fn().mockResolvedValue(undefined),
      },
      userRepository: { update: jest.fn().mockResolvedValue(undefined) },
    };
    return { deps, useCase: new CambiarMiPasswordUseCase(deps) };
  };
  const input = (extra = {}) => ({ usuarioId: 5, username: 'ana', passwordActual: 'clave-actual-1', passwordNuevo: 'clave-nueva-22', ...extra });

  it('contraseña correcta: guarda solo el hash nuevo y no devuelve claves', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(input());
    expect(deps.authRepository.findUsuarioParaLogin).toHaveBeenCalledWith('ana');
    const [id, patch] = deps.userRepository.update.mock.calls[0];
    expect(id).toBe(5);
    expect(Object.keys(patch)).toEqual(['passwordHash']);
    expect(await bcrypt.compare('clave-nueva-22', patch.passwordHash)).toBe(true);
    expect(JSON.stringify(res)).not.toMatch(/clave-|[$]2[aby][$]/);
    expect(res.ok).toBe(true);
  });

  it('cierra las demás sesiones y conserva la actual', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(input({ tokenActual: 'tok-actual' }));
    expect(deps.authRepository.invalidarSesionesUsuario).toHaveBeenCalledWith(5, { exceptoToken: 'tok-actual' });
  });

  it('el username del token no corresponde al usuarioId: NotFoundError sin escribir', async () => {
    const { deps, useCase } = crear({ id: 9, password_hash: hashActual });
    await expect(useCase.execute(input())).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('nueva de más de 72 bytes: 422 sin actualizar', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(input({ passwordNuevo: 'x'.repeat(73) }))).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('nueva de solo espacios: 422', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(input({ passwordNuevo: '        ' }))).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('usuario inexistente o inactivo (login no lo encuentra): NotFoundError', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(input())).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it.each([['incorrecta'], [''], [undefined], [null]])('contraseña actual %p incorrecta: 401 sin actualizar', async (passwordActual) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(input({ passwordActual }))).rejects.toBeInstanceOf(UnauthorizedError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], [''], ['corta']])('contraseña nueva %p inválida: 422', async (passwordNuevo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(input({ passwordNuevo }))).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('nueva igual a la actual: 422', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(input({ passwordNuevo: 'clave-actual-1' }))).rejects.toBeInstanceOf(
      UnprocessableEntityError,
    );
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('verifica la actual antes de validar la nueva (no revela reglas a quien no se autentica)', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(input({ passwordActual: 'mala', passwordNuevo: 'x' }))).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
