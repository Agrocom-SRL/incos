import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { CreateInscripcionCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/CreateInscripcionCapacitacionUseCase.js'
);

const NO_EXTERNO = {
  pagoCursoExterno: false,
  requisitoId: null,
  requisitoDescripcion: null,
  acreditado: false,
};

describe('CreateInscripcionCapacitacionUseCase', () => {
  const cursoAbierto = (o = {}) => ({
    id: 1,
    titulo: 'Guaraní',
    estado: 'ABIERTO',
    fechaInicio: '2999-01-01',
    fechaFin: '2999-12-31',
    tieneCosto: true,
    costo: 440,
    cobraMatricula: true,
    costoMatricula: 150,
    cupoMaximo: 30,
    ...o,
  });
  const gratis = { tieneCosto: false, costo: 0, cobraMatricula: false, costoMatricula: 0 };
  const participante = { id: 9, ci: '123', nombres: 'Ana', celular: '7' };

  const crear = ({
    curso = cursoAbierto(),
    part = participante,
    duplicadoCi = null,
    activa = null,
    conteos = [0, 0],
    grupos = [],
    conteoGrupo = 0,
    requisitosCurso = [],
    pagos = { MATRICULA: 0, CURSO: 0 },
    pendientes = 0,
    resultadoPago = null,
  } = {}) => {
    const count = jest.fn();
    count.mockResolvedValueOnce(conteos[0]).mockResolvedValueOnce(conteos[1]);
    const inscripcionesGuardadas = {};
    const deps = {
      inscripcionCapacitacionRepository: {
        count,
        findActivaByParticipanteAndCapacitacion: jest.fn().mockResolvedValue(activa),
        create: jest.fn().mockImplementation(async (d) => {
          Object.assign(inscripcionesGuardadas, { id: 50, ...d });
          return { id: 50, ...d };
        }),
        update: jest.fn().mockImplementation(async (id, d) => {
          Object.assign(inscripcionesGuardadas, d);
          return { ...inscripcionesGuardadas };
        }),
        findById: jest.fn().mockImplementation(async () => ({ ...inscripcionesGuardadas })),
        countVigentesByGrupoIds: jest.fn().mockImplementation(async (ids) => ({ [ids[0]]: conteoGrupo })),
      },
      participanteRepository: {
        findById: jest.fn().mockResolvedValue(part),
        findByCiExpedicion: jest.fn().mockResolvedValue(duplicadoCi),
        create: jest.fn().mockImplementation(async (d) => ({ id: 9, ...d })),
      },
      cursoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(curso),
      },
      grupoCapacitacionRepository: { findByCapacitacionId: jest.fn().mockResolvedValue(grupos) },
      capacitacionCompromisoRepository: {
        create: jest.fn().mockImplementation(async (d) => ({ id: 3, ...d })),
        findVigenteByInscripcionId: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
      capacitacionRequisitoRepository: {
        findByCapacitacionId: jest.fn().mockResolvedValue(requisitosCurso),
      },
      capacitacionInscritoRequisitoRepository: {
        create: jest.fn().mockResolvedValue({}),
        contarObligatoriosPendientes: jest.fn().mockResolvedValue(pendientes),
        resolverPagoCursoExterno: jest.fn().mockResolvedValue(NO_EXTERNO),
      },
      pagoCapacitacionRepository: { sumMontosPorConcepto: jest.fn().mockResolvedValue(pagos) },
      registerPagoCapacitacionUseCase: {
        execute: jest.fn().mockResolvedValue(
          resultadoPago ?? {
            pagoCapacitacion: { id: 1, monto: 150, inscripcion: { saldoCurso: 440, saldoMatricula: 0 } },
          }
        ),
      },
      logger: { info: jest.fn(), warn: jest.fn() },
    };
    return { deps, useCase: new CreateInscripcionCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('sin pago inicial ni requisitos: se registra PENDIENTE con snapshots de curso y matrícula', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(
      { capacitacionId: '1', participanteId: 9, fechaInscripcion: '2026-02-01' },
      5
    );
    expect(deps.inscripcionCapacitacionRepository.create).toHaveBeenCalledWith(
      {
        participanteId: 9,
        capacitacionId: 1,
        fechaInscripcion: '2026-02-01',
        estado: 'PENDIENTE',
        montoObligatorio: 440,
        montoMatricula: 150,
        estadoPago: 'PARCIAL',
        estadoPagoCurso: 'PARCIAL',
        estadoPagoMatricula: 'PARCIAL',
        capacitacionGrupoId: null,
      },
      5,
      { transaction: 'TX' }
    );
    expect(deps.registerPagoCapacitacionUseCase.execute).not.toHaveBeenCalled();
    expect(res.inscripcionCapacitacion).toMatchObject({
      estado: 'PENDIENTE',
      capacitacionTitulo: 'Guaraní',
      costo: 440,
      pagoInicial: null,
    });
  });

  it('acepta cursoId como alias de capacitacionId', async () => {
    const { deps, useCase } = crear();
    await useCase.execute({ cursoId: 1, participanteId: 9 });
    expect(deps.cursoCapacitacionRepository.findById).toHaveBeenCalledWith(1);
  });

  it('pago inicial de matrícula: delega en RegisterPago con la transacción y crea compromiso si queda saldo', async () => {
    const { deps, useCase } = crear({ pagos: { MATRICULA: 150, CURSO: 0 } });
    const body = {
      capacitacionId: 1,
      participanteId: 9,
      pagoInicial: { concepto: 'MATRICULA', monto: 150, metodoPagoId: 1, fechaCompromiso: '2026-03-01' },
    };
    const res = await useCase.execute(body, 5);
    expect(deps.registerPagoCapacitacionUseCase.execute).toHaveBeenCalledWith(50, body.pagoInicial, 5, {
      transaction: 'TX',
    });
    expect(deps.capacitacionCompromisoRepository.create).toHaveBeenCalledWith(
      { capacitacionInscritoId: 50, fechaCompromiso: '2026-03-01', observacion: null, estado: 'VIGENTE' },
      5,
      { transaction: 'TX' }
    );
    expect(res.inscripcionCapacitacion).toMatchObject({
      fechaCompromiso: '2026-03-01',
      compromisoEstado: 'VIGENTE',
      pagoInicial: { id: 1 },
      saldoCurso: 440,
      saldoMatricula: 0,
    });
  });

  it('el pago inicial ya no es obligatorio ni exige fechaCompromiso aunque haya saldo', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 9 })).resolves.toBeDefined();
    expect(deps.capacitacionCompromisoRepository.create).not.toHaveBeenCalled();
  });

  it('INSCRITO solo con matrícula y curso cancelados y requisitos obligatorios entregados', async () => {
    const { deps, useCase } = crear({
      pagos: { MATRICULA: 150, CURSO: 440 },
      pendientes: 0,
      requisitosCurso: [{ id: 7 }],
    });
    const res = await useCase.execute({
      capacitacionId: 1,
      participanteId: 9,
      requisitosEntregados: [7],
      pagoInicial: { concepto: 'CURSO', monto: 440, metodoPagoId: 1 },
    });
    expect(deps.capacitacionInscritoRequisitoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ capacitacionRequisitoId: 7, entregado: true }),
      null,
      { transaction: 'TX' }
    );
    expect(res.inscripcionCapacitacion.estado).toBe('PENDIENTE');
  });

  it('todo pagado pero faltan requisitos obligatorios: queda PENDIENTE', async () => {
    const { deps, useCase } = crear({
      pagos: { MATRICULA: 150, CURSO: 440 },
      pendientes: 2,
      resultadoPago: { pagoCapacitacion: { id: 1, monto: 1 } },
    });
    const res = await useCase.execute({
      capacitacionId: 1,
      participanteId: 9,
      pagoInicial: { concepto: 'CURSO', monto: 440, metodoPagoId: 1 },
    });
    // RegisterPago simulado no recalcula: el use case recalcula al no recibir resumen
    expect(deps.capacitacionInscritoRequisitoRepository.contarObligatoriosPendientes).toHaveBeenCalled();
    expect(res.inscripcionCapacitacion.estado).toBe('PENDIENTE');
    expect(res.inscripcionCapacitacion.estadoPago).toBe('CANCELADO');
  });

  it('todo cancelado y sin requisitos pendientes: pasa a INSCRITO', async () => {
    const { useCase } = crear({
      pagos: { MATRICULA: 150, CURSO: 440 },
      pendientes: 0,
      resultadoPago: { pagoCapacitacion: { id: 1, monto: 1 } },
    });
    const res = await useCase.execute({
      capacitacionId: 1,
      participanteId: 9,
      pagoInicial: { concepto: 'CURSO', monto: 440, metodoPagoId: 1 },
    });
    expect(res.inscripcionCapacitacion).toMatchObject({ estado: 'INSCRITO', estadoPago: 'CANCELADO' });
  });

  it('curso gratuito sin requisitos: INSCRITO sin pago, e ignora pagoInicial', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto(gratis) });
    const res = await useCase.execute({ capacitacionId: 1, participanteId: 9, pagoInicial: { monto: 5 } });
    expect(deps.registerPagoCapacitacionUseCase.execute).not.toHaveBeenCalled();
    expect(deps.logger.warn).toHaveBeenCalled();
    expect(res.inscripcionCapacitacion).toMatchObject({ estado: 'INSCRITO', estadoPago: 'CANCELADO' });
  });

  describe('elección de grupo', () => {
    const g1 = { id: 4, nombre: 'Grupo 1 – Mañana', cupoMaximo: null };
    const g2 = { id: 5, nombre: 'Grupo 2 – Tarde', cupoMaximo: 2 };

    it('curso sin grupos: capacitacionGrupoId queda null y enviar uno es un error', async () => {
      const { deps, useCase } = crear();
      await useCase.execute({ capacitacionId: 1, participanteId: 9 });
      expect(deps.inscripcionCapacitacionRepository.create.mock.calls[0][0].capacitacionGrupoId).toBeNull();
      await expect(
        useCase.execute({ capacitacionId: 1, participanteId: 9, capacitacionGrupoId: 4 })
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('curso con un solo grupo: se asigna solo', async () => {
      const { deps, useCase } = crear({ grupos: [g1] });
      const res = await useCase.execute({ capacitacionId: 1, participanteId: 9 });
      expect(deps.inscripcionCapacitacionRepository.create.mock.calls[0][0].capacitacionGrupoId).toBe(4);
      expect(res.inscripcionCapacitacion.capacitacionGrupoId).toBe(4);
    });

    it('con 2 o más grupos el grupo es obligatorio', async () => {
      const { deps, useCase } = crear({ grupos: [g1, g2] });
      await expect(useCase.execute({ capacitacionId: 1, participanteId: 9 })).rejects.toThrow(/capacitacionGrupoId es requerido/);
      expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
    });

    it('el grupo debe pertenecer al curso', async () => {
      const { deps, useCase } = crear({ grupos: [g1, g2] });
      await expect(
        useCase.execute({ capacitacionId: 1, participanteId: 9, capacitacionGrupoId: 99 })
      ).rejects.toBeInstanceOf(ValidationError);
      expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
    });

    it('guarda el grupo elegido', async () => {
      const { deps, useCase } = crear({ grupos: [g1, g2] });
      await useCase.execute({ capacitacionId: 1, participanteId: 9, capacitacionGrupoId: '4' });
      expect(deps.inscripcionCapacitacionRepository.create.mock.calls[0][0].capacitacionGrupoId).toBe(4);
      // grupo sin cupo propio: no consulta el cupo (rige el cupo informativo del curso)
      expect(deps.inscripcionCapacitacionRepository.countVigentesByGrupoIds).not.toHaveBeenCalled();
    });

    it('un grupo con cupo propio lleno bloquea la inscripción (409)', async () => {
      const { deps, useCase } = crear({ grupos: [g1, g2], conteoGrupo: 2 });
      await expect(
        useCase.execute({ capacitacionId: 1, participanteId: 9, capacitacionGrupoId: 5 })
      ).rejects.toBeInstanceOf(ConflictError);
      expect(deps.inscripcionCapacitacionRepository.countVigentesByGrupoIds).toHaveBeenCalledWith([5]);
      expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
    });

    it('un grupo con cupo propio con lugar disponible acepta la inscripción', async () => {
      const { deps, useCase } = crear({ grupos: [g1, g2], conteoGrupo: 1 });
      await useCase.execute({ capacitacionId: 1, participanteId: 9, capacitacionGrupoId: 5 });
      expect(deps.inscripcionCapacitacionRepository.create.mock.calls[0][0].capacitacionGrupoId).toBe(5);
    });

    it.each([['x'], [0], [-1], [1.5]])('rechaza capacitacionGrupoId inválido (%p)', async (valor) => {
      const { useCase } = crear({ grupos: [g1, g2] });
      await expect(
        useCase.execute({ capacitacionId: 1, participanteId: 9, capacitacionGrupoId: valor })
      ).rejects.toBeInstanceOf(ValidationError);
    });
  });

  it('un curso con costo pero sin interruptores activos se trata como gratuito (los flags mandan, no el monto)', async () => {
    const { deps, useCase } = crear({
      curso: cursoAbierto({ tieneCosto: false, cobraMatricula: false, costo: 999, costoMatricula: 999 }),
    });
    const res = await useCase.execute({ capacitacionId: 1, participanteId: 9, pagoInicial: { monto: 5 } });
    expect(deps.inscripcionCapacitacionRepository.create.mock.calls[0][0]).toMatchObject({
      montoObligatorio: 0, montoMatricula: 0,
    });
    expect(deps.registerPagoCapacitacionUseCase.execute).not.toHaveBeenCalled();
    expect(res.inscripcionCapacitacion.estado).toBe('INSCRITO');
  });

  it('solo cobra matrícula: el snapshot del curso es 0 y la matrícula se cobra', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto({ tieneCosto: false, costo: 440 }) });
    const res = await useCase.execute({ capacitacionId: 1, participanteId: 9 });
    expect(deps.inscripcionCapacitacionRepository.create.mock.calls[0][0]).toMatchObject({
      montoObligatorio: 0, montoMatricula: 150, estadoPagoCurso: 'CANCELADO', estadoPagoMatricula: 'PARCIAL',
    });
    expect(res.inscripcionCapacitacion.estado).toBe('PENDIENTE');
  });

  it('rechaza requisitosEntregados que no pertenecen al curso o no son ids', async () => {
    const { deps, useCase } = crear({ requisitosCurso: [{ id: 7 }] });
    await expect(
      useCase.execute({ capacitacionId: 1, participanteId: 9, requisitosEntregados: [8] })
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      useCase.execute({ capacitacionId: 1, participanteId: 9, requisitosEntregados: ['a'] })
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      useCase.execute({ capacitacionId: 1, participanteId: 9, requisitosEntregados: 'x' })
    ).rejects.toBeInstanceOf(ValidationError);
    expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza pagoInicial que no es objeto y fechaCompromiso inválida', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute({ capacitacionId: 1, participanteId: 9, pagoInicial: 'x' })
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      useCase.execute({ capacitacionId: 1, participanteId: 9, fechaCompromiso: '2026-02-31' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('crea participante nuevo cuando se envía el objeto participante', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto(gratis) });
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

  it('acepta curso EN_CURSO efectivo (incluso sin fechaFin) y solo avisa del cupo excedido', async () => {
    const { deps, useCase } = crear({
      curso: cursoAbierto({ ...gratis, fechaInicio: '2000-01-01', fechaFin: null, cupoMaximo: 2 }),
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

  it('exige participanteId o participante, pero no ambos', async () => {
    const { useCase } = crear({ curso: cursoAbierto(gratis) });
    await expect(useCase.execute({ capacitacionId: 1 })).rejects.toBeInstanceOf(ValidationError);
    await expect(
      useCase.execute({ capacitacionId: 1, participanteId: 9, participante: { ci: '1', nombres: 'a', celular: '1' } })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([['ci'], ['nombres'], ['celular']])('rechaza participante.%s vacío', async (campo) => {
    const { useCase } = crear({ curso: cursoAbierto(gratis) });
    const participanteBody = { ci: '1', nombres: 'a', celular: '1', [campo]: ' ' };
    await expect(useCase.execute({ capacitacionId: 1, participante: participanteBody })).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it('lanza NotFoundError si participanteId no existe', async () => {
    const { useCase } = crear({ curso: cursoAbierto(gratis), part: null });
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 77 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ConflictError si el CI del participante nuevo ya existe', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto(gratis), duplicadoCi: { id: 2 } });
    await expect(
      useCase.execute({ capacitacionId: 1, participante: { ci: '1', nombres: 'a', celular: '1' } })
    ).rejects.toBeInstanceOf(ConflictError);
    expect(deps.participanteRepository.create).not.toHaveBeenCalled();
  });

  it('lanza ConflictError si ya hay una inscripción vigente del participante', async () => {
    const { deps, useCase } = crear({ curso: cursoAbierto(gratis), activa: { id: 8 } });
    await expect(useCase.execute({ capacitacionId: 1, participanteId: 9 })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  describe('curso con entidad certificadora (costo del curso externo)', () => {
    it('rechaza un pagoInicial de concepto CURSO antes de crear nada', async () => {
      const { deps, useCase } = crear({ curso: cursoAbierto({ entidadCertificadora: 'IPELC' }) });
      await expect(
        useCase.execute(
          { capacitacionId: 1, participanteId: 9, pagoInicial: { concepto: 'curso', monto: 100, metodoPagoId: 1 } },
          5
        )
      ).rejects.toBeInstanceOf(ValidationError);
      expect(mockTransaction).not.toHaveBeenCalled();
      expect(deps.inscripcionCapacitacionRepository.create).not.toHaveBeenCalled();
    });

    it('acepta un pagoInicial de MATRÍCULA', async () => {
      const { deps, useCase } = crear({ curso: cursoAbierto({ entidadCertificadora: 'IPELC' }) });
      await useCase.execute(
        { capacitacionId: 1, participanteId: 9, pagoInicial: { concepto: 'MATRICULA', monto: 150, metodoPagoId: 1 } },
        5
      );
      expect(deps.registerPagoCapacitacionUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('un curso sin entidad conserva el pago de CURSO', async () => {
      const { deps, useCase } = crear();
      await useCase.execute(
        { capacitacionId: 1, participanteId: 9, pagoInicial: { concepto: 'CURSO', monto: 100, metodoPagoId: 1 } },
        5
      );
      expect(deps.registerPagoCapacitacionUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

});
