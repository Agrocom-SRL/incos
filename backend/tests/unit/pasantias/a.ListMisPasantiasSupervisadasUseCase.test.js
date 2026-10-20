import { describe, it, expect, jest } from '@jest/globals';
import { ListMisPasantiasSupervisadasUseCase } from '../../../src/application/use-cases/pasantias/ListMisPasantiasSupervisadasUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('ListMisPasantiasSupervisadasUseCase', () => {
  const crear = (rows = [{ pasantia_id: 1, estado: 'EN_CURSO' }]) => {
    const deps = {
      pasantiaViewRepository: {
        findListado: jest.fn().mockResolvedValue({ rows, total: rows.length }),
      },
      teacherRepository: {
        findAll: jest.fn().mockResolvedValue([{ id: 31 }]),
        findById: jest.fn(),
        update: jest.fn(),
      },
      userRepository: { findById: jest.fn() },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListMisPasantiasSupervisadasUseCase(deps) };
  };

  it('lista los trámites del docente de la sesión', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ usuarioId: 60 });

    expect(deps.teacherRepository.findAll).toHaveBeenCalledWith({ userId: 60 });
    expect(deps.pasantiaViewRepository.findListado).toHaveBeenCalledWith(
      { docenteSupervisorId: 31 },
      1,
      10000
    );
    expect(result.total).toBe(1);
    expect(result.misPasantias[0]).toMatchObject({ id: 1, estado: 'EN_CURSO' });
  });

  it('devuelve lista vacía si no supervisa trámites', async () => {
    const { useCase } = crear([]);
    expect(await useCase.execute({ usuarioId: 60 })).toEqual({ misPasantias: [], total: 0 });
  });

  it('usuario sin docente vinculado lanza ForbiddenError', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([]);
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'ESTUDIANTE', referenceId: 1 });

    await expect(useCase.execute({ usuarioId: 60 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.pasantiaViewRepository.findListado).not.toHaveBeenCalled();
  });

  it('sin argumentos lanza error en lugar de listar', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findAll.mockResolvedValue([]);
    deps.userRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute()).rejects.toBeInstanceOf(ForbiddenError);
  });
});
