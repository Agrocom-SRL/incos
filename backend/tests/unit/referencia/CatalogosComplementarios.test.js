import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { CreateDiscapacidadUseCase } from '../../../src/application/use-cases/referencia/CreateDiscapacidadUseCase.js';
import { CreateEstadoCivilUseCase } from '../../../src/application/use-cases/referencia/CreateEstadoCivilUseCase.js';
import { CreateIdiomaUseCase } from '../../../src/application/use-cases/referencia/CreateIdiomaUseCase.js';
import { CreateTipoParentescoUseCase } from '../../../src/application/use-cases/referencia/CreateTipoParentescoUseCase.js';
import { UpdateDiscapacidadUseCase } from '../../../src/application/use-cases/referencia/UpdateDiscapacidadUseCase.js';
import { UpdateEstadoCivilUseCase } from '../../../src/application/use-cases/referencia/UpdateEstadoCivilUseCase.js';
import { UpdateIdiomaUseCase } from '../../../src/application/use-cases/referencia/UpdateIdiomaUseCase.js';
import { UpdateTipoParentescoUseCase } from '../../../src/application/use-cases/referencia/UpdateTipoParentescoUseCase.js';
import { DeleteDiscapacidadUseCase } from '../../../src/application/use-cases/referencia/DeleteDiscapacidadUseCase.js';
import { DeleteEstadoCivilUseCase } from '../../../src/application/use-cases/referencia/DeleteEstadoCivilUseCase.js';
import { DeleteIdiomaUseCase } from '../../../src/application/use-cases/referencia/DeleteIdiomaUseCase.js';
import { DeleteTipoParentescoUseCase } from '../../../src/application/use-cases/referencia/DeleteTipoParentescoUseCase.js';
import { SetEstadoDiscapacidadUseCase } from '../../../src/application/use-cases/referencia/SetEstadoDiscapacidadUseCase.js';
import { SetEstadoEstadoCivilUseCase } from '../../../src/application/use-cases/referencia/SetEstadoEstadoCivilUseCase.js';
import { SetEstadoIdiomaUseCase } from '../../../src/application/use-cases/referencia/SetEstadoIdiomaUseCase.js';
import { SetEstadoTipoParentescoUseCase } from '../../../src/application/use-cases/referencia/SetEstadoTipoParentescoUseCase.js';
import { GetDiscapacidadByIdUseCase } from '../../../src/application/use-cases/referencia/GetDiscapacidadByIdUseCase.js';
import { GetEstadoCivilByIdUseCase } from '../../../src/application/use-cases/referencia/GetEstadoCivilByIdUseCase.js';
import { GetIdiomaByIdUseCase } from '../../../src/application/use-cases/referencia/GetIdiomaByIdUseCase.js';
import { GetTipoParentescoByIdUseCase } from '../../../src/application/use-cases/referencia/GetTipoParentescoByIdUseCase.js';
import { ListDiscapacidadUseCase } from '../../../src/application/use-cases/referencia/ListDiscapacidadUseCase.js';
import { ListEstadosCivilesUseCase } from '../../../src/application/use-cases/referencia/ListEstadosCivilesUseCase.js';
import { ListIdiomasUseCase } from '../../../src/application/use-cases/referencia/ListIdiomasUseCase.js';
import { ListTiposParentescoUseCase } from '../../../src/application/use-cases/referencia/ListTiposParentescoUseCase.js';

// Los 4 catálogos complementarios comparten forma; cada uno difiere en repo, claves y campo extra.
const catalogos = [
  {
    nombre: 'Discapacidad',
    repoKey: 'disabilityTypeRepository',
    resultKey: 'discapacidad',
    extra: ['descripcion', 'description'],
    codigoUso: 'DISCAPACIDAD',
    collection: 'disabilityTypes',
    dataKey: 'discapacidades',
    Create: CreateDiscapacidadUseCase,
    Update: UpdateDiscapacidadUseCase,
    Delete: DeleteDiscapacidadUseCase,
    SetEstado: SetEstadoDiscapacidadUseCase,
    GetById: GetDiscapacidadByIdUseCase,
    List: ListDiscapacidadUseCase,
  },
  {
    nombre: 'EstadoCivil',
    repoKey: 'civilStatusRepository',
    resultKey: 'estadoCivil',
    extra: ['abreviatura', 'abbreviation'],
    codigoUso: 'ESTADO_CIVIL',
    collection: 'civilStatuses',
    dataKey: 'estadosCiviles',
    Create: CreateEstadoCivilUseCase,
    Update: UpdateEstadoCivilUseCase,
    Delete: DeleteEstadoCivilUseCase,
    SetEstado: SetEstadoEstadoCivilUseCase,
    GetById: GetEstadoCivilByIdUseCase,
    List: ListEstadosCivilesUseCase,
  },
  {
    nombre: 'Idioma',
    repoKey: 'languageRepository',
    resultKey: 'idioma',
    extra: ['codigoIso', 'isoCode'],
    codigoUso: 'IDIOMA',
    collection: 'languages',
    dataKey: 'idiomas',
    Create: CreateIdiomaUseCase,
    Update: UpdateIdiomaUseCase,
    Delete: DeleteIdiomaUseCase,
    SetEstado: SetEstadoIdiomaUseCase,
    GetById: GetIdiomaByIdUseCase,
    List: ListIdiomasUseCase,
  },
  {
    nombre: 'TipoParentesco',
    repoKey: 'relationshipTypeRepository',
    resultKey: 'tipoParentesco',
    extra: ['descripcion', 'description'],
    codigoUso: 'PARENTESCO',
    collection: 'relationshipTypes',
    dataKey: 'tiposParentesco',
    Create: CreateTipoParentescoUseCase,
    Update: UpdateTipoParentescoUseCase,
    Delete: DeleteTipoParentescoUseCase,
    SetEstado: SetEstadoTipoParentescoUseCase,
    GetById: GetTipoParentescoByIdUseCase,
    List: ListTiposParentescoUseCase,
  },
];

const nuevoLogger = () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() });

describe.each(catalogos)('Catálogo complementario $nombre', (c) => {
  describe('Create', () => {
    const crear = () => {
      const repo = { create: jest.fn().mockResolvedValue({ id: 7, name: 'X' }) };
      const logger = nuevoLogger();
      return { repo, logger, useCase: new c.Create({ [c.repoKey]: repo, logger }) };
    };

    it('crea con nombre en español, campo extra y activo=true por defecto', async () => {
      const { useCase, repo, logger } = crear();
      const res = await useCase.execute({ nombre: 'X', [c.extra[0]]: 'v' }, 3);
      expect(repo.create).toHaveBeenCalledWith({ name: 'X', [c.extra[1]]: 'v', active: true }, 3);
      expect(res).toEqual({ [c.resultKey]: { id: 7, name: 'X' } });
      expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 7 });
    });

    it('acepta alias en inglés y respeta activo=false', async () => {
      const { useCase, repo } = crear();
      await useCase.execute({ name: 'Y', [c.extra[1]]: 'w', active: false });
      expect(repo.create).toHaveBeenCalledWith({ name: 'Y', [c.extra[1]]: 'w', active: false }, null);
    });

    it.each([[undefined], [{}], [{ nombre: '' }], [{ nombre: null }]])(
      'lanza ValidationError sin nombre (%p) y no crea',
      async (body) => {
        const { useCase, repo } = crear();
        await expect(useCase.execute(body)).rejects.toBeInstanceOf(ValidationError);
        expect(repo.create).not.toHaveBeenCalled();
      }
    );
  });

  describe('Update', () => {
    const crear = (existing = { id: 1 }) => {
      const repo = {
        findById: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockResolvedValue({ id: 1, name: 'N' }),
      };
      const logger = nuevoLogger();
      return { repo, logger, useCase: new c.Update({ [c.repoKey]: repo, logger }) };
    };

    it('actualiza mapeando campos y devuelve la clave de resultado', async () => {
      const { useCase, repo } = crear();
      const res = await useCase.execute(1, { nombre: 'N', activo: false, [c.extra[0]]: 'v' }, 4);
      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(repo.update).toHaveBeenCalledWith(
        1,
        { name: 'N', [c.extra[1]]: 'v', active: false },
        4
      );
      expect(res).toEqual({ [c.resultKey]: { id: 1, name: 'N' } });
    });

    it('con body vacío no envía campos definidos', async () => {
      const { useCase, repo } = crear();
      await useCase.execute(1);
      const [, data, userId] = repo.update.mock.calls[0];
      expect(Object.values(data).every((v) => v === undefined)).toBe(true);
      expect(userId).toBeNull();
    });

    it.each([[99], [NaN]])('lanza NotFoundError si id=%p no existe', async (id) => {
      const { useCase, repo } = crear(null);
      await expect(useCase.execute(id, { nombre: 'N' })).rejects.toBeInstanceOf(NotFoundError);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('Delete', () => {
    const crear = (resultado) => {
      const repo = { delete: jest.fn().mockResolvedValue(resultado) };
      const logger = nuevoLogger();
      return { repo, logger, useCase: new c.Delete({ [c.repoKey]: repo, logger }) };
    };

    it('elimina y registra', async () => {
      const { useCase, repo, logger } = crear(true);
      await expect(useCase.execute(5, 9)).resolves.toBe(true);
      expect(repo.delete).toHaveBeenCalledWith(5, 9);
      expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 5 });
    });

    it('userId es null por defecto', async () => {
      const { useCase, repo } = crear(true);
      await useCase.execute(5);
      expect(repo.delete).toHaveBeenCalledWith(5, null);
    });

    it.each([[99], [NaN]])('lanza NotFoundError si delete devuelve false (id=%p)', async (id) => {
      const { useCase, logger } = crear(false);
      await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('SetEstado', () => {
    const crear = (existing = { id: 2 }) => {
      const repo = {
        findById: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockResolvedValue({ id: 2, name: 'Z', active: false }),
      };
      const logger = nuevoLogger();
      return { repo, logger, useCase: new c.SetEstado({ [c.repoKey]: repo, logger }) };
    };

    it('actualiza solo active y devuelve el ítem en presentación', async () => {
      const { useCase, repo } = crear();
      const res = await useCase.execute(2, false, 8);
      expect(repo.update).toHaveBeenCalledWith(2, { active: false }, 8);
      expect(res[c.resultKey]).toMatchObject({ id: 2, nombre: 'Z', activo: false });
    });

    it.each([[true, true], ['', false], [undefined, false], [1, true]])(
      'normaliza activo=%p a booleano %p',
      async (entrada, esperado) => {
        const { useCase, repo } = crear();
        await useCase.execute(2, entrada);
        expect(repo.update).toHaveBeenCalledWith(2, { active: esperado }, null);
      }
    );

    it.each([[99], [NaN]])('lanza NotFoundError si id=%p no existe', async (id) => {
      const { useCase, repo } = crear(null);
      await expect(useCase.execute(id, true)).rejects.toBeInstanceOf(NotFoundError);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('GetById', () => {
    const crear = (entity, usos = new Map()) => {
      const repo = { findById: jest.fn().mockResolvedValue(entity) };
      const usosRepo = { getUsosByCatalogo: jest.fn().mockResolvedValue(usos) };
      const useCase = new c.GetById({
        [c.repoKey]: repo,
        complementariosUsosViewRepository: usosRepo,
        logger: nuevoLogger(),
      });
      return { repo, usosRepo, useCase };
    };

    it('devuelve el ítem con conteos de uso y busca incluyendo borrados', async () => {
      const usos = new Map([[4, { cantidadEstudiantes: 3, cantidadDocentes: 2, cantidadPersonal: 1 }]]);
      const { useCase, repo, usosRepo } = crear({ id: 4, name: 'A', active: true }, usos);
      const res = await useCase.execute(4);
      expect(repo.findById).toHaveBeenCalledWith(4, { paranoid: false });
      expect(usosRepo.getUsosByCatalogo).toHaveBeenCalledWith(c.codigoUso);
      expect(res).toMatchObject({
        id: 4,
        nombre: 'A',
        activo: true,
        cantidadEstudiantes: 3,
        cantidadDocentes: 2,
        cantidadPersonal: 1,
      });
    });

    it('conteos en 0 si el ítem no tiene uso', async () => {
      const { useCase } = crear({ id: 4, name: 'A', active: true });
      const res = await useCase.execute(4);
      expect(res).toMatchObject({ cantidadEstudiantes: 0, cantidadDocentes: 0, cantidadPersonal: 0 });
    });

    it.each([[99], [NaN]])('lanza NotFoundError y no consulta usos si id=%p no existe', async (id) => {
      const { useCase, usosRepo } = crear(null);
      await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
      expect(usosRepo.getUsosByCatalogo).not.toHaveBeenCalled();
    });
  });

  describe('List', () => {
    const crear = (items = [{ id: 1, name: 'A', active: true }], total = 25) => {
      const repo = { findAll: jest.fn().mockResolvedValue({ [c.collection]: items, total }) };
      const usosRepo = {
        getUsosByCatalogo: jest
          .fn()
          .mockResolvedValue(new Map([[1, { cantidadEstudiantes: 5, cantidadDocentes: 0, cantidadPersonal: 2 }]])),
      };
      const useCase = new c.List({
        [c.repoKey]: repo,
        complementariosUsosViewRepository: usosRepo,
        logger: nuevoLogger(),
      });
      return { repo, usosRepo, useCase };
    };

    it('expone la colección bajo el dataFieldName con paginación y conteos', async () => {
      const { useCase, repo, usosRepo } = crear();
      const res = await useCase.execute({ search: 'a' }, 2, 10);
      expect(repo.findAll).toHaveBeenCalledWith({ search: 'a' }, 2, 10);
      expect(usosRepo.getUsosByCatalogo).toHaveBeenCalledWith(c.codigoUso);
      expect(res).toMatchObject({ total: 25, page: 2, limit: 10, totalPages: 3 });
      expect(res[c.dataKey]).toHaveLength(1);
      expect(res[c.dataKey][0]).toMatchObject({
        id: 1,
        nombre: 'A',
        cantidadEstudiantes: 5,
        cantidadDocentes: 0,
        cantidadPersonal: 2,
      });
    });

    it('page/limit NaN usan los valores por defecto 1 y 50', async () => {
      const { useCase, repo } = crear();
      const res = await useCase.execute({}, NaN, NaN);
      expect(repo.findAll).toHaveBeenCalledWith({}, 1, 50);
      expect(res).toMatchObject({ page: 1, limit: 50 });
    });

    it.each([
      ['true', true],
      [true, true],
      ['false', false],
    ])('incluirInactivos=%p se traduce a includeInactive=%p', async (valor, esperado) => {
      const { useCase, repo } = crear();
      await useCase.execute({ search: 'x' }, 1, 10, { incluirInactivos: valor });
      expect(repo.findAll).toHaveBeenCalledWith({ search: 'x', includeInactive: esperado }, 1, 10);
    });

    it('lista vacía devuelve arreglo vacío y 0 páginas', async () => {
      const { useCase } = crear([], 0);
      const res = await useCase.execute({}, 1, 10);
      expect(res[c.dataKey]).toEqual([]);
      expect(res.totalPages).toBe(0);
    });

    it('propaga y registra el error del repositorio', async () => {
      const { useCase, repo } = crear();
      repo.findAll.mockRejectedValue(new Error('boom'));
      await expect(useCase.execute({}, 1, 10)).rejects.toThrow('boom');
      expect(useCase.logger.error).toHaveBeenCalled();
    });
  });
});
