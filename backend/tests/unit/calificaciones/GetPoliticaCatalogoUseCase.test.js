import { jest } from '@jest/globals';
import { GetPoliticaCatalogoUseCase } from '../../../src/application/use-cases/academico/GetPoliticaCatalogoUseCase.js';

describe('GetPoliticaCatalogoUseCase', () => {
  const crear = (carreras, periodos) => {
    const deps = {
      careerRepository: { findAll: jest.fn().mockResolvedValue(carreras) },
      periodRepository: { findAll: jest.fn().mockResolvedValue(periodos) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetPoliticaCatalogoUseCase(deps) };
  };

  it.each(['careerRepository', 'periodRepository', 'logger'])('exige %s', (k) => {
    const { deps } = crear([], []);
    const resto = { ...deps };
    delete resto[k];
    expect(() => new GetPoliticaCatalogoUseCase(resto)).toThrow(`${k} es requerido`);
  });

  it('devuelve carreras y periodos mapeados, periodos ordenados por número', async () => {
    const { useCase, deps } = crear(
      { careers: [{ id: 1, code: 'ENF', name: 'Enfermería' }] },
      { periods: [{ id: 3, name: 'Tercero', number: 3 }, { id: 1, name: 'Primero', number: 1 }] }
    );
    const r = await useCase.execute();

    expect(deps.careerRepository.findAll).toHaveBeenCalledWith({});
    expect(deps.periodRepository.findAll).toHaveBeenCalledWith({});
    expect(r).toEqual({
      catalogo: {
        carreras: [{ id: 1, codigo: 'ENF', nombre: 'Enfermería' }],
        periodosPlan: [
          { id: 1, nombre: 'Primero', numero: 1 },
          { id: 3, nombre: 'Tercero', numero: 3 },
        ],
      },
    });
  });

  it('acepta listas planas y campos en español', async () => {
    const { useCase } = crear(
      [{ id: 2, codigo: 'X', nombre: 'Carrera X' }],
      [{ id: 9, nombre: 'P9', numero: 2 }, { id: 8, nombre: 'P8', numero: 1 }]
    );
    const { catalogo } = await useCase.execute();
    expect(catalogo.carreras[0]).toEqual({ id: 2, codigo: 'X', nombre: 'Carrera X' });
    expect(catalogo.periodosPlan.map((p) => p.id)).toEqual([8, 9]);
  });

  it('sin datos devuelve catálogo vacío', async () => {
    const { useCase } = crear(undefined, null);
    const r = await useCase.execute();
    expect(r.catalogo).toEqual({ carreras: [], periodosPlan: [] });
  });
});
