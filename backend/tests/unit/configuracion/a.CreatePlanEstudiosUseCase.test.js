import { describe, it, expect, jest } from '@jest/globals';
import { CreatePlanEstudiosUseCase } from '../../../src/application/use-cases/configuracion/CreatePlanEstudiosUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreatePlanEstudiosUseCase', () => {
  const crear = () => {
    const studyPlanRepository = { create: jest.fn().mockResolvedValue({ id: 3 }) };
    const logger = { info: jest.fn() };
    return { studyPlanRepository, logger, useCase: new CreatePlanEstudiosUseCase({ studyPlanRepository, logger }) };
  };

  it('crea el plan con claves snake_case y registra el log', async () => {
    const { useCase, studyPlanRepository, logger } = crear();
    const res = await useCase.execute(
      {
        carrera_id: 1,
        nombre_plan: 'Plan 2026',
        resolucion_ministerial: 'RM 1',
        documento_ruta: '/d.pdf',
        duracion_anios: 3,
        carga_horaria_total: 3000,
        horas_semana: 30,
        horas_mes: 120,
        horas_anio: 1000,
        observaciones: 'o',
        vigente: true,
        activo: false,
      },
      4
    );
    expect(res).toEqual({ plan_estudio: { id: 3 } });
    expect(studyPlanRepository.create).toHaveBeenCalledWith(
      {
        careerId: 1,
        planName: 'Plan 2026',
        ministerialResolution: 'RM 1',
        documentPath: '/d.pdf',
        durationYears: 3,
        totalHours: 3000,
        hoursPerWeek: 30,
        hoursPerMonth: 120,
        hoursPerYear: 1000,
        observations: 'o',
        isActive: true,
        active: false,
      },
      4
    );
    expect(logger.info).toHaveBeenCalledWith('Plan de estudios creado', { id: 3 });
  });

  it('acepta camelCase y aplica defaults', async () => {
    const { useCase, studyPlanRepository } = crear();
    await useCase.execute({ carreraId: 2, nombrePlan: 'P', duracionAnios: 2, cargaHorariaTotal: 10 });
    expect(studyPlanRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        careerId: 2,
        planName: 'P',
        durationYears: 2,
        totalHours: 10,
        isActive: undefined,
        active: true,
      }),
      null
    );
  });

  it('rechaza si falta carrera_id', async () => {
    const { useCase, studyPlanRepository } = crear();
    await expect(useCase.execute({ nombre_plan: 'P' })).rejects.toBeInstanceOf(ValidationError);
    expect(studyPlanRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si falta nombre_plan', async () => {
    const { useCase, studyPlanRepository } = crear();
    await expect(useCase.execute({ carrera_id: 1 })).rejects.toBeInstanceOf(ValidationError);
    expect(studyPlanRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza carrera_id NaN', async () => {
    const { useCase, studyPlanRepository } = crear();
    await expect(
      useCase.execute({ carrera_id: Number('abc'), nombre_plan: 'P' })
    ).rejects.toBeInstanceOf(ValidationError);
    expect(studyPlanRepository.create).not.toHaveBeenCalled();
  });
});

describe('CreatePlanEstudiosUseCase validación de tipos', () => {
  const base = { carrera_id: 1, nombre_plan: 'Plan' };
  const crear = () => {
    const studyPlanRepository = { create: jest.fn().mockResolvedValue({ id: 3 }) };
    return { studyPlanRepository, useCase: new CreatePlanEstudiosUseCase({ studyPlanRepository, logger: { info: jest.fn() } }) };
  };

  it.each([
    [{ carrera_id: 'abc' }],
    [{ carrera_id: -1 }],
    [{ nombre_plan: '   ' }],
    [{ duracion_anios: -3 }],
    [{ carga_horaria_total: 'mucho' }],
    [{ horas_semana: -1 }],
    [{ vigente: 'tal vez' }],
    [{ activo: 'x' }],
  ])('rechaza %p', async (cambio) => {
    const { useCase, studyPlanRepository } = crear();
    await expect(useCase.execute({ ...base, ...cambio })).rejects.toBeInstanceOf(ValidationError);
    expect(studyPlanRepository.create).not.toHaveBeenCalled();
  });
});
