import { describe, it, expect, jest } from '@jest/globals';
import { ListLibrosUseCase } from '../../../src/application/use-cases/academico/libros/ListLibrosUseCase.js';

describe('ListLibrosUseCase', () => {
  const crear = (rows = [{ id: 1, numero_libro: 14 }, { id: 2, numero_libro: 15 }]) => {
    const deps = {
      libroRegistroViewRepository: { listarLibros: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListLibrosUseCase(deps) };
  };

  it('lista y mapea libros', async () => {
    const { useCase, deps } = crear();
    const { libros } = await useCase.execute({ gestionId: '4' });
    expect(deps.libroRegistroViewRepository.listarLibros).toHaveBeenCalledWith({ gestionId: 4 });
    expect(libros.map((l) => l.numeroLibro)).toEqual([14, 15]);
  });

  it('sin filtro pasa gestionId undefined; sin params no falla', async () => {
    const { useCase, deps } = crear([]);
    const res = await useCase.execute();
    expect(deps.libroRegistroViewRepository.listarLibros).toHaveBeenCalledWith({ gestionId: undefined });
    expect(res).toEqual({ libros: [] });
  });
});
