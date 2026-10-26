import { describe, it, expect } from '@jest/globals';
import {
  toISODate,
  expandirFechasClase,
  enumerarFechasRango,
} from '../../../src/application/utils/asistenciaCalendario.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('asistenciaCalendario.toISODate', () => {
  it('normaliza strings ISO, ISO completos y Date', () => {
    expect(toISODate('2026-03-05')).toBe('2026-03-05');
    expect(toISODate('2026-03-05T10:00:00.000Z')).toBe('2026-03-05');
    expect(toISODate(new Date('2026-03-05T00:00:00Z'))).toBe('2026-03-05');
  });

  it('null/undefined devuelven null', () => {
    expect(toISODate(null)).toBeNull();
    expect(toISODate(undefined)).toBeNull();
  });

  it.each([['abc'], ['2026-02-31'], ['05/03/2026'], [new Date('x')], [{}]])(
    'fecha basura (%p) lanza ValidationError en lugar de propagarse',
    (v) => {
      expect(() => toISODate(v)).toThrow(ValidationError);
    },
  );

  it('los expansores de rango rechazan fechas basura', () => {
    expect(() => enumerarFechasRango('abc', '2026-03-05')).toThrow(ValidationError);
    expect(() => expandirFechasClase('2026-03-01', 'zzz', new Set([1]))).toThrow(ValidationError);
    expect(enumerarFechasRango('2026-03-01', '2026-03-03')).toHaveLength(3);
  });
});
