import { describe, it, expect } from 'vitest';
import { excludeByField, excludeByMultipleFields, includeByField } from '../filters';
import {
  mapGenericOptions,
  mapLabelValueOptions,
  transformToOptions,
  createOptionMapper,
} from '../optionTransformers';
import { groupByCarrera, SIN_CARRERA_KEY } from '../groupByCarrera';
import { normalizeFieldToArray } from '../responseTransformers';

describe('filters', () => {
  const items = [{ iso: 'BOL' }, { iso: 'pe' }, { iso: 'AR' }];
  it('excludeByField es case-insensitive por defecto', () => {
    expect(items.filter(excludeByField('iso', 'bol'))).toHaveLength(2);
    expect(items.filter(excludeByField('iso', 'bol', true))).toHaveLength(3);
  });
  it('excludeByField conserva valores no objeto y compara no-strings con ===', () => {
    expect(excludeByField('x', 1)(null)).toBe(true);
    expect(excludeByField('x', 1)({ x: 1 })).toBe(false);
    expect(excludeByField('x', 1)({ x: 2 })).toBe(true);
  });
  it('excludeByMultipleFields excluye si alguna regla coincide', () => {
    const f = excludeByMultipleFields([
      { field: 'iso', value: 'BOL' },
      { field: 'n', value: 3 },
    ]);
    expect(f({ iso: 'bol' })).toBe(false);
    expect(f({ iso: 'X', n: 3 })).toBe(false);
    expect(f({ iso: 'X', n: 4 })).toBe(true);
    expect(f(undefined)).toBe(true);
    expect(excludeByMultipleFields([{ field: 'iso', value: 'BOL' }], true)({ iso: 'bol' })).toBe(true);
  });
  it('includeByField incluye solo coincidencias', () => {
    expect(items.filter(includeByField('iso', 'PE'))).toEqual([{ iso: 'pe' }]);
    expect(items.filter(includeByField('iso', 'PE', true))).toEqual([]);
    expect(includeByField('iso', 'PE')(null)).toBe(false);
    expect(includeByField('n', 2)({ n: 2 })).toBe(true);
  });
});

describe('optionTransformers', () => {
  it('mapGenericOptions soporta strings y objetos; normaliza ids numéricos', () => {
    expect(mapGenericOptions(['a'])).toEqual([{ label: 'a', value: 'a' }]);
    expect(mapGenericOptions([{ id: '5', nombre: 'Cinco' }])).toEqual([{ label: 'Cinco', value: 5 }]);
    expect(mapGenericOptions([{ value: 'x', label: 'X' }])).toEqual([{ label: 'X', value: 'x' }]);
    expect(mapGenericOptions([{ code: 'c', name: 'C' }])).toEqual([{ label: 'C', value: 'c' }]);
  });
  it('mapGenericOptions tolera entrada inválida', () => {
    expect(mapGenericOptions(null)).toEqual([]);
    expect(mapGenericOptions('x')).toEqual([]);
  });
  it('mapLabelValueOptions prioriza label/value', () => {
    expect(mapLabelValueOptions(['a'])).toEqual([{ label: 'a', value: 'a' }]);
    expect(mapLabelValueOptions([{ label: 'L', value: 1 }])).toEqual([{ label: 'L', value: 1 }]);
    expect(mapLabelValueOptions([{ nombre: 'N', id: 2 }])).toEqual([{ label: 'N', value: 2 }]);
    expect(mapLabelValueOptions(undefined)).toEqual([]);
  });
  it('transformToOptions filtra y elige mapper', () => {
    const data = [{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }];
    expect(transformToOptions('generic', data, (d) => d.id > 1)).toEqual([{ label: 'B', value: 2 }]);
    expect(transformToOptions('labelValue', [{ label: 'Z', value: 9 }])).toEqual([{ label: 'Z', value: 9 }]);
    expect(transformToOptions('generic', null)).toEqual([]);
  });
  it('createOptionMapper devuelve una función reutilizable', () => {
    const m = createOptionMapper('generic', (d) => d.id !== 1);
    expect(m([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }])).toHaveLength(1);
  });
});

describe('groupByCarrera', () => {
  const rows = [
    { c: { id: 2, nombre: 'Sistemas', colorHex: '#111' } },
    { c: { id: 1, nombre: 'Contaduría' } },
    { c: { id: 2, nombre: 'Sistemas' } },
    { c: { codigo: 'ENF' } },
    { c: null },
  ];
  it('agrupa, ordena alfabéticamente y deja "Sin carrera" al final', () => {
    const g = groupByCarrera(rows, (r) => r.c);
    expect(g.map((x) => x.nombre)).toEqual(['Contaduría', 'ENF', 'Sistemas', 'Sin carrera']);
    expect(g[2].rows).toHaveLength(2);
    expect(g[2].colorHex).toBe('#111');
    expect(g[3]).toMatchObject({ key: SIN_CARRERA_KEY, esSinCarrera: true });
  });
  it('tolera entradas inválidas', () => {
    expect(groupByCarrera(null, () => ({}))).toEqual([]);
    expect(groupByCarrera([{}])[0].esSinCarrera).toBe(true);
  });
});

describe('normalizeFieldToArray', () => {
  it('normaliza objeto, array y vacío', () => {
    expect(normalizeFieldToArray({ student: { id: 1 } })).toEqual([{ id: 1 }]);
    expect(normalizeFieldToArray({ career: [{ id: 1 }] }, 'career')).toEqual([{ id: 1 }]);
    expect(normalizeFieldToArray([{ id: 1 }], 'x')).toEqual([{ id: 1 }]);
    expect(normalizeFieldToArray({}, 'x')).toEqual([]);
    expect(normalizeFieldToArray(null)).toEqual([]);
  });
});
