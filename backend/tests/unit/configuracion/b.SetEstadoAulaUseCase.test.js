import { describe, it, expect, jest } from '@jest/globals';
import { SetEstadoAulaUseCase } from '../../../src/application/use-cases/configuracion/SetEstadoAulaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('SetEstadoAulaUseCase', () => {
  const crear = ({ existing = { id: 7 }, updated = { id: 7, active: true } } = {}) => {
    const classroomRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    const logger = { info: jest.fn() };
    return { classroomRepository, logger, useCase: new SetEstadoAulaUseCase({ classroomRepository, logger }) };
  };

  it('actualiza solo el campo active y devuelve la presentación bajo "aula"', async () => {
    const { useCase, classroomRepository, logger } = crear({ updated: { id: 7, active: false } });
    const res = await useCase.execute(7, false, 4);
    expect(classroomRepository.findById).toHaveBeenCalledWith(7);
    expect(classroomRepository.update).toHaveBeenCalledWith(7, { active: false }, 4);
    expect(res.aula).toMatchObject({ id: 7, activo: false });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 7, activo: false });
  });

  it('reactiva (true) y usa userId null por defecto', async () => {
    const { useCase, classroomRepository } = crear();
    const res = await useCase.execute(7, true);
    expect(classroomRepository.update).toHaveBeenCalledWith(7, { active: true }, null);
    expect(res.aula.activo).toBe(true);
  });

  it('coacciona 0 y 1 a boolean', async () => {
    const { useCase, classroomRepository } = crear();
    await useCase.execute(7, 0);
    expect(classroomRepository.update).toHaveBeenLastCalledWith(7, { active: false }, null);
    await useCase.execute(7, 1);
    expect(classroomRepository.update).toHaveBeenLastCalledWith(7, { active: true }, null);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, classroomRepository, logger } = crear({ existing: null });
    await expect(useCase.execute(99, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(classroomRepository.update).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio al actualizar', async () => {
    const { useCase, classroomRepository } = crear();
    classroomRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(7, true)).rejects.toThrow('db');
  });
});
