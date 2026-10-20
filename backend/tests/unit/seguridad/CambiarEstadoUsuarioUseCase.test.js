import { describe, it, expect, jest } from '@jest/globals';
import { CambiarEstadoUsuarioUseCase } from '../../../src/application/use-cases/seguridad/CambiarEstadoUsuarioUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('CambiarEstadoUsuarioUseCase', () => {
  const crear = (actual = { id: 5, username: 'ana' }) => {
    const userRepository = {
      findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(actual),
      update: jest.fn().mockResolvedValue(undefined),
    };
    return { userRepository, useCase: new CambiarEstadoUsuarioUseCase({ userRepository }) };
  };

  it.each(['BLOQUEADO', 'SUSPENDIDO', 'RETIRADO'])('estado %s con motivo', async (estado) => {
    const { userRepository, useCase } = crear();
    const res = await useCase.execute(5, { estado, motivo: 'mora' });
    expect(userRepository.update).toHaveBeenCalledWith(5, {
      state: estado,
      stateChangeDate: expect.any(Date),
      stateChangeReason: 'mora',
    });
    expect(res.id).toBe(5);
    expect(JSON.stringify(res)).not.toMatch(/password/);
  });

  it('estado sin motivo guarda motivo null', async () => {
    const { userRepository, useCase } = crear();
    await useCase.execute(5, { estado: 'BLOQUEADO' });
    expect(userRepository.update.mock.calls[0][1].stateChangeReason).toBeNull();
  });

  it('reactivar (estado null) descarta el motivo', async () => {
    const { userRepository, useCase } = crear();
    await useCase.execute(5, { estado: null, motivo: 'ignorar' });
    expect(userRepository.update).toHaveBeenCalledWith(5, expect.objectContaining({ state: null, stateChangeReason: null }));
  });

  it('usuario inexistente: NotFoundError', async () => {
    const { userRepository, useCase } = crear(null);
    await expect(useCase.execute(5, { estado: null })).rejects.toBeInstanceOf(NotFoundError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('body sin la clave estado: 422 (no reactiva por omisión)', async () => {
    const { userRepository, useCase } = crear();
    await expect(useCase.execute(5, { motivo: 'x' })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it.each([['ACTIVO'], [''], ['bloqueado'], [NaN], [0], [false], [undefined]])('estado %p inválido: 422', async (estado) => {
    const { userRepository, useCase } = crear();
    await expect(useCase.execute(5, { estado })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
