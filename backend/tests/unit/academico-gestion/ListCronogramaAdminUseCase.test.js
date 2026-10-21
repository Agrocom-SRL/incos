import { describe, it, expect, jest } from '@jest/globals';
import { ListCronogramaAdminUseCase } from '../../../src/application/use-cases/academico/ListCronogramaAdminUseCase.js';

describe('ListCronogramaAdminUseCase', () => {
  const crear = (data) => {
    const deps = {
      cronogramaGestionRepository: { obtenerAdminVigente: jest.fn().mockResolvedValue(data) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListCronogramaAdminUseCase(deps) };
  };

  it('arma gestión, actividades mapeadas, periodos y catálogo', async () => {
    const periodos = [{ id: 1 }];
    const catalogo = [{ id: 2 }];
    const { useCase } = crear({
      contexto: { gestion_id: 4, gestion_anio: 2026, gestion_nombre: 'G', gestion_codigo: undefined },
      actividades: [{ id: 1, periodoAcademicoId: 1, periodoNombre: 'P', nombre: 'A', fechaInicio: 'f', esDestacada: 0, estado: 'vigente' }],
      periodos,
      catalogo,
    });
    const res = await useCase.execute();
    expect(res.gestion).toEqual({ id: 4, anio: 2026, nombre: 'G', codigo: null });
    expect(res.actividades[0]).toMatchObject({ id: 1, esDestacada: false, fechaFin: null, periodoColor: null, estado: 'vigente' });
    expect(res.periodos).toBe(periodos);
    expect(res.catalogo).toBe(catalogo);
  });

  it('404 si no hay gestión vigente', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute()).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });
});
