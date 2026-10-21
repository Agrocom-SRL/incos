import { describe, it, expect, jest } from '@jest/globals';
import { EliminarOverridePermisoUseCase } from '../../../src/application/use-cases/seguridad/EliminarOverridePermisoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('EliminarOverridePermisoUseCase', () => {
  it('elimina el override acotado al usuario (overrideId, usuarioId)', async () => {
    const userPermissionRepository = { softDeleteOverrideForUser: jest.fn().mockResolvedValue(1) };
    const res = await new EliminarOverridePermisoUseCase({ userPermissionRepository }).execute(5, 33);
    expect(userPermissionRepository.softDeleteOverrideForUser).toHaveBeenCalledWith(33, 5);
    expect(res).toEqual({ message: 'Override eliminado correctamente' });
  });

  it.each([[0], [null], [undefined]])('sin filas afectadas (%p, p.ej. override de otro usuario): NotFoundError', async (n) => {
    const userPermissionRepository = { softDeleteOverrideForUser: jest.fn().mockResolvedValue(n) };
    await expect(new EliminarOverridePermisoUseCase({ userPermissionRepository }).execute(5, NaN)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
