import { describe, it, expect } from 'vitest';
import { normalizeError, extractErrorFromResult } from '../errorHelpers';

describe('normalizeError', () => {
  it('usa el mensaje por defecto con null/undefined/vacío', () => {
    expect(normalizeError(null)).toBe('Ha ocurrido un error');
    expect(normalizeError(undefined, 'x')).toBe('x');
    expect(normalizeError('   ', 'x')).toBe('x');
  });
  it('extrae de string, Error y objetos', () => {
    expect(normalizeError(' falló ')).toBe('falló');
    expect(normalizeError(new Error('boom'))).toBe('boom');
    expect(normalizeError(new Error(''), 'def')).toBe('def');
    expect(normalizeError({ message: ' m ' })).toBe('m');
    expect(normalizeError({ error: 'e' })).toBe('e');
    expect(normalizeError({ toString: () => 'custom' })).toBe('custom');
    expect(normalizeError({}, 'def')).toBe('def');
    expect(normalizeError(42, 'def')).toBe('def');
  });
});

describe('extractErrorFromResult', () => {
  it('devuelve null si el resultado es exitoso o inexistente', () => {
    expect(extractErrorFromResult(null)).toBeNull();
    expect(extractErrorFromResult({ success: true })).toBeNull();
  });
  it('normaliza el error de un resultado fallido', () => {
    expect(extractErrorFromResult({ success: false, error: 'no' })).toBe('no');
    expect(extractErrorFromResult({ success: false }, 'def')).toBe('def');
  });
});
