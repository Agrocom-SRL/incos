import { describe, it, expect, jest } from '@jest/globals';
import { UpdatePlanEstudiosUseCase } from '../../../src/application/use-cases/configuracion/UpdatePlanEstudiosUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdatePlanEstudiosUseCase', () => {
  const crear = ({ existing = { id: 3 } } = {}) => {
    const studyPlanRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 3, marca: 'ok' }),
    };
    const logger = { info: jest.fn() };
    return { studyPlanRepository, logger, useCase: new UpdatePlanEstudiosUseCase({ studyPlanRepository, logger }) };
  };

  it('mapea el body en español al patch del repositorio y devuelve { plan_estudio }', async () => {
    const { useCase, studyPlanRepository } = crear();
    const res = await useCase.execute(3, { carrera_id: 1, nombre_plan: 'P', resolucion_ministerial: 'R', documento_ruta: '/d', duracion_anios: 3, carga_horaria_total: 3000, horas_semana: 30, horas_mes: 120, horas_anio: 1200, observaciones: 'o', vigente: true, activo: true }, 9);
    expect(studyPlanRepository.findById).toHaveBeenCalledWith(3);
    expect(studyPlanRepository.update).toHaveBeenCalledWith(3, { careerId: 1, planName: 'P', ministerialResolution: 'R', documentPath: '/d', durationYears: 3, totalHours: 3000, hoursPerWeek: 30, hoursPerMonth: 120, hoursPerYear: 1200, observations: 'o', isActive: true, active: true }, 9);
    expect(res).toEqual({ plan_estudio: { id: 3, marca: 'ok' } });
  });

  it('acepta alias alternativos del body', async () => {
    const { useCase, studyPlanRepository } = crear();
    await useCase.execute(3, { carreraId: 2, nombrePlan: 'Q', resolucionMinisterial: 'R2', documentoRuta: '/e', duracionAnios: 2, cargaHorariaTotal: 2000, horasSemana: 20, horasMes: 80, horasAnio: 800, isActive: false }, null);
    expect(studyPlanRepository.update).toHaveBeenCalledWith(3, { careerId: 2, planName: 'Q', ministerialResolution: 'R2', documentPath: '/e', durationYears: 2, totalHours: 2000, hoursPerWeek: 20, hoursPerMonth: 80, hoursPerYear: 800, observations: undefined, isActive: false, active: undefined }, null);
  });

  it('con body vacío envía todos los campos undefined (no pisa nada)', async () => {
    const { useCase, studyPlanRepository } = crear();
    await useCase.execute(3);
    const patch = studyPlanRepository.update.mock.calls[0][1];
    expect(Object.values(patch).every((v) => v === undefined)).toBe(true);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, studyPlanRepository } = crear({ existing: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(studyPlanRepository.update).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, studyPlanRepository } = crear();
    studyPlanRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(3, {})).rejects.toThrow('db');
  });
});

describe('UpdatePlanEstudiosUseCase validación y vaciado', () => {
  const crear = () => {
    const studyPlanRepository = {
      findById: jest.fn().mockResolvedValue({ id: 3 }),
      update: jest.fn().mockResolvedValue({ id: 3 }),
    };
    return { studyPlanRepository, useCase: new UpdatePlanEstudiosUseCase({ studyPlanRepository, logger: { info: jest.fn() } }) };
  };

  it.each([
    [{ carrera_id: 'abc' }],
    [{ nombre_plan: '' }],
    [{ duracion_anios: -1 }],
    [{ horas_mes: 'x' }],
    [{ vigente: 'x' }],
    [{ activo: 'x' }],
  ])('rechaza %p sin actualizar', async (body) => {
    const { useCase, studyPlanRepository } = crear();
    await expect(useCase.execute(3, body)).rejects.toBeInstanceOf(ValidationError);
    expect(studyPlanRepository.update).not.toHaveBeenCalled();
  });

  it('null vacía observaciones y resolución; ausente no las toca', async () => {
    const { useCase, studyPlanRepository } = crear();
    await useCase.execute(3, { observaciones: null, resolucion_ministerial: null, duracion_anios: null });
    const patch = studyPlanRepository.update.mock.calls[0][1];
    expect(patch.observations).toBeNull();
    expect(patch.ministerialResolution).toBeNull();
    expect(patch.durationYears).toBeNull();
    await useCase.execute(3, {});
    expect(studyPlanRepository.update.mock.calls[1][1].observations).toBeUndefined();
  });
});
