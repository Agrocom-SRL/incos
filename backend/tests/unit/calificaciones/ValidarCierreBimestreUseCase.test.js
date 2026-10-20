import { jest } from '@jest/globals';
import { ValidarCierreBimestreUseCase } from '../../../src/application/use-cases/academico/ValidarCierreBimestreUseCase.js';

describe('ValidarCierreBimestreUseCase', () => {
  const crear = (ctx = { gestion_id: '3' }) => {
    const deps = {
      gestionBimestresRepository: {
        validarCierreBimestre: jest.fn().mockResolvedValue({ puedeCerrar: true }),
      },
      calificacionContextoRepository: {
        obtenerContextoVigente: jest.fn().mockResolvedValue(ctx),
      },
    };
    return { deps, useCase: new ValidarCierreBimestreUseCase(deps) };
  };

  it('valida el cierre con la gestión vigente como número', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ numeroBimestre: 2 });

    expect(deps.gestionBimestresRepository.validarCierreBimestre).toHaveBeenCalledWith(2, 3);
    expect(result).toEqual({ puedeCerrar: true });
  });

  it.each([[null], [{}], [{ gestion_id: null }]])(
    'lanza 404 si no hay gestión vigente (contexto %j)',
    async (ctx) => {
      const { useCase, deps } = crear(ctx);
      await expect(useCase.execute({ numeroBimestre: 1 })).rejects.toMatchObject({
        statusCode: 404,
        message: 'No hay gestión académica vigente',
      });
      expect(deps.gestionBimestresRepository.validarCierreBimestre).not.toHaveBeenCalled();
    },
  );
});
