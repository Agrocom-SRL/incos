import { ValidationError } from '../../../src/domain/errors/AppError.js';
import {
  parseIdPositivo,
  parseIdOpcional,
  parseNumero,
  parseFechaISO,
  parseBooleano,
  parsePaginacion,
} from '../../../src/application/utils/validacionEntrada.js';

describe('validacionEntrada', () => {
  describe('parseIdPositivo', () => {
    it.each([[1, 1], ['7', 7], [' 12 ', 12]])('acepta %p', (entrada, esperado) => {
      expect(parseIdPositivo(entrada)).toBe(esperado);
    });
    it.each([[0], [-1], [1.5], ['5abc'], ['abc'], [''], [null], [undefined], [NaN], [true], ['1.5']])('rechaza %p', (v) => {
      expect(() => parseIdPositivo(v, 'banco_id')).toThrow(ValidationError);
    });
    it('el mensaje nombra el campo', () => {
      expect(() => parseIdPositivo('x', 'banco_id')).toThrow(/banco_id/);
    });
  });

  describe('parseIdOpcional', () => {
    it.each([[undefined], [null], [''], ['  ']])('devuelve null para %p', (v) => {
      expect(parseIdOpcional(v)).toBeNull();
    });
    it('valida lo que sí viene', () => {
      expect(parseIdOpcional('3')).toBe(3);
      expect(() => parseIdOpcional('abc')).toThrow(ValidationError);
    });
  });

  describe('parseNumero', () => {
    it('acepta números y cadenas numéricas, incluido el 0 explícito', () => {
      expect(parseNumero('12.5', 'm')).toBe(12.5);
      expect(parseNumero(0, 'm', { min: 0 })).toBe(0);
      expect(parseNumero('0', 'm', { min: 0 })).toBe(0);
    });
    it.each([[''], ['   '], [null], [undefined], ['abc'], [NaN], [Infinity], [-Infinity], [true], [[]]])('rechaza %p (no se vuelve 0)', (v) => {
      expect(() => parseNumero(v, 'm')).toThrow(ValidationError);
    });
    it('respeta rango y entero', () => {
      expect(() => parseNumero(-1, 'm', { min: 0 })).toThrow(/mayor o igual a 0/);
      expect(() => parseNumero(101, 'm', { max: 100 })).toThrow(/menor o igual a 100/);
      expect(() => parseNumero(1.5, 'm', { entero: true })).toThrow(/entero/);
      expect(parseNumero(100, 'm', { min: 0, max: 100, entero: true })).toBe(100);
    });
  });

  describe('parseFechaISO', () => {
    it('acepta fechas reales y recorta un ISO completo', () => {
      expect(parseFechaISO('2026-02-28')).toBe('2026-02-28');
      expect(parseFechaISO('2028-02-29')).toBe('2028-02-29');
      expect(parseFechaISO('2026-05-10T10:00:00Z')).toBe('2026-05-10');
      expect(parseFechaISO(new Date('2026-05-10T00:00:00Z'))).toBe('2026-05-10');
    });
    it.each([['2026-02-31'], ['2026-02-29'], ['2026-04-31'], ['2026-13-01'], ['2026-00-10'], ['abc'], [''], [null], [undefined], [20260101], ['2026-1-1']])('rechaza %p', (v) => {
      expect(() => parseFechaISO(v, 'fecha')).toThrow(ValidationError);
    });
    it('rechaza un Date inválido', () => {
      expect(() => parseFechaISO(new Date('x'))).toThrow(ValidationError);
    });
  });

  describe('parseBooleano', () => {
    it.each([[true, true], ['true', true], ['TRUE', true], [1, true], ['1', true], [false, false], ['false', false], [0, false], ['0', false]])('%p → %p', (v, esperado) => {
      expect(parseBooleano(v)).toBe(esperado);
    });
    it.each([[undefined], [null], [''], ['abc'], [2], ['yes']])('rechaza %p (no se interpreta como false)', (v) => {
      expect(() => parseBooleano(v, 'activo')).toThrow(ValidationError);
    });
  });

  describe('parsePaginacion', () => {
    it('usa valores por defecto', () => {
      expect(parsePaginacion({})).toEqual({ page: 1, limit: 20, offset: 0 });
      expect(parsePaginacion()).toEqual({ page: 1, limit: 20, offset: 0 });
    });
    it('calcula el offset', () => {
      expect(parsePaginacion({ page: '3', limit: '10' })).toEqual({ page: 3, limit: 10, offset: 20 });
    });
    it.each([[{ page: 0 }], [{ page: -1 }], [{ limit: 0 }], [{ limit: -5 }], [{ limit: 101 }], [{ page: 'x' }], [{ limit: 1.5 }]])('rechaza %p', (q) => {
      expect(() => parsePaginacion(q)).toThrow(ValidationError);
    });
    it('respeta un tope propio', () => {
      expect(parsePaginacion({ limit: 500 }, { maxLimit: 500 }).limit).toBe(500);
      expect(() => parsePaginacion({ limit: 501 }, { maxLimit: 500 })).toThrow(ValidationError);
    });
  });
});
