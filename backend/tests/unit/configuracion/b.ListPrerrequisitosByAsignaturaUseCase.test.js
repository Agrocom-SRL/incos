import { describe, it, expect, jest } from '@jest/globals';
import { ListPrerrequisitosByAsignaturaUseCase } from '../../../src/application/use-cases/configuracion/ListPrerrequisitosByAsignaturaUseCase.js';

describe('ListPrerrequisitosByAsignaturaUseCase', () => {
  const crear = (result) => {
    const prerequisiteRepository = { findAll: jest.fn().mockResolvedValue(result) };
    return { prerequisiteRepository, useCase: new ListPrerrequisitosByAsignaturaUseCase({ prerequisiteRepository, logger: { info: jest.fn() } }) };
  };

  it('consulta por subjectId sin paginación y devuelve { prerrequisitos } mapeado', async () => {
    const { useCase, prerequisiteRepository } = crear({ prerequisites: [{ id: 1, subjectId: 2, prerequisiteId: 3 }] });
    const res = await useCase.execute(2);
    expect(prerequisiteRepository.findAll).toHaveBeenCalledWith({ subjectId: 2 }, null, null);
    expect(res.prerrequisitos).toEqual([{ id: 1, asignatura_id: 2, prerrequisito_id: 3 }]);
  });

  it('devuelve lista vacía si el repositorio no trae la colección', async () => {
    const { useCase } = crear({});
    await expect(useCase.execute(2)).resolves.toEqual({ prerrequisitos: [] });
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, prerequisiteRepository } = crear({});
    prerequisiteRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(2)).rejects.toThrow('db');
  });
});
