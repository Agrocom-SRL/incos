import { describe, it, expect, jest } from '@jest/globals';
import { ListAvancesProyectoUseCase } from '../../../src/application/use-cases/titulacion/ListAvancesProyectoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListAvancesProyectoUseCase', () => {
  const crear = ({ proyecto = { id: 10 }, avances = [] } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      avanceProyectoRepository: { findByProyectoGradoId: jest.fn().mockResolvedValue(avances) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListAvancesProyectoUseCase(deps) };
  };

  it('lista los avances del proyecto con su total', async () => {
    const avances = [{ id: 1 }, { id: 2 }];
    const { useCase, deps } = crear({ avances });
    const r = await useCase.execute(10);
    expect(deps.proyectoGradoRepository.findById).toHaveBeenCalledWith(10);
    expect(deps.avanceProyectoRepository.findByProyectoGradoId).toHaveBeenCalledWith(10);
    expect(r).toEqual({ avances, total: 2 });
  });

  it('sin avances devuelve lista vacía', async () => {
    const { useCase } = crear();
    expect(await useCase.execute(10)).toEqual({ avances: [], total: 0 });
  });

  it('proyecto inexistente -> NotFoundError sin consultar avances', async () => {
    const { useCase, deps } = crear({ proyecto: null });
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.avanceProyectoRepository.findByProyectoGradoId).not.toHaveBeenCalled();
  });

  it('id no numérico (NaN) -> NotFoundError', async () => {
    const { useCase } = crear({ proyecto: null });
    await expect(useCase.execute(Number('abc'))).rejects.toThrow(NotFoundError);
  });
});
