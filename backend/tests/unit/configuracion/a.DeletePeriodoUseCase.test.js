import { describe, it, expect, jest } from '@jest/globals';
import { DeletePeriodoUseCase } from '../../../src/application/use-cases/configuracion/DeletePeriodoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeletePeriodoUseCase', () => {
  const crear = (resultado) => {
    const periodRepository = { delete: jest.fn().mockResolvedValue(resultado) };
    const logger = { info: jest.fn() };
    return { periodRepository, logger, useCase: new DeletePeriodoUseCase({ periodRepository, logger }) };
  };

  it('elimina y devuelve true', async () => {
    const { useCase, periodRepository } = crear(true);
    await expect(useCase.execute(5, 9)).resolves.toBe(true);
    expect(periodRepository.delete).toHaveBeenCalledWith(5, 9);
  });

  it('usa userId null por defecto', async () => {
    const { useCase, periodRepository } = crear(true);
    await useCase.execute(5);
    expect(periodRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { useCase, logger } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico sin llamar al repositorio', async () => {
    const { useCase, periodRepository } = crear(true);
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(ValidationError);
    expect(periodRepository.delete).not.toHaveBeenCalled();
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, periodRepository } = crear(true);
    periodRepository.delete.mockRejectedValue(new Error('fk'));
    await expect(useCase.execute(1)).rejects.toThrow('fk');
  });
});

describe('DeletePeriodoUseCase con referencias', () => {
  const crear = (refs) => {
    const periodRepository = { delete: jest.fn().mockResolvedValue(true) };
    const planSubjectRepository = { count: jest.fn().mockResolvedValue(refs) };
    const logger = { info: jest.fn() };
    return {
      periodRepository,
      planSubjectRepository,
      logger,
      useCase: new DeletePeriodoUseCase({ periodRepository, planSubjectRepository, logger }),
    };
  };

  it('rechaza borrar un periodo con asignaturas del plan', async () => {
    const { useCase, periodRepository, planSubjectRepository } = crear(2);
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(ValidationError);
    expect(planSubjectRepository.count).toHaveBeenCalledWith({ periodId: 5 });
    expect(periodRepository.delete).not.toHaveBeenCalled();
  });

  it('borra y registra el log si no hay referencias', async () => {
    const { useCase, logger } = crear(0);
    await expect(useCase.execute('5', 9)).resolves.toBe(true);
    expect(logger.info).toHaveBeenCalledWith('Periodo eliminado', { id: 5 });
  });
});
