import { describe, it, expect, jest } from '@jest/globals';
import { GetMisDatosDocenteUseCase } from '../../../src/application/use-cases/docentes/GetMisDatosDocenteUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('GetMisDatosDocenteUseCase', () => {
  const crear = () => {
    const deps = {
      teacherRepository: {
        findAll: jest.fn().mockResolvedValue([{ id: 8 }]),
        findById: jest.fn().mockResolvedValue({
          lastName: 'Perez', motherLastName: 'Gomez', firstName: 'Ana',
        }),
        update: jest.fn(),
      },
      userRepository: { findById: jest.fn() },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetMisDatosDocenteUseCase(deps) };
  };

  it('resuelve el docente de la sesión y devuelve id y nombre institucional', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 20 });
    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({ userId: 20 });
    expect(deps.teacherRepository.findById).toHaveBeenCalledWith(8);
    expect(res).toEqual({ id: 8, nombreCompleto: 'Perez Gomez Ana' });
  });

  it('omite el apellido materno ausente', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue({ lastName: 'Perez', firstName: 'Ana' });
    const res = await useCase.execute({ usuarioId: 20 });
    expect(res.nombreCompleto).toBe('Perez Ana');
  });

  it('usa la referencia del usuario y sincroniza docentes.usuario_id', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([]);
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'DOCENTE', referenceId: '8' });
    const res = await useCase.execute({ usuarioId: 20 });
    expect(res.id).toBe(8);
    expect(deps.teacherRepository.update).toHaveBeenCalledWith(8, { userId: 20 });
  });

  it('lanza ForbiddenError si el usuario no está vinculado a un docente', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([]);
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'ESTUDIANTE', referenceId: 3 });
    await expect(useCase.execute({ usuarioId: 20 })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('lanza ForbiddenError si la referencia no es numérica o el docente no existe', async () => {
    const a = crear();
    a.deps.teacherRepository.findAll.mockResolvedValue([]);
    a.deps.userRepository.findById.mockResolvedValue({ referenceType: 'DOCENTE', referenceId: 'abc' });
    await expect(a.useCase.execute({ usuarioId: 20 })).rejects.toBeInstanceOf(ForbiddenError);

    const b = crear();
    b.deps.teacherRepository.findAll.mockResolvedValue([]);
    b.deps.teacherRepository.findById.mockResolvedValue(null);
    b.deps.userRepository.findById.mockResolvedValue({ referenceType: 'DOCENTE', referenceId: 8 });
    await expect(b.useCase.execute({ usuarioId: 20 })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('exige las dependencias en el constructor', () => {
    expect(() => new GetMisDatosDocenteUseCase({ userRepository: {}, logger: {} })).toThrow();
    expect(() => new GetMisDatosDocenteUseCase({ teacherRepository: {}, logger: {} })).toThrow();
    expect(() => new GetMisDatosDocenteUseCase({ teacherRepository: {}, userRepository: {} })).toThrow();
  });
});
