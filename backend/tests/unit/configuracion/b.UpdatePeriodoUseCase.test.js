import { describe, it, expect, jest } from '@jest/globals';
import { UpdatePeriodoUseCase } from '../../../src/application/use-cases/configuracion/UpdatePeriodoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdatePeriodoUseCase', () => {
  const crear = ({ existing = { id: 3 } } = {}) => {
    const periodRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 3, marca: 'ok' }),
    };
    const logger = { info: jest.fn() };
    return { periodRepository, logger, useCase: new UpdatePeriodoUseCase({ periodRepository, logger }) };
  };

  it('mapea el body en español al patch del repositorio y devuelve { periodo }', async () => {
    const { useCase, periodRepository } = crear();
    const res = await useCase.execute(3, { nombre: 'Primero', numero: 1, orden_visualizacion: 2, descripcion: 'd', activo: true }, 9);
    expect(periodRepository.findById).toHaveBeenCalledWith(3);
    expect(periodRepository.update).toHaveBeenCalledWith(3, { name: 'Primero', number: 1, displayOrder: 2, description: 'd', active: true }, 9);
    expect(res).toEqual({ periodo: { id: 3, marca: 'ok' } });
  });

  it('acepta alias alternativos del body', async () => {
    const { useCase, periodRepository } = crear();
    await useCase.execute(3, { ordenVisualizacion: 5 }, null);
    expect(periodRepository.update).toHaveBeenCalledWith(3, { name: undefined, number: undefined, displayOrder: 5, description: undefined, active: undefined }, null);
  });

  it('con body vacío envía todos los campos undefined (no pisa nada)', async () => {
    const { useCase, periodRepository } = crear();
    await useCase.execute(3);
    const patch = periodRepository.update.mock.calls[0][1];
    expect(Object.values(patch).every((v) => v === undefined)).toBe(true);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, periodRepository } = crear({ existing: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(periodRepository.update).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, periodRepository } = crear();
    periodRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(3, {})).rejects.toThrow('db');
  });
});

describe('UpdatePeriodoUseCase validación y vaciado', () => {
  const crear = () => {
    const periodRepository = {
      findById: jest.fn().mockResolvedValue({ id: 3 }),
      update: jest.fn().mockResolvedValue({ id: 3 }),
    };
    return { periodRepository, useCase: new UpdatePeriodoUseCase({ periodRepository, logger: { info: jest.fn() } }) };
  };

  it.each([[{ numero: 'abc' }], [{ numero: -1 }], [{ nombre: '   ' }], [{ orden_visualizacion: -3 }], [{ activo: 'x' }]])(
    'rechaza %p sin actualizar',
    async (body) => {
      const { useCase, periodRepository } = crear();
      await expect(useCase.execute(3, body)).rejects.toBeInstanceOf(ValidationError);
      expect(periodRepository.update).not.toHaveBeenCalled();
    }
  );

  it('descripcion null vacía el campo; ausente no lo toca', async () => {
    const { useCase, periodRepository } = crear();
    await useCase.execute(3, { descripcion: null });
    expect(periodRepository.update.mock.calls[0][1].description).toBeNull();
    await useCase.execute(3, {});
    expect(periodRepository.update.mock.calls[1][1].description).toBeUndefined();
  });
});
