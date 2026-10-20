import { describe, it, expect, jest } from '@jest/globals';
import { DeleteMateriaUseCase } from '../../../src/application/use-cases/configuracion/DeleteMateriaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteMateriaUseCase', () => {
  const crear = (resultado) => {
    const subjectRepository = { delete: jest.fn().mockResolvedValue(resultado) };
    const logger = { info: jest.fn() };
    return { subjectRepository, logger, useCase: new DeleteMateriaUseCase({ subjectRepository, logger }) };
  };

  it('elimina y devuelve true', async () => {
    const { useCase, subjectRepository } = crear(true);
    await expect(useCase.execute(5, 9)).resolves.toBe(true);
    expect(subjectRepository.delete).toHaveBeenCalledWith(5, 9);
  });

  it('usa userId null por defecto', async () => {
    const { useCase, subjectRepository } = crear(true);
    await useCase.execute(5);
    expect(subjectRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { useCase, logger } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('con id no numérico (NaN) delega al repositorio y respeta su resultado', async () => {
    const { useCase, subjectRepository } = crear(false);
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(NotFoundError);
    expect(subjectRepository.delete).toHaveBeenCalledWith(NaN, null);
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, subjectRepository } = crear(true);
    subjectRepository.delete.mockRejectedValue(new Error('fk'));
    await expect(useCase.execute(1)).rejects.toThrow('fk');
  });
});
