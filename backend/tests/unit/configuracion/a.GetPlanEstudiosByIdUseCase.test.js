import { describe, it, expect, jest } from '@jest/globals';
import { GetPlanEstudiosByIdUseCase } from '../../../src/application/use-cases/configuracion/GetPlanEstudiosByIdUseCase.js';

describe('GetPlanEstudiosByIdUseCase', () => {
  const crear = ({ plan = { id: 1, careerId: 2, planName: 'Plan' }, periodos, asignaturas, prerrequisitos } = {}) => {
    const studyPlanRepository = { findById: jest.fn().mockResolvedValue(plan) };
    const periodRepository = {
      findAll: jest.fn().mockResolvedValue(periodos ?? { periods: [{ id: 5, studyPlanId: 1, name: 'P1', number: 1 }] }),
    };
    const planSubjectRepository = {
      findAll: jest.fn().mockResolvedValue(asignaturas ?? { planSubjects: [] }),
    };
    const prerequisiteRepository = {
      findAll: jest.fn().mockResolvedValue(prerrequisitos ?? { prerequisites: [] }),
    };
    return {
      studyPlanRepository,
      periodRepository,
      planSubjectRepository,
      prerequisiteRepository,
      useCase: new GetPlanEstudiosByIdUseCase({
        studyPlanRepository,
        periodRepository,
        planSubjectRepository,
        prerequisiteRepository,
        logger: { info: jest.fn() },
      }),
    };
  };

  it('devuelve null si el plan no existe y no consulta hijos', async () => {
    const { useCase, periodRepository, planSubjectRepository, prerequisiteRepository } = crear({ plan: null });
    await expect(useCase.execute(9)).resolves.toBeNull();
    expect(periodRepository.findAll).not.toHaveBeenCalled();
    expect(planSubjectRepository.findAll).not.toHaveBeenCalled();
    expect(prerequisiteRepository.findAll).not.toHaveBeenCalled();
  });

  it('devuelve plan, periodos, asignaturas y prerrequisitos consultando por studyPlanId', async () => {
    const { useCase, periodRepository, planSubjectRepository, prerequisiteRepository } = crear();
    const res = await useCase.execute(1);
    expect(periodRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 1 }, null, null);
    expect(planSubjectRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 1 }, null, null);
    expect(prerequisiteRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 1 }, null, null);
    expect(Object.keys(res)).toEqual(['plan_estudio', 'periodos', 'asignaturas', 'prerrequisitos']);
    expect(res.plan_estudio).toMatchObject({ id: 1 });
    expect(res.periodos).toHaveLength(1);
    expect(res.periodos[0]).toMatchObject({ id: 5, nombre: 'P1', numero: 1 });
    expect(res.asignaturas).toEqual([]);
    expect(res.prerrequisitos).toEqual([]);
  });

  it('tolera resultados sin la colección esperada', async () => {
    const { useCase } = crear({ periodos: {}, asignaturas: {}, prerrequisitos: {} });
    const res = await useCase.execute(1);
    expect(res.periodos).toEqual([]);
    expect(res.asignaturas).toEqual([]);
    expect(res.prerrequisitos).toEqual([]);
  });
});
