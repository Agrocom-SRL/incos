import { describe, it, expect, jest } from '@jest/globals';
import { GetMiProyectoGradoUseCase } from '../../../src/application/use-cases/titulacion/GetMiProyectoGradoUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('GetMiProyectoGradoUseCase', () => {
  const crear = ({ students = [{ id: 5 }], user = null, student = { id: 7 }, membresias = [] } = {}) => {
    const deps = {
      proyectoGradoListadoViewRepository: {
        findIntegranteRowsByEstudianteId: jest.fn().mockResolvedValue(membresias),
      },
      getProyectoGradoByIdUseCase: { execute: jest.fn().mockResolvedValue({ id: 10, titulo: 'P' }) },
      studentRepository: {
        findAll: jest.fn().mockResolvedValue(students),
        findById: jest.fn().mockResolvedValue(student),
      },
      userRepository: { findById: jest.fn().mockResolvedValue(user) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetMiProyectoGradoUseCase(deps) };
  };

  it('devuelve la ficha del proyecto vigente del estudiante de la sesión', async () => {
    const { useCase, deps } = crear({
      membresias: [{ proyecto_grado_id: 10, proyecto_estado: 'DESARROLLO' }],
    });
    const r = await useCase.execute({ usuarioId: 3 });

    expect(deps.studentRepository.findAll).toHaveBeenCalledWith({ userId: 3 });
    expect(deps.proyectoGradoListadoViewRepository.findIntegranteRowsByEstudianteId)
      .toHaveBeenCalledWith(5);
    expect(deps.getProyectoGradoByIdUseCase.execute).toHaveBeenCalledWith(10);
    expect(r).toEqual({ proyectoGrado: { id: 10, titulo: 'P' }, estudianteId: 5 });
  });

  it('ignora proyectos no vigentes y toma el primero vigente', async () => {
    const { useCase, deps } = crear({
      membresias: [
        { proyecto_grado_id: 1, proyecto_estado: 'APROBADO' },
        { proyecto_grado_id: 2, proyecto_estado: 'CANCELADO' },
        { proyecto_grado_id: 3, proyecto_estado: 'DEFENSA' },
      ],
    });
    await useCase.execute({ usuarioId: 3 });
    expect(deps.getProyectoGradoByIdUseCase.execute).toHaveBeenCalledWith(3);
  });

  it('sin proyecto vigente devuelve proyectoGrado null y no consulta la ficha', async () => {
    const { useCase, deps } = crear({
      membresias: [{ proyecto_grado_id: 1, proyecto_estado: 'REPROBADO' }],
    });
    const r = await useCase.execute({ usuarioId: 3 });
    expect(r).toEqual({ proyectoGrado: null, estudianteId: 5 });
    expect(deps.getProyectoGradoByIdUseCase.execute).not.toHaveBeenCalled();
  });

  it('sin membresías devuelve proyectoGrado null', async () => {
    const { useCase } = crear({ membresias: [] });
    const r = await useCase.execute({ usuarioId: 3 });
    expect(r.proyectoGrado).toBeNull();
  });

  it('resuelve el estudiante por referencia polimórfica si no hay vínculo directo', async () => {
    const { useCase, deps } = crear({
      students: [],
      user: { referenceType: 'ESTUDIANTE', referenceId: '7' },
    });
    const r = await useCase.execute({ usuarioId: 3 });
    expect(deps.studentRepository.findById).toHaveBeenCalledWith(7);
    expect(r.estudianteId).toBe(7);
  });

  it('usuario no vinculado a estudiante -> ForbiddenError', async () => {
    const { useCase, deps } = crear({
      students: [],
      user: { referenceType: 'DOCENTE', referenceId: 1 },
    });
    await expect(useCase.execute({ usuarioId: 3 })).rejects.toThrow(ForbiddenError);
    expect(deps.proyectoGradoListadoViewRepository.findIntegranteRowsByEstudianteId)
      .not.toHaveBeenCalled();
  });

  it('referenceId no numérico (NaN) -> ForbiddenError', async () => {
    const { useCase } = crear({
      students: [],
      user: { referenceType: 'ESTUDIANTE', referenceId: 'abc' },
    });
    await expect(useCase.execute({ usuarioId: 3 })).rejects.toThrow(ForbiddenError);
  });

  it('estudiante referenciado inexistente -> ForbiddenError', async () => {
    const { useCase } = crear({
      students: [],
      user: { referenceType: 'ESTUDIANTE', referenceId: 9 },
      student: null,
    });
    await expect(useCase.execute({ usuarioId: 3 })).rejects.toThrow(ForbiddenError);
  });

  it('sin argumentos (usuarioId indefinido) no resuelve estudiante -> ForbiddenError', async () => {
    const { useCase } = crear({ students: [], user: null });
    await expect(useCase.execute()).rejects.toThrow(ForbiddenError);
  });
});
