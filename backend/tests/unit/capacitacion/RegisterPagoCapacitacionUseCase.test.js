import { describe, it, expect, jest } from '@jest/globals';
import { RegisterPagoCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/RegisterPagoCapacitacionUseCase.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('RegisterPagoCapacitacionUseCase', () => {
  const crear = ({
    inscripcion = { id: 7, estado: 'PENDIENTE', montoObligatorio: 100 },
    pagado = 0,
    metodo = { id: 1 },
    cuenta = { id: 2 },
    compromiso = null,
  } = {}) => {
    const deps = {
      pagoCapacitacionRepository: {
        sumMontoByInscripcionId: jest.fn().mockResolvedValue(pagado),
        create: jest.fn().mockImplementation(async (d) => ({ id: 42, ...d })),
        update: jest.fn().mockImplementation(async (id, d) => ({ id, monto: 30, ...d })),
      },
      inscripcionCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(inscripcion),
        update: jest.fn().mockResolvedValue({}),
      },
      capacitacionCompromisoRepository: {
        findVigenteByInscripcionId: jest.fn().mockResolvedValue(compromiso),
        update: jest.fn().mockResolvedValue({}),
      },
      paymentMethodRepository: { findById: jest.fn().mockResolvedValue(metodo) },
      paymentAccountRepository: { findById: jest.fn().mockResolvedValue(cuenta) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new RegisterPagoCapacitacionUseCase(deps) };
  };
  const body = { monto: 30, metodoPagoId: 1 };

  it('registra pago parcial: asigna recibo de 6 dígitos y no cierra la inscripción', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(7, { ...body, cuentaPagoId: 2, fechaPago: '2026-01-05', observaciones: 'o' }, 3, {
      transaction: 'TX',
    });
    expect(deps.inscripcionCapacitacionRepository.findById).toHaveBeenCalledWith(7, { transaction: 'TX' });
    const creado = deps.pagoCapacitacionRepository.create.mock.calls[0];
    expect(creado[0]).toMatchObject({
      capacitacionInscritoId: 7,
metodoPagoId: 1,
cuentaPagoId: 2,
monto: 30,
      fechaPago: '2026-01-05',
observaciones: 'o',
    });
    expect(creado[0].numeroRecibo).toMatch(/^TEMP-7-/);
    expect(creado[1]).toBe(3);
    expect(deps.pagoCapacitacionRepository.update).toHaveBeenCalledWith(42, { numeroRecibo: '000042' }, 3, {
      transaction: 'TX',
    });
    expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
    expect(res.pagoCapacitacion.numeroRecibo).toBe('000042');
  });

  it('pago que cubre el saldo: PENDIENTE -> INSCRITO, CANCELADO y cierra compromiso', async () => {
    const { deps, useCase } = crear({ pagado: 70, compromiso: { id: 11 } });
    await useCase.execute(7, body, 3, { transaction: 'TX' });
    expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(
      7,
      { estadoPago: 'CANCELADO', estado: 'INSCRITO' },
      3,
      { transaction: 'TX' }
    );
    expect(deps.capacitacionCompromisoRepository.update).toHaveBeenCalledWith(
      11,
      { estado: 'CUMPLIDO' },
      3,
      { transaction: 'TX' }
    );
  });

  it('inscripción INSCRITO con saldo cubierto no cambia el estado de inscripción', async () => {
    const { deps, useCase } = crear({
      inscripcion: { id: 7, estado: 'INSCRITO', montoObligatorio: 100 },
      pagado: 70,
    });
    await useCase.execute(7, body);
    expect(deps.inscripcionCapacitacionRepository.update.mock.calls[0][1]).toEqual({ estadoPago: 'CANCELADO' });
    expect(deps.capacitacionCompromisoRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la inscripción no existe', async () => {
    const { deps, useCase } = crear({ inscripcion: null });
    await expect(useCase.execute(1, body)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it.each([['RETIRADO'], ['ANULADO']])('rechaza pago sobre inscripción %s', async (estado) => {
    const { deps, useCase } = crear({ inscripcion: { id: 7, estado, montoObligatorio: 100 } });
    await expect(useCase.execute(7, body)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it.each([[undefined], ['abc'], [NaN], [0], [-5]])('rechaza monto inválido (%p)', async (monto) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(7, { ...body, monto })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza monto mayor al saldo pendiente', async () => {
    const { deps, useCase } = crear({ pagado: 80 });
    await expect(useCase.execute(7, { ...body, monto: 30 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], [0], ['abc']])('exige metodoPagoId (%p)', async (metodoPagoId) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(7, { monto: 10, metodoPagoId })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el método o la cuenta no existen', async () => {
    await expect(crear({ metodo: null }).useCase.execute(7, body)).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      crear({ cuenta: null }).useCase.execute(7, { ...body, cuentaPagoId: 9 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('si aún no hay pagos, el mensaje habla del costo del curso y no de un saldo pendiente', async () => {
    const { useCase } = crear({ pagado: 0 });
    await expect(useCase.execute(7, { ...body, monto: 100000 })).rejects.toThrow(/costo del curso/);
  });
});
