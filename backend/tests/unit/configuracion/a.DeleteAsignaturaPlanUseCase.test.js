import { describe, it, expect, jest } from '@jest/globals';
import { DeleteAsignaturaPlanUseCase } from '../../../src/application/use-cases/configuracion/DeleteAsignaturaPlanUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('DeleteAsignaturaPlanUseCase', () => {
  const crear = (resultado) => {
    const planSubjectRepository = { delete: jest.fn().mockResolvedValue(resultado) };
    const logger = { info: jest.fn() };
    return {
      planSubjectRepository,
      logger,
      useCase: new DeleteAsignaturaPlanUseCase({ planSubjectRepository, logger }),
    };
  };

  it('elimina y devuelve true', async () => {
    const { useCase, planSubjectRepository } = crear(true);
    await expect(useCase.execute(5, 9)).resolves.toBe(true);
    expect(planSubjectRepository.delete).toHaveBeenCalledWith(5, 9);
  });

  it('usa userId null por defecto', async () => {
    const { useCase, planSubjectRepository } = crear(true);
    await useCase.execute(5);
    expect(planSubjectRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el repositorio no elimina nada', async () => {
    const { useCase, logger } = crear(false);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico sin llamar al repositorio', async () => {
    const { useCase, planSubjectRepository } = crear(true);
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(ValidationError);
    expect(planSubjectRepository.delete).not.toHaveBeenCalled();
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, planSubjectRepository } = crear(true);
    planSubjectRepository.delete.mockRejectedValue(new Error('fk'));
    await expect(useCase.execute(1)).rejects.toThrow('fk');
  });
});

describe('DeleteAsignaturaPlanUseCase con referencias', () => {
  const crear = ({ comoAsignatura = 0, comoPrerrequisito = 0 } = {}) => {
    const planSubjectRepository = { delete: jest.fn().mockResolvedValue(true) };
    const prerequisiteRepository = {
      count: jest.fn().mockImplementation(async (f) => (f.subjectId ? comoAsignatura : comoPrerrequisito)),
    };
    const logger = { info: jest.fn() };
    return {
      planSubjectRepository,
      prerequisiteRepository,
      logger,
      useCase: new DeleteAsignaturaPlanUseCase({ planSubjectRepository, prerequisiteRepository, logger }),
    };
  };

  it.each([[{ comoAsignatura: 1 }], [{ comoPrerrequisito: 1 }]])('rechaza si tiene prerrequisitos %p', async (refs) => {
    const { useCase, planSubjectRepository } = crear(refs);
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(ValidationError);
    expect(planSubjectRepository.delete).not.toHaveBeenCalled();
  });

  it('borra y registra el log si no hay referencias', async () => {
    const { useCase, logger } = crear();
    await expect(useCase.execute(4)).resolves.toBe(true);
    expect(logger.info).toHaveBeenCalledWith('Asignatura del plan eliminada', { id: 4 });
  });
});
