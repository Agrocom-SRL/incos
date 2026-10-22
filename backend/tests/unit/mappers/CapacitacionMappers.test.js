import { describe, it, expect } from '@jest/globals';
import { InscripcionCapacitacionMapper } from '../../../src/application/mappers/capacitacion/InscripcionCapacitacionMapper.js';
import { PagoCapacitacionMapper } from '../../../src/application/mappers/capacitacion/PagoCapacitacionMapper.js';
import { CursoCapacitacionMapper } from '../../../src/application/mappers/capacitacion/CursoCapacitacionMapper.js';

describe('InscripcionCapacitacionMapper (costo del curso externo)', () => {
  const fila = (o = {}) => ({
    id: 1,
    estado: 'PENDIENTE',
    monto_obligatorio: 440,
    monto_matricula: 150,
    pagado_curso: 0,
    pagado_matricula: 50,
    total_pagado: 50,
    estado_pago: 'PARCIAL',
    estado_pago_curso: 'PARCIAL',
    estado_pago_matricula: 'PARCIAL',
    ...o,
  });

  it('curso propio (sin entidad): saldos por concepto como siempre y sin requisito acreditador', () => {
    const p = InscripcionCapacitacionMapper.rowToPresentation(fila());
    expect(p).toMatchObject({
      pagoCursoExterno: false,
      requisitoAcreditaPagoCurso: null,
      saldoCurso: 440,
      saldoMatricula: 100,
      saldo: 540,
    });
  });

  it('curso externo con el depósito entregado: saldoCurso 0 y el saldo cobrable es solo la matrícula', () => {
    const p = InscripcionCapacitacionMapper.rowToPresentation(
      fila({
        pago_curso_externo: 1,
        requisito_acredita_id: 7,
        requisito_acredita_descripcion: 'Fotocopia del depósito',
        requisito_acredita_entregado: 1,
        estado_pago_curso: 'CANCELADO',
      })
    );
    expect(p).toMatchObject({
      pagoCursoExterno: true,
      requisitoAcreditaPagoCurso: { requisitoId: 7, descripcion: 'Fotocopia del depósito', entregado: true },
      saldoCurso: 0,
      saldo: 100,
      estadoPagoCurso: 'CANCELADO',
    });
  });

  it('curso externo sin el depósito: el curso figura pendiente pero no suma al saldo cobrable', () => {
    const p = InscripcionCapacitacionMapper.rowToPresentation(
      fila({ pago_curso_externo: 1, requisito_acredita_id: 7, requisito_acredita_entregado: 0 })
    );
    expect(p).toMatchObject({
      saldoCurso: 440,
      saldo: 100,
      requisitoAcreditaPagoCurso: { requisitoId: 7, entregado: false },
    });
  });

  it('curso externo sin requisito configurado: requisitoAcreditaPagoCurso es null', () => {
    const p = InscripcionCapacitacionMapper.rowToPresentation(fila({ pago_curso_externo: 1 }));
    expect(p.requisitoAcreditaPagoCurso).toBeNull();
    expect(p.saldoCurso).toBe(440);
  });

  it('el checklist expone acreditaPagoCurso', () => {
    expect(
      InscripcionCapacitacionMapper.requisitoRowToPresentation({
        requisito_id: 7, descripcion: 'Depósito', obligatorio: 1, acredita_pago_curso: 1, entregado: 0,
      })
    ).toMatchObject({ requisitoId: 7, acreditaPagoCurso: true, entregado: false });
  });
});

describe('PagoCapacitacionMapper (anulación)', () => {
  it('expone anulado, motivo y fecha en filas y entidades', () => {
    const fecha = '2026-10-22 10:00:00';
    expect(
      PagoCapacitacionMapper.rowToPresentation({
        id: 1, monto: 50, anulado: 1, motivo_anulacion: 'error de caja', fecha_anulacion: fecha,
      })
    ).toMatchObject({ anulado: true, motivoAnulacion: 'error de caja', fechaAnulacion: fecha });
    expect(PagoCapacitacionMapper.rowToPresentation({ id: 2, monto: 5, anulado: 0 })).toMatchObject({
      anulado: false, motivoAnulacion: null,
    });
    expect(
      PagoCapacitacionMapper.entityToPresentation({ id: 3, monto: 5, anulado: true, motivoAnulacion: 'x' })
    ).toMatchObject({ anulado: true, motivoAnulacion: 'x' });
  });
});

describe('CursoCapacitacionMapper (costo externo)', () => {
  it('pagoCursoExterno depende de la entidad certificadora', () => {
    const fila = { id: 1, titulo: 'T', estado: 'ABIERTO', fecha_inicio: '2999-01-01' };
    expect(CursoCapacitacionMapper.viewRowToPresentation({ ...fila, entidad_certificadora: 'IPELC' }).pagoCursoExterno).toBe(true);
    expect(CursoCapacitacionMapper.viewRowToPresentation({ ...fila, entidad_certificadora: '  ' }).pagoCursoExterno).toBe(false);
    expect(CursoCapacitacionMapper.entityToPresentation({ id: 1, entidadCertificadora: null }).pagoCursoExterno).toBe(false);
  });

  it('requisitoAcreditaPagoCurso devuelve el requisito marcado o null', () => {
    const requisitos = CursoCapacitacionMapper.requisitosToPresentation([
      { id: 1, descripcion: 'Cédula', obligatorio: true, acreditaPagoCurso: false },
      { id: 2, descripcion: 'Depósito', obligatorio: true, acreditaPagoCurso: true },
    ]);
    expect(CursoCapacitacionMapper.requisitoAcreditaPagoCurso(requisitos)).toMatchObject({ id: 2, acreditaPagoCurso: true });
    expect(CursoCapacitacionMapper.requisitoAcreditaPagoCurso(requisitos.slice(0, 1))).toBeNull();
  });
});
