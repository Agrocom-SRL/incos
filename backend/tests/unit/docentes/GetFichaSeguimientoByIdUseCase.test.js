import { describe, it, expect, jest } from '@jest/globals';
import { GetFichaSeguimientoByIdUseCase } from '../../../src/application/use-cases/docentes/supervision/GetFichaSeguimientoByIdUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GetFichaSeguimientoByIdUseCase', () => {
  const crear = () => {
    const deps = {
      fichaSeguimientoClaseRepository: {
        findById: jest.fn().mockResolvedValue({
          id: 70,
asignacionDocenteId: 4,
supervisorId: 12,
fechaSeguimiento: '2026-05-01',
          obsRecursos: 'bien',
estudiantesEnPlanilla: 20,
estudiantesAsistentes: 15,
        }),
      },
      fichaSeguimientoListadoViewRepository: {
        findListadoById: jest.fn().mockResolvedValue({
          id: 70, docente_nombre: 'Perez Ana', asignatura_nombre: 'Mat', evaluador_nombre: 'Dir',
        }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetFichaSeguimientoByIdUseCase(deps) };
  };

  it('combina la entidad completa con el contexto de la vista', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(70);
    expect(deps.fichaSeguimientoClaseRepository.findById).toHaveBeenCalledWith(70);
    expect(deps.fichaSeguimientoListadoViewRepository.findListadoById).toHaveBeenCalledWith(70);
    expect(res).toMatchObject({
      id: 70,
asignacionDocenteId: 4,
supervisorId: 12,
obsRecursos: 'bien',
      docenteNombre: 'Perez Ana',
asignaturaNombre: 'Mat',
evaluadorNombre: 'Dir',
      estudiantesEnPlanilla: 20,
estudiantesAsistentes: 15,
otrasObservaciones: null,
    });
  });

  it('sin fila de contexto devuelve igualmente la ficha', async () => {
    const { useCase, deps } = crear();
    deps.fichaSeguimientoListadoViewRepository.findListadoById.mockResolvedValue(null);
    const res = await useCase.execute(70);
    expect(res).toMatchObject({ id: 70, obsRecursos: 'bien' });
    expect(res.docenteNombre).toBeUndefined();
  });

  it('lanza NotFoundError si la ficha no existe', async () => {
    const { useCase, deps } = crear();
    deps.fichaSeguimientoClaseRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(70)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.fichaSeguimientoListadoViewRepository.findListadoById).not.toHaveBeenCalled();
  });
});

describe('GetFichaSeguimientoByIdUseCase id inválido', () => {
  it.each([['abc'], ['12abc'], [0], [-1], [1.5]])('id %p lanza ValidationError sin consultar', async (id) => {
    const fichaSeguimientoClaseRepository = { findById: jest.fn() };
    const useCase = new GetFichaSeguimientoByIdUseCase({
      fichaSeguimientoClaseRepository,
      fichaSeguimientoListadoViewRepository: { findListadoById: jest.fn() },
      logger: { info: jest.fn() },
    });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(ValidationError);
    expect(fichaSeguimientoClaseRepository.findById).not.toHaveBeenCalled();
  });
});
