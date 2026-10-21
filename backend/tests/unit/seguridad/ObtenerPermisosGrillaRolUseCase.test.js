import { describe, it, expect, jest } from '@jest/globals';
import { ValidationError } from '../../../src/domain/errors/AppError.js';
import { ObtenerPermisosGrillaRolUseCase } from '../../../src/application/use-cases/seguridad/ObtenerPermisosGrillaRolUseCase.js';

describe('ObtenerPermisosGrillaRolUseCase', () => {
  it('delega en el repositorio con rol y dominio', async () => {
    const rolPermisoRepository = { findPermisosParaGrilla: jest.fn().mockResolvedValue([{ x: 1 }]) };
    const res = await new ObtenerPermisosGrillaRolUseCase({ rolPermisoRepository }).execute(2, 'SEG');
    expect(rolPermisoRepository.findPermisosParaGrilla).toHaveBeenCalledWith(2, 'SEG');
    expect(res).toEqual([{ x: 1 }]);
  });

  it.each([[undefined], [''], [null]])('dominio %p: lanza y no consulta', async (dominio) => {
    const rolPermisoRepository = { findPermisosParaGrilla: jest.fn() };
    const promesa = new ObtenerPermisosGrillaRolUseCase({ rolPermisoRepository }).execute(2, dominio);
    await expect(promesa).rejects.toBeInstanceOf(ValidationError);
    await expect(promesa).rejects.toMatchObject({ statusCode: 400 });
    expect(rolPermisoRepository.findPermisosParaGrilla).not.toHaveBeenCalled();
  });
});
