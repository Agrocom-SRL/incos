import { jest } from '@jest/globals';
import { GetMisDatosEstudianteUseCase } from '../../../src/application/use-cases/estudiantes/GetMisDatosEstudianteUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('GetMisDatosEstudianteUseCase', () => {
  const crear = ({ students = [{ id: 5 }], user = null, estudiante = null } = {}) => {
    const deps = {
      studentRepository: {
        findAll: jest.fn().mockResolvedValue({ students }),
        findById: jest.fn().mockResolvedValue(estudiante),
      },
      userRepository: { findById: jest.fn().mockResolvedValue(user) },
      getStudentByIdUseCase: {
        execute: jest.fn().mockResolvedValue({
          student: { id: 5 },
          guardians: [{ id: 1 }],
          origins: undefined,
          academicData: { id: 2 },
          secreto: 'no debe salir',
        }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetMisDatosEstudianteUseCase(deps) };
  };

  it('exige dependencias', () => {
    const ok = { studentRepository: {}, userRepository: {}, getStudentByIdUseCase: {}, logger: {} };
    for (const k of Object.keys(ok)) {
      const rest = { ...ok };
      delete rest[k];
      expect(() => new GetMisDatosEstudianteUseCase(rest)).toThrow();
    }
  });

  it('resuelve el estudiante por usuario y devuelve payload recortado con defaults', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 11 });
    expect(deps.studentRepository.findAll).toHaveBeenCalledWith({ userId: 11 });
    expect(deps.getStudentByIdUseCase.execute).toHaveBeenCalledWith(5);
    expect(res).toEqual({
      student: { id: 5 },
      guardians: [{ id: 1 }],
      origins: [],
      academicData: { id: 2 },
      inscripcion: null,
    });
    expect(res.secreto).toBeUndefined();
  });

  it('usa la referencia polimórfica del usuario como fallback', async () => {
    const { useCase, deps } = crear({
      students: [],
      user: { referenceType: 'ESTUDIANTE', referenceId: 5 },
      estudiante: { id: 5 },
    });
    await useCase.execute({ usuarioId: 11 });
    expect(deps.userRepository.findById).toHaveBeenCalledWith(11);
    expect(deps.getStudentByIdUseCase.execute).toHaveBeenCalledWith(5);
  });

  it('usuario no vinculado a estudiante lanza ForbiddenError sin cargar datos', async () => {
    const { useCase, deps } = crear({ students: [], user: { referenceType: 'DOCENTE', referenceId: 5 } });
    await expect(useCase.execute({ usuarioId: 11 })).rejects.toThrow(ForbiddenError);
    expect(deps.getStudentByIdUseCase.execute).not.toHaveBeenCalled();
  });

  it('referenceId inválido (NaN) lanza ForbiddenError', async () => {
    const { useCase } = crear({ students: [], user: { referenceType: 'ESTUDIANTE', referenceId: 'abc' } });
    await expect(useCase.execute({ usuarioId: 11 })).rejects.toThrow(ForbiddenError);
  });
});
