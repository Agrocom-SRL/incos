import { describe, it, expect, jest } from '@jest/globals';
import { UpdateAsignaturaPlanUseCase } from '../../../src/application/use-cases/configuracion/UpdateAsignaturaPlanUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateAsignaturaPlanUseCase', () => {
  const crear = ({ existing = { id: 3 } } = {}) => {
    const planSubjectRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 3, marca: 'ok' }),
    };
    const logger = { info: jest.fn() };
    return { planSubjectRepository, logger, useCase: new UpdateAsignaturaPlanUseCase({ planSubjectRepository, logger }) };
  };

  it('mapea el body en español al patch del repositorio y devuelve { asignatura }', async () => {
    const { useCase, planSubjectRepository } = crear();
    const res = await useCase.execute(3, { horas_semanales: 4, modalidad: 'PRESENCIAL', orden_visualizacion: 2, activo: true }, 9);
    expect(planSubjectRepository.findById).toHaveBeenCalledWith(3);
    expect(planSubjectRepository.update).toHaveBeenCalledWith(3, { weeklyHours: 4, modality: 'PRESENCIAL', displayOrder: 2, active: true }, 9);
    expect(res).toEqual({ asignatura: { id: 3, marca: 'ok' } });
  });

  it('acepta alias alternativos del body', async () => {
    const { useCase, planSubjectRepository } = crear();
    await useCase.execute(3, { horasSemanales: 6, modality: 'VIRTUAL', ordenVisualizacion: 3 }, null);
    expect(planSubjectRepository.update).toHaveBeenCalledWith(3, { weeklyHours: 6, modality: 'VIRTUAL', displayOrder: 3, active: undefined }, null);
  });

  it('con body vacío envía todos los campos undefined (no pisa nada)', async () => {
    const { useCase, planSubjectRepository } = crear();
    await useCase.execute(3);
    const patch = planSubjectRepository.update.mock.calls[0][1];
    expect(Object.values(patch).every((v) => v === undefined)).toBe(true);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, planSubjectRepository } = crear({ existing: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(planSubjectRepository.update).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, planSubjectRepository } = crear();
    planSubjectRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(3, {})).rejects.toThrow('db');
  });
});

describe('UpdateAsignaturaPlanUseCase validación y vaciado', () => {
  const crear = () => {
    const planSubjectRepository = {
      findById: jest.fn().mockResolvedValue({ id: 3 }),
      update: jest.fn().mockResolvedValue({ id: 3 }),
    };
    return { planSubjectRepository, useCase: new UpdateAsignaturaPlanUseCase({ planSubjectRepository, logger: { info: jest.fn() } }) };
  };

  it.each([[{ horas_semanales: 'abc' }], [{ horas_semanales: -1 }], [{ orden_visualizacion: -1 }], [{ activo: 'x' }]])(
    'rechaza %p sin actualizar',
    async (body) => {
      const { useCase, planSubjectRepository } = crear();
      await expect(useCase.execute(3, body)).rejects.toBeInstanceOf(ValidationError);
      expect(planSubjectRepository.update).not.toHaveBeenCalled();
    }
  );

  it('modalidad null vacía el campo; ausente no lo toca', async () => {
    const { useCase, planSubjectRepository } = crear();
    await useCase.execute(3, { modalidad: null });
    expect(planSubjectRepository.update.mock.calls[0][1].modality).toBeNull();
    await useCase.execute(3, {});
    expect(planSubjectRepository.update.mock.calls[1][1].modality).toBeUndefined();
  });
});
