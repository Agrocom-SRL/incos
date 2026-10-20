import { describe, it, expect, jest } from '@jest/globals';
import { MarcarPlanEstudiosVigenteUseCase } from '../../../src/application/use-cases/configuracion/MarcarPlanEstudiosVigenteUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('MarcarPlanEstudiosVigenteUseCase', () => {
  const crear = ({ plan = { id: 5, careerId: 2 } } = {}) => {
    const Model = { update: jest.fn().mockResolvedValue([3]) };
    const studyPlanRepository = {
      findById: jest.fn().mockResolvedValue(plan),
      getModel: jest.fn().mockReturnValue(Model),
      update: jest.fn().mockResolvedValue({ id: 5, isActive: true }),
    };
    const logger = { info: jest.fn() };
    return { Model, studyPlanRepository, logger, useCase: new MarcarPlanEstudiosVigenteUseCase({ studyPlanRepository, logger }) };
  };

  it('desmarca los planes de la carrera y marca el plan como vigente', async () => {
    const { useCase, Model, studyPlanRepository, logger } = crear();
    const res = await useCase.execute(5, 8);
    expect(Model.update).toHaveBeenCalledWith({ vigente: false, updatedBy: 8 }, { where: { carreraId: 2 } });
    expect(studyPlanRepository.update).toHaveBeenCalledWith(5, { isActive: true }, 8);
    expect(res).toEqual({ plan_estudio: { id: 5, isActive: true } });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 5, carreraId: 2 });
  });

  it('desmarca antes de marcar (orden)', async () => {
    const { useCase, Model, studyPlanRepository } = crear();
    await useCase.execute(5);
    expect(Model.update.mock.invocationCallOrder[0]).toBeLessThan(studyPlanRepository.update.mock.invocationCallOrder[0]);
    expect(Model.update).toHaveBeenCalledWith({ vigente: false, updatedBy: null }, { where: { carreraId: 2 } });
  });

  it('lanza NotFoundError si el plan no existe y no modifica nada', async () => {
    const { useCase, Model, studyPlanRepository } = crear({ plan: null });
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(studyPlanRepository.getModel).not.toHaveBeenCalled();
    expect(Model.update).not.toHaveBeenCalled();
    expect(studyPlanRepository.update).not.toHaveBeenCalled();
  });
});
