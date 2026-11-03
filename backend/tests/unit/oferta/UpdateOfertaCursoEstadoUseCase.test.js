import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

import { UpdateOfertaCursoEstadoUseCase } from '../../../src/application/use-cases/oferta/UpdateOfertaCursoEstadoUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ offer = { id: 4, state: 'PROGRAMADA' } } = {}) => {
  const deps = {
    courseOfferRepository: {
      findById: jest.fn().mockResolvedValue(offer),
      update: jest.fn().mockResolvedValue({ id: 4, state: 'ACTIVA' }),
    },
    logger: logger(),
  };
  return { deps, useCase: new UpdateOfertaCursoEstadoUseCase(deps) };
};

describe('UpdateOfertaCursoEstadoUseCase', () => {
  it.each([
    ['PROGRAMADA', 'ACTIVA'], ['PROGRAMADA', 'CANCELADA'],
    ['ACTIVA', 'CERRADA'], ['ACTIVA', 'CANCELADA'],
  ])('permite %s -> %s', async (desde, estado) => {
    const { deps, useCase } = crear({ offer: { id: 4, state: desde } });
    const res = await useCase.execute(4, { estado }, 2);
    expect(deps.courseOfferRepository.update).toHaveBeenCalledWith(4, { state: estado }, 2);
    expect(res.ofertaCurso).toMatchObject({ id: 4, estado: 'ACTIVA' });
  });

  it.each([
    ['PROGRAMADA', 'CERRADA'], ['ACTIVA', 'PROGRAMADA'], ['CERRADA', 'ACTIVA'],
    ['CERRADA', 'CANCELADA'], ['CANCELADA', 'PROGRAMADA'], ['CANCELADA', 'ACTIVA'],
  ])('rechaza %s -> %s', async (desde, estado) => {
    const { deps, useCase } = crear({ offer: { id: 4, state: desde } });
    await expect(useCase.execute(4, { estado })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.courseOfferRepository.update).not.toHaveBeenCalled();
  });

  it.each([undefined, null, '', 'OFERTADO', 'activa'])('rechaza estado inválido %p', async (estado) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(4, { estado })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.courseOfferRepository.findById).not.toHaveBeenCalled();
  });

  it.each([99, NaN])('NotFoundError si la oferta no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ offer: null });
    await expect(useCase.execute(id, { estado: 'ACTIVA' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.update).not.toHaveBeenCalled();
  });
});
