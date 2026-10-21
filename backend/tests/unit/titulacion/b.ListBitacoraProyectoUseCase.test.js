import { describe, it, expect, jest } from '@jest/globals';
import { ListBitacoraProyectoUseCase } from '../../../src/application/use-cases/titulacion/ListBitacoraProyectoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListBitacoraProyectoUseCase', () => {
  const crear = ({ proyecto = { id: 10 }, entradas = [] } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      bitacoraProyectoRepository: { findByProyectoGradoId: jest.fn().mockResolvedValue(entradas) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListBitacoraProyectoUseCase(deps) };
  };

  it('lista las entradas de bitácora con su total', async () => {
    const entradas = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const { useCase, deps } = crear({ entradas });
    const r = await useCase.execute(10);
    expect(deps.proyectoGradoRepository.findById).toHaveBeenCalledWith(10);
    expect(deps.bitacoraProyectoRepository.findByProyectoGradoId).toHaveBeenCalledWith(10);
    expect(r).toEqual({ bitacoraEntradas: entradas, total: 3 });
  });

  it('sin entradas devuelve lista vacía', async () => {
    const { useCase } = crear();
    expect(await useCase.execute(10)).toEqual({ bitacoraEntradas: [], total: 0 });
  });

  it('proyecto inexistente -> NotFoundError sin consultar la bitácora', async () => {
    const { useCase, deps } = crear({ proyecto: null });
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.bitacoraProyectoRepository.findByProyectoGradoId).not.toHaveBeenCalled();
  });

  it('id no numérico (NaN) -> NotFoundError', async () => {
    const { useCase } = crear({ proyecto: null });
    await expect(useCase.execute(Number('abc'))).rejects.toThrow(NotFoundError);
  });
});
