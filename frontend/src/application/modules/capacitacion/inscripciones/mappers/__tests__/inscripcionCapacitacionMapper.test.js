import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  buildInscripcionPayload,
  buildPagoRequestBody,
  extractComprobanteFile,
  mapFormValuesToPagoInicialPayload,
  mapFormValuesToPagoPayload,
  mapInscripcionCapacitacion,
  mapInscripcionCapacitacionDetail,
  mapRequisitosToPayload,
} from '../inscripcionCapacitacionMapper';

const rawInscripcion = {
  id: 10,
  estado: 'PENDIENTE',
  capacitacionId: 1,
  capacitacionTitulo: 'Guaraní',
  capacitacionGrupoId: 5,
  grupoNombre: '1er grupo',
  grupoHorariosEtiqueta: 'SAB 08:00-12:00',
  capacitacionFechaInicio: '2026-11-01',
  capacitacionFechaFin: null,
  montoObligatorio: 440,
  montoMatricula: 150,
  saldoCurso: 340,
  saldoMatricula: 0,
  totalPagado: 250,
  estadoPagoCurso: 'PARCIAL',
  estadoPagoMatricula: 'CANCELADO',
  estadoPago: 'PARCIAL',
};

describe('mapInscripcionCapacitacion', () => {
  it('mapea montos, saldos y estado por concepto', () => {
    const i = mapInscripcionCapacitacion(rawInscripcion);
    expect(i).toMatchObject({
      capacitacionGrupoId: 5,
      grupoNombre: '1er grupo',
      grupoHorariosEtiqueta: 'SAB 08:00-12:00',
      montoObligatorio: 440,
      montoMatricula: 150,
      montoTotal: 590,
      saldoCurso: 340,
      saldoMatricula: 0,
      saldoTotal: 340,
      estadoPagoCurso: 'PARCIAL',
      estadoPagoMatricula: 'CANCELADO',
      capacitacionFechasLabel: 'Desde 01/11/2026',
    });
  });

  it('sin saldoCurso usa el saldo legado como saldo del curso', () => {
    const i = mapInscripcionCapacitacion({ id: 1, saldo: 50, montoObligatorio: 100 });
    expect(i.saldoCurso).toBe(50);
    expect(i.saldoMatricula).toBe(0);
  });
});

describe('mapInscripcionCapacitacionDetail', () => {
  it('mapea pagos con concepto y comprobante, y requisitos', () => {
    const d = mapInscripcionCapacitacionDetail({
      ...rawInscripcion,
      pagos: [
        { id: 1, monto: 150, concepto: 'MATRICULA', tieneComprobante: 1, comprobanteNombre: 'dep.pdf' },
        { id: 2, monto: 100, concepto: 'CURSO' },
      ],
      requisitos: [
        { requisitoId: 3, descripcion: 'CI', obligatorio: true, entregado: 0 },
        { requisitoId: 4, descripcion: 'Foto', obligatorio: false, entregado: true, fechaEntrega: '2026-10-21' },
        { descripcion: 'sin id' },
      ],
    });
    expect(d.pagos[0]).toMatchObject({
      concepto: 'MATRICULA',
      tieneComprobante: true,
      comprobanteNombre: 'dep.pdf',
    });
    expect(d.pagos[0].conceptoLabel).toMatch(/Matrícula/);
    expect(d.pagos[1].tieneComprobante).toBe(false);
    expect(d.requisitos).toHaveLength(2);
    expect(d.requisitos[0]).toMatchObject({ requisitoId: 3, entregado: false, obligatorio: true });
  });

  it('sin requisitos ni pagos devuelve listas vacías', () => {
    const d = mapInscripcionCapacitacionDetail(rawInscripcion);
    expect(d.pagos).toEqual([]);
    expect(d.requisitos).toEqual([]);
  });
});

describe('payloads de pago', () => {
  const values = {
    concepto: 'CURSO',
    monto: '440',
    metodoPagoId: '2',
    cuentaPagoId: undefined,
    fechaPago: dayjs('2026-10-21'),
    observaciones: ' depósito ',
  };

  it('incluye concepto y normaliza campos', () => {
    expect(mapFormValuesToPagoPayload(values)).toEqual({
      concepto: 'CURSO',
      monto: 440,
      metodoPagoId: 2,
      cuentaPagoId: null,
      fechaPago: '2026-10-21',
      observaciones: 'depósito',
    });
    expect(mapFormValuesToPagoInicialPayload(values).concepto).toBe('CURSO');
  });

  it('sin comprobante el body es el JSON tal cual', () => {
    const payload = mapFormValuesToPagoPayload(values);
    expect(buildPagoRequestBody(payload)).toBe(payload);
  });

  it('con comprobante arma multipart sin enviar nulos', () => {
    const file = new File(['x'], 'dep.pdf', { type: 'application/pdf' });
    const body = buildPagoRequestBody(mapFormValuesToPagoPayload(values), file);
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('concepto')).toBe('CURSO');
    expect(body.get('monto')).toBe('440');
    expect(body.get('comprobante')).toBe(file);
    expect(body.has('cuentaPagoId')).toBe(false);
  });

  it('extrae el File del fileList de AntD o undefined', () => {
    const file = new File(['x'], 'a.png');
    expect(extractComprobanteFile([{ originFileObj: file }])).toBe(file);
    expect(extractComprobanteFile([])).toBeUndefined();
    expect(extractComprobanteFile(undefined)).toBeUndefined();
  });
});

describe('mapRequisitosToPayload', () => {
  it('envía el estado completo; fecha solo si está entregado', () => {
    expect(
      mapRequisitosToPayload([
        { requisitoId: 1, entregado: true, fechaEntrega: '2026-10-21', observacion: 'ok' },
        { requisitoId: 2, entregado: false, fechaEntrega: '2026-10-20' },
      ]),
    ).toEqual([
      { requisitoId: 1, entregado: true, fechaEntrega: '2026-10-21', observacion: 'ok' },
      { requisitoId: 2, entregado: false },
    ]);
  });
});

describe('buildInscripcionPayload', () => {
  it('mínimo: solo curso y participante existente (pendiente de todo)', () => {
    expect(buildInscripcionPayload({ cursoId: '1', participanteId: '9' })).toEqual({
      capacitacionId: 1,
      cursoId: 1,
      participanteId: 9,
    });
  });

  it('completo: grupo, requisitos y pago inicial', () => {
    const pagoInicial = { concepto: 'MATRICULA', monto: 150, metodoPagoId: 1 };
    expect(
      buildInscripcionPayload({
        cursoId: 1,
        participanteNuevo: { ci: '123' },
        capacitacionGrupoId: 5,
        requisitosEntregados: ['3', 4],
        pagoInicial,
      }),
    ).toEqual({
      capacitacionId: 1,
      cursoId: 1,
      participante: { ci: '123' },
      capacitacionGrupoId: 5,
      requisitosEntregados: [3, 4],
      pagoInicial,
    });
  });
});
