import { describe, it, expect, jest } from '@jest/globals';
import { AbrirCursoCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/AbrirCursoCapacitacionUseCase.js';
import { ConflictError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('AbrirCursoCapacitacionUseCase', () => {
  const crear = (curso) => {
    const deps = {
      cursoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(curso),
        update: jest.fn().mockImplementation(async (id, d) => ({ ...curso, ...d })),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new AbrirCursoCapacitacionUseCase(deps) };
  };
  const curso = (estado, ini = '2999-01-01', fin = '2999-12-31') => ({
    id: 1, titulo: 'Excel', estado, fechaInicio: ini, fechaFin: fin,
  });

  it('abre un curso PROPUESTO', async () => {
    const { deps, useCase } = crear(curso('PROPUESTO'));
    const res = await useCase.execute(1, 6);
    expect(deps.cursoCapacitacionRepository.update).toHaveBeenCalledWith(1, { estado: 'ABIERTO' }, 6);
    expect(res.cursoCapacitacion.estado).toBe('ABIERTO');
  });

  it('lanza NotFoundError si no existe', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it.each([
    ['ABIERTO', undefined, undefined],
    ['CANCELADO', undefined, undefined],
    ['CERRADO', undefined, undefined],
    ['EN_CURSO', undefined, undefined],
  ])('rechaza abrir desde %s', async (estado) => {
    const { deps, useCase } = crear(curso(estado));
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });
});
