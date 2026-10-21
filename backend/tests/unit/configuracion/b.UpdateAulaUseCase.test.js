import { describe, it, expect, jest } from '@jest/globals';
import { UpdateAulaUseCase } from '../../../src/application/use-cases/configuracion/UpdateAulaUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateAulaUseCase', () => {
  const crear = ({ existing = { id: 3 } } = {}) => {
    const classroomRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 3 }),
    };
    const logger = { info: jest.fn() };
    return { classroomRepository, logger, useCase: new UpdateAulaUseCase({ classroomRepository, logger }) };
  };

  it('mapea el body en español y devuelve { aula }', async () => {
    const { useCase, classroomRepository } = crear();
    const res = await useCase.execute(
      3,
      { codigo: 'A-1', nombre: 'Aula 1', categoria: 'AULA', capacidad: 30, observaciones: 'o', activo: true },
      9
    );
    expect(classroomRepository.update).toHaveBeenCalledWith(
      3,
      { code: 'A-1', name: 'Aula 1', category: 'AULA', capacity: 30, observations: 'o', active: true },
      9
    );
    expect(res).toEqual({ aula: { id: 3 } });
  });

  it('acepta alias en inglés y userId null por defecto', async () => {
    const { useCase, classroomRepository } = crear();
    await useCase.execute(3, { code: 'L', name: 'Lab', category: 'LABORATORIO', capacity: 15, observations: 'x', active: false });
    expect(classroomRepository.update).toHaveBeenCalledWith(
      3,
      { code: 'L', name: 'Lab', category: 'LABORATORIO', capacity: 15, observations: 'x', active: false },
      null
    );
  });

  it('sin categoría no valida ni envía category', async () => {
    const { useCase, classroomRepository } = crear();
    await useCase.execute(3, { nombre: 'Solo nombre' });
    expect(classroomRepository.update.mock.calls[0][1].category).toBeUndefined();
  });

  it('lanza ValidationError con categoría inválida y no actualiza', async () => {
    const { useCase, classroomRepository } = crear();
    await expect(useCase.execute(3, { categoria: 'PATIO' })).rejects.toBeInstanceOf(ValidationError);
    expect(classroomRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, classroomRepository } = crear({ existing: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(classroomRepository.update).not.toHaveBeenCalled();
  });
});
