import { describe, it, expect, jest } from '@jest/globals';
import { CancelarCursoCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/CancelarCursoCapacitacionUseCase.js';
import { ConflictError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('CancelarCursoCapacitacionUseCase', () => {
  const crear = (curso) => {
    const deps = {
      cursoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(curso),
        update: jest.fn().mockImplementation(async (id, d) => ({ ...curso, ...d })),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CancelarCursoCapacitacionUseCase(deps) };
  };
  const curso = (estado, ini = '2999-01-01', fin = '2999-12-31') => ({
    id: 1, titulo: 'Excel', estado, fechaInicio: ini, fechaFin: fin,
  });

  it.each([['PROPUESTO'], ['ABIERTO']])('cancela un curso %s', async (estado) => {
    const { deps, useCase } = crear(curso(estado));
    const res = await useCase.execute(1, 3);
    expect(deps.cursoCapacitacionRepository.update).toHaveBeenCalledWith(1, { estado: 'CANCELADO' }, 3);
    expect(res.cursoCapacitacion.estado).toBe('CANCELADO');
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rechaza cancelar un curso ya CANCELADO', async () => {
    const { deps, useCase } = crear(curso('CANCELADO'));
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza cancelar un ABIERTO cuyo estado efectivo es EN_CURSO', async () => {
    const { deps, useCase } = crear(curso('ABIERTO', '2000-01-01', '2999-01-01'));
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza cancelar un ABIERTO cuyo estado efectivo es CERRADO', async () => {
    const { useCase } = crear(curso('ABIERTO', '2000-01-01', '2000-02-01'));
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ConflictError);
  });
});
