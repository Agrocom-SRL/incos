import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { RegisterPagoCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/RegisterPagoCapacitacionUseCase.js'
);

const NO_EXTERNO = {
  pagoCursoExterno: false,
  requisitoId: null,
  requisitoDescripcion: null,
  acreditado: false,
};

describe('RegisterPagoCapacitacionUseCase', () => {
  const inscripcionBase = {
    id: 7,
    capacitacionId: 1,
    estado: 'PENDIENTE',
    montoObligatorio: 440,
    montoMatricula: 150,
    estadoPago: 'PARCIAL',
    estadoPagoCurso: 'PARCIAL',
    estadoPagoMatricula: 'PARCIAL',
  };

  const crear = ({
    inscripcion = inscripcionBase,
    pagado = { MATRICULA: 0, CURSO: 0 },
    pagadoDespues = null,
    pendientes = 0,
    metodo = { id: 1 },
    cuenta = { id: 2 },
    compromiso = null,
  } = {}) => {
    const deps = {
      pagoCapacitacionRepository: {
        sumMontosPorConcepto: jest
          .fn()
          .mockResolvedValueOnce(pagado)
          .mockResolvedValue(pagadoDespues ?? pagado),
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
      capacitacionInscritoRequisitoRepository: {
        contarObligatoriosPendientes: jest.fn().mockResolvedValue(pendientes),
        resolverPagoCursoExterno: jest.fn().mockResolvedValue(NO_EXTERNO),
      },
      paymentMethodRepository: { findById: jest.fn().mockResolvedValue(metodo) },
      paymentAccountRepository: { findById: jest.fn().mockResolvedValue(cuenta) },
      logger: { info: jest.fn(), warn: jest.fn() },
      fileSystem: { unlinkSync: jest.fn() },
    };
    return { deps, useCase: new RegisterPagoCapacitacionUseCase(deps) };
  };
  const body = { concepto: 'CURSO', monto: 30, metodoPagoId: 1 };

  beforeEach(() => mockTransaction.mockClear());

  it('registra pago parcial del curso: recibo de 6 dígitos y la inscripción sigue PENDIENTE', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(
      7,
      { ...body, cuentaPagoId: 2, fechaPago: '2026-01-05', observaciones: 'o' },
      3,
      { transaction: 'TX' }
    );
    expect(deps.inscripcionCapacitacionRepository.findById).toHaveBeenCalledWith(7, { transaction: 'TX' });
    const creado = deps.pagoCapacitacionRepository.create.mock.calls[0];
    expect(creado[0]).toMatchObject({
      capacitacionInscritoId: 7,
      metodoPagoId: 1,
      cuentaPagoId: 2,
      concepto: 'CURSO',
      monto: 30,
      fechaPago: '2026-01-05',
      observaciones: 'o',
    });
    expect(creado[0].numeroRecibo).toMatch(/^TEMP-7-/);
    expect(creado[0].comprobanteRuta).toBeUndefined();
    expect(deps.pagoCapacitacionRepository.update).toHaveBeenCalledWith(42, { numeroRecibo: '000042' }, 3, {
      transaction: 'TX',
    });
    expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
    expect(res.pagoCapacitacion).toMatchObject({
      numeroRecibo: '000042',
      tieneComprobante: false,
      inscripcion: { estado: 'PENDIENTE', estadoPago: 'PARCIAL', saldoMatricula: 150 },
    });
  });

  it('sin transacción externa abre la suya', async () => {
    const { useCase } = crear();
    await useCase.execute(7, body, 3);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it('el concepto es obligatorio y debe ser MATRICULA o CURSO (acepta minúsculas)', async () => {
    const { deps, useCase } = crear();
    for (const concepto of [undefined, null, '', 'OTRO', 5]) {
      await expect(useCase.execute(7, { ...body, concepto })).rejects.toBeInstanceOf(ValidationError);
    }
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
    await useCase.execute(7, { ...body, concepto: 'matricula', monto: 10 });
    expect(deps.pagoCapacitacionRepository.create.mock.calls[0][0].concepto).toBe('MATRICULA');
  });

  it('matrícula y curso se pagan en cualquier orden: pagar solo el curso deja la matrícula pendiente', async () => {
    const { deps, useCase } = crear({
      pagado: { MATRICULA: 0, CURSO: 410 },
      pagadoDespues: { MATRICULA: 0, CURSO: 440 },
    });
    const res = await useCase.execute(7, body, 3, { transaction: 'TX' });
    expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(
      7,
      { estadoPagoCurso: 'CANCELADO' },
      3,
      { transaction: 'TX' }
    );
    expect(res.pagoCapacitacion.inscripcion).toMatchObject({
      estado: 'PENDIENTE',
      estadoPago: 'PARCIAL',
      estadoPagoCurso: 'CANCELADO',
      estadoPagoMatricula: 'PARCIAL',
      saldoCurso: 0,
      saldoMatricula: 150,
    });
  });

  it('pagar la matrícula después del curso cancela todo: PENDIENTE -> INSCRITO y cierra el compromiso', async () => {
    const { deps, useCase } = crear({
      inscripcion: { ...inscripcionBase, estadoPagoCurso: 'CANCELADO' },
      pagado: { MATRICULA: 0, CURSO: 440 },
      pagadoDespues: { MATRICULA: 150, CURSO: 440 },
      compromiso: { id: 11 },
    });
    await useCase.execute(7, { concepto: 'MATRICULA', monto: 150, metodoPagoId: 1 }, 3, { transaction: 'TX' });
    expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(
      7,
      { estado: 'INSCRITO', estadoPago: 'CANCELADO', estadoPagoMatricula: 'CANCELADO' },
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

  it('todo pagado pero con requisitos obligatorios pendientes: queda PENDIENTE', async () => {
    const { deps, useCase } = crear({
      pagado: { MATRICULA: 0, CURSO: 440 },
      pagadoDespues: { MATRICULA: 150, CURSO: 440 },
      pendientes: 1,
    });
    const res = await useCase.execute(7, { concepto: 'MATRICULA', monto: 150, metodoPagoId: 1 }, 3, {
      transaction: 'TX',
    });
    expect(res.pagoCapacitacion.inscripcion).toMatchObject({ estado: 'PENDIENTE', estadoPago: 'CANCELADO' });
    expect(deps.inscripcionCapacitacionRepository.update.mock.calls[0][1].estado).toBeUndefined();
  });

  it('sobrepago por concepto: no se puede superar el saldo de ese concepto', async () => {
    const { deps, useCase } = crear({ pagado: { MATRICULA: 100, CURSO: 0 } });
    await expect(useCase.execute(7, { concepto: 'MATRICULA', monto: 60, metodoPagoId: 1 })).rejects.toThrow(
      /saldo pendiente de la matrícula \(Bs\. 50\.00\)/
    );
    // el saldo de curso es independiente del de matrícula
    await expect(useCase.execute(7, { concepto: 'CURSO', monto: 440, metodoPagoId: 1 })).resolves.toBeDefined();
    await expect(useCase.execute(7, { concepto: 'CURSO', monto: 441, metodoPagoId: 1 })).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(deps.pagoCapacitacionRepository.create).toHaveBeenCalledTimes(1);
  });

  it('una matrícula de Bs 0 no admite pagos', async () => {
    const { useCase } = crear({ inscripcion: { ...inscripcionBase, montoMatricula: 0 } });
    await expect(useCase.execute(7, { concepto: 'MATRICULA', monto: 1, metodoPagoId: 1 })).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it('si aún no hay pagos del concepto, el mensaje habla del costo del curso y no de un saldo pendiente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(7, { ...body, monto: 100000 })).rejects.toThrow(/costo del curso/);
  });

  it('comprobante opcional: con archivo guarda ruta y nombre; sin archivo no los envía', async () => {
    const { deps, useCase } = crear();
    const file = { path: '/uploads/c.pdf', originalname: 'deposito.pdf' };
    const res = await useCase.execute(7, body, 3, { transaction: 'TX', file });
    expect(deps.pagoCapacitacionRepository.create.mock.calls[0][0]).toMatchObject({
      comprobanteRuta: '/uploads/c.pdf',
      comprobanteNombre: 'deposito.pdf',
    });
    expect(deps.fileSystem.unlinkSync).not.toHaveBeenCalled();
    expect(res.pagoCapacitacion).toBeDefined();
  });

  it('si el pago falla, el comprobante ya subido se descarta', async () => {
    const { deps, useCase } = crear();
    const file = { path: '/uploads/c.pdf', originalname: 'deposito.pdf' };
    await expect(useCase.execute(7, { ...body, monto: 100000 }, 3, { file })).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(deps.fileSystem.unlinkSync).toHaveBeenCalledWith('/uploads/c.pdf');
  });

  it('lanza NotFoundError si la inscripción no existe', async () => {
    const { deps, useCase } = crear({ inscripcion: null });
    await expect(useCase.execute(1, body)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it.each([['abc'], [0], [-1], [null]])('rechaza id de inscripción inválido (%p)', async (id) => {
    const { useCase } = crear();
    await expect(useCase.execute(id, body)).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([['RETIRADO'], ['ANULADO']])('rechaza pago sobre inscripción %s', async (estado) => {
    const { deps, useCase } = crear({ inscripcion: { ...inscripcionBase, estado } });
    await expect(useCase.execute(7, body)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it.each([[undefined], ['abc'], [NaN], [0], [-5], [null], ['']])('rechaza monto inválido (%p)', async (monto) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(7, { ...body, monto })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza montos con más de 2 decimales y fechaPago inválida', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(7, { ...body, monto: 10.123 })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(7, { ...body, fechaPago: '2026-02-30' })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([[undefined], [null], [0], ['abc']])('exige metodoPagoId (%p)', async (metodoPagoId) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(7, { concepto: 'CURSO', monto: 10, metodoPagoId })).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el método o la cuenta no existen', async () => {
    await expect(crear({ metodo: null }).useCase.execute(7, body)).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      crear({ cuenta: null }).useCase.execute(7, { ...body, cuentaPagoId: 9 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  describe('curso con entidad certificadora (costo del curso externo)', () => {
    const externo = { pagoCursoExterno: true, requisitoId: 5, requisitoDescripcion: 'Depósito', acreditado: false };

    it('rechaza el concepto CURSO con 400 y un mensaje claro, sin crear nada', async () => {
      const { deps, useCase } = crear();
      deps.capacitacionInscritoRequisitoRepository.resolverPagoCursoExterno.mockResolvedValue(externo);
      const error = await useCase.execute(7, body, 3, { transaction: 'TX' }).catch((e) => e);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toMatch(/entidad certificadora/);
      expect(error.message).toMatch(/solo se registra la matrícula/);
      expect(deps.pagoCapacitacionRepository.create).not.toHaveBeenCalled();
    });

    it('sigue aceptando la MATRÍCULA', async () => {
      const { deps, useCase } = crear();
      deps.capacitacionInscritoRequisitoRepository.resolverPagoCursoExterno.mockResolvedValue(externo);
      await useCase.execute(7, { ...body, concepto: 'MATRICULA', monto: 150 }, 3, { transaction: 'TX' });
      expect(deps.pagoCapacitacionRepository.create).toHaveBeenCalledTimes(1);
    });
  });

});
