import { describe, it, expect, jest } from '@jest/globals';
import { SetEstadoTipoEvaluacionUseCase } from '../../../src/application/use-cases/configuracion/SetEstadoTipoEvaluacionUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoTipoEvaluacionUseCase', () => {
  const crear = ({ existing = { id: 7 }, updated = { id: 7, active: true } } = {}) => {
    const evaluationTypeRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    const logger = { info: jest.fn() };
    return { evaluationTypeRepository, logger, useCase: new SetEstadoTipoEvaluacionUseCase({ evaluationTypeRepository, logger }) };
  };

  it('actualiza solo el campo active y devuelve la presentación bajo "tipoEvaluacion"', async () => {
    const { useCase, evaluationTypeRepository, logger } = crear({ updated: { id: 7, active: false } });
    const res = await useCase.execute(7, false, 4);
    expect(evaluationTypeRepository.findById).toHaveBeenCalledWith(7);
    expect(evaluationTypeRepository.update).toHaveBeenCalledWith(7, { active: false }, 4);
    expect(res.tipoEvaluacion).toMatchObject({ id: 7, activo: false });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 7, activo: false });
  });

  it('reactiva (true) y usa userId null por defecto', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    const res = await useCase.execute(7, true);
    expect(evaluationTypeRepository.update).toHaveBeenCalledWith(7, { active: true }, null);
    expect(res.tipoEvaluacion.activo).toBe(true);
  });

  it('coacciona 0 y 1 a boolean', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    await useCase.execute(7, 0);
    expect(evaluationTypeRepository.update).toHaveBeenLastCalledWith(7, { active: false }, null);
    await useCase.execute(7, 1);
    expect(evaluationTypeRepository.update).toHaveBeenLastCalledWith(7, { active: true }, null);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, evaluationTypeRepository, logger } = crear({ existing: null });
    await expect(useCase.execute(99, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(evaluationTypeRepository.update).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio al actualizar', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    evaluationTypeRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(7, true)).rejects.toThrow('db');
  });
});
