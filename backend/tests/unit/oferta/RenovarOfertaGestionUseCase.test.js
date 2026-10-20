import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { RenovarOfertaGestionUseCase } = await import('../../../src/application/use-cases/oferta/RenovarOfertaGestionUseCase.js');

const model = (rows = []) => ({ findAll: jest.fn().mockResolvedValue(rows), findOne: jest.fn().mockResolvedValue(rows[0] ?? null) });
const identity = (m) => m;

/** Origen: gestión 1 / gestion_plan 10 / plan estudio 2 → destino gestión 2. */
const crear = ({
  gestionPlanOrigen = { id: 10, managementId: 1, studyPlanId: 2, name: 'Oferta 2025' },
  existenteDestino = null,
  paralelos = [{ id: 20, parallelId: 7, classroomId: 3, shift: 'MAÑANA', maxCapacity: 30, minCapacity: 8 }],
  ofertas = [{ id: 30, parallelManagementId: 20, planSubjectId: 40 }],
  asignaturasPlan = [{ id: 40, subjectId: 50, periodId: 60 }],
  asignaciones = [{ id: 70, offerCourseId: 30, teacherId: 80, hours: 4 }],
  docentes = [{ id: 80, activo: true }],
  bloques = [{ id: 90, teacherAssignmentId: 70, scheduleId: 100, sequenceOrder: 1 }],
} = {}) => {
  let n = 1000;
  const create = jest.fn(async (data) => ({ id: n++, ...data }));
  const deps = {
    managementRepository: {
      findById: jest.fn(async (id) => ({ id })),
    },
    managementPlanRepository: {
      findById: jest.fn().mockResolvedValue(gestionPlanOrigen),
      getModel: () => model(existenteDestino ? [existenteDestino] : []),
      create: jest.fn(create),
    },
    parallelManagementRepository: { getModel: () => model(paralelos), toEntity: identity, create: jest.fn(create) },
    courseOfferRepository: { getModel: () => model(ofertas), toEntity: identity, create: jest.fn(create) },
    teacherAssignmentRepository: { getModel: () => model(asignaciones), toEntity: identity, create: jest.fn(create) },
    asignacionHorarioRepository: { getModel: () => model(bloques), toEntity: identity, create: jest.fn(create) },
    studyPlanRepository: { findById: jest.fn().mockResolvedValue({ id: 3 }) },
    planSubjectRepository: {
      getModel: () => ({
        // Plan destino distinto (3): sin asignaturas equivalentes.
        findAll: jest.fn(async ({ where }) => (where.planEstudioId === 3 ? [] : asignaturasPlan)),
      }),
      toEntity: identity,
    },
    periodRepository: { getModel: () => model([]), toEntity: identity },
    subjectRepository: { getModel: () => model([{ id: 50, sigla: 'MAT-101' }]) },
    teacherRepository: { getModel: () => model(docentes) },
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  };
  return { deps, useCase: new RenovarOfertaGestionUseCase(deps) };
};

const body = (extra = {}) => ({
  gestion_origen_id: 1,
  gestiones_planes: [{ gestion_plan_origen_id: 10 }],
  ...extra,
});

describe('RenovarOfertaGestionUseCase', () => {
  beforeEach(() => mockTransaction.mockClear());

  it('copia la cadena completa: plan, paralelos, ofertas, asignaciones y bloques', async () => {
    const { deps, useCase } = crear();
    const { resumen } = await useCase.execute(2, body(), 9);

    expect(resumen).toMatchObject({ gestion_destino_id: 2, gestion_origen_id: 1 });
    expect(resumen.planes[0]).toMatchObject({
      gestion_plan_origen_id: 10, plan_estudio_id: 2, paralelos: 1, ofertas: 1, asignaciones: 1, bloques: 1, advertencias: [],
    });
    const nuevoGp = resumen.planes[0].gestion_plan_destino_id;
    expect(nuevoGp).toBe(1000);

    expect(deps.managementPlanRepository.create).toHaveBeenCalledWith(
      { managementId: 2, studyPlanId: 2, name: 'Oferta 2025', state: 'PROPUESTO' }, 9, { transaction: 'TX' }
    );
    expect(deps.parallelManagementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ managementPlanId: nuevoGp, parallelId: 7, classroomId: 3, state: 'BORRADOR', maxCapacity: 30 }),
      9,
{ transaction: 'TX' }
    );
    // paralelo nuevo = 1001 -> oferta PROGRAMADA bajo el nuevo paralelo
    expect(deps.courseOfferRepository.create).toHaveBeenCalledWith(
      { parallelManagementId: 1001, planSubjectId: 40, state: 'PROGRAMADA' }, 9, { transaction: 'TX' }
    );
    expect(deps.teacherAssignmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ managementPlanId: nuevoGp, offerCourseId: 1002, teacherId: 80, hours: 4, active: true }),
      9,
{ transaction: 'TX' }
    );
    expect(deps.asignacionHorarioRepository.create).toHaveBeenCalledWith(
      { teacherAssignmentId: 1003, scheduleId: 100, sequenceOrder: 1 }, 9, { transaction: 'TX' }
    );
  });

  it('incluir_asignaciones=false no copia asignaciones ni bloques', async () => {
    const { deps, useCase } = crear();
    const { resumen } = await useCase.execute(
      2, body({ incluir_asignaciones: false, incluir_horarios: false }), 1
    );
    expect(resumen.planes[0]).toMatchObject({ ofertas: 1, asignaciones: 0, bloques: 0 });
    expect(deps.teacherAssignmentRepository.create).not.toHaveBeenCalled();
  });

  it('incluir_horarios=true implica asignaciones aun con incluir_asignaciones=false', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, body({ incluir_asignaciones: false, incluir_horarios: true }));
    expect(deps.teacherAssignmentRepository.create).toHaveBeenCalled();
    expect(deps.asignacionHorarioRepository.create).toHaveBeenCalled();
  });

  it('incluir_horarios=false copia asignaciones pero no bloques', async () => {
    const { deps, useCase } = crear();
    const { resumen } = await useCase.execute(2, body({ incluir_horarios: '0' }));
    expect(resumen.planes[0]).toMatchObject({ asignaciones: 1, bloques: 0 });
    expect(deps.asignacionHorarioRepository.create).not.toHaveBeenCalled();
  });

  it('docente inactivo: la asignación nace pendiente (teacherId null) con advertencia', async () => {
    const { deps, useCase } = crear({
      docentes: [{ id: 80, activo: false, nombres: 'Ana', apellidoPaterno: 'Paz', apellidoMaterno: null }],
    });
    const { resumen } = await useCase.execute(2, body());
    expect(deps.teacherAssignmentRepository.create.mock.calls[0][0].teacherId).toBeNull();
    expect(resumen.planes[0].advertencias.join(' ')).toContain('Paz Ana');
  });

  it('idempotencia: si el destino ya tiene el plan activo no copia y advierte', async () => {
    const { deps, useCase } = crear({ existenteDestino: { id: 555 } });
    const { resumen } = await useCase.execute(2, body());
    expect(deps.managementPlanRepository.create).not.toHaveBeenCalled();
    expect(resumen.planes[0].gestion_plan_destino_id).toBeNull();
    expect(resumen.planes[0].advertencias[0]).toContain('555');
  });

  it('plan destino distinto: asignaturas sin equivalente se omiten con advertencia', async () => {
    const { deps, useCase } = crear();
    const { resumen } = await useCase.execute(2, body({
      gestiones_planes: [{ gestion_plan_origen_id: 10, plan_estudio_destino_id: 3 }],
    }));
    expect(deps.studyPlanRepository.findById).toHaveBeenCalledWith(3);
    expect(resumen.planes[0]).toMatchObject({ plan_estudio_id: 3, ofertas: 0, asignaciones: 0 });
    const adv = resumen.planes[0].advertencias.join(' | ');
    expect(adv).toContain('MAT-101');
    expect(adv).toContain('Asignación docente 70 omitida');
    expect(deps.courseOfferRepository.create).not.toHaveBeenCalled();
  });

  it('una transacción por plan y el fallo de uno no aborta el resumen', async () => {
    const { deps, useCase } = crear();
    deps.parallelManagementRepository.create.mockRejectedValueOnce(new Error('fallo db'));
    const { resumen } = await useCase.execute(2, body());
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(resumen.planes[0]).toMatchObject({ gestion_plan_destino_id: null, paralelos: 0, ofertas: 0 });
    expect(resumen.planes[0].advertencias[0]).toContain('fallo db');
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it.each([
    [{}],
    [{ gestion_origen_id: 'abc' }],
    [{ gestion_origen_id: NaN }],
    [{ gestion_origen_id: 0 }],
  ])('ValidationError por gestion_origen_id inválido %j', async (b) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(2, { ...b, gestiones_planes: [{ gestion_plan_origen_id: 10 }] }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementRepository.findById).not.toHaveBeenCalled();
  });

  it.each([[undefined], [[]], ['x']])('ValidationError si gestiones_planes es %p', async (gp) => {
    const { useCase } = crear();
    await expect(useCase.execute(2, { gestion_origen_id: 1, gestiones_planes: gp }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('ValidationError si origen y destino son la misma gestión', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(1, body())).rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementPlanRepository.create).not.toHaveBeenCalled();
  });

  it('NotFoundError si la gestión destino o la origen no existen', async () => {
    const a = crear();
    a.deps.managementRepository.findById.mockResolvedValueOnce(null);
    await expect(a.useCase.execute(2, body())).rejects.toBeInstanceOf(NotFoundError);

    const b = crear();
    b.deps.managementRepository.findById.mockResolvedValueOnce({ id: 2 }).mockResolvedValueOnce(null);
    await expect(b.useCase.execute(2, body())).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([[{}], [{ gestion_plan_origen_id: 'x' }], [{ gestion_plan_origen_id: NaN }]])(
    'ValidationError si el elemento de gestiones_planes es inválido %j',
    async (item) => {
      const { useCase } = crear();
      await expect(useCase.execute(2, { gestion_origen_id: 1, gestiones_planes: [item] }))
        .rejects.toBeInstanceOf(ValidationError);
    }
  );

  it('ValidationError si el plan habilitado no pertenece a la gestión origen', async () => {
    const { deps, useCase } = crear({ gestionPlanOrigen: { id: 10, managementId: 5, studyPlanId: 2 } });
    await expect(useCase.execute(2, body())).rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementPlanRepository.create).not.toHaveBeenCalled();
  });

  it('ValidationError si el plan habilitado no existe', async () => {
    const { deps, useCase } = crear();
    deps.managementPlanRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(2, body())).rejects.toBeInstanceOf(ValidationError);
  });

  it('NotFoundError si el plan de estudios destino no existe', async () => {
    const { deps, useCase } = crear();
    deps.studyPlanRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(2, body({
      gestiones_planes: [{ gestion_plan_origen_id: 10, plan_estudio_destino_id: 3 }],
    }))).rejects.toBeInstanceOf(NotFoundError);
  });
});
