import { describe, it, expect, jest } from '@jest/globals';
import { GetCronogramaGestionUseCase } from '../../../src/application/use-cases/academico/GetCronogramaGestionUseCase.js';

describe('GetCronogramaGestionUseCase', () => {
  const fila = (o = {}) => ({
    actividad_calendario_id: 1,
    periodo_academico_id: 10,
    periodo_nombre: 'Bimestre 1',
    periodo_division: 'BIMESTRE',
    nombre: 'Act',
    fecha_inicio: '2026-03-01',
    estado_actividad: 'pasada',
    ...o,
  });

  const crear = (data) => {
    const deps = {
      cronogramaGestionRepository: { obtenerCronogramaVigente: jest.fn().mockResolvedValue(data) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetCronogramaGestionUseCase(deps) };
  };

  const contexto = { gestion_id: 1, gestion_anio: 2026, gestion_nombre: 'G26', bimestre_vigente: 2 };

  it('agrupa actividades por periodo conservando el orden', async () => {
    const { useCase } = crear({
      contexto,
      actividades: [
        fila({ actividad_calendario_id: 1, periodo_academico_id: 10 }),
        fila({ actividad_calendario_id: 2, periodo_academico_id: 20, periodo_nombre: 'Bim 2', periodo_color: '#fff' }),
        fila({ actividad_calendario_id: 3, periodo_academico_id: 10 }),
      ],
    });
    const res = await useCase.execute();

    expect(res.gestion).toEqual({ id: 1, anio: 2026, nombre: 'G26', codigo: null, bimestreVigente: 2 });
    expect(res.periodos.map((p) => p.periodoAcademicoId)).toEqual([10, 20]);
    expect(res.periodos[0].actividades.map((a) => a.id)).toEqual([1, 3]);
    expect(res.periodos[1]).toMatchObject({ nombre: 'Bim 2', color: '#fff', numeroOrden: null });
  });

  it('próximas: solo vigentes/futuras, ordenadas por inicio y limitadas a 6', async () => {
    const actividades = [
      fila({ actividad_calendario_id: 1, estado_actividad: 'pasada', fecha_inicio: '2026-01-01' }),
      ...[8, 7, 6, 5, 4, 3, 2].map((d, i) =>
        fila({ actividad_calendario_id: 10 + i, estado_actividad: i % 2 ? 'vigente' : 'futura', fecha_inicio: `2026-0${d}-01` }),
      ),
    ];
    const { useCase } = crear({ contexto, actividades });
    const res = await useCase.execute();
    expect(res.proximasActividades).toHaveLength(6);
    expect(res.proximasActividades.map((a) => a.fechaInicio)).toEqual([
      '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01', '2026-07-01',
    ]);
    expect(res.proximasActividades.every((a) => a.id !== 1)).toBe(true);
  });

  it('sin actividades devuelve listas vacías', async () => {
    const { useCase } = crear({ contexto, actividades: [] });
    const res = await useCase.execute();
    expect(res.periodos).toEqual([]);
    expect(res.proximasActividades).toEqual([]);
  });

  it('404 si no hay gestión vigente', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute()).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });
});
