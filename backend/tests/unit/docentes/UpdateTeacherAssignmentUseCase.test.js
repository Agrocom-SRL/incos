import { describe, it, expect, jest } from '@jest/globals';
import { UpdateTeacherAssignmentUseCase } from '../../../src/application/use-cases/docentes/UpdateTeacherAssignmentUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

function crear({ existing } = {}) {
  const current = existing ?? {
    id: 11, managementPlanId: 3, offerCourseId: 5, teacherId: 1, hours: 4, active: true,
  };
  const deps = {
    teacherAssignmentRepository: {
      findById: jest.fn().mockResolvedValue({ toPlainObject: () => current }),
      update: jest.fn().mockResolvedValue({ id: 11, toPlainObject: () => ({ id: 11 }) }),
      retireVigenteForOffer: jest.fn().mockResolvedValue(undefined),
      findEnrichedById: jest.fn().mockResolvedValue({
        id: 11, gestion_plan_id: 3, oferta_curso_id: 5, docente_id: 2, carga_horaria: 4, vigente: 1,
      }),
    },
    teacherRepository: {
      findById: jest.fn().mockResolvedValue({ id: 2, colorHex: '#3CB44B' }),
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
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  };
  return { deps, useCase: new UpdateTeacherAssignmentUseCase(deps) };
}

const entidadActualizada = (deps) => deps.teacherAssignmentRepository.update.mock.calls[0][1];

describe('UpdateTeacherAssignmentUseCase', () => {
  it('cambia de docente: asigna fecha de hoy y llama update con id y usuario', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute('11', { docente_id: 2 }, 99);

    expect(deps.teacherRepository.findById).toHaveBeenCalledWith(2);
    const [id, , userId] = deps.teacherAssignmentRepository.update.mock.calls[0];
    expect([id, userId]).toEqual([11, 99]);
    expect(entidadActualizada(deps)).toMatchObject({ teacherId: 2 });
    expect(entidadActualizada(deps).assignmentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.asignacion).toMatchObject({ id: 11, docenteId: 2 });
  });

  it('respeta la fecha enviada al cambiar de docente', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(11, { docente_id: 2, fecha_asignacion: '2026-03-01' });
    expect(entidadActualizada(deps).assignmentDate).toBe('2026-03-01');
  });

  it('al cambiar de docente sin horas previas toma las horas del plan', async () => {
    const { useCase, deps } = crear({
      existing: { id: 11, managementPlanId: 3, offerCourseId: 5, teacherId: 1, hours: null, active: true },
    });
    await useCase.execute(11, { docente_id: 2 });
    expect(entidadActualizada(deps).hours).toBe(4);
  });

  it('redondea la carga horaria y acepta null', async () => {
    const a = crear();
    await a.useCase.execute(11, { carga_horaria: 7.4 });
    expect(entidadActualizada(a.deps).hours).toBe(7);

    const b = crear();
    await b.useCase.execute(11, { carga_horaria: null });
    expect(entidadActualizada(b.deps).hours).toBeNull();
  });

  it.each([['abc'], [-1], [201]])('rechaza carga_horaria inválida (%s)', async (valor) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(11, { carga_horaria: valor }))
      .rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.teacherAssignmentRepository.update).not.toHaveBeenCalled();
  });

  it.each([[0], [-3], ['abc'], ['']])('rechaza docente_id inválido (%p)', async (valor) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(11, { docente_id: valor }))
      .rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.teacherAssignmentRepository.update).not.toHaveBeenCalled();
  });

  it.each([[0], ['abc'], [null]])('rechaza oferta_curso_id inválido (%p)', async (valor) => {
    const { useCase } = crear();
    await expect(useCase.execute(11, { oferta_curso_id: valor }))
      .rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it.each([[0], [-1], ['abc'], [undefined]])('id de asignación inválido (%p) lanza NotFoundError', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id, { vigente: true })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherAssignmentRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la asignación no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(11, { vigente: true })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el docente nuevo no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(11, { docente_id: 2 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('exige color en el docente nuevo', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue({ id: 2, colorHex: null });
    const err = await useCase.execute(11, { docente_id: 2 }).catch((e) => e);
    expect(err).toBeInstanceOf(UnprocessableEntityError);
    expect(err.extensions).toEqual({ requiere_color: true });
  });

  it('valida la nueva oferta contra el plan habilitado de la asignación', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findById.mockResolvedValue({ id: 7, managementPlanId: 4 });
    await expect(useCase.execute(11, { oferta_curso_id: 6 }))
      .rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.teacherAssignmentRepository.update).not.toHaveBeenCalled();
  });

  it('body vacío o sin campos reconocidos lanza 422', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(11, {})).rejects.toBeInstanceOf(UnprocessableEntityError);
    await expect(useCase.execute(11, null)).rejects.toBeInstanceOf(UnprocessableEntityError);
    await expect(useCase.execute(11, { otro: 1 })).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('dar de baja (vigente=false) añade el motivo por defecto y no retira otras', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(11, { vigente: false });
    expect(entidadActualizada(deps)).toMatchObject({
      active: false, reason: 'Baja manual de asignación',
    });
    expect(deps.teacherAssignmentRepository.retireVigenteForOffer).not.toHaveBeenCalled();
  });

  it('dar de baja respeta el motivo enviado', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(11, { vigente: false, motivo: 'Renuncia' });
    expect(entidadActualizada(deps).reason).toBe('Renuncia');
  });

  it('vigente=true sobre una asignación vigente retira las demás de la oferta', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(11, { vigente: true }, 99);
    expect(deps.teacherAssignmentRepository.retireVigenteForOffer).toHaveBeenCalledWith(5, 11, 99);
  });

  it('lanza NotFoundError si update no devuelve la asignación', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.update.mockResolvedValue(null);
    await expect(useCase.execute(11, { vigente: true })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('un fallo de auto-oferta no rompe la actualización', async () => {
    const { useCase, deps } = crear();
    deps.courseOfferRepository.findById.mockResolvedValueOnce(null);
    const res = await useCase.execute(11, { vigente: true });
    expect(res.asignacion).toBeDefined();
  });

  it('si no hay fila enriquecida responde con la entidad actualizada', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue(null);
    const res = await useCase.execute(11, { vigente: true });
    expect(res.asignacion).toBeDefined();
  });
});
