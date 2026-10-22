import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { AnularPagoCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/AnularPagoCapacitacionUseCase.js'
);

const NO_EXTERNO = { pagoCursoExterno: false, requisitoId: null, requisitoDescripcion: null, acreditado: false };

describe('AnularPagoCapacitacionUseCase', () => {
  const inscripcionBase = {
    id: 7,
    capacitacionId: 1,
    estado: 'INSCRITO',
    montoObligatorio: 0,
    montoMatricula: 150,
    estadoPago: 'CANCELADO',
    estadoPagoCurso: 'CANCELADO',
    estadoPagoMatricula: 'CANCELADO',
  };
  const pagoBase = {
    id: 42,
    capacitacionInscritoId: 7,
    concepto: 'MATRICULA',
    monto: 150,
    numeroRecibo: '000042',
    anulado: false,
  };

  const crear = ({ inscripcion = inscripcionBase, pago = pagoBase, totalesDespues = { MATRICULA: 0, CURSO: 0 } } = {}) => {
    const deps = {
      pagoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(pago),
        sumMontosPorConcepto: jest.fn().mockResolvedValue(totalesDespues),
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
        contarObligatoriosPendientes: jest.fn().mockResolvedValue(0),
        resolverPagoCursoExterno: jest.fn().mockResolvedValue(NO_EXTERNO),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new AnularPagoCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('marca el pago como anulado con motivo, fecha y usuario (sin borrarlo) y recalcula', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(7, 42, { motivo: '  Monto mal digitado ' }, 9);

    const [id, datos, userId, opciones] = deps.pagoCapacitacionRepository.update.mock.calls[0];
    expect([id, userId, opciones]).toEqual([42, 9, { transaction: 'TX' }]);
    expect(datos).toMatchObject({ anulado: true, motivoAnulacion: 'Monto mal digitado', anuladoPor: 9 });
    expect(datos.fechaAnulacion).toBeInstanceOf(Date);

    expect(res.pagoCapacitacion).toMatchObject({ id: 42, anulado: true, motivoAnulacion: 'Monto mal digitado' });
    // el pago anulado ya no cuenta: matrícula vuelve a PARCIAL y la inscripción a PENDIENTE
    expect(res.pagoCapacitacion.inscripcion).toMatchObject({
      estado: 'PENDIENTE',
      estadoPagoMatricula: 'PARCIAL',
      saldoMatricula: 150,
    });
  });

  it.each([[undefined], [null], ['   '], ['ab'], ['x'.repeat(501)]])('exige un motivo válido (%s)', async (motivo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(7, 42, { motivo })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.pagoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('409 si el pago ya está anulado o la inscripción está retirada/anulada', async () => {
    const yaAnulado = crear({ pago: { ...pagoBase, anulado: true } });
    await expect(yaAnulado.useCase.execute(7, 42, { motivo: 'error' })).rejects.toBeInstanceOf(ConflictError);
    const cerrada = crear({ inscripcion: { ...inscripcionBase, estado: 'ANULADO' } });
    await expect(cerrada.useCase.execute(7, 42, { motivo: 'error' })).rejects.toBeInstanceOf(ConflictError);
  });

  it('404 si el pago no es de la inscripción o la inscripción no existe', async () => {
    const ajeno = crear({ pago: { ...pagoBase, capacitacionInscritoId: 8 } });
    await expect(ajeno.useCase.execute(7, 42, { motivo: 'error' })).rejects.toBeInstanceOf(NotFoundError);
    const sinInscripcion = crear();
    sinInscripcion.deps.inscripcionCapacitacionRepository.findById.mockResolvedValue(null);
    await expect(sinInscripcion.useCase.execute(7, 42, { motivo: 'error' })).rejects.toBeInstanceOf(NotFoundError);
  });
});
