import { describe, it, expect, jest } from '@jest/globals';
import { GetActividadCronogramaUseCase } from '../../../src/application/use-cases/academico/GetActividadCronogramaUseCase.js';

describe('GetActividadCronogramaUseCase', () => {
  const crear = (fila) => {
    const deps = {
      cronogramaGestionRepository: { obtenerActividadAdminPorId: jest.fn().mockResolvedValue(fila) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetActividadCronogramaUseCase(deps) };
  };

  it('devuelve la ficha con nulos normalizados', async () => {
    const { useCase, deps } = crear({
      id: 1, periodoAcademicoId: 2, periodoNombre: 'Bim 1', nombre: 'Inicio', fechaInicio: '2026-03-01', esDestacada: 1,
    });
    const res = await useCase.execute(1);
    expect(deps.cronogramaGestionRepository.obtenerActividadAdminPorId).toHaveBeenCalledWith(1);
    expect(res).toEqual({
      id: 1,
      periodoAcademicoId: 2,
      periodoNombre: 'Bim 1',
      periodoColor: null,
      actividadId: null,
      nombrePersonalizado: null,
      catalogoNombre: null,
      nombre: 'Inicio',
      tipo: null,
      icono: null,
      esDestacada: true,
      codigo: null,
      fechaInicio: '2026-03-01',
      fechaFin: null,
      estado: null,
    });
  });

  it('404 si no existe', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute(99)).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });
});
