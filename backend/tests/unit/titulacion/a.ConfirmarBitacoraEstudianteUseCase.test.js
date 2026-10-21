import { describe, it, expect, jest } from '@jest/globals';
import { ConfirmarBitacoraEstudianteUseCase } from '../../../src/application/use-cases/titulacion/ConfirmarBitacoraEstudianteUseCase.js';
import { ForbiddenError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ConfirmarBitacoraEstudianteUseCase', () => {
  const crear = ({
    estudiantes = [{ id: 9 }],
    proyecto = { id: 5 },
    integrante = { id: 1 },
    entrada = { id: 20, proyectoGradoId: 5 },
    user = null,
  } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      bitacoraProyectoRepository: {
        findById: jest.fn().mockResolvedValue(entrada),
        update: jest.fn().mockResolvedValue({ id: 20, confirmadoEstudiante: true }),
      },
      integranteProyectoRepository: {
        findActivoByProyectoAndEstudiante: jest.fn().mockResolvedValue(integrante),
      },
      studentRepository: {
        findAll: jest.fn().mockResolvedValue(estudiantes),
        findById: jest.fn().mockResolvedValue(null),
      },
      userRepository: { findById: jest.fn().mockResolvedValue(user) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ConfirmarBitacoraEstudianteUseCase(deps) };
  };

  const input = { usuarioId: 3, proyectoGradoId: 5, entradaId: 20 };

  it('confirma la entrada con la fecha de hoy', async () => {
    const { deps, useCase } = crear();
    const result = await useCase.execute(input);

    expect(result.bitacoraEntrada).toEqual({ id: 20, confirmadoEstudiante: true });
    expect(deps.studentRepository.findAll).toHaveBeenCalledWith({ userId: 3 });
    expect(deps.integranteProyectoRepository.findActivoByProyectoAndEstudiante)
      .toHaveBeenCalledWith(5, 9);
    expect(deps.bitacoraProyectoRepository.update).toHaveBeenCalledWith(20, {
      confirmadoEstudiante: true,
      fechaConfirmacion: new Date().toISOString().slice(0, 10),
    });
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('resuelve el estudiante por referencia del usuario si no hay vínculo directo', async () => {
    const { deps, useCase } = crear({
      estudiantes: [],
      user: { referenceType: 'ESTUDIANTE', referenceId: 9 },
    });
    deps.studentRepository.findById.mockResolvedValue({ id: 9 });
    await expect(useCase.execute(input)).resolves.toHaveProperty('bitacoraEntrada');
    expect(deps.integranteProyectoRepository.findActivoByProyectoAndEstudiante)
      .toHaveBeenCalledWith(5, 9);
  });

  it('lanza ForbiddenError si el usuario no está vinculado a un estudiante', async () => {
    const { deps, useCase } = crear({
      estudiantes: [],
      user: { referenceType: 'DOCENTE', referenceId: 4 },
    });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.bitacoraProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenError si la referencia no es numérica (NaN)', async () => {
    const { useCase } = crear({
      estudiantes: [],
      user: { referenceType: 'ESTUDIANTE', referenceId: 'abc' },
    });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('lanza NotFoundError si el proyecto no existe', async () => {
    const { deps, useCase } = crear({ proyecto: null });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.bitacoraProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenError si no es integrante activo del proyecto', async () => {
    const { deps, useCase } = crear({ integrante: null });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.bitacoraProyectoRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la entrada no existe', async () => {
    const { deps, useCase } = crear({ entrada: null });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.bitacoraProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la entrada es de otro proyecto (anti-IDOR)', async () => {
    const { deps, useCase } = crear({ entrada: { id: 20, proyectoGradoId: 77 } });
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.bitacoraProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('un proyectoGradoId no numérico no coincide con la entrada', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...input, proyectoGradoId: 'abc' })).rejects
      .toBeInstanceOf(NotFoundError);
  });
});
