import { describe, it, expect, jest } from '@jest/globals';
import { ListAsignaturasPlanByPeriodoUseCase } from '../../../src/application/use-cases/configuracion/ListAsignaturasPlanByPeriodoUseCase.js';

describe('ListAsignaturasPlanByPeriodoUseCase', () => {
  const crear = (result) => {
    const planSubjectRepository = { findAll: jest.fn().mockResolvedValue(result) };
    return { planSubjectRepository, useCase: new ListAsignaturasPlanByPeriodoUseCase({ planSubjectRepository, logger: { info: jest.fn() } }) };
  };

  it('consulta por periodId sin paginación y devuelve { asignaturas } mapeado', async () => {
    const { useCase, planSubjectRepository } = crear({ planSubjects: [{ id: 1, studyPlanId: 2, periodId: 5, subjectId: 4, weeklyHours: 3 }] });
    const res = await useCase.execute(5);
    expect(planSubjectRepository.findAll).toHaveBeenCalledWith({ periodId: 5 }, null, null);
    expect(res.asignaturas).toEqual([{ id: 1, plan_estudio_id: 2, periodo_id: 5, materia_id: 4, horas_semanales: 3 }]);
  });

  it('devuelve lista vacía si el repositorio no trae la colección', async () => {
    const { useCase } = crear({});
    await expect(useCase.execute(5)).resolves.toEqual({ asignaturas: [] });
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, planSubjectRepository } = crear({});
    planSubjectRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(5)).rejects.toThrow('db');
  });
});
