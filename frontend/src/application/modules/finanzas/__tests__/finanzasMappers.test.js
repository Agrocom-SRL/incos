import { describe, it, expect } from 'vitest';
import { mapBancoToFormValues, mapFormValuesToBancoPayload } from '../mappers/bancoFormMapper';
import { mapBecasReporte, becaPorcentajeKey, becaPorcentajeLabel } from '../mappers/becasReporteMapper';
import { mapCompromisoFromApi, mapCompromisoToApi } from '../mappers/compromisoMapper';
import {
  mapMetodoPago,
  ordenarMetodos,
  mapBancoAutorizado,
  mapCuentaPago,
  indexarBancos,
} from '../mappers/configPagosMapper';
import { mapCuentaToFormValues, mapFormValuesToCuentaPayload } from '../mappers/cuentaFormMapper';
import { mapCuentasPorCobrar } from '../mappers/cuentasPorCobrarMapper';
import { mapIngresosList, ingresoListMapper } from '../mappers/ingresosListMapper';
import { mapMetodoToFormValues, mapFormValuesToMetodoPayload } from '../mappers/metodoFormMapper';
import { mapCuota, mapPagoDetailFromApi, mergePagoDetail } from '../mappers/pagosDetailMapper';
import { mapPagosList } from '../mappers/pagosListMapper';
import * as reg from '../mappers/pagosRegistrarMapper';
import { mapConfiguracionAporte } from '../aportes/mappers/aporteMapper';
import {
  mapBecaDescuentoToFormValues,
  mapFormValuesToBecaDescuentoPayload,
  mapBecaDescuentoDetail,
} from '../becas-descuentos/mappers/becaDescuentoFormMapper';
import { mapBecasDescuentosList, becaDescuentoListMapper } from '../becas-descuentos/mappers/becaDescuentoListMapper';
import { getCoberturaPillClass } from '../utils/becasReportePills';
import { formatEstadoCobranza, getEstadoDotClass, getDiasAtrasoLabel, getSaldoBandaClass } from '../utils/cuentasPorCobrarPills';
import { formatOrigenIngreso, getOrigenIngresoPillClass } from '../utils/ingresosPills';
import {
  derivarEstadoPago,
  formatEstadoPago,
  getEstadoPagoPillClass,
  getEstadoPagoTextClass,
  getSaldoPillClass,
  getDescuentoPillClass,
} from '../utils/pagosPills';

describe('formularios de banco, cuenta y método', () => {
  it('banco', () => {
    expect(mapBancoToFormValues(null)).toEqual({ codigo: '', nombre: '', metodoPagoId: undefined });
    expect(mapBancoToFormValues({ codigo: 'BNB', activo: false })).toMatchObject({ codigo: 'BNB', activo: false });
    expect(mapFormValuesToBancoPayload({ codigo: ' B ', nombre: ' N ', metodoPagoId: 3 })).toEqual({ codigo: 'B', nombre: 'N', metodo_pago_id: 3, activo: true });
    expect(mapFormValuesToBancoPayload({ activo: false }, { isEditMode: true }).activo).toBe(false);
    expect(mapFormValuesToBancoPayload({}, { isEditMode: true }).activo).toBe(true);
  });
  it('cuenta', () => {
    expect(mapCuentaToFormValues(null).tieneQr).toBe(false);
    expect(mapCuentaToFormValues({ numeroCelular: '7', qrImagenUrl: 'u', activo: true })).toMatchObject({ tieneNumeroCelular: true, tieneQr: true, activo: true });
    const archivo = { originFileObj: 'F' };
    expect(mapFormValuesToCuentaPayload({ nombreTitular: ' A ', tieneNumeroCelular: true, numeroCelular: ' 7 ', tieneQr: true, qr: [archivo] })).toMatchObject({ nombre_titular: 'A', numero_celular: '7', qr: 'F', numero_cuenta: null });
    expect(mapFormValuesToCuentaPayload({ tieneQr: true, qr: [] }).qr).toBeUndefined();
    expect(mapFormValuesToCuentaPayload({ tieneQr: true, qr: ['plano'] }).qr).toBe('plano');
    expect(mapFormValuesToCuentaPayload({ numeroCelular: '7' }).numero_celular).toBeNull();
  });
  it('método', () => {
    expect(mapMetodoToFormValues(null)).toEqual({ nombre: '' });
    expect(mapFormValuesToMetodoPayload({ nombre: ' QR ' })).toEqual({ nombre: 'QR' });
  });
});

describe('reporte de becas', () => {
  it('claves y etiquetas', () => {
    expect(becaPorcentajeKey('50')).toBe('beca_50');
    expect(becaPorcentajeLabel('x')).toBe('Beca 0%');
  });
  it('mapea la planilla completa', () => {
    expect(mapBecasReporte(null)).toBeNull();
    const r = mapBecasReporte({
      gestion: { id: 1 },
      porcentajes: ['50', 100],
      filas: [
        {
          id: 'c1', label: 'Sis', totalMatriculados: '10', becasPorPorcentaje: { 50: 2 },
          children: [{ id: 'p1', becasPorPorcentaje: { 100: '1' }, estudiantes: [{ estudianteId: 1, becaPorcentaje: '50', montoBase: '100' }] }, null],
        },
        null,
      ],
      totales: { totalMatriculados: 10, becasPorPorcentaje: { 50: 2, 100: 1 } },
      distribucion: [{ porcentaje: 50, beneficiados: 2 }],
      catalogo: [{ porcentaje: 100, usado: 1 }],
      catalogoResumen: { totalTipos: 2 },
    });
    expect(r.porcentajes).toEqual([50, 100]);
    expect(r.filas).toHaveLength(1);
    expect(r.filas[0].becasPorPorcentaje).toEqual({ beca_50: 2, beca_100: 0 });
    expect(r.filas[0].children[0].becasPorPorcentaje.beca_100).toBe(1);
    expect(r.filas[0].children[0].estudiantes[0]).toMatchObject({ becaPorcentaje: 50, montoBase: 100, codigo: null });
    expect(r.distribucion[0].etiqueta).toBe('Beca 50%');
    expect(r.catalogo[0].usado).toBe(true);
    expect(r.totales.becasPorPorcentaje.beca_50).toBe(2);
    expect(r.catalogoResumen.totalTipos).toBe(2);
    const vacio = mapBecasReporte({});
    expect(vacio.filas).toEqual([]);
    expect(vacio.distribucion).toEqual([]);
  });
  it('pills de cobertura', () => {
    expect(getCoberturaPillClass(60)).toMatch(/al-dia/);
    expect(getCoberturaPillClass(10)).toMatch(/proxima/);
    expect(getCoberturaPillClass('x')).toMatch(/sin/);
  });
});

describe('compromisos y configuración de pagos', () => {
  it('compromiso', () => {
    expect(mapCompromisoFromApi(null)).toBeNull();
    expect(mapCompromisoFromApi({ id: 1, fechaCompromiso: '2026-05-01T10:00', observacion: '  ', estado: ' PENDIENTE ' })).toMatchObject({ fechaCompromiso: '2026-05-01', observacion: null, estado: 'PENDIENTE' });
    expect(mapCompromisoFromApi({ fechaCompromiso: '' }).fechaCompromiso).toBeNull();
    expect(mapCompromisoToApi({ fechaCompromiso: '2026-05-01', observacion: ' x ' })).toEqual({ fecha_compromiso: '2026-05-01', observacion: 'x' });
    expect(mapCompromisoToApi()).toEqual({ fecha_compromiso: null, observacion: null });
  });
  it('método, banco, cuenta', () => {
    expect(mapMetodoPago(null)).toBeNull();
    expect(mapMetodoPago({ id: 1, code: 'qr', active: 0, cantidadPagos: '3' })).toMatchObject({ codigo: 'QR', nombre: 'QR', activo: false, cantidadPagos: 3 });
    expect(mapMetodoPago({ id: 2, codigo: 'efectivo', nombre: 'Efectivo', activo: '1' }).activo).toBe(true);
    const orden = ordenarMetodos([{ codigo: 'OTRO' }, { codigo: 'QR' }, { codigo: 'EFECTIVO' }]);
    expect(orden.map((m) => m.codigo)).toEqual(['EFECTIVO', 'QR', 'OTRO']);
    expect(mapBancoAutorizado(undefined)).toBeNull();
    expect(mapBancoAutorizado({ id: 1, paymentMethodId: 5, name: 'BNB', code: 'B' })).toMatchObject({ metodoPagoId: 5, nombre: 'BNB', codigo: 'B', activo: true });
    const bancos = indexarBancos([{ id: 1, nombre: 'BNB' }, {}, null]);
    expect(Object.keys(bancos)).toEqual(['1']);
    expect(mapCuentaPago(null)).toBeNull();
    expect(mapCuentaPago({ id: 9, bankId: 1, accountHolderName: ' Ana ', accountNumber: '123', phoneNumber: '7', qrImageUrl: 'q' }, bancos)).toMatchObject({ bancoNombre: 'BNB', nombreTitular: 'Ana', numeroCuenta: '123', numeroCelular: '7', qrImagenUrl: 'q' });
    expect(mapCuentaPago({ id: 9, banco: { nombre: 'Union' } }).bancoNombre).toBe('Union');
  });
});

describe('cuentas por cobrar e ingresos', () => {
  it('mapea la planilla', () => {
    expect(mapCuentasPorCobrar(null)).toBeNull();
    const r = mapCuentasPorCobrar({
      montoMaximoPorEstudiante: '500',
      carreras: [{ carreraId: 1, totalPendiente: '10', paralelos: [{ paraleloId: 2, estudiantes: [{ estudianteId: 3, estado: 'vencida', diasAtraso: '4', saldoPendiente: '20' }, { estado: 'raro', diasAtraso: null }, null] }, null] }, null],
      resumen: { totalCancelado: 5 },
    });
    const est = r.carreras[0].paralelos[0].estudiantes;
    expect(est[0]).toMatchObject({ estado: 'VENCIDA', diasAtraso: 4, saldoPendiente: 20 });
    expect(est[1]).toMatchObject({ estado: 'SIN_COMPROMISO', diasAtraso: null, nombreCompleto: 'Sin nombre' });
    expect(r.carreras[0].carreraNombre).toBe('Sin nombre');
    expect(r.resumen.totalCancelado).toBe(5);
    expect(r.montoMaximoPorEstudiante).toBe(500);
    expect(mapCuentasPorCobrar({}).carreras).toEqual([]);
  });
  it('pills de cobranza', () => {
    expect(formatEstadoCobranza('VENCIDA')).toBe('Vencida');
    expect(formatEstadoCobranza('x')).toBe('Sin compromiso');
    expect(getEstadoDotClass('AL_DIA')).toBe('fin-dot--ok');
    expect(getEstadoDotClass('x')).toBe('');
    expect(getDiasAtrasoLabel(null)).toBe('—');
    expect(getDiasAtrasoLabel(3)).toBe('+3');
    expect(getDiasAtrasoLabel(-2)).toBe('-2');
    expect(getDiasAtrasoLabel(0)).toBe('Hoy');
    expect(getSaldoBandaClass(0)).toBe('fin-banda--ok');
    expect(getSaldoBandaClass(5)).toBe('fin-banda--err');
  });
  it('ingresos', () => {
    expect(ingresoListMapper(null)).toBeNull();
    expect(mapIngresosList([{ id: 1, monto: '12' }, null])).toEqual([expect.objectContaining({ id: 1, monto: 12, personaNombreCompleto: 'Sin nombre' })]);
    expect(mapIngresosList(null)).toEqual([]);
    expect(formatOrigenIngreso('APORTE')).toBe('Aporte');
    expect(formatOrigenIngreso('x')).toBe('Ingreso');
    expect(getOrigenIngresoPillClass('CAPACITACION')).toMatch(/purple/);
    expect(getOrigenIngresoPillClass('APORTE')).toMatch(/primary/);
  });
});

describe('pagos', () => {
  it('lista de pagos', () => {
    const [p] = mapPagosList([{ id: 1, estudiante: { nombre: 'Juan', apellidoPaterno: 'Pérez' }, beca: { nombre: 'B', porcentaje: '50' }, monto_base: '100', saldo_pendiente: 40 }, null]);
    expect(p).toMatchObject({ id: 1, becaPorcentaje: 50, montoBase: 100, saldoPendiente: 40 });
    expect(p.estudiante.nombreCompleto).toBe('Pérez Juan');
    expect(mapPagosList(null)).toEqual([]);
    expect(mapPagosList([{ id: 2 }])[0].becaPorcentaje).toBeNull();
  });
  it('detalle de pago y cuotas', () => {
    expect(mapCuota(null)).toBeNull();
    const cuota = mapCuota({ id: 1, monto: '10', numero_recibo: ' R1 ', metodo_pago: { nombre: '', codigo: 'QR' }, cuenta_pago: { nombre_titular: 'Ana', numero_cuenta: '1', numero_celular: '7' }, observacion: 'obs' });
    expect(cuota).toMatchObject({ numeroRecibo: 'R1', metodoNombre: 'QR', cuenta: 'Ana · Cuenta 1 · Cel. 7', descripcion: 'obs', monto: 10 });
    expect(mapCuota({ id: 2 }).cuenta).toBeNull();
    expect(mapPagoDetailFromApi(null)).toBeNull();
    const d = mapPagoDetailFromApi({ id: 5, estudiante: { id: 3, nombre: 'Juan', apellidoPaterno: 'Pérez', ci: '123', expedicion: 'lp', carrera: 'Sis' }, gestion: { id: 2, anio: 2026 }, monto_base: 100, descuento_beca: 10, monto_obligatorio: 90, estado: 'x' });
    expect(d.profile).toMatchObject({ nombreCompleto: 'Pérez Juan', ciCompleto: '123 LP', carrera: 'Sis' });
    expect(d).toMatchObject({ estudianteId: 3, gestionId: 2, montoObligatorio: 90 });
    expect(mapPagoDetailFromApi({ student_id: 8, management_id: 9, baseAmount: 5 })).toMatchObject({ estudianteId: 8, gestionId: 9, montoBase: 5 });
    expect(mergePagoDetail(null, {})).toBeNull();
    const m = mergePagoDetail(d, { total_pagado: 50, saldo_pendiente: 40, cuotas: [{ id: 1 }, { id: 2 }] });
    expect(m).toMatchObject({ totalPagado: 50, saldoPendiente: 40, cantidadPagos: 2 });
    expect(mergePagoDetail(d, { cantidad_pagos: 7 }).cantidadPagos).toBe(7);
  });
  it('registro de pago', () => {
    expect(reg.mapEstudianteBusqueda(null)).toBeNull();
    const e = reg.mapEstudianteBusqueda({ id: 1, nombres: 'Juan', apellidoPaterno: 'Pérez', ci: '123', expedicion: 'cb', celular: '7', aporteRegistro: { tieneCabeceraAporte: 1, saldoPendienteTotal: '30' } });
    expect(e).toMatchObject({ nombreCompleto: 'Pérez Juan', ciCompleto: '123 CB', celular: '7' });
    expect(e.aporte).toEqual({ tieneCabecera: true, tieneSaldoPendiente: false, totalmenteCubierto: false, saldoPendienteTotal: 30 });
    expect(reg.mapEstudianteBusqueda({ id: 2, codigoEstudiante: 'E2' }).nombreCompleto).toBe('E2');
    expect(reg.mapEstadoAporte(undefined)).toBeNull();
    const est = reg.mapEstadoAporte({ monto_base: 100, cabecera: { id: 4 }, tiene_descuento_aplicado: 1, gestion: { nombre: ' G ' }, cuotas: [{ id: 1, monto: '5', metodo_pago: { codigo: 'QR' } }, null] });
    expect(est).toMatchObject({ cabeceraId: 4, montoBase: 100, tieneDescuentoAplicado: true });
    expect(est.cuotas).toEqual([expect.objectContaining({ metodoNombre: 'QR', monto: 5 })]);
    expect(reg.METODO_CODIGO.QR).toBe('QR');
    expect(reg.mapMetodoPago({ id: 1, code: 'x' })).toEqual({ id: 1, codigo: 'X', nombre: 'X' });
    expect(reg.mapBancoAutorizado({ id: 1, name: 'B', code: 'C' })).toEqual({ id: 1, nombre: 'B', codigo: 'C' });
    expect(reg.mapBancoAutorizado(null)).toBeNull();
    expect(reg.mapCuentaPago({ id: 1, accountHolderName: 'Ana', accountNumber: '9', bancoId: 2 }, { 2: { nombre: 'BNB' } }).label).toBe('Ana · 9 · BNB');
    expect(reg.mapCuentaPago({ id: 7 }).label).toBe('Cuenta 7');
    expect(reg.mapCuentaPago(null)).toBeNull();
  });
  it('pills de pago', () => {
    expect(derivarEstadoPago({ saldoPendiente: 0 })).toBe('CANCELADO');
    expect(derivarEstadoPago({ saldoPendiente: 10, totalPagado: 0, cantidadPagos: 0 })).toBe('SIN_PAGOS');
    expect(derivarEstadoPago({ saldoPendiente: 10, totalPagado: 5, cantidadPagos: 1 })).toBe('PARCIAL');
    expect(formatEstadoPago('CANCELADO')).toBe('Cancelado');
    expect(formatEstadoPago('x')).toBe('Sin estado');
    expect(getEstadoPagoPillClass('SIN_PAGOS')).toBe('pago-pill pago-pill--sin-pagos');
    expect(getEstadoPagoPillClass('x')).toBe('pago-pill pago-pill--parcial');
    expect(getEstadoPagoTextClass('CANCELADO')).toBe('pago-estado--cancelado');
    expect(getSaldoPillClass(5)).toMatch(/saldo/);
    expect(getSaldoPillClass(0)).toMatch(/aldia/);
    expect(getDescuentoPillClass(100)).toMatch(/total/);
    expect(getDescuentoPillClass(50)).toMatch(/media/);
    expect(getDescuentoPillClass(10)).toMatch(/baja/);
    expect(getDescuentoPillClass(0)).toMatch(/neutro/);
  });
});

describe('aportes y becas/descuentos', () => {
  it('configuración de aporte', () => {
    expect(mapConfiguracionAporte(null)).toBeNull();
    expect(mapConfiguracionAporte({ gestion_id: 2, monto_base: '300', aporte_activo: 0, fecha_inicio: 'a' })).toMatchObject({ gestionId: 2, montoBase: 300, aporteActivo: false, fechaInicio: 'a', activo: true });
  });
  it('lista de becas', () => {
    expect(becaDescuentoListMapper(null)).toBeNull();
    expect(mapBecasDescuentosList(null)).toEqual([]);
    const [b] = mapBecasDescuentosList([{ id: 1, porcentaje: '50', requiereDocumentacion: 1, esAutomatica: '1', promedioMinimo: '', activo: 0, cantidadAsignaciones: '3' }]);
    expect(b).toMatchObject({ porcentaje: 50, requiereDocumentacion: true, esAutomatica: true, promedioMinimo: null, activo: false, cantidadAsignaciones: 3 });
  });
  it('formulario de becas', () => {
    expect(mapBecaDescuentoToFormValues(null)).toMatchObject({ nombre: '', requiereDocumentacion: false });
    expect(mapBecaDescuentoToFormValues({ id: 1, nombre: 'B', porcentaje: 30, activo: true })).toMatchObject({ nombre: 'B', porcentaje: 30, activo: true });
    expect(mapFormValuesToBecaDescuentoPayload({ nombre: ' B ', codigo: ' ', porcentaje: '25', esAutomatica: true, tipoAutomatica: 'PROMEDIO_90', promedioMinimo: '90', activo: 0 })).toMatchObject({ nombre: 'B', codigo: undefined, porcentaje: 25, tipoAutomatica: 'PROMEDIO_90', promedioMinimo: 90, activo: false });
    expect(mapFormValuesToBecaDescuentoPayload({ nombre: 'x', tipoAutomatica: 'PROMEDIO_90', promedioMinimo: 90 })).toMatchObject({ tipoAutomatica: undefined, promedioMinimo: undefined });
    expect(mapBecaDescuentoDetail(null)).toBeNull();
    expect(mapBecaDescuentoDetail({ becaDescuento: { id: 1, activo: false } }).activo).toBe(false);
    expect(mapBecaDescuentoDetail({ id: 2 }).activo).toBe(true);
  });
});
