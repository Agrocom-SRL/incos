import { describe, it, expect, jest } from '@jest/globals';
import { ListPaisesUseCase } from '../../../src/application/use-cases/geograficos/ListPaisesUseCase.js';
import { ListDepartamentosUseCase } from '../../../src/application/use-cases/geograficos/ListDepartamentosUseCase.js';
import { ListProvinciasUseCase } from '../../../src/application/use-cases/geograficos/ListProvinciasUseCase.js';
import { ListMunicipiosUseCase } from '../../../src/application/use-cases/geograficos/ListMunicipiosUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

const familias = [
  { nombre: 'Paises', UseCase: ListPaisesUseCase, repoKey: 'countryRepository', collection: 'countries', dataKey: 'paises' },
  { nombre: 'Departamentos', UseCase: ListDepartamentosUseCase, repoKey: 'departmentRepository', collection: 'departments', dataKey: 'departamentos' },
  { nombre: 'Provincias', UseCase: ListProvinciasUseCase, repoKey: 'provinceRepository', collection: 'provinces', dataKey: 'provincias', filtro: ['departamentoId', 'departmentId'] },
  { nombre: 'Municipios', UseCase: ListMunicipiosUseCase, repoKey: 'municipalityRepository', collection: 'municipalities', dataKey: 'municipios', filtro: ['provinciaId', 'provinceId'] },
];

describe.each(familias)('List$nombre', (f) => {
  const crear = (items = [{ id: 1, name: 'Bolivia' }], total = 3) => {
    const repo = { findAll: jest.fn().mockResolvedValue({ [f.collection]: items, total }) };
    const logger = { info: jest.fn(), error: jest.fn() };
    return { repo, logger, useCase: new f.UseCase({ [f.repoKey]: repo, logger }) };
  };

  it('lista con el dataFieldName esperado y paginación', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute({ search: 'b' }, 1, 2);
    expect(repo.findAll).toHaveBeenCalledWith({ search: 'b' }, 1, 2);
    expect(res[f.dataKey]).toHaveLength(1);
    expect(res[f.dataKey][0]).toMatchObject({ id: 1, nombre: 'Bolivia' });
    expect(res).toMatchObject({ total: 3, page: 1, limit: 2, totalPages: 2 });
  });

  it('page/limit NaN caen a 1 y 50', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({}, NaN, NaN);
    expect(repo.findAll).toHaveBeenCalledWith({}, 1, 50);
  });

  it('colección ausente en el resultado devuelve arreglo vacío', async () => {
    const { useCase, repo } = crear();
    repo.findAll.mockResolvedValue({ total: 0 });
    const res = await useCase.execute({}, 1, 10);
    expect(res[f.dataKey]).toEqual([]);
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, repo, logger } = crear();
    repo.findAll.mockRejectedValue(new Error('fallo'));
    await expect(useCase.execute({}, 1, 10)).rejects.toThrow('fallo');
    expect(logger.error).toHaveBeenCalled();
  });

  if (f.filtro) {
    const [param, dominio] = f.filtro;

    it(`traduce ${param} a ${dominio} numérico`, async () => {
      const { useCase, repo } = crear();
      await useCase.execute({ search: 'x' }, 1, 10, { [param]: '4' });
      expect(repo.findAll).toHaveBeenCalledWith({ search: 'x', [dominio]: 4 }, 1, 10);
    });

    it(`ignora ${param} vacío`, async () => {
      const { useCase, repo } = crear();
      await useCase.execute({}, 1, 10, { [param]: '' });
      expect(repo.findAll).toHaveBeenCalledWith({}, 1, 10);
    });
  }
});

describe('Filtros geográficos no numéricos', () => {
  it.each([
    [ListProvinciasUseCase, 'provinceRepository', 'departamentoId'],
    [ListMunicipiosUseCase, 'municipalityRepository', 'provinciaId'],
  ])('%p rechaza %s inválido con ValidationError', (UseCase, repoKey, param) => {
    const useCase = new UseCase({ [repoKey]: {}, logger: { info: jest.fn() } });
    for (const valor of ['abc', '3x', '0', '-1']) {
      expect(() => useCase.buildSpecificFilters({ [param]: valor }, {})).toThrow(ValidationError);
    }
    expect(useCase.buildSpecificFilters({ [param]: '' }, { search: 's' })).toEqual({ search: 's' });
  });
});
