import { describe, it, expect, jest } from '@jest/globals';
import { CreateAsignaturaPlanUseCase } from '../../../src/application/use-cases/configuracion/CreateAsignaturaPlanUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateAsignaturaPlanUseCase', () => {
  const crear = () => {
    const planSubjectRepository = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    const logger = { info: jest.fn() };
    return {
      planSubjectRepository,
      useCase: new CreateAsignaturaPlanUseCase({ planSubjectRepository, logger }),
    };
  };
  const valido = { plan_estudio_id: 1, periodo_id: 2, materia_id: 3, horas_semanales: 4 };

  it('crea con claves snake_case y devuelve { asignatura }', async () => {
    const { useCase, planSubjectRepository } = crear();
    const res = await useCase.execute({ ...valido, modalidad: 'PRESENCIAL', orden_visualizacion: 2 }, 8);
    expect(res).toEqual({ asignatura: { id: 1 } });
    expect(planSubjectRepository.create).toHaveBeenCalledWith(
      {
        studyPlanId: 1,
        periodId: 2,
        subjectId: 3,
        weeklyHours: 4,
        modality: 'PRESENCIAL',
        displayOrder: 2,
        active: true,
      },
      8
    );
  });

  it('acepta claves camelCase y userId null por defecto', async () => {
    const { useCase, planSubjectRepository } = crear();
    await useCase.execute({
      planEstudioId: 1,
      periodoId: 2,
      materiaId: 3,
      horasSemanales: 5,
      ordenVisualizacion: 9,
      activo: false,
    });
    expect(planSubjectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ weeklyHours: 5, displayOrder: 9, active: false }),
      null
    );
  });

  it.each([
    ['plan_estudio_id'],
    ['periodo_id'],
    ['materia_id'],
    ['horas_semanales'],
  ])('rechaza si falta %s', async (campo) => {
    const { useCase, planSubjectRepository } = crear();
    const body = { ...valido };
    delete body[campo];
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(ValidationError);
    expect(planSubjectRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza horas_semanales igual a 0', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...valido, horas_semanales: 0 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('rechaza un body vacío', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('CreateAsignaturaPlanUseCase validación de tipos', () => {
  const base = { plan_estudio_id: 1, periodo_id: 2, materia_id: 3, horas_semanales: 4 };
  const crear = () => {
    const planSubjectRepository = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    return { planSubjectRepository, useCase: new CreateAsignaturaPlanUseCase({ planSubjectRepository, logger: { info: jest.fn() } }) };
  };

  it.each([
    [{ plan_estudio_id: 'abc' }],
    [{ periodo_id: -1 }],
    [{ materia_id: '3x' }],
    [{ horas_semanales: 'abc' }],
    [{ horas_semanales: -4 }],
    [{ horas_semanales: 0 }],
    [{ orden_visualizacion: -1 }],
    [{ activo: 'quizas' }],
  ])('rechaza %p', async (cambio) => {
    const { useCase, planSubjectRepository } = crear();
    await expect(useCase.execute({ ...base, ...cambio })).rejects.toBeInstanceOf(ValidationError);
    expect(planSubjectRepository.create).not.toHaveBeenCalled();
  });
});
