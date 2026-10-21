import { describe, it, expect, jest } from '@jest/globals';
import { CreateAulaUseCase } from '../../../src/application/use-cases/configuracion/CreateAulaUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateAulaUseCase', () => {
  const crear = () => {
    const classroomRepository = { create: jest.fn().mockResolvedValue({ id: 4 }) };
    const logger = { info: jest.fn() };
    return { classroomRepository, logger, useCase: new CreateAulaUseCase({ classroomRepository, logger }) };
  };

  it('crea el aula, mapea campos y registra el log', async () => {
    const { useCase, classroomRepository, logger } = crear();
    const res = await useCase.execute(
      { codigo: 'A-1', nombre: 'Aula 1', categoria: 'LABORATORIO', capacidad: 30, observaciones: 'o', activo: false },
      2
    );
    expect(res).toEqual({ aula: { id: 4 } });
    expect(classroomRepository.create).toHaveBeenCalledWith(
      { code: 'A-1', name: 'Aula 1', category: 'LABORATORIO', capacity: 30, observations: 'o', active: false },
      2
    );
    expect(logger.info).toHaveBeenCalledWith('Aula creada', { id: 4 });
  });

  it('acepta alias en inglés y activo=true por defecto', async () => {
    const { useCase, classroomRepository } = crear();
    await useCase.execute({ code: 'B', name: 'N' });
    expect(classroomRepository.create).toHaveBeenCalledWith(
      {
        code: 'B',
        name: 'N',
        category: undefined,
        capacity: undefined,
        observations: undefined,
        active: true,
      },
      null
    );
  });

  it('rechaza si falta codigo', async () => {
    const { useCase, classroomRepository } = crear();
    await expect(useCase.execute({ nombre: 'N' })).rejects.toBeInstanceOf(ValidationError);
    expect(classroomRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si falta nombre', async () => {
    const { useCase, classroomRepository } = crear();
    await expect(useCase.execute({ codigo: 'A' })).rejects.toBeInstanceOf(ValidationError);
    expect(classroomRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza una categoría fuera del catálogo', async () => {
    const { useCase, classroomRepository } = crear();
    await expect(
      useCase.execute({ codigo: 'A', nombre: 'N', categoria: 'PISCINA' })
    ).rejects.toBeInstanceOf(ValidationError);
    expect(classroomRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza body vacío', async () => {
    const { useCase } = crear();
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
  });
});
