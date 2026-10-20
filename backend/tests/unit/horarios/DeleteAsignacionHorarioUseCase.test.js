import { describe, it, expect, jest } from '@jest/globals';
import { DeleteAsignacionHorarioUseCase } from '../../../src/application/use-cases/horarios/DeleteAsignacionHorarioUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

describe('DeleteAsignacionHorarioUseCase', () => {
  const crear = ({ estado = 'BORRADOR' } = {}) => {
    const deps = {
      asignacionHorarioRepository: {
        findById: jest.fn().mockResolvedValue({ id: 5, teacherAssignmentId: 4 }),
        delete: jest.fn().mockResolvedValue(true),
      },
      teacherAssignmentRepository: {
        findEnrichedById: jest.fn().mockResolvedValue({ paralelo_gestion_id: 11 }),
      },
      parallelManagementRepository: { findById: jest.fn().mockResolvedValue({ id: 11, state: estado }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteAsignacionHorarioUseCase(deps) };
  };

  it('elimina el bloque', async () => {
    const { useCase, deps } = crear();
    const out = await useCase.execute('5', 7);

    expect(deps.teacherAssignmentRepository.findEnrichedById).toHaveBeenCalledWith(4);
    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(11);
    expect(deps.asignacionHorarioRepository.delete).toHaveBeenCalledWith(5, 7);
    expect(out).toEqual({ eliminado: true, id: 5 });
  });

  it.each([[0], ['x'], [-1], [undefined]])('rechaza id inválido %p', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toThrow(ValidationError);
    expect(deps.asignacionHorarioRepository.findById).not.toHaveBeenCalled();
  });

  it('NotFound si el bloque no existe', async () => {
    const { useCase, deps } = crear();
    deps.asignacionHorarioRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(5)).rejects.toThrow(NotFoundError);
    expect(deps.asignacionHorarioRepository.delete).not.toHaveBeenCalled();
  });

  it('NotFound si falta la asignación docente o el paralelo', async () => {
    const a = crear();
    a.deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue(null);
    await expect(a.useCase.execute(5)).rejects.toThrow(NotFoundError);

    const b = crear();
    b.deps.parallelManagementRepository.findById.mockResolvedValue(null);
    await expect(b.useCase.execute(5)).rejects.toThrow(NotFoundError);
    expect(b.deps.asignacionHorarioRepository.delete).not.toHaveBeenCalled();
  });

  it.each(['PUBLICADO', 'CERRADO'])('bloquea eliminar con paralelo %s', async (estado) => {
    const { useCase, deps } = crear({ estado });
    await expect(useCase.execute(5)).rejects.toThrow(ValidationError);
    expect(deps.asignacionHorarioRepository.delete).not.toHaveBeenCalled();
  });

  it('con coberturaReajuste permite PUBLICADO pero no CERRADO', async () => {
    const pub = crear({ estado: 'PUBLICADO' });
    await expect(pub.useCase.execute(5, null, { coberturaReajuste: true })).resolves.toEqual({
      eliminado: true,
      id: 5,
    });

    const cer = crear({ estado: 'CERRADO' });
    await expect(cer.useCase.execute(5, null, { coberturaReajuste: true })).rejects.toThrow(ValidationError);
  });
});
