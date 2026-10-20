import { describe, it, expect, jest } from '@jest/globals';
import { EliminarUsuarioUseCase } from '../../../src/application/use-cases/seguridad/EliminarUsuarioUseCase.js';
import { ConflictError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('EliminarUsuarioUseCase', () => {
  const crear = ({ existente = { id: 4 }, borrado = true } = {}) => {
    const userRepository = {
      findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(existente),
      delete: jest.fn().mockResolvedValue(borrado),
    };
    return { userRepository, useCase: new EliminarUsuarioUseCase({ userRepository }) };
  };

  it('baja lógica: llama delete(id, actorId) y devuelve el id numérico', async () => {
    const { userRepository, useCase } = crear();
    expect(await useCase.execute('4', 1)).toEqual({ id: 4 });
    expect(userRepository.findByIdWithRoleForAdmin).toHaveBeenCalledWith(4);
    expect(userRepository.delete).toHaveBeenCalledWith(4, 1);
  });

  it('no permite eliminar la propia cuenta', async () => {
    const { userRepository, useCase } = crear();
    await expect(useCase.execute(4, '4')).rejects.toBeInstanceOf(ConflictError);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('actor null (sin autenticar en contexto): no aplica la regla propia cuenta', async () => {
    const { userRepository, useCase } = crear();
    await useCase.execute(4);
    expect(userRepository.delete).toHaveBeenCalledWith(4, null);
  });

  it('usuario inexistente o ya eliminado: NotFoundError', async () => {
    const { userRepository, useCase } = crear({ existente: null });
    await expect(useCase.execute(4, 1)).rejects.toBeInstanceOf(NotFoundError);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('delete que no afecta filas: NotFoundError', async () => {
    const { useCase } = crear({ borrado: false });
    await expect(useCase.execute(4, 1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('id NaN no elimina nada (el repositorio no lo encuentra)', async () => {
    const { userRepository, useCase } = crear({ existente: null });
    await expect(useCase.execute('abc', 1)).rejects.toBeInstanceOf(NotFoundError);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });
});
