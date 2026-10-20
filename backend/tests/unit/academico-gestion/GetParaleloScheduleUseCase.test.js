import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { query: mockQuery },
}));

const { GetParaleloScheduleUseCase } = await import(
  '../../../src/application/use-cases/academico/GetParaleloScheduleUseCase.js'
);

describe('GetParaleloScheduleUseCase', () => {
  const pg = { paraleloGestionId: 11, gestionPlanId: 22, turnoEfectivo: 'TARDE' };

  const crear = ({ paralelo = { id: 1, name: 'A', shift: 'MANANA', careerId: 5, periodId: 6 }, ofertas = [], planSubjects = [] } = {}) => {
    const deps = {
      parallelRepository: { findById: jest.fn().mockResolvedValue(paralelo) },
      courseOfferRepository: { findEnrichedByParallelManagementId: jest.fn().mockResolvedValue(ofertas) },
      asignacionHorarioRepository: { findBloquesByOfertaCursoIdForPresentation: jest.fn().mockResolvedValue([]) },
      teacherAssignmentRepository: { findAll: jest.fn().mockResolvedValue({ teacherAssignments: [] }) },
      teacherRepository: { findById: jest.fn().mockResolvedValue(null) },
      planSubjectRepository: { findAll: jest.fn().mockResolvedValue({ planSubjects }) },
      subjectRepository: { findById: jest.fn().mockResolvedValue(null) },
      careerRepository: { findById: jest.fn().mockResolvedValue({ name: 'Sistemas', code: 'SIS', colorHex: '#1', imagePath: '/i.png' }) },
      periodRepository: { findById: jest.fn().mockResolvedValue({ name: 'Primero', number: 1 }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
    };
    return { deps, useCase: new GetParaleloScheduleUseCase(deps) };
  };

  beforeEach(() => mockQuery.mockReset().mockResolvedValue([pg]));

  it.each([['abc'], [0], [-3], [undefined], [null]])('404 si el id no es válido (%p)', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toMatchObject({ statusCode: 404 });
    expect(deps.parallelRepository.findById).not.toHaveBeenCalled();
  });

  it('404 si el paralelo no existe', async () => {
    const { useCase } = crear({ paralelo: null });
    await expect(useCase.execute(1)).rejects.toMatchObject({ statusCode: 404 });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('404 si el paralelo no tiene instancia en la gestión vigente', async () => {
    mockQuery.mockResolvedValue([]);
    const { useCase, deps } = crear();
    await expect(useCase.execute(1)).rejects.toMatchObject({ statusCode: 404 });
    expect(mockQuery.mock.calls[0][1].replacements).toEqual({ paraleloId: 1 });
    expect(deps.courseOfferRepository.findEnrichedByParallelManagementId).not.toHaveBeenCalled();
  });

  it('arma resumen, cursos con bloques y docente, y materias faltantes', async () => {
    const { useCase, deps } = crear({
      ofertas: [{ id: 100, asignaturaPlanId: 7, materiaId: 3, materiaNombre: 'Mat', materiaCodigo: 'MAT', horasSemanales: 4 }],
      planSubjects: [
        { id: 7, subjectId: 3, weeklyHours: 4 },
        { id: 8, subjectId: 4, weeklyHours: 2 },
      ],
    });
    deps.asignacionHorarioRepository.findBloquesByOfertaCursoIdForPresentation.mockResolvedValue([
      { id: 1, ordenSecuencia: 1, dia: 'LUNES', horaInicio: '08:00:00', horaFin: '09:00:00', aulaNombre: 'Aula 1' },
    ]);
    deps.teacherAssignmentRepository.findAll.mockResolvedValue({ teacherAssignments: [{ teacherId: 9, managementPlanId: 33 }] });
    deps.teacherRepository.findById.mockResolvedValue({ firstName: 'Ana', lastName: 'Paz', motherLastName: null });
    deps.subjectRepository.findById.mockResolvedValue({ acronym: 'FIS', name: 'Física' });

    const res = await useCase.execute('1');

    expect(deps.courseOfferRepository.findEnrichedByParallelManagementId).toHaveBeenCalledWith(11);
    expect(deps.teacherAssignmentRepository.findAll).toHaveBeenCalledWith({ offerCourseId: 100, active: true }, { page: 1, limit: 1 }, null);
    expect(deps.planSubjectRepository.findAll).toHaveBeenCalledWith({ periodId: 6 }, null, null);
    expect(res.paralelo).toMatchObject({
      nombre: 'A', turno: 'TARDE', periodoNombre: 'Primero', periodoNumero: 1, carreraNombre: 'Sistemas', carreraCodigo: 'SIS',
    });
    expect(res.schedule).toEqual([
      {
        cursoId: 100,
materiaId: 3,
materiaNombre: 'Mat',
materiaSigla: 'MAT',
horasSemanalesPlan: 4,
        gestionPlanId: 33,
docenteId: 9,
docenteNombre: 'Ana Paz',
color: null,
        horarios: [{ id: 1, ordenSecuencia: 1, horario: { dia: 'LUNES', horaInicio: '08:00:00', horaFin: '09:00:00' }, aula: 'Aula 1' }],
      },
    ]);
    expect(res.missingSubjects).toEqual([
      { asignaturaPlanId: 8, materiaId: 4, materiaSigla: 'FIS', materiaNombre: 'Física', horasSemanalesPlan: 2 },
    ]);
  });

  it('oferta sin asignación docente usa el gestionPlanId del paralelo en gestión', async () => {
    const { useCase } = crear({ ofertas: [{ id: 100, asignaturaPlanId: 7 }] });
    const res = await useCase.execute(1);
    expect(res.schedule[0]).toMatchObject({ gestionPlanId: 22, docenteId: null, docenteNombre: null, horarios: [] });
  });

  it('descarta la oferta cuyo procesamiento falla y sigue con el resto', async () => {
    const { useCase, deps } = crear({ ofertas: [{ id: 100 }, { id: 101 }] });
    deps.asignacionHorarioRepository.findBloquesByOfertaCursoIdForPresentation
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValueOnce([]);
    const res = await useCase.execute(1);
    expect(res.schedule.map((c) => c.cursoId)).toEqual([101]);
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('tolera fallos al cargar carrera, periodo y docente (advierte, no lanza)', async () => {
    const { useCase, deps } = crear({ ofertas: [{ id: 100 }] });
    deps.careerRepository.findById.mockRejectedValue(new Error('c'));
    deps.periodRepository.findById.mockRejectedValue(new Error('p'));
    deps.teacherAssignmentRepository.findAll.mockRejectedValue(new Error('t'));
    deps.planSubjectRepository.findAll.mockRejectedValue(new Error('ps'));
    const res = await useCase.execute(1);
    expect(res.paralelo).toMatchObject({ carreraNombre: null, periodoNombre: null, turno: 'TARDE' });
    expect(res.schedule).toHaveLength(1);
    expect(res.missingSubjects).toEqual([]);
    expect(deps.logger.warn).toHaveBeenCalledTimes(4);
  });

  it('sin periodId no calcula materias faltantes', async () => {
    const { useCase, deps } = crear({ paralelo: { id: 1, name: 'A' } });
    const res = await useCase.execute(1);
    expect(res.missingSubjects).toEqual([]);
    expect(deps.planSubjectRepository.findAll).not.toHaveBeenCalled();
  });
});
