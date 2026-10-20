import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

import { ListOfertaCursosByParaleloGestionUseCase } from '../../../src/application/use-cases/oferta/ListOfertaCursosByParaleloGestionUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ pg = { id: 3 }, rows = [] } = {}) => {
  const deps = {
    parallelManagementRepository: { findById: jest.fn().mockResolvedValue(pg) },
    courseOfferRepository: { findEnrichedByParallelManagementId: jest.fn().mockResolvedValue(rows) },
    logger: logger(),
  };
  return { deps, useCase: new ListOfertaCursosByParaleloGestionUseCase(deps) };
};

describe('ListOfertaCursosByParaleloGestionUseCase', () => {
  it('lista la oferta enriquecida bajo ofertaCursos', async () => {
    const { deps, useCase } = crear({
      rows: [{ id: 1, paraleloGestionId: 3, asignaturaPlanId: 5, estado: 'PROGRAMADA', horasSemanales: '4', docenteId: null }],
    });
    const res = await useCase.execute(3);
    expect(deps.courseOfferRepository.findEnrichedByParallelManagementId).toHaveBeenCalledWith(3);
    expect(res.ofertaCursos).toHaveLength(1);
    expect(res.ofertaCursos[0]).toMatchObject({ id: 1, horasSemanales: 4, docenteId: null, asignacionDocenteId: null });
  });

  it('devuelve lista vacía si el paralelo no tiene oferta', async () => {
    const { useCase } = crear({ rows: null });
    expect(await useCase.execute(3)).toEqual({ ofertaCursos: [] });
  });

  it.each([99, NaN])('NotFoundError si el paralelo no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ pg: null });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.findEnrichedByParallelManagementId).not.toHaveBeenCalled();
  });
});
