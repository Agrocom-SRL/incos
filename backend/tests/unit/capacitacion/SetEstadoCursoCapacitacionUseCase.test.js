import { describe, it, expect, jest } from '@jest/globals';
import { SetEstadoCursoCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/SetEstadoCursoCapacitacionUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoCursoCapacitacionUseCase', () => {
  const crear = (found = { id: 2 }) => {
    const deps = {
      cursoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(found),
        update: jest.fn().mockImplementation(async (id, data) => ({ id, titulo: 'T', estado: 'PROPUESTO', ...data })),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new SetEstadoCursoCapacitacionUseCase(deps) };
  };

  it('desactiva el curso y devuelve la presentación', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(2, false, 5);
    expect(deps.cursoCapacitacionRepository.update).toHaveBeenCalledWith(2, { activo: false }, 5);
    expect(res.cursoCapacitacion).toMatchObject({ id: 2, activo: false });
  });

  it('coacciona activo a booleano', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, 1);
    expect(deps.cursoCapacitacionRepository.update).toHaveBeenCalledWith(2, { activo: true }, null);
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(9, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });
});
