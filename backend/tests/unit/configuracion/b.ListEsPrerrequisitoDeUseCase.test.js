import { describe, it, expect, jest } from '@jest/globals';
import { ListEsPrerrequisitoDeUseCase } from '../../../src/application/use-cases/configuracion/ListEsPrerrequisitoDeUseCase.js';

describe('ListEsPrerrequisitoDeUseCase', () => {
  const crear = (result) => {
    const prerequisiteRepository = { findAll: jest.fn().mockResolvedValue(result) };
    return { prerequisiteRepository, useCase: new ListEsPrerrequisitoDeUseCase({ prerequisiteRepository, logger: { info: jest.fn() } }) };
  };

  it('consulta por prerequisiteId sin paginación y devuelve { es_prerrequisito_de } mapeado', async () => {
    const { useCase, prerequisiteRepository } = crear({ prerequisites: [{ id: 1, subjectId: 2, prerequisiteId: 8 }] });
    const res = await useCase.execute(8);
    expect(prerequisiteRepository.findAll).toHaveBeenCalledWith({ prerequisiteId: 8 }, null, null);
    expect(res.es_prerrequisito_de).toEqual([{ id: 1, asignatura_id: 2, prerrequisito_id: 8 }]);
  });

  it('devuelve lista vacía si el repositorio no trae la colección', async () => {
    const { useCase } = crear({});
    await expect(useCase.execute(8)).resolves.toEqual({ es_prerrequisito_de: [] });
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, prerequisiteRepository } = crear({});
    prerequisiteRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(8)).rejects.toThrow('db');
  });
});
