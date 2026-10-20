import { describe, it, expect, jest } from '@jest/globals';
import {
  assertEstudianteSinPasantiaVigente,
  assertInformeViablePreviaAutorizacion,
  assertTipoInformeCoherente,
  getInformeOfPasantiaOrFail,
  getPasantiaOrFail,
  getSeguimientoOfPasantiaOrFail,
} from '../../../src/application/use-cases/pasantias/helpers/pasantiaGuards.js';
import { validatePasantiaPayload } from '../../../src/application/use-cases/pasantias/helpers/pasantiaPayload.js';
import {
  actualizarInformeConPdf,
  buildContextoInformePdf,
  guardarInformeConPdf,
  hoyISO,
} from '../../../src/application/use-cases/pasantias/helpers/informePdfHelpers.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('pasantiaGuards', () => {
  it('getPasantiaOrFail devuelve la entidad o lanza NotFoundError', async () => {
    const repo = { findById: jest.fn().mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null) };
    await expect(getPasantiaOrFail(repo, 1)).resolves.toEqual({ id: 1 });
    await expect(getPasantiaOrFail(repo, 2)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('getInformeOfPasantiaOrFail valida pertenencia', async () => {
    const repo = { findById: jest.fn().mockResolvedValue({ id: 5, pasantiaId: '2' }) };
    await expect(getInformeOfPasantiaOrFail(repo, 2, 5)).resolves.toMatchObject({ id: 5 });
    await expect(getInformeOfPasantiaOrFail(repo, 3, 5)).rejects.toBeInstanceOf(NotFoundError);
    repo.findById.mockResolvedValue(null);
    await expect(getInformeOfPasantiaOrFail(repo, 2, 5)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('getSeguimientoOfPasantiaOrFail valida pertenencia', async () => {
    const repo = { findById: jest.fn().mockResolvedValue({ id: 5, pasantiaId: 2 }) };
    await expect(getSeguimientoOfPasantiaOrFail(repo, 2, 5)).resolves.toMatchObject({ id: 5 });
    await expect(getSeguimientoOfPasantiaOrFail(repo, 9, 5)).rejects.toBeInstanceOf(NotFoundError);
    repo.findById.mockResolvedValue(null);
    await expect(getSeguimientoOfPasantiaOrFail(repo, 2, 5)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('assertTipoInformeCoherente', () => {
    expect(() => assertTipoInformeCoherente({ tipo: 'PASANTIA' }, 'VERIFICACION_EMPRESA')).not.toThrow();
    expect(() => assertTipoInformeCoherente({ tipo: 'CONVALIDACION' }, 'CONVALIDACION_TRABAJO'))
      .not.toThrow();
    expect(() => assertTipoInformeCoherente({ tipo: 'PASANTIA' }, 'CONVALIDACION_TRABAJO'))
      .toThrow(ValidationError);
    expect(() => assertTipoInformeCoherente({ tipo: 'CONVALIDACION' }, 'VERIFICACION_EMPRESA'))
      .toThrow(ValidationError);
    expect(() => assertTipoInformeCoherente({ tipo: 'PASANTIA' }, undefined)).toThrow(ValidationError);
  });

  describe('assertEstudianteSinPasantiaVigente', () => {
    const repoCon = (tramites) => ({
      findAll: jest.fn().mockResolvedValue({ pasantias: tramites }),
      getCollectionName: () => 'pasantias',
    });

    it('pasa sin trámites o con no vigentes', async () => {
      const repo = repoCon([{ id: 1, estado: 'RECHAZADA' }, { id: 2, estado: 'CANCELADA' }]);
      await expect(assertEstudianteSinPasantiaVigente({ pasantiaRepository: repo, estudianteId: 5 }))
        .resolves.toBeUndefined();
      expect(repo.findAll).toHaveBeenCalledWith({ estudianteId: 5 });
    });

    it('pasa si la colección falta en el resultado', async () => {
      const repo = { findAll: jest.fn().mockResolvedValue({}), getCollectionName: () => 'pasantias' };
      await expect(assertEstudianteSinPasantiaVigente({ pasantiaRepository: repo, estudianteId: 5 }))
        .resolves.toBeUndefined();
    });

    it.each(['SOLICITADA', 'EN_CURSO'])('ConflictError con trámite %s', async (estado) => {
      const repo = repoCon([{ id: 1, estado }]);
      await expect(assertEstudianteSinPasantiaVigente({ pasantiaRepository: repo, estudianteId: 5 }))
        .rejects.toBeInstanceOf(ConflictError);
    });

    it('excluye el trámite indicado (incluso id 0 como string/number)', async () => {
      const repo = repoCon([{ id: 3, estado: 'EN_CURSO' }]);
      await expect(assertEstudianteSinPasantiaVigente({
        pasantiaRepository: repo, estudianteId: 5, excludePasantiaId: '3',
      })).resolves.toBeUndefined();
    });
  });

  describe('assertInformeViablePreviaAutorizacion', () => {
    const repoCon = (informes) => ({ findByPasantiaId: jest.fn().mockResolvedValue(informes) });

    it('no consulta informes si el destino no es el positivo del camino', async () => {
      const repo = repoCon([]);
      await assertInformeViablePreviaAutorizacion({
        pasantiaInformeRepository: repo, pasantia: { id: 1, tipo: 'PASANTIA' }, estadoDestino: 'RECHAZADA',
      });
      await assertInformeViablePreviaAutorizacion({
        pasantiaInformeRepository: repo, pasantia: { id: 1, tipo: 'PASANTIA' }, estadoDestino: 'CONVALIDADA',
      });
      expect(repo.findByPasantiaId).not.toHaveBeenCalled();
    });

    it('pasa con informe viable del tipo esperado', async () => {
      const repo = repoCon([{ tipo: 'CONVALIDACION_TRABAJO', resultado: 'VIABLE' }]);
      await expect(assertInformeViablePreviaAutorizacion({
        pasantiaInformeRepository: repo,
pasantia: { id: 1, tipo: 'CONVALIDACION' },
        estadoDestino: 'CONVALIDADA',
      })).resolves.toBeUndefined();
      expect(repo.findByPasantiaId).toHaveBeenCalledWith(1);
    });

    it('lanza ValidationError sin informe viable del tipo esperado', async () => {
      const repo = repoCon([{ tipo: 'VERIFICACION_EMPRESA', resultado: 'VIABLE' }]);
      await expect(assertInformeViablePreviaAutorizacion({
        pasantiaInformeRepository: repo,
pasantia: { id: 1, tipo: 'CONVALIDACION' },
        estadoDestino: 'CONVALIDADA',
      })).rejects.toBeInstanceOf(ValidationError);
    });
  });
});

describe('validatePasantiaPayload', () => {
  it('create válido no lanza (con y sin horas)', () => {
    expect(() => validatePasantiaPayload({ estudianteId: 1, tipo: 'PASANTIA' })).not.toThrow();
    expect(() => validatePasantiaPayload({ estudianteId: 1, tipo: 'PASANTIA', horasRequeridas: 330 }))
      .not.toThrow();
  });

  it('create exige estudianteId y tipo válido', () => {
    expect(() => validatePasantiaPayload({ tipo: 'PASANTIA' })).toThrow(ValidationError);
    expect(() => validatePasantiaPayload({ estudianteId: 1 })).toThrow(ValidationError);
    expect(() => validatePasantiaPayload({ estudianteId: 1, tipo: 'x' })).toThrow(ValidationError);
  });

  it('límites de horas 300 y 360 inclusivos; fuera lanza', () => {
    const base = { estudianteId: 1, tipo: 'PASANTIA' };
    expect(() => validatePasantiaPayload({ ...base, horasRequeridas: 300 })).not.toThrow();
    expect(() => validatePasantiaPayload({ ...base, horasRequeridas: '360' })).not.toThrow();
    expect(() => validatePasantiaPayload({ ...base, horasRequeridas: 'abc' })).toThrow(ValidationError);
    expect(() => validatePasantiaPayload({ ...base, horasRequeridas: 299.9 })).toThrow(ValidationError);
    expect(() => validatePasantiaPayload({ ...base, horasRequeridas: 360.1 })).toThrow(ValidationError);
  });

  it('parcial: todo opcional, pero tipo presente debe ser válido', () => {
    expect(() => validatePasantiaPayload({}, { partial: true })).not.toThrow();
    expect(() => validatePasantiaPayload({ tipo: 'CONVALIDACION' }, { partial: true })).not.toThrow();
    expect(() => validatePasantiaPayload({ tipo: 'x' }, { partial: true })).toThrow(ValidationError);
  });

  it('campos de contrato solo con CONVALIDACION (payload o tipoActual)', () => {
    expect(() => validatePasantiaPayload(
      { estudianteId: 1, tipo: 'CONVALIDACION', tipoContrato: 'OTRO', tipoContratoDetalle: 'x' }
    )).not.toThrow();
    expect(() => validatePasantiaPayload(
      { estudianteId: 1, tipo: 'PASANTIA', tipoContratoDetalle: 'x' }
    )).toThrow(ValidationError);
    expect(() => validatePasantiaPayload(
      { tipoContrato: 'OTRO' }, { partial: true, tipoActual: 'CONVALIDACION' }
    )).not.toThrow();
    expect(() => validatePasantiaPayload(
      { tipoContrato: 'OTRO' }, { partial: true, tipoActual: 'PASANTIA' }
    )).toThrow(ValidationError);
    expect(() => validatePasantiaPayload({ tipoContrato: 'OTRO' }, { partial: true }))
      .toThrow(ValidationError);
  });

  it('contrato null no cuenta como contrato', () => {
    expect(() => validatePasantiaPayload(
      { estudianteId: 1, tipo: 'PASANTIA', tipoContrato: null }
    )).not.toThrow();
  });
});

describe('informePdfHelpers', () => {
  it('hoyISO devuelve YYYY-MM-DD de la fecha actual', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-04T10:00:00Z'));
    try {
      expect(hoyISO()).toBe('2026-03-04');
    } finally {
      jest.useRealTimers();
    }
  });

  it('buildContextoInformePdf mapea la fila de la vista', async () => {
    const view = { findListadoById: jest.fn().mockResolvedValue({ id: 2, area_departamento: 'TI' }) };
    const ctx = await buildContextoInformePdf({ pasantiaViewRepository: view, pasantia: { id: 2 } });
    expect(view.findListadoById).toHaveBeenCalledWith(2);
    expect(ctx.areaDepartamento).toBe('TI');
  });

  it('buildContextoInformePdf degrada a copia de la entidad si no hay fila', async () => {
    const view = { findListadoById: jest.fn().mockResolvedValue(null) };
    const pasantia = { id: 2, tipo: 'PASANTIA' };
    const ctx = await buildContextoInformePdf({ pasantiaViewRepository: view, pasantia });
    expect(ctx).toEqual(pasantia);
    expect(ctx).not.toBe(pasantia);
  });

  it('guardarInformeConPdf guarda el archivo y crea la fila', async () => {
    const uploadsStorage = {
      saveToUploads: jest.fn().mockReturnValue({ fileName: 'a.pdf', absolutePath: '/abs/a.pdf' }),
    };
    const repo = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    const buffer = Buffer.from('x');
    const res = await guardarInformeConPdf({
      uploadsStorage,
      pasantiaInformeRepository: repo,
      pasantiaId: 4,
      buffer,
      fileName: 'a.pdf',
      informeData: { tipo: 'T' },
      userId: 9,
      options: { transaction: 't' },
    });
    expect(res).toEqual({ id: 1 });
    expect(uploadsStorage.saveToUploads).toHaveBeenCalledWith('documentos/pasantias/4', 'a.pdf', buffer);
    expect(repo.create).toHaveBeenCalledWith(
      {
        pasantiaId: 4,
        tipo: 'T',
        nombreArchivo: 'a.pdf',
        rutaArchivo: '/abs/a.pdf',
        extension: 'pdf',
        tipoMime: 'application/pdf',
      },
      9,
      { transaction: 't' }
    );
  });

  it('actualizarInformeConPdf sobrescribe el archivo y actualiza la fila', async () => {
    const uploadsStorage = {
      saveToUploads: jest.fn().mockReturnValue({ fileName: 'a.pdf', absolutePath: '/abs/a.pdf' }),
    };
    const repo = { update: jest.fn().mockResolvedValue({ id: 3 }) };
    const res = await actualizarInformeConPdf({
      uploadsStorage,
      pasantiaInformeRepository: repo,
      pasantiaId: 4,
      informeId: 3,
      buffer: Buffer.from('x'),
      fileName: 'a.pdf',
      informeData: { tipo: 'T' },
    });
    expect(res).toEqual({ id: 3 });
    expect(repo.update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ tipo: 'T', rutaArchivo: '/abs/a.pdf', extension: 'pdf' }),
      null
    );
  });
});
