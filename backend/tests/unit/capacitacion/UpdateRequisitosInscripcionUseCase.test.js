import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { UpdateRequisitosInscripcionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/UpdateRequisitosInscripcionUseCase.js'
);

describe('UpdateRequisitosInscripcionUseCase', () => {
  const inscripcionBase = {
    id: 7, capacitacionId: 1, estado: 'PENDIENTE', montoObligatorio: 440, montoMatricula: 150,
    estadoPago: 'CANCELADO', estadoPagoCurso: 'CANCELADO', estadoPagoMatricula: 'CANCELADO',
  };

  const crear = ({ inscripcion = inscripcionBase, requisitosCurso = [{ id: 1 }, { id: 2 }], existente = null, pendientes = 0 } = {}) => {
    const deps = {
      inscripcionCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(inscripcion),
        update: jest.fn(),
      },
      capacitacionRequisitoRepository: { findByCapacitacionId: jest.fn().mockResolvedValue(requisitosCurso) },
      capacitacionInscritoRequisitoRepository: {
        findByInscripcionAndRequisito: jest.fn().mockResolvedValue(existente),
        create: jest.fn(),
        update: jest.fn(),
        contarObligatoriosPendientes: jest.fn().mockResolvedValue(pendientes),
        findChecklistByInscripcionId: jest.fn().mockResolvedValue([
          { requisito_id: 1, descripcion: 'A', obligatorio: 1, orden: 1, entregado: 1, fecha_entrega: '2026-01-01', observacion: null },
        ]),
      },
      pagoCapacitacionRepository: {
        sumMontosPorConcepto: jest.fn().mockResolvedValue({ MATRICULA: 150, CURSO: 440 }),
      },
      capacitacionCompromisoRepository: { findVigenteByInscripcionId: jest.fn().mockResolvedValue(null), update: jest.fn() },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdateRequisitosInscripcionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('crea la entrega, recalcula y pasa a INSCRITO cuando todo está pagado y sin pendientes', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(
      '7',
      { requisitos: [{ requisitoId: 1, entregado: true, fechaEntrega: '2026-02-01', observacion: ' ok ' }] },
      3
    );
    expect(deps.capacitacionInscritoRequisitoRepository.create).toHaveBeenCalledWith(
      { capacitacionInscritoId: 7, capacitacionRequisitoId: 1, entregado: true, fechaEntrega: '2026-02-01', observacion: 'ok' },
      3,
      { transaction: 'TX' }
    );
    expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(7, { estado: 'INSCRITO' }, 3, {
      transaction: 'TX',
    });
    expect(res.inscripcionCapacitacion).toMatchObject({ id: 7, estado: 'INSCRITO', requisitosPendientes: 0 });
    expect(res.inscripcionCapacitacion.requisitos[0]).toMatchObject({ requisitoId: 1, entregado: true });
  });

  it('actualiza la fila existente y, si se desmarca, limpia fechaEntrega y vuelve a PENDIENTE', async () => {
    const { deps, useCase } = crear({
      inscripcion: { ...inscripcionBase, estado: 'INSCRITO' },
      existente: { id: 55 },
      pendientes: 1,
    });
    const res = await useCase.execute(7, { requisitos: [{ requisitoId: 1, entregado: false, fechaEntrega: '2026-02-01' }] }, 3);
    expect(deps.capacitacionInscritoRequisitoRepository.update).toHaveBeenCalledWith(
      55, { entregado: false, fechaEntrega: null, observacion: null }, 3, { transaction: 'TX' }
    );
    expect(deps.capacitacionInscritoRequisitoRepository.create).not.toHaveBeenCalled();
    expect(res.inscripcionCapacitacion.estado).toBe('PENDIENTE');
  });

  it('entregado sin fecha usa la fecha de hoy', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(7, { requisitos: [{ requisitoId: 2, entregado: true }] });
    expect(deps.capacitacionInscritoRequisitoRepository.create.mock.calls[0][0].fechaEntrega).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });

  it.each([['RETIRADO'], ['ANULADO']])('nunca cambia el estado de una inscripción %s', async (estado) => {
    const { deps, useCase } = crear({ inscripcion: { ...inscripcionBase, estado } });
    const res = await useCase.execute(7, { requisitos: [{ requisitoId: 1, entregado: true }] });
    expect(res.inscripcionCapacitacion.estado).toBe(estado);
    expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la inscripción no existe', async () => {
    const { useCase } = crear({ inscripcion: null });
    await expect(useCase.execute(9, { requisitos: [{ requisitoId: 1, entregado: true }] })).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it.each([[undefined], [[]], ['x'], [[null]], [[{ requisitoId: 'a', entregado: true }]], [[{ requisitoId: 1 }]],
    [[{ requisitoId: 1, entregado: 'quizás' }]], [[{ requisitoId: 1, entregado: true, fechaEntrega: '2026-13-01' }]],
    [[{ requisitoId: 1, entregado: true, observacion: 'x'.repeat(256) }]],
    [[{ requisitoId: 1, entregado: true }, { requisitoId: 1, entregado: false }]],
  ])('rechaza requisitos inválidos (%p)', async (requisitos) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(7, { requisitos })).rejects.toBeInstanceOf(ValidationError);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.capacitacionInscritoRequisitoRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un requisito que no es del curso de la inscripción', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(7, { requisitos: [{ requisitoId: 99, entregado: true }] })).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it.each([['abc'], [0], [null]])('rechaza id de inscripción inválido (%p)', async (id) => {
    const { useCase } = crear();
    await expect(useCase.execute(id, { requisitos: [{ requisitoId: 1, entregado: true }] })).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});
