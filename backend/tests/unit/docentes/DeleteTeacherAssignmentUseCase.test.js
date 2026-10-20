import { describe, it, expect, jest } from '@jest/globals';
import { DeleteTeacherAssignmentUseCase } from '../../../src/application/use-cases/docentes/DeleteTeacherAssignmentUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteTeacherAssignmentUseCase', () => {
  const crear = () => {
    const deps = {
      teacherAssignmentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 4 }),
        delete: jest.fn().mockResolvedValue(true),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteTeacherAssignmentUseCase(deps) };
  };

  it('elimina la asignación con el usuario', async () => {
    const { useCase, deps } = crear();
    await useCase.execute('4', 7);
    expect(deps.teacherAssignmentRepository.findById).toHaveBeenCalledWith(4);
    expect(deps.teacherAssignmentRepository.delete).toHaveBeenCalledWith(4, 7);
  });

  it.each([[0], [-4], ['abc'], [undefined]])('id inválido (%p) lanza NotFoundError', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherAssignmentRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherAssignmentRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el delete devuelve falso', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.delete.mockResolvedValue(false);
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(NotFoundError);
  });
});
