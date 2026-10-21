import { describe, it, expect, jest } from '@jest/globals';
import { CreateFichaSeguimientoUseCase } from '../../../src/application/use-cases/docentes/supervision/CreateFichaSeguimientoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateFichaSeguimientoUseCase', () => {
  const crear = () => {
    const deps = {
      fichaSeguimientoClaseRepository: {
        create: jest.fn().mockResolvedValue({ id: 70, asignacionDocenteId: 4, supervisorId: 12 }),
      },
      teacherAssignmentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 4, active: true }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreateFichaSeguimientoUseCase(deps) };
  };

  const data = {
    asignacionDocenteId: 4,
fechaSeguimiento: '2026-05-01',
estudiantesEnPlanilla: 20,
    estudiantesAsistentes: 18,
  };

  it('crea la ficha fijando el evaluador desde la sesión y no desde el cliente', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ ...data, supervisorId: 999, campoAjeno: 'x' }, 12);

    expect(deps.teacherAssignmentRepository.findById).toHaveBeenCalledWith(4);
    const [payload, usuarioId] = deps.fichaSeguimientoClaseRepository.create.mock.calls[0];
    expect(usuarioId).toBe(12);
    expect(payload).toEqual({ ...data, supervisorId: 12 });
    expect(res.fichaSeguimiento.id).toBe(70);
  });

  it('sin usuario de sesión no envía supervisorId', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ ...data, supervisorId: 999 });
    expect(deps.fichaSeguimientoClaseRepository.create.mock.calls[0][0]).not.toHaveProperty('supervisorId');
  });

  it.each([[undefined], [0], [-1], ['abc'], [null]])(
    'asignacionDocenteId inválido (%p) lanza ValidationError',
    async (asignacionDocenteId) => {
      const { useCase, deps } = crear();
      await expect(useCase.execute({ ...data, asignacionDocenteId }, 1))
        .rejects.toBeInstanceOf(ValidationError);
      expect(deps.teacherAssignmentRepository.findById).not.toHaveBeenCalled();
      expect(deps.fichaSeguimientoClaseRepository.create).not.toHaveBeenCalled();
    }
  );

  it('lanza NotFoundError si la asignación no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(data, 1)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.fichaSeguimientoClaseRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza una asignación no vigente (entidad o plano)', async () => {
    const a = crear();
    a.deps.teacherAssignmentRepository.findById.mockResolvedValue({
      toPlainObject: () => ({ active: false }),
    });
    await expect(a.useCase.execute(data, 1)).rejects.toBeInstanceOf(ValidationError);

    const b = crear();
    b.deps.teacherAssignmentRepository.findById.mockResolvedValue({ active: false });
    await expect(b.useCase.execute(data, 1)).rejects.toBeInstanceOf(ValidationError);
    expect(b.deps.fichaSeguimientoClaseRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza más asistentes que estudiantes en planilla', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ ...data, estudiantesEnPlanilla: 10, estudiantesAsistentes: 11 }, 1))
      .rejects.toBeInstanceOf(ValidationError);
    expect(deps.fichaSeguimientoClaseRepository.create).not.toHaveBeenCalled();
  });

  it('acepta asistentes iguales a la planilla o solo uno de los dos valores', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ ...data, estudiantesEnPlanilla: 10, estudiantesAsistentes: 10 }, 1);
    await useCase.execute({ asignacionDocenteId: 4, estudiantesAsistentes: 50 }, 1);
    expect(deps.fichaSeguimientoClaseRepository.create).toHaveBeenCalledTimes(2);
  });
});
