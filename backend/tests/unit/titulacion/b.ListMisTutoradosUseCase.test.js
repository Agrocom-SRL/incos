import { describe, it, expect, jest } from '@jest/globals';
import { ListMisTutoradosUseCase } from '../../../src/application/use-cases/titulacion/ListMisTutoradosUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('ListMisTutoradosUseCase', () => {
  const crear = ({
    teachers = [{ id: 4 }], user = null, teacher = { id: 9, userId: 1 }, rows = [], total = 0,
  } = {}) => {
    const deps = {
      proyectoGradoListadoViewRepository: {
        findListado: jest.fn().mockResolvedValue({ rows, total }),
      },
      teacherRepository: {
        findAll: jest.fn().mockResolvedValue(teachers),
        findById: jest.fn().mockResolvedValue(teacher),
        update: jest.fn().mockResolvedValue({}),
      },
      userRepository: { findById: jest.fn().mockResolvedValue(user) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListMisTutoradosUseCase(deps) };
  };

  it('lista los proyectos del docente de la sesión como tutor', async () => {
    const { useCase, deps } = crear({
      rows: [{ proyecto_grado_id: 1, titulo: 'P1', proyecto_estado: 'DESARROLLO' }],
      total: 1,
    });
    const r = await useCase.execute({ usuarioId: 2 });

    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({ userId: 2 });
    expect(deps.proyectoGradoListadoViewRepository.findListado)
      .toHaveBeenCalledWith({ tutorId: 4 }, 1, 10000);
    expect(r.total).toBe(1);
    expect(r.misTutorados).toEqual([expect.objectContaining({ id: 1, titulo: 'P1' })]);
  });

  it('sin tutorados devuelve lista vacía', async () => {
    const { useCase } = crear();
    expect(await useCase.execute({ usuarioId: 2 })).toEqual({ misTutorados: [], total: 0 });
  });

  it('resuelve el docente por referencia y vincula userId si faltaba', async () => {
    const { useCase, deps } = crear({
      teachers: [],
      user: { referenceType: 'DOCENTE', referenceId: '9' },
      teacher: { id: 9, userId: null },
    });
    await useCase.execute({ usuarioId: 2 });
    expect(deps.teacherRepository.update).toHaveBeenCalledWith(9, { userId: 2 });
    expect(deps.proyectoGradoListadoViewRepository.findListado)
      .toHaveBeenCalledWith({ tutorId: 9 }, 1, 10000);
  });

  it('usuario no vinculado a docente -> ForbiddenError sin consultar proyectos', async () => {
    const { useCase, deps } = crear({ teachers: [], user: { referenceType: 'ESTUDIANTE', referenceId: 1 } });
    await expect(useCase.execute({ usuarioId: 2 })).rejects.toThrow(ForbiddenError);
    expect(deps.proyectoGradoListadoViewRepository.findListado).not.toHaveBeenCalled();
  });

  it('referenceId no numérico (NaN) -> ForbiddenError', async () => {
    const { useCase } = crear({ teachers: [], user: { referenceType: 'DOCENTE', referenceId: 'abc' } });
    await expect(useCase.execute({ usuarioId: 2 })).rejects.toThrow(ForbiddenError);
  });

  it('docente referenciado inexistente -> ForbiddenError', async () => {
    const { useCase } = crear({
      teachers: [],
      user: { referenceType: 'DOCENTE', referenceId: 9 },
      teacher: null,
    });
    await expect(useCase.execute({ usuarioId: 2 })).rejects.toThrow(ForbiddenError);
  });

  it('sin argumentos -> ForbiddenError', async () => {
    const { useCase } = crear({ teachers: [], user: null });
    await expect(useCase.execute()).rejects.toThrow(ForbiddenError);
  });
});
