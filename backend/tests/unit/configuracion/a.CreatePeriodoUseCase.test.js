import { describe, it, expect, jest } from '@jest/globals';
import { CreatePeriodoUseCase } from '../../../src/application/use-cases/configuracion/CreatePeriodoUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreatePeriodoUseCase', () => {
  const crear = () => {
    const periodRepository = { create: jest.fn().mockResolvedValue({ id: 9 }) };
    const logger = { info: jest.fn() };
    return { periodRepository, useCase: new CreatePeriodoUseCase({ periodRepository, logger }) };
  };

  it('crea el periodo para el plan indicado', async () => {
    const { useCase, periodRepository } = crear();
    const res = await useCase.execute(
      4,
      { nombre: 'Primer año', numero: 1, orden_visualizacion: 3, descripcion: 'd', activo: false },
      7
    );
    expect(res).toEqual({ periodo: { id: 9 } });
    expect(periodRepository.create).toHaveBeenCalledWith(
      { studyPlanId: 4, name: 'Primer año', number: 1, displayOrder: 3, description: 'd', active: false },
      7
    );
  });

  it('displayOrder usa numero por defecto y activo=true', async () => {
    const { useCase, periodRepository } = crear();
    await useCase.execute(4, { nombre: 'P', numero: 2 });
    expect(periodRepository.create).toHaveBeenCalledWith(
      { studyPlanId: 4, name: 'P', number: 2, displayOrder: 2, description: undefined, active: true },
      null
    );
  });

  it('acepta ordenVisualizacion en camelCase', async () => {
    const { useCase, periodRepository } = crear();
    await useCase.execute(4, { nombre: 'P', numero: 2, ordenVisualizacion: 8 });
    expect(periodRepository.create.mock.calls[0][0].displayOrder).toBe(8);
  });

  it('rechaza si falta nombre', async () => {
    const { useCase, periodRepository } = crear();
    await expect(useCase.execute(4, { numero: 1 })).rejects.toBeInstanceOf(ValidationError);
    expect(periodRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si falta numero o es 0', async () => {
    const { useCase, periodRepository } = crear();
    await expect(useCase.execute(4, { nombre: 'P' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(4, { nombre: 'P', numero: 0 })).rejects.toBeInstanceOf(ValidationError);
    expect(periodRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza numero NaN (Number("abc"))', async () => {
    const { useCase, periodRepository } = crear();
    await expect(useCase.execute(4, { nombre: 'P', numero: Number('abc') })).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(periodRepository.create).not.toHaveBeenCalled();
  });
});
