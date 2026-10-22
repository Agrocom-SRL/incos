import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { UpdatePagoCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/UpdatePagoCapacitacionUseCase.js'
);

const NO_EXTERNO = { pagoCursoExterno: false, requisitoId: null, requisitoDescripcion: null, acreditado: false };

describe('UpdatePagoCapacitacionUseCase', () => {
  const inscripcionBase = {
    id: 7,
    capacitacionId: 1,
    estado: 'INSCRITO',
    montoObligatorio: 440,
    montoMatricula: 150,
    estadoPago: 'CANCELADO',
    estadoPagoCurso: 'CANCELADO',
    estadoPagoMatricula: 'CANCELADO',
  };
  const pagoBase = {
    id: 42,
    capacitacionInscritoId: 7,
    concepto: 'CURSO',
    monto: 100,
    fechaPago: '2026-01-05',
    numeroRecibo: '000042',
    metodoPagoId: 1,
    anulado: false,
  };

  const crear = ({
    inscripcion = inscripcionBase,
    pago = pagoBase,
    // totales ANTES de corregir (incluyen el pago que se corrige)
    totales = { MATRICULA: 150, CURSO: 440 },
    totalesDespues = null,
    pendientes = 0,
    externo = NO_EXTERNO,
  } = {}) => {
    const deps = {
      pagoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(pago),
        sumMontosPorConcepto: jest
          .fn()
          .mockResolvedValueOnce(totales)
          .mockResolvedValue(totalesDespues ?? totales),
        update: jest.fn().mockImplementation(async (id, d) => ({ ...pago, ...d })),
      },
      inscripcionCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(inscripcion),
        update: jest.fn().mockResolvedValue({}),
      },
      capacitacionCompromisoRepository: {
        findVigenteByInscripcionId: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
      capacitacionInscritoRequisitoRepository: {
        contarObligatoriosPendientes: jest.fn().mockResolvedValue(pendientes),
        resolverPagoCursoExterno: jest.fn().mockResolvedValue(externo),
      },
      paymentMethodRepository: { findById: jest.fn().mockResolvedValue({ id: 2 }) },
      paymentAccountRepository: { findById: jest.fn().mockResolvedValue({ id: 3 }) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdatePagoCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('corrige monto, fecha, método, cuenta y observaciones, y recalcula los estados', async () => {
    const { deps, useCase } = crear({ totalesDespues: { MATRICULA: 150, CURSO: 300 } });
    const res = await useCase.execute(
      7,
      42,
      { monto: 60, fechaPago: '2026-01-09', metodoPagoId: 2, cuentaPagoId: 3, observaciones: '  corregido ' },
      9
    );

    expect(deps.pagoCapacitacionRepository.update).toHaveBeenCalledWith(
      42,
      { monto: 60, fechaPago: '2026-01-09', metodoPagoId: 2, cuentaPagoId: 3, observaciones: 'corregido' },
      9,
      { transaction: 'TX' }
    );
    // pagó 440 con este pago de 100: bajarlo a 60 deja el curso en 400 -> sigue PARCIAL
    expect(res.pagoCapacitacion.inscripcion).toMatchObject({
      id: 7,
      estado: 'PENDIENTE',
      estadoPagoCurso: 'PARCIAL',
      saldoCurso: 140,
      saldoMatricula: 0,
    });
    // la inscripción baja de INSCRITO a PENDIENTE por el recálculo
    expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ estado: 'PENDIENTE', estadoPagoCurso: 'PARCIAL', estadoPago: 'PARCIAL' }),
      9,
      { transaction: 'TX' }
    );
  });

  it('permite subir el monto hasta el saldo del concepto SIN contar el propio pago', async () => {
    // curso: 440, ya pagado 340 (incluye este pago de 100) -> hasta 200 en este pago
    const { useCase } = crear({ totales: { MATRICULA: 0, CURSO: 340 }, totalesDespues: { MATRICULA: 0, CURSO: 440 } });
    await expect(useCase.execute(7, 42, { monto: 200 })).resolves.toBeDefined();
    const sobre = crear({ totales: { MATRICULA: 0, CURSO: 340 } });
    const error = await sobre.useCase.execute(7, 42, { monto: 200.01 }).catch((e) => e);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toMatch(/no puede superar/);
    expect(sobre.deps.pagoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('al cambiar el concepto valida contra el saldo del nuevo concepto', async () => {
    // matrícula ya cubierta (150): mover el pago de 100 a MATRÍCULA sobrepasa
    const { deps, useCase } = crear({ totales: { MATRICULA: 150, CURSO: 100 } });
    await expect(useCase.execute(7, 42, { concepto: 'matricula' })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.pagoCapacitacionRepository.update).not.toHaveBeenCalled();

    const ok = crear({ totales: { MATRICULA: 50, CURSO: 100 }, totalesDespues: { MATRICULA: 150, CURSO: 0 } });
    await ok.useCase.execute(7, 42, { concepto: 'matricula' });
    expect(ok.deps.pagoCapacitacionRepository.update).toHaveBeenCalledWith(
      42, { concepto: 'MATRICULA' }, null, { transaction: 'TX' }
    );
  });

  it('rechaza pasar un pago a CURSO si el curso tiene entidad certificadora', async () => {
    const externo = { pagoCursoExterno: true, requisitoId: 5, requisitoDescripcion: 'Depósito', acreditado: false };
    const { deps, useCase } = crear({
      pago: { ...pagoBase, concepto: 'MATRICULA' },
      totales: { MATRICULA: 100, CURSO: 0 },
      externo,
    });
    await expect(useCase.execute(7, 42, { concepto: 'CURSO' })).rejects.toThrow(/entidad certificadora/);
    expect(deps.pagoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('valida método y cuenta contra los catálogos', async () => {
    const a = crear();
    a.deps.paymentMethodRepository.findById.mockResolvedValue(null);
    await expect(a.useCase.execute(7, 42, { metodoPagoId: 99 })).rejects.toBeInstanceOf(NotFoundError);
    const b = crear();
    b.deps.paymentAccountRepository.findById.mockResolvedValue(null);
    await expect(b.useCase.execute(7, 42, { cuentaPagoId: 99 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(crear().useCase.execute(7, 42, { metodoPagoId: '' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('cuentaPagoId null limpia la cuenta', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(7, 42, { cuentaPagoId: null });
    expect(deps.pagoCapacitacionRepository.update.mock.calls[0][1]).toEqual({ cuentaPagoId: null });
  });

  it('rechaza monto inválido y cuerpo sin campos editables', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(7, 42, { monto: 0 })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(7, 42, { monto: 10.123 })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(7, 42, {})).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(7, 42, { monto: 5, fechaPago: 'x' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('404 si el pago es de otra inscripción o no existe; 409 si está anulado', async () => {
    const ajeno = crear({ pago: { ...pagoBase, capacitacionInscritoId: 99 } });
    await expect(ajeno.useCase.execute(7, 42, { monto: 5 })).rejects.toBeInstanceOf(NotFoundError);
    const noExiste = crear({ pago: null });
    await expect(noExiste.useCase.execute(7, 42, { monto: 5 })).rejects.toBeInstanceOf(NotFoundError);
    const anulado = crear({ pago: { ...pagoBase, anulado: true } });
    await expect(anulado.useCase.execute(7, 42, { monto: 5 })).rejects.toBeInstanceOf(ConflictError);
    expect(anulado.deps.pagoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it.each(['RETIRADO', 'ANULADO'])('409 si la inscripción está %s', async (estado) => {
    const { deps, useCase } = crear({ inscripcion: { ...inscripcionBase, estado } });
    await expect(useCase.execute(7, 42, { monto: 5 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.pagoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('404 si la inscripción no existe', async () => {
    const { deps, useCase } = crear();
    deps.inscripcionCapacitacionRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(7, 42, { monto: 5 })).rejects.toBeInstanceOf(NotFoundError);
  });
});
