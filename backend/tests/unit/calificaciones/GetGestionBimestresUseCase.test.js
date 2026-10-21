import { jest } from '@jest/globals';
import { GetGestionBimestresUseCase } from '../../../src/application/use-cases/academico/GetGestionBimestresUseCase.js';

describe('GetGestionBimestresUseCase', () => {
  const crear = (tablero) => {
    const deps = {
      gestionBimestresRepository: {
        obtenerGestionBimestres: jest.fn().mockResolvedValue(tablero),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetGestionBimestresUseCase(deps) };
  };

  it('devuelve el tablero tal cual y registra la gestión', async () => {
    const tablero = { gestion: { id: 4 }, bimestreVigente: 2, bimestres: [] };
    const { useCase, deps } = crear(tablero);

    await expect(useCase.execute()).resolves.toBe(tablero);
    expect(deps.gestionBimestresRepository.obtenerGestionBimestres).toHaveBeenCalledTimes(1);
    expect(deps.logger.info).toHaveBeenCalledWith(
      '[Calificaciones] Gestión bimestres cargada',
      { gestionId: 4, bimestreVigente: 2 },
    );
  });

  it.each([[null], [undefined]])('lanza 404 NOT_FOUND si no hay gestión vigente (%s)', async (valor) => {
    const { useCase, deps } = crear(valor);
    await expect(useCase.execute()).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'No hay gestión académica vigente',
    });
    expect(deps.logger.info).not.toHaveBeenCalled();
  });
});
