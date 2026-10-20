import { describe, it, expect, jest } from '@jest/globals';
import { GetFolioByIdUseCase } from '../../../src/application/use-cases/academico/libros/GetFolioByIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetFolioByIdUseCase', () => {
  const filas135 = [
    { estudiante_id: 1, oferta_curso_id: 20, asignatura_orden: 2, asignatura_sigla: 'B', nota_final: 70, estado: 'CURSANDO' },
    { estudiante_id: 1, oferta_curso_id: 10, asignatura_orden: 1, asignatura_sigla: 'A', nota_final: null, estado: 'CURSANDO' },
    { estudiante_id: 2, oferta_curso_id: 10, asignatura_orden: 1, asignatura_sigla: 'A', nota_final: 55, estado: 'ABANDONO' },
  ];
  const crear = (row = { id: 5, libro_id: 2, paralelo_gestion_id: 40, numero_folio: 7 }) => {
    const deps = {
      libroRegistroRepository: {
        listarEstudiantesFolio: jest.fn().mockResolvedValue([
          { id: 100, estudiante_id: 1, nombre_completo: 'A A' },
          { id: 101, estudiante_id: 2, nombre_completo: 'B B' },
          { id: 102, estudiante_id: 3, nombre_completo: 'C C' },
        ]),
      },
      libroRegistroViewRepository: { obtenerFolioPorId: jest.fn().mockResolvedValue(row) },
      calificacionCentralizadorRepository: {
        listarFilasCentralizadorPorParaleloGestion: jest.fn().mockResolvedValue(filas135),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetFolioByIdUseCase(deps) };
  };

  it('arma cabecera, asignaturas ordenadas y celdas por estudiante', async () => {
    const { useCase, deps } = crear();
    const { folio } = await useCase.execute({ id: '2', folioId: '5' });

    expect(deps.libroRegistroViewRepository.obtenerFolioPorId).toHaveBeenCalledWith(5);
    expect(deps.libroRegistroRepository.listarEstudiantesFolio).toHaveBeenCalledWith(5);
    expect(deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion)
      .toHaveBeenCalledWith(40);
    expect(folio.numeroFolio).toBe(7);
    expect(folio.asignaturas.map((a) => a.ofertaCursoId)).toEqual([10, 20]);
    expect(folio.estudiantes[0].celdas).toEqual({ 20: 70, 10: 'NP' });
    expect(folio.estudiantes[1].celdas).toEqual({ 10: 'NP' });
    expect(folio.estudiantes[2].celdas).toEqual({});
  });

  it('NotFound si el folio no existe', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute({ id: 2, folioId: 5 })).rejects.toThrow(NotFoundError);
    expect(deps.libroRegistroRepository.listarEstudiantesFolio).not.toHaveBeenCalled();
  });

  it('NotFound si el folio es de otro libro', async () => {
    const { useCase } = crear({ id: 5, libro_id: 9, paralelo_gestion_id: 40 });
    await expect(useCase.execute({ id: 2, folioId: 5 })).rejects.toThrow(NotFoundError);
  });
});
