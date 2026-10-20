import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { GenerarParalelosGestionUseCase } = await import('../../../src/application/use-cases/oferta/GenerarParalelosGestionUseCase.js');

const crear = ({
  gestionPlan = { id: 1, studyPlanId: 2 },
  planRow = { carreraId: 9 },
  maestros = [{ id: 10, shift: 'MAÑANA' }, { id: 11, shift: 'TARDE' }],
  existing = [],
} = {}) => {
  let n = 100;
  const deps = {
    managementPlanRepository: { findById: jest.fn().mockResolvedValue(gestionPlan) },
    studyPlanRepository: { getModel: () => ({ findByPk: jest.fn().mockResolvedValue(planRow) }) },
    parallelRepository: { findAll: jest.fn().mockResolvedValue({ parallels: maestros }) },
    parallelManagementRepository: {
      findExistingParallelIds: jest.fn().mockResolvedValue(existing),
      create: jest.fn(async (data) => ({ id: n++, ...data })),
    },
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  };
  return { deps, useCase: new GenerarParalelosGestionUseCase(deps) };
};

describe('GenerarParalelosGestionUseCase', () => {
  beforeEach(() => mockTransaction.mockClear());

  it('crea un paralelo-gestión BORRADOR por paralelo maestro de la carrera', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(1, 5);
    expect(deps.parallelRepository.findAll).toHaveBeenCalledWith({ careerId: 9, pagina: 1, limite: 500 });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(deps.parallelManagementRepository.create).toHaveBeenCalledWith(
      {
        managementPlanId: 1,
parallelId: 10,
classroomId: null,
shift: 'MAÑANA',
        state: 'BORRADOR',
maxCapacity: 35,
minCapacity: 10,
      },
      5
    );
    expect(res.resumen).toEqual({ creados: 2, existentes: 0, totalMaestros: 2 });
    expect(res.paralelosGestion).toHaveLength(2);
  });

  it('omite paralelos ya generados (idempotente)', async () => {
    const { deps, useCase } = crear({ existing: [10] });
    const res = await useCase.execute(1);
    expect(deps.parallelManagementRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.parallelManagementRepository.create.mock.calls[0][0].parallelId).toBe(11);
    expect(res.resumen).toEqual({ creados: 1, existentes: 1, totalMaestros: 2 });
  });

  it.each([99, NaN])('NotFoundError si el plan habilitado no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ gestionPlan: null });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.parallelRepository.findAll).not.toHaveBeenCalled();
  });

  it('ValidationError si el plan habilitado no tiene plan de estudios', async () => {
    const { useCase } = crear({ gestionPlan: { id: 1, studyPlanId: null } });
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([[null], [{ carreraId: null }]])('ValidationError si no se resuelve la carrera (%j)', async (planRow) => {
    const { deps, useCase } = crear({ planRow });
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelRepository.findAll).not.toHaveBeenCalled();
  });

  it.each([[[]]])('ValidationError si la carrera no tiene paralelos maestros (%p)', async (maestros) => {
    const { deps, useCase } = crear({ maestros });
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.parallelManagementRepository.create).not.toHaveBeenCalled();
  });
});
