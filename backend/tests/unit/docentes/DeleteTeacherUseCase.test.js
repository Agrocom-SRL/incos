import { describe, it, expect, jest } from '@jest/globals';
import { DeleteTeacherUseCase } from '../../../src/application/use-cases/docentes/DeleteTeacherUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteTeacherUseCase', () => {
  const crear = () => {
    const deps = {
      teacherRepository: {
        findById: jest.fn().mockResolvedValue({ id: 8 }),
        delete: jest.fn().mockResolvedValue(true),
      },
      teacherAssignmentRepository: {
        findAll: jest.fn().mockResolvedValue({ teacherAssignments: [{ id: 1 }, { id: '2' }, {}] }),
        delete: jest.fn().mockResolvedValue(true),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteTeacherUseCase(deps) };
  };

  it('da de baja todas las asignaciones (incluidas inactivas) y luego al docente', async () => {
    const { useCase, deps } = crear();
    await useCase.execute('8', 3);

    expect(deps.teacherAssignmentRepository.findAll)
      .toHaveBeenCalledWith({ teacherId: 8, includeInactive: true }, 1, 10000);
    expect(deps.teacherAssignmentRepository.delete).toHaveBeenCalledTimes(2);
    expect(deps.teacherAssignmentRepository.delete).toHaveBeenCalledWith(1, 3);
    expect(deps.teacherAssignmentRepository.delete).toHaveBeenCalledWith(2, 3);
    expect(deps.teacherRepository.delete).toHaveBeenCalledWith(8, 3);
  });

  it('sin asignaciones solo elimina al docente', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findAll.mockResolvedValue(undefined);
    await useCase.execute(8);
    expect(deps.teacherAssignmentRepository.delete).not.toHaveBeenCalled();
    expect(deps.teacherRepository.delete).toHaveBeenCalledWith(8, null);
  });

  it.each([[0], [-1], ['abc'], [undefined]])('id inválido (%p) lanza NotFoundError', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el docente no existe sin borrar asignaciones', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(8)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherAssignmentRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el delete del docente devuelve falso', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.delete.mockResolvedValue(false);
    await expect(useCase.execute(8)).rejects.toBeInstanceOf(NotFoundError);
  });
});
