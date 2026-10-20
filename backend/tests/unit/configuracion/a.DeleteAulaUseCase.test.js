import { describe, it, expect, jest } from '@jest/globals';
import { DeleteAulaUseCase } from '../../../src/application/use-cases/configuracion/DeleteAulaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteAulaUseCase', () => {
  const crear = (resultado) => {
    const classroomRepository = { delete: jest.fn().mockResolvedValue(resultado) };
    const logger = { info: jest.fn() };
    return { classroomRepository, logger, useCase: new DeleteAulaUseCase({ classroomRepository, logger }) };
  };

  it('elimina y devuelve true', async () => {
    const { useCase, classroomRepository } = crear(true);
    await expect(useCase.execute(5, 9)).resolves.toBe(true);
    expect(classroomRepository.delete).toHaveBeenCalledWith(5, 9);
  });

  it('usa userId null por defecto', async () => {
    const { useCase, classroomRepository } = crear(true);
    await useCase.execute(5);
    expect(classroomRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { useCase, logger } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('con id no numérico (NaN) delega al repositorio y respeta su resultado', async () => {
    const { useCase, classroomRepository } = crear(false);
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(NotFoundError);
    expect(classroomRepository.delete).toHaveBeenCalledWith(NaN, null);
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, classroomRepository } = crear(true);
    classroomRepository.delete.mockRejectedValue(new Error('fk'));
    await expect(useCase.execute(1)).rejects.toThrow('fk');
  });
});
