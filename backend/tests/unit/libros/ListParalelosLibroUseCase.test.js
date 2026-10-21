import { describe, it, expect, jest } from '@jest/globals';
import { ListParalelosLibroUseCase } from '../../../src/application/use-cases/academico/libros/ListParalelosLibroUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListParalelosLibroUseCase', () => {
  const crear = (libro = { id: 3, gestion_id: 8 }) => {
    const deps = {
      libroRegistroViewRepository: {
        obtenerLibroPorId: jest.fn().mockResolvedValue(libro),
        listarParalelosPorGestion: jest.fn().mockResolvedValue([
          { paralelo_gestion_id: 1, total_estudiantes: '12', folios_vigentes: '2' },
          { paralelo_gestion_id: 2, folios_vigentes: 0 },
        ]),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListParalelosLibroUseCase(deps) };
  };

  it('lista paralelos de la gestión del libro con flag generado', async () => {
    const { useCase, deps } = crear();
    const { paralelos } = await useCase.execute({ id: '3' });

    expect(deps.libroRegistroViewRepository.listarParalelosPorGestion)
      .toHaveBeenCalledWith(8, { libroId: 3 });
    expect(paralelos[0]).toMatchObject({
      paraleloGestionId: 1, totalEstudiantes: 12, foliosVigentes: 2, generado: true,
    });
    expect(paralelos[1]).toMatchObject({ foliosVigentes: 0, generado: false });
  });

  it('NotFound si el libro no existe', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute({ id: 1 })).rejects.toThrow(NotFoundError);
    expect(deps.libroRegistroViewRepository.listarParalelosPorGestion).not.toHaveBeenCalled();
  });
});
