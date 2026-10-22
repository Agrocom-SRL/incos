import { describe, it, expect, jest } from '@jest/globals';
import { ExportReciboPagoCapacitacionPdfUseCase } from '../../../src/application/use-cases/capacitacion/ExportReciboPagoCapacitacionPdfUseCase.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearFicha } from './pdf/fichaInscripcionFixture.js';

describe('ExportReciboPagoCapacitacionPdfUseCase', () => {
  const crear = ({ ficha = crearFicha() } = {}) => {
    const deps = {
      getInscripcionCapacitacionByIdUseCase: { execute: jest.fn().mockResolvedValue(ficha) },
      reciboPagoCapacitacionPdfGenerator: {
        generarRecibo: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.7')),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ExportReciboPagoCapacitacionPdfUseCase(deps) };
  };

  it('genera el recibo del pago pedido y devuelve buffer, nombre y mimeType', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ inscripcionId: '12', pagoId: '31' });

    expect(deps.getInscripcionCapacitacionByIdUseCase.execute).toHaveBeenCalledWith(12);
    const datos = deps.reciboPagoCapacitacionPdfGenerator.generarRecibo.mock.calls[0][0];
    expect(datos).toMatchObject({ numeroRecibo: '000031', concepto: 'CURSO', saldoConcepto: 300 });
    expect(res.mimeType).toBe('application/pdf');
    expect(res.fileName).toBe('Recibo_000031_PEREZ_GOMEZ_JUAN_CARLOS.pdf');
    expect(Buffer.isBuffer(res.buffer)).toBe(true);
  });

  it('lanza NotFoundError si el pago pertenece a otra inscripción (no está en la ficha)', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ inscripcionId: 12, pagoId: 777 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.reciboPagoCapacitacionPdfGenerator.generarRecibo).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la inscripción no existe', async () => {
    const { deps, useCase } = crear({ ficha: null });
    await expect(useCase.execute({ inscripcionId: 99, pagoId: 31 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.reciboPagoCapacitacionPdfGenerator.generarRecibo).not.toHaveBeenCalled();
  });

  it('rechaza ids inválidos con ValidationError', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ inscripcionId: 12, pagoId: 0 })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ inscripcionId: 'x', pagoId: 1 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('un pago ANULADO no tiene recibo (409) y no se invoca al generador', async () => {
    const ficha = crearFicha();
    ficha.pagos = ficha.pagos.map((pago) => (pago.id === 31 ? { ...pago, anulado: true } : pago));
    const { deps, useCase } = crear({ ficha });
    await expect(useCase.execute({ inscripcionId: 12, pagoId: 31 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.reciboPagoCapacitacionPdfGenerator.generarRecibo).not.toHaveBeenCalled();
  });

});
