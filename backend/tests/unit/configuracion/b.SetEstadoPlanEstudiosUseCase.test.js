import { describe, it, expect, jest } from '@jest/globals';
import { SetEstadoPlanEstudiosUseCase } from '../../../src/application/use-cases/configuracion/SetEstadoPlanEstudiosUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoPlanEstudiosUseCase', () => {
  const crear = ({ existing = { id: 7 }, updated = { id: 7, active: true } } = {}) => {
    const studyPlanRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    const logger = { info: jest.fn() };
    return { studyPlanRepository, logger, useCase: new SetEstadoPlanEstudiosUseCase({ studyPlanRepository, logger }) };
  };

  it('actualiza solo el campo active y devuelve la presentación bajo "plan_estudio"', async () => {
    const { useCase, studyPlanRepository, logger } = crear({ updated: { id: 7, active: false } });
    const res = await useCase.execute(7, false, 4);
    expect(studyPlanRepository.findById).toHaveBeenCalledWith(7);
    expect(studyPlanRepository.update).toHaveBeenCalledWith(7, { active: false }, 4);
    expect(res.plan_estudio).toMatchObject({ id: 7, activo: false });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 7, activo: false });
  });

  it('reactiva (true) y usa userId null por defecto', async () => {
    const { useCase, studyPlanRepository } = crear();
    const res = await useCase.execute(7, true);
    expect(studyPlanRepository.update).toHaveBeenCalledWith(7, { active: true }, null);
    expect(res.plan_estudio.activo).toBe(true);
  });

  it('coacciona 0 y 1 a boolean', async () => {
    const { useCase, studyPlanRepository } = crear();
    await useCase.execute(7, 0);
    expect(studyPlanRepository.update).toHaveBeenLastCalledWith(7, { active: false }, null);
    await useCase.execute(7, 1);
    expect(studyPlanRepository.update).toHaveBeenLastCalledWith(7, { active: true }, null);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, studyPlanRepository, logger } = crear({ existing: null });
    await expect(useCase.execute(99, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(studyPlanRepository.update).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio al actualizar', async () => {
    const { useCase, studyPlanRepository } = crear();
    studyPlanRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(7, true)).rejects.toThrow('db');
  });
});
