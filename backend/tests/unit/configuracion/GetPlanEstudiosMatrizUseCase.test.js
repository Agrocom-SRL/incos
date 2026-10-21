import { jest } from '@jest/globals';
import { GetPlanEstudiosMatrizUseCase } from '../../../src/application/use-cases/configuracion/GetPlanEstudiosMatrizUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetPlanEstudiosMatrizUseCase', () => {
  const crear = () => {
    const deps = {
      studyPlanRepository: {
        findById: jest.fn().mockResolvedValue({ id: 1, careerId: 4, planName: 'Plan 2026', hoursPerWeek: 30 }),
      },
      careerRepository: { findById: jest.fn().mockResolvedValue({ id: 4, code: 'SIS', name: 'Sistemas' }) },
      periodRepository: {
        findAll: jest.fn().mockResolvedValue({
          periods: [
            { id: 10, name: 'Primero', number: 1 },
            { id: 11, name: 'Segundo', number: 2 },
          ],
        }),
      },
      planSubjectRepository: {
        findAll: jest.fn().mockResolvedValue({
          planSubjects: [
            { id: 3, periodId: 10, subjectId: 100, weeklyHours: 4, modality: 'PRESENCIAL', displayOrder: 2 },
            { id: 2, periodId: 10, subjectId: 101, weeklyHours: 6, modality: 'PRESENCIAL', displayOrder: 1 },
            { id: 4, periodId: 11, subjectId: 100, weeklyHours: 3, modality: 'VIRTUAL', displayOrder: 1 },
            { id: 5, periodId: 999, subjectId: 100, weeklyHours: 50, displayOrder: 1 },
          ],
        }),
      },
      subjectRepository: {
        findAll: jest.fn().mockResolvedValue({
          subjects: [
            { id: 100, acronym: 'MAT', name: 'Matemática', type: 'TEORICA' },
            { id: 101, acronym: 'PRG', name: 'Programación', type: 'PRACTICA' },
          ],
        }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetPlanEstudiosMatrizUseCase(deps) };
  };

  it('arma la matriz por periodo con asignaturas ordenadas y horas acumuladas', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(1);

    expect(deps.periodRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 1, sort: 'numero:ASC' }, null, null);
    expect(deps.planSubjectRepository.findAll).toHaveBeenCalledWith(
      { studyPlanId: 1, sort: 'periodoId:ASC' }, null, null
    );
    expect(deps.subjectRepository.findAll).toHaveBeenCalledWith({ id: [100, 101] }, null, null);

    expect(result.plan).toMatchObject({ id: 1, nombre_plan: 'Plan 2026', horas_semana: 30 });
    expect(result.plan.carrera).toMatchObject({ id: 4, codigo: 'SIS', nombre: 'Sistemas' });
    expect(result.periodos).toHaveLength(2);
    expect(result.periodos[0]).toMatchObject({ id: 10, nombre: 'Primero', numero: 1, horas_total: 10 });
    expect(result.periodos[0].asignaturas.map((a) => a.id)).toEqual([2, 3]);
    expect(result.periodos[0].asignaturas[0]).toEqual({
      id: 2,
      materia: { sigla: 'PRG', nombre: 'Programación', tipo: 'PRACTICA' },
      horas_semanales: 6,
      modalidad: 'PRESENCIAL',
      orden_visualizacion: 1,
    });
    expect(result.periodos[1].horas_total).toBe(3);
    // la asignatura de un periodo inexistente no cuenta
    expect(result.horas_total_plan).toBe(13);
  });

  it('lanza NotFoundError si el plan no existe y no consulta nada más', async () => {
    const { useCase, deps } = crear();
    deps.studyPlanRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.periodRepository.findAll).not.toHaveBeenCalled();
  });

  it('carrera null si el plan no tiene careerId', async () => {
    const { useCase, deps } = crear();
    deps.studyPlanRepository.findById.mockResolvedValue({ id: 1, planName: 'P' });
    const result = await useCase.execute(1);
    expect(deps.careerRepository.findById).not.toHaveBeenCalled();
    expect(result.plan.carrera).toBeNull();
  });

  it('no consulta materias si el plan no tiene asignaturas', async () => {
    const { useCase, deps } = crear();
    deps.planSubjectRepository.findAll.mockResolvedValue({ planSubjects: [] });
    const result = await useCase.execute(1);
    expect(deps.subjectRepository.findAll).not.toHaveBeenCalled();
    expect(result.horas_total_plan).toBe(0);
    expect(result.periodos.every((p) => p.asignaturas.length === 0)).toBe(true);
  });

  it('usa materia con campos null cuando el catálogo no la tiene', async () => {
    const { useCase, deps } = crear();
    deps.subjectRepository.findAll.mockResolvedValue({ subjects: [] });
    const result = await useCase.execute(1);
    expect(result.periodos[0].asignaturas[0].materia).toEqual({ sigla: null, nombre: null, tipo: null });
  });

  it('resultados sin colecciones devuelven matriz vacía', async () => {
    const { useCase, deps } = crear();
    deps.periodRepository.findAll.mockResolvedValue({});
    deps.planSubjectRepository.findAll.mockResolvedValue({});
    const result = await useCase.execute(1);
    expect(result.periodos).toEqual([]);
    expect(result.horas_total_plan).toBe(0);
  });
});
