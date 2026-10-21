import { jest } from '@jest/globals';
import { DeleteCarreraUseCase } from '../../../src/application/use-cases/configuracion/DeleteCarreraUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteCarreraUseCase', () => {
  const crear = (deleteResult) => {
    const careerRepository = { delete: jest.fn().mockResolvedValue(deleteResult) };
    const logger = { info: jest.fn() };
    return { careerRepository, logger, useCase: new DeleteCarreraUseCase({ careerRepository, logger }) };
  };

  it('elimina y registra en el log', async () => {
    const { useCase, careerRepository, logger } = crear(true);
    await expect(useCase.execute(5, 9)).resolves.toBe(true);
    expect(careerRepository.delete).toHaveBeenCalledWith(5, 9);
    expect(logger.info).toHaveBeenCalledWith('Carrera eliminada', { id: 5 });
  });

  it('usa userId null por defecto', async () => {
    const { useCase, careerRepository } = crear(true);
    await useCase.execute(5);
    expect(careerRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { useCase, logger } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });
});
