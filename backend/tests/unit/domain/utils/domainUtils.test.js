import { describe, it, expect } from '@jest/globals';
import { parseJsonArray, createMap, mapRows, normalizeId, normalizeOriginType } from '../../../../src/domain/utils/index.js';
import { TIPOS_ORIGEN } from '../../../../src/domain/constants/index.js';

describe('parseJsonArray', () => {
  it('devuelve el arreglo tal cual y [] para vacío', () => {
    const a = [1, 2];
    expect(parseJsonArray(a)).toBe(a);
    expect(parseJsonArray(null)).toEqual([]);
    expect(parseJsonArray(undefined)).toEqual([]);
    expect(parseJsonArray('')).toEqual([]);
  });

  it('parsea JSON en string o Buffer (MySQL)', () => {
    expect(parseJsonArray('[1,2,3]')).toEqual([1, 2, 3]);
    expect(parseJsonArray(Buffer.from('["a"]'))).toEqual(['a']);
  });

  it('JSON inválido o que no es arreglo da []', () => {
    expect(parseJsonArray('{"a":1}')).toEqual([]);
    expect(parseJsonArray('no-json')).toEqual([]);
    expect(parseJsonArray(Object.create(null))).toEqual([]);
  });
});

describe('normalizeId', () => {
  it('normaliza números y strings numéricos; el resto es null', () => {
    expect(normalizeId(5)).toBe(5);
    expect(normalizeId('7')).toBe(7);
    expect(normalizeId('7abc')).toBe(7);
    expect(normalizeId(null)).toBeNull();
    expect(normalizeId(undefined)).toBeNull();
    expect(normalizeId({})).toBeNull();
  });

  it('un string no numérico es null y no NaN', () => {
    expect(normalizeId('abc')).toBeNull();
    expect(Number.isNaN(normalizeId('abc'))).toBe(false);
  });
});

describe('createMap', () => {
  it('construye un mapa clave->valor ignorando nulos', () => {
    const rows = [
      { id: 1, nombre: 'a' },
      { id: null, nombre: 'x' },
      { id: 3, nombre: null },
    ];
    expect(createMap(rows, 'id', 'nombre')).toEqual({ 1: 'a' });
  });

  it('claves numéricas se indexan como número y como string; las string, una sola vez', () => {
    const m = createMap([{ k: 2, v: 'dos' }, { k: 'x', v: 'equis' }], 'k', 'v');
    expect(m[2]).toBe('dos');
    expect(m['2']).toBe('dos');
    expect(m.x).toBe('equis');
  });

  it('entrada no arreglo da {}; sin campos lanza', () => {
    expect(createMap(null, 'a', 'b')).toEqual({});
    expect(() => createMap([], null, 'b')).toThrow('requeridos');
    expect(() => createMap([], 'a')).toThrow('requeridos');
  });
});

describe('mapRows', () => {
  it('mapea y descarta nulos', () => {
    expect(mapRows([1, 2, 3], (n) => (n === 2 ? null : n * 2))).toEqual([2, 6]);
  });
  it('entrada inválida da []', () => {
    expect(mapRows(null, (x) => x)).toEqual([]);
    expect(mapRows('x', (x) => x)).toEqual([]);
  });
});

describe('normalizeOriginType', () => {
  it('por defecto BOLIVIANA para null, undefined y valores desconocidos', () => {
    expect(normalizeOriginType(null)).toBe(TIPOS_ORIGEN.BOLIVIANA);
    expect(normalizeOriginType(undefined)).toBe(TIPOS_ORIGEN.BOLIVIANA);
    expect(normalizeOriginType('basura')).toBe(TIPOS_ORIGEN.BOLIVIANA);
    expect(normalizeOriginType(9)).toBe(TIPOS_ORIGEN.BOLIVIANA);
    expect(normalizeOriginType({})).toBe(TIPOS_ORIGEN.BOLIVIANA);
  });

  it('acepta el valor del ENUM en cualquier caja', () => {
    expect(normalizeOriginType('extranjera')).toBe(TIPOS_ORIGEN.EXTRANJERA);
    expect(normalizeOriginType('DOBLE_NACIONALIDAD')).toBe(TIPOS_ORIGEN.DOBLE_NACIONALIDAD);
  });

  it('mapea los códigos numéricos 0, 1 y 2 (número o string con espacios)', () => {
    expect(normalizeOriginType(0)).toBe(TIPOS_ORIGEN.BOLIVIANA);
    expect(normalizeOriginType(1)).toBe(TIPOS_ORIGEN.EXTRANJERA);
    expect(normalizeOriginType(' 2 ')).toBe(TIPOS_ORIGEN.DOBLE_NACIONALIDAD);
  });
});
