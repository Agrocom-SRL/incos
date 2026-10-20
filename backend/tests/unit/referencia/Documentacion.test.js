import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { TIPOS_DOCUMENTO_SISTEMA_VALUES } from '../../../src/domain/constants/index.js';
import { CreateDocumentacionUseCase } from '../../../src/application/use-cases/referencia/CreateDocumentacionUseCase.js';
import { UpdateDocumentacionUseCase } from '../../../src/application/use-cases/referencia/UpdateDocumentacionUseCase.js';
import { DeleteDocumentacionUseCase } from '../../../src/application/use-cases/referencia/DeleteDocumentacionUseCase.js';
import { SetEstadoDocumentacionUseCase } from '../../../src/application/use-cases/referencia/SetEstadoDocumentacionUseCase.js';
import { GetDocumentacionByIdUseCase } from '../../../src/application/use-cases/referencia/GetDocumentacionByIdUseCase.js';
import { ListDocumentacionUseCase } from '../../../src/application/use-cases/referencia/ListDocumentacionUseCase.js';

const TIPO = TIPOS_DOCUMENTO_SISTEMA_VALUES[0];
const OTRO_TIPO = TIPOS_DOCUMENTO_SISTEMA_VALUES[1];
const nuevoLogger = () => ({ info: jest.fn(), error: jest.fn() });

describe('CreateDocumentacionUseCase', () => {
  const crear = (padre) => {
    const repo = {
      create: jest.fn().mockResolvedValue({ id: 10 }),
      findById: jest.fn().mockResolvedValue(padre),
    };
    const logger = nuevoLogger();
    return { repo, logger, useCase: new CreateDocumentacionUseCase({ documentacionRepository: repo, logger }) };
  };

  it('crea aplicando valores por defecto', async () => {
    const { useCase, repo, logger } = crear();
    const res = await useCase.execute({ nombre: 'CI', tipoDocumento: TIPO }, 2);
    expect(repo.create).toHaveBeenCalledWith(
      {
        name: 'CI',
        documentType: TIPO,
        acceptsPhotocopy: false,
        required: true,
        order: 0,
        active: true,
      },
      2
    );
    expect(repo.findById).not.toHaveBeenCalled();
    expect(res).toEqual({ documentacion: { id: 10 } });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 10 });
  });

  it('mapea alias en español e inglés y valida el padre válido', async () => {
    const { useCase, repo } = crear({ id: 3, documentType: TIPO, isSystemDocument: false });
    await useCase.execute({
      name: 'Cert',
      documentType: TIPO,
      aceptaFotocopia: true,
      requerido: false,
      orden: 4,
      descripcion: 'd',
      documentoPadreId: 3,
      activo: false,
    });
    expect(repo.findById).toHaveBeenCalledWith(3);
    expect(repo.create).toHaveBeenCalledWith(
      {
        name: 'Cert',
        documentType: TIPO,
        acceptsPhotocopy: true,
        required: false,
        order: 4,
        description: 'd',
        parentDocumentId: 3,
        active: false,
      },
      null
    );
  });

  it.each([
    ['sin cuerpo', undefined],
    ['sin nombre', { tipoDocumento: TIPO }],
    ['sin tipoDocumento', { nombre: 'CI' }],
    ['tipoDocumento inválido', { nombre: 'CI', tipoDocumento: 'NO_EXISTE' }],
  ])('ValidationError %s', async (_t, body) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(body)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it.each([
    ['padre inexistente', undefined, 'no corresponde'],
    ['padre de otro tipo', { id: 3, documentType: OTRO_TIPO }, 'mismo tipoDocumento'],
    ['padre generado por el sistema', { id: 3, documentType: TIPO, isSystemDocument: true }, 'sistema'],
  ])('rechaza documentoPadreId: %s', async (_t, padre, fragmento) => {
    const { useCase, repo } = crear(padre);
    await expect(
      useCase.execute({ nombre: 'CI', tipoDocumento: TIPO, documentoPadreId: 3 })
    ).rejects.toThrow(fragmento);
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe('UpdateDocumentacionUseCase', () => {
  const crear = (existing = { id: 1, documentType: TIPO }, padre = undefined) => {
    const repo = {
      findById: jest.fn().mockImplementation(async (id) => (id === 1 ? existing : padre)),
      update: jest.fn().mockResolvedValue({ id: 1 }),
    };
    const logger = nuevoLogger();
    return { repo, logger, useCase: new UpdateDocumentacionUseCase({ documentacionRepository: repo, logger }) };
  };

  it('actualiza mapeando campos', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute(
      1,
      { nombre: 'N', tipoDocumento: OTRO_TIPO, aceptaFotocopia: true, requerido: false, orden: 2, activo: true },
      5
    );
    expect(repo.update).toHaveBeenCalledWith(
      1,
      {
        name: 'N',
        documentType: OTRO_TIPO,
        acceptsPhotocopy: true,
        required: false,
        order: 2,
        active: true,
      },
      5
    );
    expect(res).toEqual({ documentacion: { id: 1 } });
  });

  it.each([[99], [NaN]])('NotFoundError si id=%p no existe', async (id) => {
    const { useCase, repo } = crear();
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute(id, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('ValidationError si tipoDocumento es inválido', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(1, { tipoDocumento: 'NO_EXISTE' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rechaza que el documento sea su propio padre', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(1, { documentoPadreId: '1' })).rejects.toThrow('no puede ser el mismo');
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('valida el padre contra el tipo existente si no se cambia el tipo', async () => {
    const { useCase, repo } = crear({ id: 1, documentType: TIPO }, { id: 2, documentType: OTRO_TIPO });
    await expect(useCase.execute(1, { documentoPadreId: 2 })).rejects.toThrow('mismo tipoDocumento');
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('valida el padre contra el tipo nuevo si se cambia el tipo', async () => {
    const { useCase, repo } = crear({ id: 1, documentType: TIPO }, { id: 2, documentType: OTRO_TIPO });
    await useCase.execute(1, { tipoDocumento: OTRO_TIPO, documentoPadreId: 2 });
    expect(repo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ documentType: OTRO_TIPO, parentDocumentId: 2 }),
      null
    );
  });

  it.each([
    ['inexistente', undefined, 'no corresponde'],
    ['de sistema', { id: 2, documentType: TIPO, isSystemDocument: true }, 'sistema'],
  ])('rechaza padre %s', async (_t, padre, fragmento) => {
    const { useCase, repo } = crear({ id: 1, documentType: TIPO }, padre);
    await expect(useCase.execute(1, { documentoPadreId: 2 })).rejects.toThrow(fragmento);
    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe('DeleteDocumentacionUseCase', () => {
  const crear = (resultado) => {
    const repo = { delete: jest.fn().mockResolvedValue(resultado) };
    const logger = nuevoLogger();
    return { repo, logger, useCase: new DeleteDocumentacionUseCase({ documentacionRepository: repo, logger }) };
  };

  it('elimina y registra', async () => {
    const { useCase, repo, logger } = crear(true);
    await expect(useCase.execute(5, 9)).resolves.toBe(true);
    expect(repo.delete).toHaveBeenCalledWith(5, 9);
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { id: 5 });
  });

  it.each([[99], [NaN]])('NotFoundError si no elimina (id=%p)', async (id) => {
    const { useCase, logger } = crear(false);
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(logger.info).not.toHaveBeenCalled();
  });
});

describe('SetEstadoDocumentacionUseCase', () => {
  const crear = (existing = { id: 2 }) => {
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 2, name: 'Z', active: false }),
    };
    const logger = nuevoLogger();
    return { repo, logger, useCase: new SetEstadoDocumentacionUseCase({ documentacionRepository: repo, logger }) };
  };

  it('actualiza solo active y devuelve presentación', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute(2, 0, 8);
    expect(repo.update).toHaveBeenCalledWith(2, { active: false }, 8);
    expect(res.documentacion).toMatchObject({ id: 2, nombre: 'Z', activo: false });
  });

  it.each([[99], [NaN]])('NotFoundError si id=%p no existe', async (id) => {
    const { useCase, repo } = crear(null);
    await expect(useCase.execute(id, true)).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe('GetDocumentacionByIdUseCase', () => {
  const crear = (entity) => {
    const repo = { findById: jest.fn().mockResolvedValue(entity) };
    return { repo, useCase: new GetDocumentacionByIdUseCase({ documentacionRepository: repo, logger: nuevoLogger() }) };
  };

  it('devuelve presentación buscando incluso borrados', async () => {
    const { useCase, repo } = crear({ id: 4, name: 'CI', active: true });
    const res = await useCase.execute(4);
    expect(repo.findById).toHaveBeenCalledWith(4, { paranoid: false });
    expect(res).toMatchObject({ id: 4, nombre: 'CI', activo: true });
  });

  it.each([[99], [NaN]])('devuelve null si id=%p no existe', async (id) => {
    const { useCase } = crear(null);
    await expect(useCase.execute(id)).resolves.toBeNull();
  });
});

describe('ListDocumentacionUseCase', () => {
  const crear = () => {
    const repo = {
      findAll: jest.fn().mockResolvedValue({ documentations: [{ id: 1, name: 'CI', active: true }], total: 12 }),
    };
    const logger = nuevoLogger();
    return { repo, useCase: new ListDocumentacionUseCase({ documentacionRepository: repo, logger }) };
  };

  it('lista bajo la clave documentacion con paginación', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute({ search: 'c' }, 2, 5);
    expect(repo.findAll).toHaveBeenCalledWith({ search: 'c' }, 2, 5);
    expect(res.documentacion[0]).toMatchObject({ id: 1, nombre: 'CI' });
    expect(res).toMatchObject({ total: 12, page: 2, limit: 5, totalPages: 3 });
  });

  it('page/limit NaN usan 1 y 50', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({}, NaN, NaN);
    expect(repo.findAll).toHaveBeenCalledWith({}, 1, 50);
  });

  it('traduce tipoDocumento e incluirInactivos a filtros de dominio', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({}, 1, 10, { tipoDocumento: TIPO, incluirInactivos: 'true' });
    expect(repo.findAll).toHaveBeenCalledWith(
      { documentType: TIPO, includeInactive: true },
      1,
      10
    );
  });

  it('incluirInactivos distinto de "true" produce false', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({}, 1, 10, { incluirInactivos: 'no' });
    expect(repo.findAll).toHaveBeenCalledWith({ includeInactive: false }, 1, 10);
  });
});
