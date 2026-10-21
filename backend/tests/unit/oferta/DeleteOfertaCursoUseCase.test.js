import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

import { DeleteOfertaCursoUseCase } from '../../../src/application/use-cases/oferta/DeleteOfertaCursoUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ offer = { id: 4 }, matriculas = 0, deps: dependencias = { asignaciones: 0, bloques: 0 } } = {}) => {
  const deps = {
    courseOfferRepository: {
      findById: jest.fn().mockResolvedValue(offer),
      countActiveEnrollmentsByOfferId: jest.fn().mockResolvedValue(matriculas),
      countDependenciasByOfferId: jest.fn().mockResolvedValue(dependencias),
      delete: jest.fn().mockResolvedValue(true),
    },
    logger: logger(),
  };
  return { deps, useCase: new DeleteOfertaCursoUseCase(deps) };
};

describe('DeleteOfertaCursoUseCase', () => {
  it('elimina una oferta sin matrículas activas', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(4, 8);
    expect(deps.courseOfferRepository.countActiveEnrollmentsByOfferId).toHaveBeenCalledWith(4);
    expect(deps.courseOfferRepository.delete).toHaveBeenCalledWith(4, 8);
    expect(res).toEqual({ eliminado: true, id: 4 });
  });

  it('NotFoundError si la oferta no existe (incluye id NaN)', async () => {
    const { deps, useCase } = crear({ offer: null });
    await expect(useCase.execute(NaN)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.delete).not.toHaveBeenCalled();
  });

  it.each([[{ asignaciones: 1, bloques: 0 }], [{ asignaciones: 2, bloques: 5 }]])(
    'rechaza eliminar con asignaciones docentes o bloques (%j) y no borra',
    async (dependencias) => {
      const { deps, useCase } = crear({ deps: dependencias });
      await expect(useCase.execute(4)).rejects.toBeInstanceOf(ValidationError);
      expect(deps.courseOfferRepository.delete).not.toHaveBeenCalled();
    }
  );

  it('rechaza eliminar si hay matrículas activas', async () => {
    const { deps, useCase } = crear({ matriculas: 3 });
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.courseOfferRepository.delete).not.toHaveBeenCalled();
  });
});
