import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

import { ListPlanesHabilitadosByGestionUseCase } from '../../../src/application/use-cases/oferta/ListPlanesHabilitadosByGestionUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ gestion = { id: 1 }, rows = [] } = {}) => {
  const deps = {
    managementRepository: { findById: jest.fn().mockResolvedValue(gestion) },
    managementPlanRepository: { findPlanesDocenteAsignacionCatalog: jest.fn().mockResolvedValue({ rows }) },
    logger: logger(),
  };
  return { deps, useCase: new ListPlanesHabilitadosByGestionUseCase(deps) };
};

describe('ListPlanesHabilitadosByGestionUseCase', () => {
  it('mapea el catálogo y consulta con página 1 / límite 500', async () => {
    const { deps, useCase } = crear({
      rows: [{ id: 4, gestionId: 1, planEstudioId: 2, estado: 'VIGENTE', planNombre: 'Plan A', carreraId: 6 }],
    });
    const res = await useCase.execute(1);
    expect(deps.managementPlanRepository.findPlanesDocenteAsignacionCatalog).toHaveBeenCalledWith({
      gestionId: 1, page: 1, limit: 500,
    });
    expect(res.planesHabilitados).toEqual([
      {
        id: 4,
gestionId: 1,
planEstudioId: 2,
nombre: null,
estado: 'VIGENTE',
        planNombre: 'Plan A',
planResolucion: null,
planVigente: null,
        carreraId: 6,
carreraNombre: null,
carreraCodigo: null,
      },
    ]);
  });

  it('devuelve lista vacía si el catálogo no trae filas', async () => {
    const { useCase } = crear({ rows: undefined });
    expect(await useCase.execute(1)).toEqual({ planesHabilitados: [] });
  });

  it.each([99, NaN])('NotFoundError si la gestión no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ gestion: null });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.managementPlanRepository.findPlanesDocenteAsignacionCatalog).not.toHaveBeenCalled();
  });
});
