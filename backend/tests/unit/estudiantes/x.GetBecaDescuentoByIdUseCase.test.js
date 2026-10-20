import { jest } from '@jest/globals';
import { GetBecaDescuentoByIdUseCase } from '../../../src/application/use-cases/estudiantes/GetBecaDescuentoByIdUseCase.js';

describe('GetBecaDescuentoByIdUseCase', () => {
  const crear = (found) => {
    const deps = {
      scholarshipRepository: { findById: jest.fn().mockResolvedValue(found) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetBecaDescuentoByIdUseCase(deps) };
  };

  it('busca incluyendo inactivos (paranoid:false) y mapea a presentación', async () => {
    const { useCase, deps } = crear({ id: 2, name: 'Beca', percentage: 30, active: false });
    const res = await useCase.execute(2);
    expect(deps.scholarshipRepository.findById).toHaveBeenCalledWith(2, { paranoid: false });
    expect(res).toEqual(expect.objectContaining({ id: 2, nombre: 'Beca', porcentaje: 30, activo: false }));
  });

  it('devuelve null si no existe', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute(5)).resolves.toBeNull();
  });
});
