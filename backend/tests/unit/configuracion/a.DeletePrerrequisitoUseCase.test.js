import { describe, it, expect, jest } from '@jest/globals';
import { DeletePrerrequisitoUseCase } from '../../../src/application/use-cases/configuracion/DeletePrerrequisitoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeletePrerrequisitoUseCase', () => {
  const crear = (resultado) => {
    const prerequisiteRepository = { delete: jest.fn().mockResolvedValue(resultado) };
    const logger = { info: jest.fn() };
    return {
      prerequisiteRepository,
      logger,
      useCase: new DeletePrerrequisitoUseCase({ prerequisiteRepository, logger }),
    };
  };

  it('elimina y devuelve true', async () => {
    const { useCase, prerequisiteRepository } = crear(true);
    await expect(useCase.execute(5, 9)).resolves.toBe(true);
    expect(prerequisiteRepository.delete).toHaveBeenCalledWith(5, 9);
  });

  it('usa userId null por defecto', async () => {
    const { useCase, prerequisiteRepository } = crear(true);
    await useCase.execute(5);
    expect(prerequisiteRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { useCase, logger } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico sin llamar al repositorio', async () => {
    const { useCase, prerequisiteRepository } = crear(true);
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(ValidationError);
    expect(prerequisiteRepository.delete).not.toHaveBeenCalled();
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, prerequisiteRepository } = crear(true);
    prerequisiteRepository.delete.mockRejectedValue(new Error('fk'));
    await expect(useCase.execute(1)).rejects.toThrow('fk');
  });
});

describe('DeletePrerrequisitoUseCase log', () => {
  it('registra el log al eliminar', async () => {
    const prerequisiteRepository = { delete: jest.fn().mockResolvedValue(true) };
    const logger = { info: jest.fn() };
    await new DeletePrerrequisitoUseCase({ prerequisiteRepository, logger }).execute(3, 1);
    expect(logger.info).toHaveBeenCalledWith('Prerrequisito eliminado', { id: 3 });
  });
});
