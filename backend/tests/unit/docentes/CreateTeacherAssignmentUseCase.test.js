import { describe, it, expect, jest } from '@jest/globals';
import { CreateTeacherAssignmentUseCase } from '../../../src/application/use-cases/docentes/CreateTeacherAssignmentUseCase.js';
import { NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

const ENRICHED = {
  id: 50, gestion_plan_id: 3, oferta_curso_id: 5, docente_id: 1, carga_horaria: 4, vigente: 1,
};

function crear({ limites = { maxHorasSemana: 20 }, carga = [] } = {}) {
  const deps = {
    teacherAssignmentRepository: {
      retireVigenteForOffer: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue({ id: 50 }),
      findEnrichedById: jest.fn().mockResolvedValue(ENRICHED),
      findCargaDetalleByDocenteAndGestion: jest.fn().mockResolvedValue(carga),
    },
    teacherRepository: {
      findById: jest.fn().mockResolvedValue({ id: 1, colorHex: '#E6194B' }),
      findCargaLimitesById: jest.fn().mockResolvedValue(limites),
    },
    courseOfferRepository: {
      findById: jest.fn().mockResolvedValue({ id: 5, parallelManagementId: 7, planSubjectId: 9 }),
    },
    parallelManagementRepository: {
      findById: jest.fn().mockResolvedValue({ id: 7, managementPlanId: 3, state: 'OFERTADO' }),
    },
    managementPlanRepository: {
      findById: jest.fn().mockResolvedValue({ id: 3, studyPlanId: 2, managementId: 1 }),
    },
    planSubjectRepository: {
      findById: jest.fn().mockResolvedValue({ id: 9, studyPlanId: 2, weeklyHours: 4 }),
    },
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  };
  return { deps, useCase: new CreateTeacherAssignmentUseCase(deps) };
}

const body = { gestion_plan_id: 3, oferta_curso_id: 5, docente_id: 1 };

describe('CreateTeacherAssignmentUseCase', () => {
  it('crea la asignación vigente con horas del plan y retira la vigente previa', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(body, 99);

    expect(deps.teacherAssignmentRepository.retireVigenteForOffer).toHaveBeenCalledWith(5, null, 99);
    const [entity, userId] = deps.teacherAssignmentRepository.create.mock.calls[0];
    expect(entity).toMatchObject({
      managementPlanId: 3, offerCourseId: 5, teacherId: 1, hours: 4, active: true,
    });
    expect(entity.assignmentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(userId).toBe(99);
    expect(res.asignacion).toMatchObject({ id: 50, gestionPlanId: 3, ofertaCursoId: 5, docenteId: 1 });
  });

  it('usa la carga enviada redondeada y no retira vigentes si vigente=false', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ ...body, carga_horaria: 6.6, vigente: false });
    expect(deps.teacherAssignmentRepository.retireVigenteForOffer).not.toHaveBeenCalled();
    expect(deps.teacherAssignmentRepository.create.mock.calls[0][0])
      .toMatchObject({ hours: 7, active: false });
  });

  it('carga_horaria null o no numérica cae a las horas del plan', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ ...body, carga_horaria: null });
    await useCase.execute({ ...body, carga_horaria: 'abc' });
    expect(deps.teacherAssignmentRepository.create.mock.calls[0][0].hours).toBe(4);
    expect(deps.teacherAssignmentRepository.create.mock.calls[1][0].hours).toBe(4);
  });

  it.each([
    [{ ...body, gestion_plan_id: 'x' }],
    [{ ...body, oferta_curso_id: undefined }],
    [{ ...body, docente_id: 0 }],
    [{ ...body, docente_id: -2 }],
    [{ ...body, oferta_curso_id: 'abc' }],
  ])('rechaza ids inválidos o NaN (%#) sin tocar repositorios', async (payload) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.teacherRepository.findById).not.toHaveBeenCalled();
    expect(deps.teacherAssignmentRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el docente no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherAssignmentRepository.create).not.toHaveBeenCalled();
  });

  it('exige color asignado al docente', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue({ id: 1, colorHex: null });
    const err = await useCase.execute(body).catch((e) => e);
    expect(err).toBeInstanceOf(UnprocessableEntityError);
    expect(err.extensions).toEqual({ requiere_color: true });
  });

  it('lanza NotFoundError si la oferta no existe', async () => {
    const { useCase, deps } = crear();
    deps.courseOfferRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rechaza oferta de otro plan habilitado', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findById.mockResolvedValue({ id: 7, managementPlanId: 4 });
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.teacherAssignmentRepository.create).not.toHaveBeenCalled();
  });

  it('bloquea la sobrecarga semanal sin confirmación', async () => {
    const { useCase, deps } = crear({ carga: [{ horas: 18 }] });
    const err = await useCase.execute(body).catch((e) => e);
    expect(err).toBeInstanceOf(UnprocessableEntityError);
    expect(err.extensions).toMatchObject({
      sobrecarga: true, carga_actual_semana: 18, carga_proyectada_semana: 22, max_horas_semana: 20,
    });
    expect(deps.teacherAssignmentRepository.findCargaDetalleByDocenteAndGestion)
      .toHaveBeenCalledWith(1, 1);
    expect(deps.teacherAssignmentRepository.create).not.toHaveBeenCalled();
  });

  it('permite la sobrecarga con confirmar_sobrecarga', async () => {
    const { useCase, deps } = crear({ carga: [{ horas: 18 }] });
    await useCase.execute({ ...body, confirmar_sobrecarga: true });
    expect(deps.teacherAssignmentRepository.create).toHaveBeenCalled();
  });

  it('sin límites del docente no valida la carga', async () => {
    const { useCase, deps } = crear({ limites: null, carga: [{ horas: 100 }] });
    await useCase.execute(body);
    expect(deps.teacherAssignmentRepository.findCargaDetalleByDocenteAndGestion).not.toHaveBeenCalled();
    expect(deps.teacherAssignmentRepository.create).toHaveBeenCalled();
  });

  it('si no hay fila enriquecida usa la entidad creada', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue(null);
    deps.teacherAssignmentRepository.create.mockResolvedValue({ id: 50, toPlainObject: () => ({ id: 50 }) });
    const res = await useCase.execute(body);
    expect(res.asignacion).toBeDefined();
  });
});
