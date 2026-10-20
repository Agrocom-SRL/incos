import { describe, it, expect, jest } from '@jest/globals';
import { UpdateActividadCronogramaUseCase } from '../../../src/application/use-cases/academico/UpdateActividadCronogramaUseCase.js';

describe('UpdateActividadCronogramaUseCase', () => {
  const crear = (existente = { id: 4 }) => {
    const deps = {
      calendarActivityRepository: {
        findById: jest.fn().mockResolvedValue(existente),
        update: jest.fn().mockResolvedValue({ id: 4, ok: true }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateActividadCronogramaUseCase(deps) };
  };

  it('solo envía al repositorio los campos presentes en el payload', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(4, { fechaInicio: '2026-04-01', suspendeClases: true }, 2);
    expect(res).toEqual({ id: 4, ok: true });
    expect(deps.calendarActivityRepository.update).toHaveBeenCalledWith(
      4,
      { startDate: '2026-04-01', suspendsClasses: true },
      2,
    );
  });

  it('normaliza nulos explícitos (fechaFin, carreras, suspendeClases)', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(4, { fechaFin: null, carrerasIds: null, suspendeClases: null, actividadId: null });
    expect(deps.calendarActivityRepository.update.mock.calls[0][1]).toEqual({
      endDate: null,
      careerIds: null,
      suspendsClasses: false,
      activityId: null,
    });
  });

  it('mapea todos los campos editables', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(4, {
      periodoAcademicoId: 1, actividadId: 2, nombrePersonalizado: 'N', fechaInicio: 'a', fechaFin: 'b', suspendeClases: false, carrerasIds: [3],
    });
    expect(deps.calendarActivityRepository.update.mock.calls[0][1]).toEqual({
      academicPeriodId: 1, activityId: 2, customName: 'N', startDate: 'a', endDate: 'b', suspendsClasses: false, careerIds: [3],
    });
  });

  it('404 si la actividad no existe', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute(4, { fechaInicio: 'x' })).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
    expect(deps.calendarActivityRepository.update).not.toHaveBeenCalled();
  });
});
