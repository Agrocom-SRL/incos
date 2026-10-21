import { describe, it, expect, jest } from '@jest/globals';
import { UpdateFichaSeguimientoUseCase } from '../../../src/application/use-cases/docentes/supervision/UpdateFichaSeguimientoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateFichaSeguimientoUseCase', () => {
  const crear = () => {
    const deps = {
      fichaSeguimientoClaseRepository: {
        findById: jest.fn().mockResolvedValue({
          id: 70, asignacionDocenteId: 4, estudiantesEnPlanilla: 20, estudiantesAsistentes: 15,
        }),
        update: jest.fn().mockResolvedValue({ id: 70 }),
      },
      teacherAssignmentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 6, active: true }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateFichaSeguimientoUseCase(deps) };
  };

  it('actualiza solo campos del formulario y nunca reasigna al evaluador', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(70, { otrasObservaciones: 'ok', supervisorId: 999 }, 12);

    expect(deps.fichaSeguimientoClaseRepository.update)
      .toHaveBeenCalledWith(70, { otrasObservaciones: 'ok' }, 12);
    expect(res).toEqual({ fichaSeguimiento: { id: 70 } });
    expect(deps.teacherAssignmentRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la ficha no existe', async () => {
    const { useCase, deps } = crear();
    deps.fichaSeguimientoClaseRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(70, {}, 1)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.fichaSeguimientoClaseRepository.update).not.toHaveBeenCalled();
  });

  it('valida la nueva asignación cuando cambia y debe estar vigente', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(70, { asignacionDocenteId: '6' }, 1);
    expect(deps.teacherAssignmentRepository.findById).toHaveBeenCalledWith(6);

    deps.teacherAssignmentRepository.findById.mockResolvedValue({ id: 6, active: false });
    await expect(useCase.execute(70, { asignacionDocenteId: 6 }, 1))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si la nueva asignación no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(70, { asignacionDocenteId: 6 }, 1))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([[0], [-2], ['abc'], [null]])(
    'asignacionDocenteId inválido (%p) lanza ValidationError',
    async (valor) => {
      const { useCase, deps } = crear();
      await expect(useCase.execute(70, { asignacionDocenteId: valor }, 1))
        .rejects.toBeInstanceOf(ValidationError);
      expect(deps.fichaSeguimientoClaseRepository.update).not.toHaveBeenCalled();
    }
  );

  it('misma asignación no vuelve a validarse', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(70, { asignacionDocenteId: 4 }, 1);
    expect(deps.teacherAssignmentRepository.findById).not.toHaveBeenCalled();
  });

  it('valida la asistencia contra el valor final (payload o actual)', async () => {
    const { useCase, deps } = crear();
    // planilla actual 20: asistentes 25 es incoherente
    await expect(useCase.execute(70, { estudiantesAsistentes: 25 }, 1))
      .rejects.toBeInstanceOf(ValidationError);
    // asistentes actual 15: bajar la planilla a 10 es incoherente
    await expect(useCase.execute(70, { estudiantesEnPlanilla: 10 }, 1))
      .rejects.toBeInstanceOf(ValidationError);
    expect(deps.fichaSeguimientoClaseRepository.update).not.toHaveBeenCalled();

    await useCase.execute(70, { estudiantesEnPlanilla: 30, estudiantesAsistentes: 25 }, 1);
    expect(deps.fichaSeguimientoClaseRepository.update).toHaveBeenCalledTimes(1);
  });
});
