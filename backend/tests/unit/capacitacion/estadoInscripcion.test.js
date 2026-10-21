import { describe, it, expect, jest } from '@jest/globals';
import {
  aCentavos,
  calcularEstadosInscripcion,
  recalcularEstadoInscripcion,
} from '../../../src/application/use-cases/capacitacion/helpers/estadoInscripcion.js';

describe('estadoInscripcion (helper de dominio)', () => {
  const base = {
    montoCurso: 440,
    montoMatricula: 150,
    pagadoCurso: 0,
    pagadoMatricula: 0,
    requisitosPendientes: 0,
    estadoActual: 'PENDIENTE',
  };

  it('sin pagos queda PENDIENTE con ambos conceptos PARCIAL y saldos completos', () => {
    expect(calcularEstadosInscripcion(base)).toEqual({
      estadoPagoCurso: 'PARCIAL',
      estadoPagoMatricula: 'PARCIAL',
      estadoPago: 'PARCIAL',
      estado: 'PENDIENTE',
      saldoCurso: 440,
      saldoMatricula: 150,
    });
  });

  it('cada concepto se cancela por separado y el global exige ambos', () => {
    const soloCurso = calcularEstadosInscripcion({ ...base, pagadoCurso: 440 });
    expect(soloCurso).toMatchObject({ estadoPagoCurso: 'CANCELADO', estadoPagoMatricula: 'PARCIAL', estadoPago: 'PARCIAL' });
    const soloMatricula = calcularEstadosInscripcion({ ...base, pagadoMatricula: 150 });
    expect(soloMatricula).toMatchObject({ estadoPagoCurso: 'PARCIAL', estadoPagoMatricula: 'CANCELADO', estadoPago: 'PARCIAL' });
  });

  it('INSCRITO solo con ambos cancelados y requisitos obligatorios entregados', () => {
    const pagado = { ...base, pagadoCurso: 440, pagadoMatricula: 150 };
    expect(calcularEstadosInscripcion(pagado).estado).toBe('INSCRITO');
    expect(calcularEstadosInscripcion({ ...pagado, requisitosPendientes: 1 }).estado).toBe('PENDIENTE');
  });

  it('un concepto con monto 0 cuenta como cancelado (curso gratuito o sin matrícula)', () => {
    const r = calcularEstadosInscripcion({ ...base, montoCurso: 0, montoMatricula: 0 });
    expect(r).toMatchObject({ estadoPago: 'CANCELADO', estado: 'INSCRITO' });
  });

  it('nunca baja ni sube de RETIRADO/ANULADO', () => {
    for (const estadoActual of ['RETIRADO', 'ANULADO']) {
      expect(calcularEstadosInscripcion({ ...base, estadoActual }).estado).toBe(estadoActual);
      expect(
        calcularEstadosInscripcion({ ...base, estadoActual, pagadoCurso: 440, pagadoMatricula: 150 }).estado
      ).toBe(estadoActual);
    }
  });

  it('una inscripción INSCRITO vuelve a PENDIENTE si se marca un requisito obligatorio como no entregado', () => {
    const r = calcularEstadosInscripcion({
      ...base, pagadoCurso: 440, pagadoMatricula: 150, requisitosPendientes: 1, estadoActual: 'INSCRITO',
    });
    expect(r.estado).toBe('PENDIENTE');
  });

  it('compara en centavos (sin errores de coma flotante)', () => {
    expect(aCentavos(0.1 + 0.2)).toBe(30);
    const r = calcularEstadosInscripcion({ ...base, montoCurso: 0.3, montoMatricula: 0, pagadoCurso: 0.1 + 0.2 });
    expect(r.estadoPagoCurso).toBe('CANCELADO');
  });

  describe('recalcularEstadoInscripcion', () => {
    const armar = ({ pagos, pendientes, vigente = null, inscripcion }) => {
      const deps = {
        pagoCapacitacionRepository: { sumMontosPorConcepto: jest.fn().mockResolvedValue(pagos) },
        capacitacionInscritoRequisitoRepository: {
          contarObligatoriosPendientes: jest.fn().mockResolvedValue(pendientes),
        },
        inscripcionCapacitacionRepository: { update: jest.fn() },
        capacitacionCompromisoRepository: {
          findVigenteByInscripcionId: jest.fn().mockResolvedValue(vigente),
          update: jest.fn(),
        },
      };
      return { deps, run: () => recalcularEstadoInscripcion({ ...deps, inscripcion, userId: 2, transaction: 'TX' }) };
    };
    const inscripcion = {
      id: 5, capacitacionId: 1, estado: 'PENDIENTE', montoObligatorio: 100, montoMatricula: 0,
      estadoPago: 'PARCIAL', estadoPagoCurso: 'PARCIAL', estadoPagoMatricula: 'CANCELADO',
    };

    it('persiste solo lo que cambió y cierra el compromiso cuando no queda saldo', async () => {
      const { deps, run } = armar({ pagos: { MATRICULA: 0, CURSO: 100 }, pendientes: 0, vigente: { id: 8 }, inscripcion });
      const r = await run();
      expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(
        5,
        { estado: 'INSCRITO', estadoPago: 'CANCELADO', estadoPagoCurso: 'CANCELADO' },
        2,
        { transaction: 'TX' }
      );
      expect(deps.capacitacionCompromisoRepository.update).toHaveBeenCalledWith(8, { estado: 'CUMPLIDO' }, 2, {
        transaction: 'TX',
      });
      expect(r.compromisoCerrado).toBe(true);
    });

    it('sin cambios no escribe ni toca el compromiso si queda saldo', async () => {
      const { deps, run } = armar({ pagos: { MATRICULA: 0, CURSO: 10 }, pendientes: 0, vigente: { id: 8 }, inscripcion });
      await run();
      expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
      expect(deps.capacitacionCompromisoRepository.update).not.toHaveBeenCalled();
    });
  });
});
