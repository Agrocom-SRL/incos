import { describe, it, expect, jest } from '@jest/globals';
import { ValidarPlanEstudiosUseCase } from '../../../src/application/use-cases/configuracion/ValidarPlanEstudiosUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ValidarPlanEstudiosUseCase', () => {
  const crear = ({ plan = { id: 1, hoursPerWeek: 10 }, periods = [], planSubjects = [] } = {}) => {
    const studyPlanRepository = { findById: jest.fn().mockResolvedValue(plan) };
    const periodRepository = { findAll: jest.fn().mockResolvedValue({ periods }) };
    const planSubjectRepository = { findAll: jest.fn().mockResolvedValue({ planSubjects }) };
    return {
      studyPlanRepository,
      periodRepository,
      planSubjectRepository,
      useCase: new ValidarPlanEstudiosUseCase({
        studyPlanRepository, periodRepository, planSubjectRepository, logger: { info: jest.fn() },
      }),
    };
  };

  it('es válido cuando cada periodo suma las horas semanales del plan', async () => {
    const { useCase, periodRepository, planSubjectRepository } = crear({
      periods: [{ id: 1 }, { id: 2 }],
      planSubjects: [
        { periodId: 1, weeklyHours: 6 }, { periodId: 1, weeklyHours: 4 },
        { periodId: 2, weeklyHours: 10 },
      ],
    });
    const res = await useCase.execute(1);
    expect(periodRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 1, sort: 'numero:ASC' }, null, null);
    expect(planSubjectRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 1 }, null, null);
    expect(res.valido).toBe(true);
    expect(res.periodos).toEqual([
      { periodo_id: 1, horas_esperadas: 10, horas_asignadas: 10, materias_count: 2, ok: true },
      { periodo_id: 2, horas_esperadas: 10, horas_asignadas: 10, materias_count: 1, ok: true },
    ]);
    expect(res.total_horas).toEqual({ esperado: 20, asignado: 20 });
  });

  it('es inválido si algún periodo no cuadra (sobra o falta)', async () => {
    const { useCase } = crear({
      periods: [{ id: 1 }, { id: 2 }],
      planSubjects: [{ periodId: 1, weeklyHours: 10 }, { periodId: 2, weeklyHours: 12 }],
    });
    const res = await useCase.execute(1);
    expect(res.valido).toBe(false);
    expect(res.periodos.map((p) => p.ok)).toEqual([true, false]);
    expect(res.total_horas).toEqual({ esperado: 20, asignado: 22 });
  });

  it('un periodo sin asignaturas queda con 0 horas y plan inválido', async () => {
    const { useCase } = crear({ periods: [{ id: 1 }], planSubjects: [] });
    const res = await useCase.execute(1);
    expect(res.periodos[0]).toMatchObject({ horas_asignadas: 0, materias_count: 0, ok: false });
    expect(res.valido).toBe(false);
  });

  it('sin periodos el plan no es válido', async () => {
    const { useCase } = crear({ periods: [] });
    const res = await useCase.execute(1);
    expect(res).toEqual({ valido: false, periodos: [], total_horas: { esperado: 0, asignado: 0 } });
  });

  it('ignora asignaturas de periodos ajenos al plan', async () => {
    const { useCase } = crear({ periods: [{ id: 1 }], planSubjects: [{ periodId: 1, weeklyHours: 10 }, { periodId: 99, weeklyHours: 50 }] });
    const res = await useCase.execute(1);
    expect(res.valido).toBe(true);
    expect(res.total_horas.asignado).toBe(10);
  });

  it('trata horas no numéricas como 0 (no propaga NaN)', async () => {
    const { useCase } = crear({
      plan: { id: 1, hoursPerWeek: 'abc' },
      periods: [{ id: 1 }],
      planSubjects: [{ periodId: 1, weeklyHours: 'x' }, { periodId: 1, weeklyHours: null }],
    });
    const res = await useCase.execute(1);
    expect(res.periodos[0]).toMatchObject({ horas_esperadas: 0, horas_asignadas: 0, materias_count: 2 });
    expect(Number.isNaN(res.total_horas.asignado)).toBe(false);
  });

  it('lanza NotFoundError si el plan no existe y no consulta periodos', async () => {
    const { useCase, periodRepository } = crear({ plan: null });
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(periodRepository.findAll).not.toHaveBeenCalled();
  });
});
