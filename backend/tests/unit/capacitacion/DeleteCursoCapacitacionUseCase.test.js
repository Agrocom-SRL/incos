import { describe, it, expect, jest } from '@jest/globals';
import { DeleteCursoCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/DeleteCursoCapacitacionUseCase.js';
import { ConflictError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteCursoCapacitacionUseCase', () => {
  const crear = ({ existing = { id: 3 }, inscritos = 0, deleted = true } = {}) => {
    const deps = {
      cursoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(existing),
        delete: jest.fn().mockResolvedValue(deleted),
      },
      inscripcionCapacitacionRepository: { count: jest.fn().mockResolvedValue(inscritos) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new DeleteCursoCapacitacionUseCase(deps) };
  };

  it('elimina el curso sin inscritos vigentes', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(3, 9)).resolves.toBe(true);
    expect(deps.cursoCapacitacionRepository.findById).toHaveBeenCalledWith(3, { paranoid: false });
    expect(deps.inscripcionCapacitacionRepository.count).toHaveBeenCalledWith({
      capacitacionId: 3,
      estado: 'INSCRITO',
    });
    expect(deps.cursoCapacitacionRepository.delete).toHaveBeenCalledWith(3, 9);
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('usa userId null por defecto', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(3);
    expect(deps.cursoCapacitacionRepository.delete).toHaveBeenCalledWith(3, null);
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { deps, useCase } = crear({ existing: null });
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cursoCapacitacionRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza ConflictError si hay inscripciones vigentes', async () => {
    const { deps, useCase } = crear({ inscritos: 2 });
    await expect(useCase.execute(3)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.cursoCapacitacionRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { deps, useCase } = crear({ deleted: false });
    await expect(useCase.execute(3)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.logger.info).not.toHaveBeenCalled();
  });
});
