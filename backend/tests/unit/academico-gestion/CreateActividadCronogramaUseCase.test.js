import { describe, it, expect, jest } from '@jest/globals';
import { CreateActividadCronogramaUseCase } from '../../../src/application/use-cases/academico/CreateActividadCronogramaUseCase.js';

describe('CreateActividadCronogramaUseCase', () => {
  const crear = () => {
    const deps = {
      calendarActivityRepository: { create: jest.fn().mockResolvedValue({ id: 5 }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreateActividadCronogramaUseCase(deps) };
  };

  it('mapea el payload a dominio y delega la creación', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(
      { periodoAcademicoId: 2, actividadId: 3, fechaInicio: '2026-03-01', fechaFin: '2026-03-02', suspendeClases: true, carrerasIds: [1, 2] },
      9,
    );
    expect(res).toEqual({ id: 5 });
    expect(deps.calendarActivityRepository.create).toHaveBeenCalledWith(
      {
        academicPeriodId: 2,
        activityId: 3,
        customName: null,
        startDate: '2026-03-01',
        endDate: '2026-03-02',
        suspendsClasses: true,
        careerIds: [1, 2],
      },
      9,
    );
  });

  it('usa valores por defecto cuando faltan opcionales', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ nombrePersonalizado: 'Feria', fechaInicio: '2026-05-01' });
    expect(deps.calendarActivityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ academicPeriodId: null, endDate: null, suspendsClasses: false, careerIds: null, customName: 'Feria' }),
      null,
    );
  });

  it('400 si no hay actividad de catálogo ni nombre personalizado', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ fechaInicio: '2026-05-01' })).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
    expect(deps.calendarActivityRepository.create).not.toHaveBeenCalled();
  });

  it.each([[undefined], [''], ['abc'], ['2026-02-31']])('fechaInicio inválida u omitida (%p) => 400', async (fechaInicio) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ actividadId: 3, fechaInicio })).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.calendarActivityRepository.create).not.toHaveBeenCalled();
  });

  it('fechaFin inválida o anterior al inicio => 400; fechaFin vacía => null', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ actividadId: 3, fechaInicio: '2026-03-05', fechaFin: 'abc' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(useCase.execute({ actividadId: 3, fechaInicio: '2026-03-05', fechaFin: '2026-03-01' })).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.calendarActivityRepository.create).not.toHaveBeenCalled();
    await useCase.execute({ actividadId: 3, fechaInicio: '2026-03-05', fechaFin: '' });
    expect(deps.calendarActivityRepository.create.mock.calls[0][0]).toMatchObject({ startDate: '2026-03-05', endDate: null });
  });
});
