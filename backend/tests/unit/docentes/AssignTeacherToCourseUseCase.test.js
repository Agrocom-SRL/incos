import { describe, it, expect, jest } from '@jest/globals';
import { AssignTeacherToCourseUseCase } from '../../../src/application/use-cases/docentes/AssignTeacherToCourseUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

function crear({ existing = null } = {}) {
  const deps = {
    teacherAssignmentRepository: {
      findBy: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 11, toPlainObject: () => ({ id: 11 }) }),
      findEnrichedById: jest.fn().mockResolvedValue({
        id: 11, gestion_plan_id: 3, oferta_curso_id: 5, docente_id: 1, carga_horaria: 4, vigente: 1,
      }),
    },
    teacherRepository: {
      findById: jest.fn().mockResolvedValue({ id: 1, colorHex: '#E6194B' }),
    },
    courseOfferRepository: {
      findById: jest.fn().mockResolvedValue({ id: 5, parallelManagementId: 7, planSubjectId: 9 }),
    },
    parallelManagementRepository: {
      findById: jest.fn().mockResolvedValue({ id: 7, managementPlanId: 3, state: 'OFERTADO' }),
    },
    planSubjectRepository: {
      findById: jest.fn().mockResolvedValue({ id: 9, studyPlanId: 2, weeklyHours: 4 }),
    },
    managementPlanRepository: {
      findById: jest.fn().mockResolvedValue({ id: 3, studyPlanId: 2, managementId: 1 }),
    },
    managementRepository: {},
    createTeacherAssignmentUseCase: {
      execute: jest.fn().mockResolvedValue({ asignacion: { id: 60 } }),
    },
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  };
  return { deps, useCase: new AssignTeacherToCourseUseCase(deps) };
}

describe('AssignTeacherToCourseUseCase', () => {
  it('sin asignación previa delega en la creación con el plan resuelto desde la oferta', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ oferta_curso_id: 5, docente_id: 1, carga_horaria: 6 }, 99);

    expect(deps.createTeacherAssignmentUseCase.execute).toHaveBeenCalledWith(
      {
        gestion_plan_id: 3,
        oferta_curso_id: 5,
        docente_id: 1,
        carga_horaria: 6,
        vigente: true,
        confirmar_sobrecarga: false,
      },
      99
    );
    expect(res).toEqual({ asignacion: { id: 60 }, warnings: [] });
    expect(deps.teacherAssignmentRepository.findBy)
      .toHaveBeenCalledWith({ managementPlanId: 3, offerCourseId: 5, active: true });
  });

  it.each([['abc'], [-3], [201], [NaN]])('carga_horaria %p inválida: 422 sin crear ni actualizar', async (carga) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ oferta_curso_id: 5, docente_id: 1, carga_horaria: carga })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.createTeacherAssignmentUseCase.execute).not.toHaveBeenCalled();
    expect(deps.teacherAssignmentRepository.update).not.toHaveBeenCalled();
  });

  it('carga_horaria en texto numérico se convierte a número', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ oferta_curso_id: 5, docente_id: 1, carga_horaria: '6' });
    expect(deps.createTeacherAssignmentUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ carga_horaria: 6 }), null);
  });

  it('con asignación existente y carga inválida no actualiza', async () => {
    const { useCase, deps } = crear({ existing: { id: 11, teacherId: 1, hours: 4 } });
    await expect(useCase.execute({ oferta_curso_id: 5, docente_id: 1, carga_horaria: 'abc' })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.teacherAssignmentRepository.update).not.toHaveBeenCalled();
  });

  it('usa gestion_plan_id del body sin consultar la oferta para resolverlo', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ oferta_curso_id: 5, docente_id: 1, gestion_plan_id: 3 });
    expect(deps.createTeacherAssignmentUseCase.execute.mock.calls[0][0].gestion_plan_id).toBe(3);
  });

  it('con asignación vigente cambia de docente, fecha de hoy y horas del plan', async () => {
    const existing = { id: 11, teacherId: 2, hours: null };
    const { useCase, deps } = crear({ existing });
    const res = await useCase.execute({ oferta_curso_id: 5, docente_id: 1 }, 99);

    expect(deps.createTeacherAssignmentUseCase.execute).not.toHaveBeenCalled();
    const [id, entity, userId] = deps.teacherAssignmentRepository.update.mock.calls[0];
    expect(id).toBe(11);
    expect(userId).toBe(99);
    expect(entity).toMatchObject({ teacherId: 1, active: true, hours: 4 });
    expect(entity.assignmentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.asignacion).toMatchObject({ id: 11, docenteId: 1 });
    expect(res.warnings).toEqual([]);
  });

  it('mismo docente: no cambia la fecha y respeta las horas enviadas', async () => {
    const existing = { id: 11, teacherId: 1, hours: 3 };
    const { useCase, deps } = crear({ existing });
    await useCase.execute({ oferta_curso_id: 5, docente_id: 1, carga_horaria: 8 });
    const entity = deps.teacherAssignmentRepository.update.mock.calls[0][1];
    expect(entity.assignmentDate).toBeUndefined();
    expect(entity.hours).toBe(8);
  });

  it('mismo docente con horas previas y sin carga en el body no toca las horas', async () => {
    const existing = { id: 11, teacherId: 1, hours: 3 };
    const { useCase, deps } = crear({ existing });
    await useCase.execute({ oferta_curso_id: 5, docente_id: 1 });
    const entity = deps.teacherAssignmentRepository.update.mock.calls[0][1];
    expect(entity.hours).toBeUndefined();
  });

  it.each([
    [{ docente_id: 1 }],
    [{ oferta_curso_id: 5 }],
    [{ oferta_curso_id: 'abc', docente_id: 1 }],
    [{ oferta_curso_id: 5, docente_id: 'x' }],
    [{ oferta_curso_id: 0, docente_id: 1 }],
    [{ oferta_curso_id: 5, docente_id: -1 }],
  ])('rechaza ids inválidos o NaN (%#)', async (payload) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.teacherRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el docente no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ oferta_curso_id: 5, docente_id: 1 }))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('exige color al docente', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue({ id: 1, colorHex: 'zzz' });
    const err = await useCase.execute({ oferta_curso_id: 5, docente_id: 1 }).catch((e) => e);
    expect(err).toBeInstanceOf(UnprocessableEntityError);
    expect(err.extensions).toEqual({ requiere_color: true });
  });

  it('lanza NotFoundError si la oferta no existe', async () => {
    const { useCase, deps } = crear();
    deps.courseOfferRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ oferta_curso_id: 5, docente_id: 1 }))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza 422 si el paralelo-gestión de la oferta no tiene plan habilitado', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findById.mockResolvedValue({ id: 7 });
    await expect(useCase.execute({ oferta_curso_id: 5, docente_id: 1 }))
      .rejects.toBeInstanceOf(UnprocessableEntityError);
  });
});
