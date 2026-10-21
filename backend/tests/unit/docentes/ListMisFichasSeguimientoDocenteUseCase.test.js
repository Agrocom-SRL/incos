import { describe, it, expect, jest } from '@jest/globals';
import { ListMisFichasSeguimientoDocenteUseCase } from '../../../src/application/use-cases/docentes/supervision/ListMisFichasSeguimientoDocenteUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('ListMisFichasSeguimientoDocenteUseCase', () => {
  const crear = () => {
    const deps = {
      fichaSeguimientoListadoViewRepository: {
        findListado: jest.fn().mockResolvedValue({
          rows: [{ id: 70, docente_id: 8, docente_nombre: 'Perez Ana' }, { id: 71, docente_id: 8 }],
          total: 2,
        }),
      },
      fichaSeguimientoClaseRepository: {
        findAll: jest.fn().mockResolvedValue({
          fichasSeguimientoClase: [
            { id: 70, obsRecursos: 'bien', asignacionDocenteId: 4 },
            { id: 71, otrasObservaciones: 'mejorar', asignacionDocenteId: 5 },
          ],
        }),
      },
      teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 8 }]), findById: jest.fn() },
      userRepository: { findById: jest.fn() },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListMisFichasSeguimientoDocenteUseCase(deps) };
  };

  it('filtra por el docente de la sesión y trae el detalle completo por ids', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 20 });

    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({ userId: 20 });
    expect(deps.fichaSeguimientoListadoViewRepository.findListado)
      .toHaveBeenCalledWith({ docenteId: 8 }, 1, 10000);
    expect(deps.fichaSeguimientoClaseRepository.findAll).toHaveBeenCalledWith({ ids: [70, 71] });
    expect(res.total).toBe(2);
    expect(res.fichasSeguimiento.map((f) => f.id)).toEqual([70, 71]);
    expect(res.fichasSeguimiento[0]).toMatchObject({
      obsRecursos: 'bien', docenteNombre: 'Perez Ana', asignacionDocenteId: 4,
    });
    expect(res.fichasSeguimiento[1].otrasObservaciones).toBe('mejorar');
  });

  it('sin fichas devuelve vacío sin consultar la entidad raíz', async () => {
    const { useCase, deps } = crear();
    deps.fichaSeguimientoListadoViewRepository.findListado.mockResolvedValue({ rows: [], total: 0 });
    const res = await useCase.execute({ usuarioId: 20 });
    expect(res).toEqual({ fichasSeguimiento: [], total: 0 });
    expect(deps.fichaSeguimientoClaseRepository.findAll).not.toHaveBeenCalled();
  });

  it('descarta filas de la vista sin entidad raíz correspondiente', async () => {
    const { useCase, deps } = crear();
    deps.fichaSeguimientoClaseRepository.findAll.mockResolvedValue({
      fichasSeguimientoClase: [{ id: 70 }],
    });
    const res = await useCase.execute({ usuarioId: 20 });
    expect(res.fichasSeguimiento.map((f) => f.id)).toEqual([70]);
  });

  it('lanza ForbiddenError si el usuario no está vinculado a un docente (anti-IDOR)', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([]);
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'ESTUDIANTE', referenceId: 1 });
    await expect(useCase.execute({ usuarioId: 20 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.fichaSeguimientoListadoViewRepository.findListado).not.toHaveBeenCalled();
  });
});
