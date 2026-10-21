import { describe, it, expect, jest } from '@jest/globals';
import { LogoutUseCase } from '../../../src/application/use-cases/auth/LogoutUseCase.js';

describe('LogoutUseCase', () => {
  it('invalida la sesión del token recibido', async () => {
    const authRepository = { invalidarSesion: jest.fn().mockResolvedValue(undefined) };
    const res = await new LogoutUseCase({ authRepository }).execute('tok-123');
    expect(authRepository.invalidarSesion).toHaveBeenCalledWith('tok-123');
    expect(res).toEqual({ message: 'Sesión cerrada correctamente' });
  });

  it('propaga el error si no se puede invalidar la sesión (no finge éxito)', async () => {
    const authRepository = { invalidarSesion: jest.fn().mockRejectedValue(new Error('db caída')) };
    await expect(new LogoutUseCase({ authRepository }).execute('t')).rejects.toThrow('db caída');
  });
});
