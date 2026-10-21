import { describe, it, expect, jest } from '@jest/globals';
import { GetDocentesConflictoBloquesCursoUseCase } from '../../../src/application/use-cases/docentes/GetDocentesConflictoBloquesCursoUseCase.js';
import { UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('GetDocentesConflictoBloquesCursoUseCase', () => {
  const crear = () => {
    const deps = {
      teacherRepository: { getDocentesConChoqueBloques: jest.fn().mockResolvedValue([3, 4]) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetDocentesConflictoBloquesCursoUseCase(deps) };
  };

  it('devuelve los docentes con choque para la oferta', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute('5');
    expect(deps.teacherRepository.getDocentesConChoqueBloques).toHaveBeenCalledWith(5);
    expect(res).toEqual({ cursoId: 5, docenteIdsConChoque: [3, 4] });
  });

  it.each([[0], [-1], ['abc'], [undefined], [null]])('cursoId inválido (%p) lanza 422', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.teacherRepository.getDocentesConChoqueBloques).not.toHaveBeenCalled();
  });
});
