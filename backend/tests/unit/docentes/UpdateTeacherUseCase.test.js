import { describe, it, expect, jest } from '@jest/globals';
import { UpdateTeacherUseCase } from '../../../src/application/use-cases/docentes/UpdateTeacherUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateTeacherUseCase', () => {
  const crear = () => {
    const deps = {
      teacherRepository: {
        findById: jest.fn().mockResolvedValue({ id: 8 }),
        update: jest.fn().mockResolvedValue({ id: 8 }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateTeacherUseCase(deps) };
  };

  it('actualiza con el body mapeado y el usuario', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(8, { ci: '9', nombres: 'Luis', apellidoPaterno: 'Rojas' }, 5);

    expect(res).toEqual({ docente: { id: 8 } });
    expect(deps.teacherRepository.findById).toHaveBeenCalledWith(8);
    const [id, domain, userId] = deps.teacherRepository.update.mock.calls[0];
    expect([id, userId]).toEqual([8, 5]);
    expect(domain).toMatchObject({ ci: '9', firstName: 'Luis', lastName: 'Rojas' });
  });

  it('lanza NotFoundError si el docente no existe y no actualiza', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(8, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si update no devuelve entidad', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.update.mockResolvedValue(null);
    await expect(useCase.execute(8, {})).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('UpdateTeacherUseCase id inválido', () => {
  it.each([['abc'], ['12abc'], [0], [-1], [1.5]])('id %p lanza ValidationError sin consultar', async (id) => {
    const teacherRepository = { findById: jest.fn(), update: jest.fn() };
    const useCase = new UpdateTeacherUseCase({ teacherRepository, logger: { info: jest.fn() } });
    await expect(useCase.execute(id, { ci: '9' }, 1)).rejects.toBeInstanceOf(ValidationError);
    expect(teacherRepository.findById).not.toHaveBeenCalled();
    expect(teacherRepository.update).not.toHaveBeenCalled();
  });
});
