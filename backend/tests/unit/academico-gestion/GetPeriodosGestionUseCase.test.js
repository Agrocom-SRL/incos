import { describe, it, expect, jest } from '@jest/globals';
import { GetPeriodosGestionUseCase } from '../../../src/application/use-cases/academico/GetPeriodosGestionUseCase.js';

describe('GetPeriodosGestionUseCase', () => {
  const crear = ({ ctx, periodos = [] }) => {
    const deps = {
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn().mockResolvedValue(ctx) },
      cronogramaGestionRepository: { obtenerPeriodosGestion: jest.fn().mockResolvedValue(periodos) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetPeriodosGestionUseCase(deps) };
  };

  it('devuelve la gestión y los periodos mapeados', async () => {
    const { useCase, deps } = crear({
      ctx: { gestion_id: 3, gestion_anio: 2026, gestion_nombre: 'G', gestion_fecha_inicio: '2026-02-01' },
      periodos: [
        { periodoAcademicoId: 1, nombre: 'Bim 1', division: 'BIMESTRE', numeroOrden: 1, color: '#abc', fechaInicio: 'a', fechaFin: 'b' },
        { periodoAcademicoId: 2, nombre: 'Etapa', division: 'OTRO', fechaInicio: 'c', fechaFin: 'd' },
      ],
    });
    const res = await useCase.execute();
    expect(deps.cronogramaGestionRepository.obtenerPeriodosGestion).toHaveBeenCalledWith(3);
    expect(res.gestion).toEqual({ id: 3, anio: 2026, nombre: 'G', codigo: null, fechaInicio: '2026-02-01', fechaFin: null });
    expect(res.periodos[0]).toEqual({
      id: 1, nombre: 'Bim 1', division: 'BIMESTRE', numeroOrden: 1, colorHex: '#abc', fechaInicio: 'a', fechaFin: 'b',
    });
    expect(res.periodos[1]).toMatchObject({ id: 2, numeroOrden: null, colorHex: null });
  });

  it('404 si no hay gestión vigente', async () => {
    const { useCase, deps } = crear({ ctx: null });
    await expect(useCase.execute()).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
    expect(deps.cronogramaGestionRepository.obtenerPeriodosGestion).not.toHaveBeenCalled();
  });
});
