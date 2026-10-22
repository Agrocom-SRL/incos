import { describe, it, expect } from 'vitest';
import {
  conceptoSugerido,
  conceptosParaEditarPago,
  contarPagosVigentes,
  evaluarAccionPago,
  saldosCobrablesInscripcion,
  saldosParaEditarPago,
} from '../pagosCapacitacion';
import { buildConceptoOptions } from '../capacitacionCatalogos';

const inscripcion = { estado: 'PENDIENTE', saldoMatricula: 50, saldoCurso: 340, pagoCursoExterno: false };
const externa = { ...inscripcion, pagoCursoExterno: true };

describe('saldosCobrablesInscripcion', () => {
  it('curso normal: matrícula y curso', () => {
    expect(saldosCobrablesInscripcion(inscripcion)).toEqual({ MATRICULA: 50, CURSO: 340 });
  });

  it('curso externo: el curso no se cobra (solo se ofrece matrícula)', () => {
    const saldos = saldosCobrablesInscripcion(externa);
    expect(saldos.CURSO).toBe(0);
    expect(buildConceptoOptions(saldos).map((o) => o.value)).toEqual(['MATRICULA']);
    expect(conceptoSugerido(saldos)).toBe('MATRICULA');
  });

  it('sin saldo de matrícula sugiere el curso (curso normal)', () => {
    expect(conceptoSugerido(saldosCobrablesInscripcion({ ...inscripcion, saldoMatricula: 0 }))).toBe(
      'CURSO',
    );
  });
});

describe('saldosParaEditarPago', () => {
  it('descuenta el propio pago del concepto que ya tenía', () => {
    const saldos = saldosParaEditarPago(inscripcion, { concepto: 'MATRICULA', monto: 100 });
    expect(saldos).toEqual({ MATRICULA: 150, CURSO: 340 });
  });
});

describe('conceptosParaEditarPago', () => {
  it('ofrece ambos conceptos en cursos normales', () => {
    expect(conceptosParaEditarPago(inscripcion, { concepto: 'CURSO' }).map((o) => o.value)).toEqual([
      'MATRICULA',
      'CURSO',
    ]);
  });

  it('curso externo: solo matrícula, salvo que el pago histórico ya sea de curso', () => {
    expect(conceptosParaEditarPago(externa, { concepto: 'MATRICULA' }).map((o) => o.value)).toEqual([
      'MATRICULA',
    ]);
    expect(conceptosParaEditarPago(externa, { concepto: 'CURSO' }).map((o) => o.value)).toEqual([
      'MATRICULA',
      'CURSO',
    ]);
  });
});

describe('evaluarAccionPago', () => {
  it('permite pagos vigentes en inscripciones PENDIENTE/INSCRITO', () => {
    expect(evaluarAccionPago(inscripcion, { anulado: false })).toEqual({ permitido: true, motivo: null });
    expect(evaluarAccionPago({ estado: 'INSCRITO' }, {}).permitido).toBe(true);
  });

  it('bloquea pagos anulados y inscripciones retiradas o anuladas', () => {
    expect(evaluarAccionPago(inscripcion, { anulado: true })).toMatchObject({
      permitido: false,
      motivo: 'El pago está anulado',
    });
    expect(evaluarAccionPago({ estado: 'RETIRADO' }, {}).permitido).toBe(false);
    expect(evaluarAccionPago({ estado: 'ANULADO' }, {}).motivo).toMatch(/retirada o anulada/);
  });
});

describe('contarPagosVigentes', () => {
  it('no cuenta los anulados', () => {
    expect(contarPagosVigentes([{ anulado: true }, { anulado: false }, {}])).toBe(2);
  });
});
