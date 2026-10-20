import { describe, it, expect, jest } from '@jest/globals';
import { ListAulasUseCase } from '../../../src/application/use-cases/configuracion/ListAulasUseCase.js';

describe('ListAulasUseCase', () => {
  const crear = (result = { classrooms: [{ id: 1, name: 'X' }], total: 1 }) => {
    const classroomRepository = { findAll: jest.fn().mockResolvedValue(result) };
    const logger = { info: jest.fn(), error: jest.fn() };
    return { classroomRepository, logger, useCase: new ListAulasUseCase({ classroomRepository, logger }) };
  };

  it('devuelve la página bajo "aulas" con metadatos de paginación', async () => {
    const { useCase, classroomRepository } = crear({ classrooms: [{ id: 1, name: 'X' }], total: 21 });
    const res = await useCase.execute({ search: 'x' }, 2, 10);
    expect(classroomRepository.findAll).toHaveBeenCalledWith({ search: 'x' }, 2, 10);
    expect(res.aulas).toHaveLength(1);
    expect(res).toMatchObject({ total: 21, page: 2, limit: 10, totalPages: 3 });
  });

  it('usa page 1 / limit 50 cuando llegan valores no numéricos (NaN)', async () => {
    const { useCase, classroomRepository } = crear();
    const res = await useCase.execute({}, 'abc', 'xyz');
    expect(classroomRepository.findAll).toHaveBeenCalledWith({}, 1, 50);
    expect(res).toMatchObject({ page: 1, limit: 50 });
  });

  it('devuelve lista vacía si falta la colección', async () => {
    const { useCase } = crear({ total: 0 });
    const res = await useCase.execute({}, 1, 10);
    expect(res.aulas).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('sin queryParams no agrega filtros específicos', async () => {
    const { useCase, classroomRepository } = crear();
    await useCase.execute({ a: 1 }, 1, 10, {});
    expect(classroomRepository.findAll).toHaveBeenCalledWith({ a: 1 }, 1, 10);
  });
  it('traduce incluirInactivos a includeInactive', async () => {
    const { useCase, classroomRepository } = crear();
    await useCase.execute({}, 1, 10, { incluirInactivos: 'true' });
    expect(classroomRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: true }, 1, 10);
    await useCase.execute({}, 1, 10, { incluirInactivos: 'false' });
    expect(classroomRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: false }, 1, 10);
    await useCase.execute({}, 1, 10, { incluirInactivos: true });
    expect(classroomRepository.findAll).toHaveBeenLastCalledWith({ includeInactive: true }, 1, 10);
  });
  it('traduce categoria a category', async () => {
    const { useCase, classroomRepository } = crear();
    await useCase.execute({}, 1, 10, { categoria: 'LABORATORIO' });
    expect(classroomRepository.findAll).toHaveBeenLastCalledWith({ category: 'LABORATORIO' }, 1, 10);
  });

  it('registra y propaga el error del repositorio', async () => {
    const { useCase, classroomRepository, logger } = crear();
    classroomRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute({}, 1, 10)).rejects.toThrow('db');
    expect(logger.error).toHaveBeenCalled();
  });
});
