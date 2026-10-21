import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { ClonarPlanEstudiosUseCase } = await import(
  '../../../src/application/use-cases/configuracion/ClonarPlanEstudiosUseCase.js'
);

describe('ClonarPlanEstudiosUseCase', () => {
  const planOrigen = {
    id: 1,
    careerId: 2,
    planName: 'Plan 2020',
    ministerialResolution: 'RM 1',
    durationYears: 3,
    totalHours: 3000,
    hoursPerWeek: 30,
    hoursPerMonth: 120,
    hoursPerYear: 1000,
  };

  // Repositorio simulado con getModel().findAll() y toEntity() identidad.
  const repoLectura = (filas, creados) => {
    let n = 0;
    return {
      getModel: jest.fn(() => ({ findAll: jest.fn().mockResolvedValue(filas) })),
      toEntity: jest.fn((m) => m),
      create: jest.fn(async () => ({ id: creados + n++ })),
    };
  };

  const crear = ({ plan = planOrigen, periodos = [], asignaturas = [], prerrequisitos = [] } = {}) => {
    let nPlan = 0;
    const studyPlanRepository = {
      findById: jest.fn().mockResolvedValue(plan),
      create: jest.fn(async () => ({ id: 500 + nPlan++ })),
    };
    const periodRepository = repoLectura(periodos, 100);
    const planSubjectRepository = repoLectura(asignaturas, 200);
    const prerequisiteRepository = repoLectura(prerrequisitos, 300);
    const logger = { info: jest.fn(), warn: jest.fn() };
    return {
      studyPlanRepository,
      periodRepository,
      planSubjectRepository,
      prerequisiteRepository,
      logger,
      useCase: new ClonarPlanEstudiosUseCase({
        studyPlanRepository,
        periodRepository,
        planSubjectRepository,
        prerequisiteRepository,
        logger,
      }),
    };
  };

  it('lanza NotFoundError si el plan origen no existe y no escribe nada', async () => {
    const { useCase, studyPlanRepository, periodRepository } = crear({ plan: null });
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(studyPlanRepository.findById).toHaveBeenCalledWith(99, { transaction: 'TX' });
    expect(studyPlanRepository.create).not.toHaveBeenCalled();
    expect(periodRepository.create).not.toHaveBeenCalled();
  });

  it('con id no numérico (NaN) el plan no se encuentra y falla con NotFoundError', async () => {
    const { useCase } = crear({ plan: null });
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(NotFoundError);
  });

  it('clona plan, periodos, asignaturas y prerrequisitos remapeando ids', async () => {
    const periodos = [
      { id: 10, name: 'P1', number: 1, displayOrder: 1, description: 'a' },
      { id: 11, name: 'P2', number: 2, displayOrder: 2, description: 'b' },
    ];
    const asignaturas = [
      { id: 20, periodId: 10, subjectId: 7, weeklyHours: 4, credits: 5, modality: 'PRESENCIAL', displayOrder: 1 },
      { id: 21, periodId: 11, subjectId: 8, weeklyHours: 2, credits: 3, modality: 'VIRTUAL', displayOrder: 2 },
    ];
    const prerrequisitos = [{ id: 30, subjectId: 21, prerequisiteId: 20 }];
    const ctx = crear({ periodos, asignaturas, prerrequisitos });

    const res = await ctx.useCase.execute(1, 9);

    // plan destino: no vigente, datos estructurales copiados, en la transacción
    expect(ctx.studyPlanRepository.create).toHaveBeenCalledWith(
      {
        careerId: 2,
        planName: 'Plan 2020',
        ministerialResolution: 'RM 1',
        durationYears: 3,
        totalHours: 3000,
        hoursPerWeek: 30,
        hoursPerMonth: 120,
        hoursPerYear: 1000,
        isActive: false,
        active: true,
      },
      9,
      { transaction: 'TX' }
    );
    expect(res).toEqual({ plan_estudio: { id: 500 } });

    // periodos al plan destino
    expect(ctx.periodRepository.create).toHaveBeenNthCalledWith(
      1,
      { studyPlanId: 500, name: 'P1', number: 1, displayOrder: 1, description: 'a' },
      9,
      { transaction: 'TX' }
    );
    expect(ctx.periodRepository.create).toHaveBeenCalledTimes(2);

    // asignaturas con periodo remapeado (10->100, 11->101)
    expect(ctx.planSubjectRepository.create).toHaveBeenNthCalledWith(
      1,
      {
        studyPlanId: 500,
        periodId: 100,
        subjectId: 7,
        weeklyHours: 4,
        credits: 5,
        modality: 'PRESENCIAL',
        displayOrder: 1,
      },
      9,
      { transaction: 'TX' }
    );
    expect(ctx.planSubjectRepository.create.mock.calls[1][0].periodId).toBe(101);

    // prerrequisito con asignaturas remapeadas (21->201, 20->200)
    expect(ctx.prerequisiteRepository.create).toHaveBeenCalledWith(
      { studyPlanId: 500, subjectId: 201, prerequisiteId: 200 },
      9,
      { transaction: 'TX' }
    );

    expect(ctx.logger.warn).not.toHaveBeenCalled();
    expect(ctx.logger.info).toHaveBeenCalledWith('Plan de estudios clonado', {
      planOrigenId: 1,
      planDestinoId: 500,
      periodos: 2,
      asignaturas: 2,
      prerrequisitos: 1,
    });
  });

  it('lee el origen filtrando por plan y activos dentro de la transacción', async () => {
    const ctx = crear();
    await ctx.useCase.execute(1);
    const findAllPeriodos = ctx.periodRepository.getModel.mock.results[0].value.findAll;
    expect(findAllPeriodos).toHaveBeenCalledWith({
      where: { planEstudioId: 1, activo: true },
      order: [['numero', 'ASC']],
      transaction: 'TX',
    });
    const findAllAsig = ctx.planSubjectRepository.getModel.mock.results[0].value.findAll;
    expect(findAllAsig).toHaveBeenCalledWith({
      where: { planEstudioId: 1, activo: true },
      transaction: 'TX',
    });
  });

  it('plan sin hijos: crea solo el plan destino, userId null por defecto', async () => {
    const ctx = crear();
    await ctx.useCase.execute(1);
    expect(ctx.studyPlanRepository.create).toHaveBeenCalledWith(expect.any(Object), null, { transaction: 'TX' });
    expect(ctx.periodRepository.create).not.toHaveBeenCalled();
    expect(ctx.planSubjectRepository.create).not.toHaveBeenCalled();
    expect(ctx.prerequisiteRepository.create).not.toHaveBeenCalled();
  });

  it('asignatura con periodo no remapeado: advierte y crea con periodId null', async () => {
    const ctx = crear({
      periodos: [{ id: 10, name: 'P1', number: 1, displayOrder: 1 }],
      asignaturas: [{ id: 20, periodId: 999, subjectId: 7, weeklyHours: 4 }],
    });
    await ctx.useCase.execute(1);
    expect(ctx.logger.warn).toHaveBeenCalledWith(
      'Asignatura de plan clonada con periodo no remapeado',
      expect.objectContaining({ asignaturaPlanOrigenId: 20, periodoOrigenId: 999 })
    );
    expect(ctx.planSubjectRepository.create.mock.calls[0][0].periodId).toBeNull();
  });

  it('asignatura sin periodo se clona con periodId null y sin advertencia', async () => {
    const ctx = crear({ asignaturas: [{ id: 20, periodId: null, subjectId: 7, weeklyHours: 4 }] });
    await ctx.useCase.execute(1);
    expect(ctx.planSubjectRepository.create.mock.calls[0][0].periodId).toBeNull();
    expect(ctx.logger.warn).not.toHaveBeenCalled();
  });

  it('omite con advertencia el prerrequisito cuyas asignaturas no se clonaron', async () => {
    const ctx = crear({
      asignaturas: [{ id: 20, periodId: null, subjectId: 7, weeklyHours: 4 }],
      prerrequisitos: [{ id: 30, subjectId: 20, prerequisiteId: 777 }],
    });
    const res = await ctx.useCase.execute(1);
    expect(ctx.prerequisiteRepository.create).not.toHaveBeenCalled();
    expect(ctx.logger.warn).toHaveBeenCalledWith(
      'Prerrequisito omitido al clonar plan: asignatura no remapeada',
      expect.objectContaining({ prerrequisitoOrigenId: 30 })
    );
    expect(res.plan_estudio.id).toBe(500);
    // el resumen cuenta los prerrequisitos leídos, aunque se haya omitido alguno
    expect(ctx.logger.info).toHaveBeenCalledWith(
      'Plan de estudios clonado',
      expect.objectContaining({ prerrequisitos: 1 })
    );
  });

  it('un error al crear dentro de la transacción se propaga y no registra el éxito', async () => {
    const ctx = crear({ periodos: [{ id: 10, name: 'P1', number: 1, displayOrder: 1 }] });
    ctx.periodRepository.create.mockRejectedValue(new Error('db'));
    await expect(ctx.useCase.execute(1)).rejects.toThrow('db');
    expect(ctx.logger.info).not.toHaveBeenCalled();
  });
});
