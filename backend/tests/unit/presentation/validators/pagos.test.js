import { describe, it, expect } from '@jest/globals';
import * as v from '../../../../src/presentation/validators/pagos/index.js';
import { camposInvalidos, runValidators } from '../_helpers/controllerHarness.js';
import { MALICIOSOS } from './_tabla.js';

const efectivo = { student_id: 5, amount: 150.5, payment_method_id: 1, payment_date: '2026-03-10' };
const qr = { ...efectivo, payment_method_id: 2, codigo_comprobante: 'QR-001' };
const transferencia = { ...efectivo, payment_method_id: 3, payment_account_id: 4, codigo_comprobante: 'TR-9', transaction_number: ' 123 ' };

describe.each([
  ['registerPagoAporteValidator', 'student_id', (b) => ({ body: b })],
  ['updatePaymentCuotaValidator', 'id', (b) => ({ body: b, params: { id: '8' } })],
])('%s', (nombre, _clave, armar) => {
  const cadena = v[nombre];
  const base = (extra = {}) => {
    const { student_id, ...resto } = efectivo;
    return nombre === 'registerPagoAporteValidator' ? { ...efectivo, ...extra } : { ...resto, ...extra };
  };
  const run = (body) => camposInvalidos(cadena, armar(body));

  it('acepta pago en efectivo, QR, transferencia y depósito', async () => {
    expect(await run(base())).toEqual([]);
    expect(await run(base({ payment_method_id: 2, codigo_comprobante: 'QR-1' }))).toEqual([]);
    expect(await run(base({ payment_method_id: 3, payment_account_id: 4, codigo_comprobante: 'T-1', transaction_number: '99' }))).toEqual([]);
    expect(await run(base({ payment_method_id: 4, payment_account_id: '4', codigo_comprobante: 'D-1' }))).toEqual([]);
  });

  it('acepta montos en el límite y valores como cadena', async () => {
    expect(await run(base({ amount: 0 }))).toEqual([]);
    expect(await run(base({ amount: '99.90', payment_method_id: '1', payment_date: '2026-03-10T10:00:00Z' }))).toEqual([]);
    expect(await run(base({ descripcion: 'x'.repeat(500), payment_account_id: null, transaction_number: null }))).toEqual([]);
  });

  it.each(['amount', 'payment_method_id', 'payment_date'])('exige %s', async (campo) => {
    const body = base();
    delete body[campo];
    expect(await run(body)).toContain(campo);
  });

  it.each([
    ['amount', -1],
    ['amount', 'mucho'],
    ['payment_method_id', 0],
    ['payment_method_id', 5],
    ['payment_method_id', 'EFECTIVO'],
    ['payment_date', '10/03/2026'],
    ['payment_date', 'ayer'],
    ['descripcion', 'x'.repeat(501)],
    ['descripcion', 42],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await run(base({ [campo]: valor }))).toContain(campo);
  });

  it.each(MALICIOSOS)('rechaza carga maliciosa %p en monto, método y fecha', async (m) => {
    expect(await run(base({ amount: m }))).toContain('amount');
    expect(await run(base({ payment_method_id: m }))).toContain('payment_method_id');
    expect(await run(base({ payment_date: m }))).toContain('payment_date');
  });

  it('el efectivo no admite cuenta de pago', async () => {
    expect(await run(base({ payment_account_id: 3 }))).toContain('payment_account_id');
  });

  it.each([3, 4])('el método %i exige cuenta y comprobante', async (metodo) => {
    expect(await run(base({ payment_method_id: metodo, codigo_comprobante: 'C-1' }))).toContain('payment_account_id');
    expect(await run(base({ payment_method_id: metodo, payment_account_id: 2 }))).toContain('codigo_comprobante');
  });

  it('el QR exige comprobante y rechaza comprobante vacío', async () => {
    expect(await run(base({ payment_method_id: 2 }))).toContain('codigo_comprobante');
    expect(await run(base({ payment_method_id: 2, codigo_comprobante: '   ' }))).toContain('codigo_comprobante');
  });

  it('rechaza cuenta de pago no entera', async () => {
    expect(await run(base({ payment_method_id: 3, payment_account_id: 'abc', codigo_comprobante: 'C' }))).toContain('payment_account_id');
    expect(await run(base({ payment_method_id: 3, payment_account_id: 1.5, codigo_comprobante: 'C' }))).toContain('payment_account_id');
  });
});

describe('registerPagoAporteValidator: reglas propias', () => {
  const run = (body) => camposInvalidos(v.registerPagoAporteValidator, { body });

  it('exige student_id válido', async () => {
    const { student_id, ...sin } = efectivo;
    expect(await run(sin)).toContain('student_id');
    for (const malo of [0, -1, 'x', ...MALICIOSOS]) expect(await run({ ...efectivo, student_id: malo })).toContain('student_id');
  });

  it('management_id es opcional (vacío o falsy se ignora) pero entero si viene', async () => {
    expect(await run({ ...efectivo, management_id: 3 })).toEqual([]);
    expect(await run({ ...efectivo, management_id: '' })).toEqual([]);
    expect(await run({ ...efectivo, management_id: -2 })).toContain('management_id');
    expect(await run({ ...efectivo, management_id: 'x' })).toContain('management_id');
  });

  it('transaction_number debe ser texto', async () => {
    expect(await run({ ...transferencia, transaction_number: 1234 })).toContain('transaction_number');
    expect(await run({ ...transferencia, transaction_number: { a: 1 } })).toContain('transaction_number');
  });

  it('codigo_comprobante debe ser texto', async () => {
    expect(await run({ ...qr, codigo_comprobante: 55 })).toContain('codigo_comprobante');
  });
});

describe('updatePaymentCuotaValidator: reglas propias', () => {
  const run = (body, id = '8') => camposInvalidos(v.updatePaymentCuotaValidator, { body, params: { id } });
  const { student_id: _s, ...sinEstudiante } = efectivo;

  it.each(['0', '-1', 'abc', ...MALICIOSOS])('rechaza :id=%p', async (id) => {
    expect(await run(sinEstudiante, id)).toContain('id');
  });

  it('transaction_number debe ser texto', async () => {
    expect(await run({ ...sinEstudiante, transaction_number: 99 })).toContain('transaction_number');
    expect(await run({ ...sinEstudiante, transaction_number: ' 99 ' })).toEqual([]);
  });
});

describe('searchStudentsRegistroAporteValidator', () => {
  const run = (query) => camposInvalidos(v.searchStudentsRegistroAporteValidator, { query });

  it('acepta búsqueda de 2 a 120 caracteres, límite y preliminar', async () => {
    expect(await run({ q: 'ab' })).toEqual([]);
    expect(await run({ q: 'a'.repeat(120), limit: '100' })).toEqual([]);
    expect(await run({ q: '', preliminar: '1' })).toEqual([]);
    expect(await run({ preliminar: '1', limit: '1' })).toEqual([]);
  });

  it('exige q de al menos 2 caracteres sin preliminar y como máximo 120', async () => {
    expect(await run({})).toContain('q');
    expect(await run({ q: 'a' })).toContain('q');
    expect(await run({ q: '   ' })).toContain('q');
    expect(await run({ q: 'a'.repeat(121) })).toContain('q');
  });

  it.each(['0', '101', 'x', '-1', '2.5'])('rechaza limit=%p', async (limit) => {
    expect(await run({ q: 'ana', limit })).toContain('limit');
  });

  it.each(['2', 'si', ...MALICIOSOS])('rechaza preliminar=%p', async (preliminar) => {
    expect(await run({ q: 'ana', preliminar })).toContain('preliminar');
  });
});

describe('contratos del índice de pagos', () => {
  it('expone todos los validators de pagos como arreglos', () => {
    for (const nombre of [
      'registerPagoAporteValidator',
      'updatePaymentCuotaValidator',
      'searchStudentsRegistroAporteValidator',
      'createConfiguracionAporteValidator',
      'updateConfiguracionAporteValidator',
      'updateMetodoPagoValidator',
      'createBancoAutorizadoValidator',
      'updateBancoAutorizadoValidator',
      'createCuentaPagoValidator',
      'updateCuentaPagoValidator',
    ]) {
      expect(Array.isArray(v[nombre])).toBe(true);
      expect(v[nombre].length).toBeGreaterThan(0);
    }
  });

  it('runValidators devuelve el mensaje de cada error', async () => {
    const errores = await runValidators(v.registerPagoAporteValidator, { body: {} });
    expect(errores.map((e) => e.path)).toEqual(expect.arrayContaining(['student_id', 'amount', 'payment_method_id', 'payment_date']));
    expect(errores.every((e) => typeof e.msg === 'string')).toBe(true);
  });
});
