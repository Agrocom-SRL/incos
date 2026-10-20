import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { CreateInscripcionCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/CreateInscripcionCapacitacionUseCase.js'
);

describe('CreateInscripcionCapacitacionUseCase', () => {
  const cursoAbierto = (o = {}) => ({
    id: 1,
titulo: 'Excel',
estado: 'ABIERTO',
fechaInicio: '2999-01-01',
fechaFin: '2999-12-31',
    costo: 100,
cupoMaximo: 30,
...o,
  });
  const participante = { id: 9, ci: '123', nombres: 'Ana', celular: '7' };

  const crear = ({
    curso = cursoAbierto(),
    part = participante,
    duplicadoCi = null,
    activa = null,
    conteos = [0, 0],
    inscripcionTrasPago = { id: 50, estado: 'PENDIENTE', participanteId: 9, capacitacionId: 1 },
  } = {}) => {
    const count = jest.fn();
    count.mockResolvedValueOnce(conteos[0]).mockResolvedValueOnce(conteos[1]);
    const deps = {
      inscripcionCapacitacionRepository: {
        count,
        findActivaByParticipanteAndCapacitacion: jest.fn().mockResolvedValue(activa),
        create: jest.fn().mockImplementation(async (d) => ({ id: 50, ...d })),
        findById: jest.fn().mockResolvedValue(inscripcionTrasPago),
      },
      participanteRepository: {
        findById: jest.fn().mockResolvedValue(part),
        findByCiExpedicion: jest.fn().mockResolvedValue(duplicadoCi),
        create: jest.fn().mockImplementation(async (d) => ({ id: 9, ...d })),
      },
      cursoCapacitacionRepository: { findById: jest.fn().mockResolvedValue(curso) },
      capacitacionCompromisoRepository: {
        create: jest.fn().mockImplementation(async (d) => ({ id: 3, ...d })),
      },
      registerPagoCapacitacionUseCase: {
        execute: jest.fn().mockResolvedValue({ pagoCapacitacion: { id: 1, monto: 40 } }),
      },
      logger: { info: jest.fn(), warn: jest.fn() },
    };
    return { deps, useCase: new CreateInscripcionCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('curso con costo, pago parcial: crea inscripción PENDIENTE, pago y compromiso', async () => {
    const { deps, useCase } = crear();
    const body = {
      capacitacionId: '1',
      participanteId: 9,
      fechaInscripcion: '2026-02-01',
      pagoInicial: { monto: 40, metodoPagoId: 1, fechaCompromiso: '2026-03-01' },
    };
    const res = await useCase.execute(body, 5);
    expect(deps.cursoCapacitacionRepository.findById).toHaveBeenCalledWith(1);
    expect(deps.inscripcionCapacitacionRepository.create).toHaveBeenCalledWith(
      {
        participanteId: 9,
capacitacionId: 1,
fechaInscripcion: '2026-02-01',
estado: 'PENDIENTE',
        montoObligatorio: 100,
estadoPago: 'PARCIAL',
      },
      5,
      { transaction: 'TX' }
    );
    expect(deps.registerPagoCapacitacionUseCase.execute).toHaveBeenCalledWith(50, body.pagoInicial, 5, {
      transaction: 'TX',
    });
    expect(deps.capacitacionCompromisoRepository.create).toHaveBeenCalledWith(
      { capacitacionInscritoId: 50, fechaCompromiso: '2026-03-01', observacion: null, estado: 'VIGENTE' },
      5,
      { transaction: 'TX' }
    );
    expect(res.inscripcionCapacitacion).toMatchObject({
      capacitacionTitulo: 'Excel',
costo: 100,
fechaCompromiso: '2026-03-01',
compromisoEstado: 'VIGENTE',
      pagoInicial: { id: 1, monto: 40 },
    });
    expect(res.inscripcionCapacitacion.participante.id).toBe(9);
  });

  it('pago inicial que cubre el costo no crea compromiso', async () => {
    const { deps, useCase } = crear({
      inscripcionTrasPago: { id: 50, estado: 'INSCRITO', participanteId: 9, capacitacionId: 1 },
    });
    const res = await useCase.execute({
      capacitacionId: 1, participanteId: 9, pagoInicial: { monto: 100, metodoPagoId: 1 },
    });
    expect(deps.capacitacionCompromisoRepository.create).not.toHaveBeenCalled();
    expect(res.inscripcionCapacitacion.estado).toBe('INSCRITO');
    expect(res.inscripcionCapacitacion.compromisoEstado).toBeUndefined();
  });

  it('curso gratuito: INSCRITO/CANCELADO sin pago e ignora pagoInicial', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto({ costo: 0 }) });
    await useCase.execute({ capacitacionId: 1, participanteId: 9, pagoInicial: { monto: 5 } });
    expect(deps.inscripcionCapacitacionRepository.create.mock.calls[0][0]).toMatchObject({
      estado: 'INSCRITO', estadoPago: 'CANCELADO', montoObligatorio: 0,
    });
    expect(deps.registerPagoCapacitacionUseCase.execute).not.toHaveBeenCalled();
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('crea participante nuevo cuando se envía el objeto participante', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto({ costo: 0 }) });
    await useCase.execute({
      capacitacionId: 1,
      participante: { ci: ' 55 ', expedicion: 'LP', nombres: ' Luis ', celular: ' 7 ' },
    });
    expect(deps.participanteRepository.findByCiExpedicion).toHaveBeenCalledWith('55', 'LP');
    expect(deps.participanteRepository.create).toHaveBeenCalledWith(
      {
        ci: '55',
expedicion: 'LP',
nombres: 'Luis',
apellidoPaterno: null,
apellidoMaterno: null,
        celular: '7',
email: null,
      },
      null,
      { transaction: 'TX' }
    );
  });

  it('acepta inscripciones en curso EN_CURSO efectivo y solo avisa del cupo excedido', async () => {
    const { deps, useCase } = crear({
      curso: cursoAbierto({ fechaInicio: '2000-01-01', costo: 0, cupoMaximo: 2 }),
      conteos: [1, 1],
    });
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 9 })).resolves.toBeDefined();
    expect(deps.logger.warn).toHaveBeenCalledWith(expect.stringContaining('cupo'), expect.any(Object));
  });

  it.each([[undefined], [null], [0], ['abc'], [NaN]])('rechaza capacitacionId inválido (%p)', async (capacitacionId) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ capacitacionId, participanteId: 9 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { useCase } = crear({ curso: null });
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 9 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([
    ['PROPUESTO', '2999-01-01', '2999-12-31'],
    ['CANCELADO', '2999-01-01', '2999-12-31'],
    ['ABIERTO', '2000-01-01', '2000-02-01'],
  ])('rechaza inscribir en curso %s (%s a %s)', async (estado, fechaInicio, fechaFin) => {
    const { deps, useCase } = crear({ curso: cursoAbierto({ estado, fechaInicio, fechaFin }) });
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 9 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it.each([
    [undefined],
    [{ monto: 0 }],
    [{ monto: 'abc' }],
    [{ monto: NaN }],
    [{ monto: -3 }],
  ])('curso con costo exige pagoInicial válido (%p)', async (pagoInicial) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 9, pagoInicial })).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('exige fechaCompromiso si el pago inicial es parcial', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute({ capacitacionId: 1, participanteId: 9, pagoInicial: { monto: 10, metodoPagoId: 1 } })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('exige participanteId o participante, pero no ambos', async () => {
    const { useCase } = crear({ curso: cursoAbierto({ costo: 0 }) });
    await expect(useCase.execute({ capacitacionId: 1 })).rejects.toBeInstanceOf(ValidationError);
    await expect(
      useCase.execute({ capacitacionId: 1, participanteId: 9, participante: { ci: '1', nombres: 'a', celular: '1' } })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([['ci'], ['nombres'], ['celular']])('rechaza participante.%s vacío', async (campo) => {
    const { useCase } = crear({ curso: cursoAbierto({ costo: 0 }) });
    const participante = { ci: '1', nombres: 'a', celular: '1', [campo]: ' ' };
    await expect(useCase.execute({ capacitacionId: 1, participante })).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si participanteId no existe', async () => {
    const { useCase } = crear({ curso: cursoAbierto({ costo: 0 }), part: null });
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 77 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ConflictError si el CI del participante nuevo ya existe', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto({ costo: 0 }), duplicadoCi: { id: 2 } });
    await expect(
      useCase.execute({ capacitacionId: 1, participante: { ci: '1', nombres: 'a', celular: '1' } })
    ).rejects.toBeInstanceOf(ConflictError);
    expect(deps.participanteRepository.create).not.toHaveBeenCalled();
  });

  it('lanza ConflictError si ya hay una inscripción vigente del participante', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto({ costo: 0 }), activa: { id: 8 } });
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 9 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
  });
});
