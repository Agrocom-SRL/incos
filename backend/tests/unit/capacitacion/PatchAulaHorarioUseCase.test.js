import { describe, it, expect, jest } from '@jest/globals';
import { PatchAulaHorarioUseCase } from '../../../src/application/use-cases/aulas-horarios/PatchAulaHorarioUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

describe('PatchAulaHorarioUseCase', () => {
  const crear = ({ schedule = { id: 5, scheduleId: 70 }, aula = { id: 3 }, conflicto = null } = {}) => {
    const deps = {
      asignacionHorarioRepository: {
        findById: jest.fn().mockResolvedValue(schedule),
        findClassroomConflict: jest.fn().mockResolvedValue(conflicto),
        update: jest.fn().mockImplementation(async (id, d) => ({
          id, teacherAssignmentId: 1, scheduleId: 70, sequenceOrder: 2, classroomId: d.classroomId,
        })),
      },
      classroomRepository: { findById: jest.fn().mockResolvedValue(aula) },
      logger: { warn: jest.fn() },
    };
    return { deps, useCase: new PatchAulaHorarioUseCase(deps) };
  };

  it('asigna aula sin conflicto', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute('5', '3', 8);
    expect(deps.asignacionHorarioRepository.findClassroomConflict).toHaveBeenCalledWith({
      scheduleId: 70, classroomId: 3, excludeAsignacionHorarioId: 5,
    });
    expect(deps.asignacionHorarioRepository.update).toHaveBeenCalledTimes(1);
    expect(deps.asignacionHorarioRepository.update).toHaveBeenCalledWith(5, { classroomId: 3 }, 8);
    expect(res).toEqual({ id: 5, teacherAssignmentId: 1, scheduleId: 70, classroomId: 3, sequenceOrder: 2 });
  });

  it('con conflicto libera el aula del bloque previo antes de asignar', async () => {
    const { deps, useCase } = crear({ conflicto: 11 });
    await useCase.execute(5, 3, 8);
    const calls = deps.asignacionHorarioRepository.update.mock.calls;
    expect(calls[0]).toEqual([11, { classroomId: null }, 8]);
    expect(calls[1]).toEqual([5, { classroomId: 3 }, 8]);
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('aulaId null o undefined desasigna sin consultar aula ni conflicto', async () => {
    for (const aulaId of [null, undefined]) {
      const { deps, useCase } = crear();
      const res = await useCase.execute(5, aulaId);
      expect(deps.classroomRepository.findById).not.toHaveBeenCalled();
      expect(deps.asignacionHorarioRepository.findClassroomConflict).not.toHaveBeenCalled();
      expect(deps.asignacionHorarioRepository.update).toHaveBeenCalledWith(5, { classroomId: null }, null);
      expect(res.classroomId).toBeNull();
    }
  });

  it.each([[undefined], [null], [''], ['abc'], [NaN], [0], [-1]])(
    'rechaza id de bloque inválido (%p)',
    async (id) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(id, 3)).rejects.toBeInstanceOf(ValidationError);
      expect(deps.asignacionHorarioRepository.findById).not.toHaveBeenCalled();
    }
  );

  it.each([['abc'], [NaN], [0], [-2]])('rechaza aulaId inválido (%p)', async (aulaId) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, aulaId)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.asignacionHorarioRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el bloque no existe', async () => {
    const { deps, useCase } = crear({ schedule: null });
    await expect(useCase.execute(5, 3)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.asignacionHorarioRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el aula no existe', async () => {
    const { deps, useCase } = crear({ aula: null });
    await expect(useCase.execute(5, 3)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.asignacionHorarioRepository.update).not.toHaveBeenCalled();
  });
});
