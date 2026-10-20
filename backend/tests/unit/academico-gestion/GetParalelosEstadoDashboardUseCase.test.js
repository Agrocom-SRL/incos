import { describe, it, expect, jest } from '@jest/globals';
import { GetParalelosEstadoDashboardUseCase } from '../../../src/application/use-cases/academico/GetParalelosEstadoDashboardUseCase.js';

describe('GetParalelosEstadoDashboardUseCase', () => {
  const crear = (rows) => {
    const deps = {
      parallelRepository: { obtenerParalelosEstadoDashboard: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetParalelosEstadoDashboardUseCase(deps) };
  };

  const completo = {
    asignaturas_requeridas: 3,
cursos_creados: 3,
cursos_con_horario: 3,
paralelo_aula_id: 1,
    bloques_sin_aula: 0,
cursos_sin_docente: 0,
  };

  it('usa tablero_grupo de la vista y calcula KPIs', async () => {
    const { useCase, deps } = crear([
      { id: 1, tablero_grupo: 'sin_aulas' },
      { id: 2, tablero_grupo: 'completo' },
      { id: 3, tablero_grupo: 'completo' },
    ]);
    const res = await useCase.execute({ carreraId: 2 });
    expect(deps.parallelRepository.obtenerParalelosEstadoDashboard).toHaveBeenCalledWith({ carreraId: 2 });
    expect(res.paralelos.map((p) => p.board_bucket)).toEqual(['sin_aulas', 'completo', 'completo']);
    expect(res.kpis).toEqual({ total: 3, sin_aulas: 1, sin_docentes: 0, sin_horarios: 0, completos: 2 });
  });

  it('sin tablero_grupo calcula el grupo con prioridad aulas > docentes > horarios > completo', async () => {
    const { useCase } = crear([
      { ...completo, paralelo_aula_id: null },
      { ...completo, cursos_sin_docente: 1 },
      { ...completo, cursos_con_horario: 2 },
      completo,
    ]);
    const res = await useCase.execute();
    expect(res.paralelos.map((p) => p.board_bucket)).toEqual(['sin_aulas', 'sin_docentes', 'sin_horarios', 'completo']);
    expect(res.kpis).toEqual({ total: 4, sin_aulas: 1, sin_docentes: 1, sin_horarios: 1, completos: 1 });
  });

  it.each([[null], [undefined], ['x']])('respuesta no-array (%p) -> sin paralelos', async (v) => {
    const { useCase } = crear(v);
    const res = await useCase.execute();
    expect(res.paralelos).toEqual([]);
    expect(res.kpis.total).toBe(0);
  });
});
