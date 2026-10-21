import { describe, it, expect, jest } from '@jest/globals';
import { GetLibroByIdUseCase } from '../../../src/application/use-cases/academico/libros/GetLibroByIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetLibroByIdUseCase', () => {
  const crear = (row = { id: 3, numero_libro: 15, total_folios: '2' }) => {
    const deps = {
      libroRegistroViewRepository: {
        obtenerLibroPorId: jest.fn().mockResolvedValue(row),
        listarFoliosPorLibro: jest.fn().mockResolvedValue([
          { id: 1, numero_folio: 1, total_estudiantes: '10' },
          { id: 2, numero_folio: 2 },
        ]),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetLibroByIdUseCase(deps) };
  };

  it('devuelve cabecera y folios mapeados', async () => {
    const { useCase, deps } = crear();
    const { libro } = await useCase.execute({ id: '3' });

    expect(deps.libroRegistroViewRepository.obtenerLibroPorId).toHaveBeenCalledWith(3);
    expect(deps.libroRegistroViewRepository.listarFoliosPorLibro).toHaveBeenCalledWith(3);
    expect(libro).toMatchObject({ id: 3, numeroLibro: 15, totalFolios: 2 });
    expect(libro.folios).toHaveLength(2);
    expect(libro.folios[0]).toMatchObject({ numeroFolio: 1, totalEstudiantes: 10 });
  });

  it('NotFound si el libro no existe y no consulta folios', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute({ id: 99 })).rejects.toThrow(NotFoundError);
    expect(deps.libroRegistroViewRepository.listarFoliosPorLibro).not.toHaveBeenCalled();
  });
});
