import { describe, it, expect } from '@jest/globals';
import {
  solapeParaleloHorarioKey,
  solapeParaleloHorarioKeySet,
  resolveParalelosConflictoHorarioResolucion,
  bloquesConflictoIdsFromPares,
  conflictHorarioIdsForParaleloTab,
} from '../../../src/application/utils/horarios/resolveParalelosConflictoHorarioResolucion.js';

describe('solapeParaleloHorarioKey / KeySet', () => {
  it('arma la clave "pg|horario" y rechaza ids inválidos', () => {
    expect(solapeParaleloHorarioKey(3, 7)).toBe('3|7');
    expect(solapeParaleloHorarioKey('3', '7')).toBe('3|7');
    expect(solapeParaleloHorarioKey(0, 7)).toBeNull();
    expect(solapeParaleloHorarioKey(3, 'x')).toBeNull();
  });

  it('el conjunto acepta camelCase y snake_case e ignora filas inválidas', () => {
    const set = solapeParaleloHorarioKeySet([
      { paraleloGestionId: 1, horarioId: 2 },
      { paralelo_gestion_id: 3, horario_id: 4 },
      { paraleloGestionId: 0, horarioId: 2 },
    ]);
    expect([...set].sort()).toEqual(['1|2', '3|4']);
    expect(solapeParaleloHorarioKeySet().size).toBe(0);
  });
});

describe('resolveParalelosConflictoHorarioResolucion', () => {
  const par = (a, b, h, extra = {}) => ({ paraleloGestionIdA: a, paraleloGestionIdB: b, horarioId: h, ...extra });

  it('mismo paralelo: solo ese paralelo', () => {
    const r = resolveParalelosConflictoHorarioResolucion([par(1, 1, 5)]);
    expect(r.map((x) => x.paraleloGestionId)).toEqual([1]);
  });

  it('paralelos distintos con solape en uno solo: solo el que solapa', () => {
    const solape = new Set(['2|5']);
    const r = resolveParalelosConflictoHorarioResolucion([par(1, 2, 5)], solape);
    expect(r.map((x) => x.paraleloGestionId)).toEqual([2]);
    const r2 = resolveParalelosConflictoHorarioResolucion([par(1, 2, 5)], new Set(['1|5']));
    expect(r2.map((x) => x.paraleloGestionId)).toEqual([1]);
  });

  it('solape en ambos o en ninguno: ambos paralelos', () => {
    expect(resolveParalelosConflictoHorarioResolucion([par(1, 2, 5)], new Set(['1|5', '2|5'])).map((x) => x.paraleloGestionId)).toEqual([1, 2]);
    expect(resolveParalelosConflictoHorarioResolucion([par(1, 2, 5)]).map((x) => x.paraleloGestionId)).toEqual([1, 2]);
  });

  it('ignora pares sin horario válido y acepta snake_case', () => {
    const r = resolveParalelosConflictoHorarioResolucion([
      par(1, 2, 0),
      { paralelo_gestion_id_a: 3, paralelo_gestion_id_b: 3, horario_id: 4, paralelo_a: 'C' },
    ]);
    expect(r).toEqual([{ paraleloGestionId: 3, paraleloNombre: 'C', turno: null }]);
  });

  it('usa nombre y turno de las filas de horario y ordena por nombre', () => {
    const rows = [
      { paralelo_gestion_id: 1, paralelo_nombre: 'B', paralelo_turno: 'TARDE' },
      { paralelo_gestion_id: 2, paralelo_nombre: 'A', horario_turno: 'MANANA' },
    ];
    const r = resolveParalelosConflictoHorarioResolucion([par(1, 2, 5)], new Set(), rows);
    expect(r).toEqual([
      { paraleloGestionId: 2, paraleloNombre: 'A', turno: 'MANANA' },
      { paraleloGestionId: 1, paraleloNombre: 'B', turno: 'TARDE' },
    ]);
  });

  it('sin metadatos el nombre es "Paralelo #id"', () => {
    expect(resolveParalelosConflictoHorarioResolucion([par(8, 8, 1)])).toEqual([
      { paraleloGestionId: 8, paraleloNombre: 'Paralelo #8', turno: null },
    ]);
  });

  it('sin pares devuelve []', () => {
    expect(resolveParalelosConflictoHorarioResolucion()).toEqual([]);
  });
});

describe('bloquesConflictoIdsFromPares', () => {
  it('reúne los ids de bloque válidos de ambos lados', () => {
    const ids = bloquesConflictoIdsFromPares([
      { bloqueAId: 1, bloqueBId: 2 },
      { bloque_a_id: 2, bloque_b_id: 3 },
      { bloqueAId: 0, bloqueBId: 'x' },
    ]);
    expect([...ids].sort()).toEqual([1, 2, 3]);
    expect(bloquesConflictoIdsFromPares().size).toBe(0);
  });
});

describe('conflictHorarioIdsForParaleloTab', () => {
  const pares = [
    { paraleloGestionIdA: 1, paraleloGestionIdB: 2, horarioId: 10 },
    { paraleloGestionIdA: 3, paraleloGestionIdB: 3, horarioId: 11 },
  ];

  it('paralelo inválido: nada', () => {
    expect(conflictHorarioIdsForParaleloTab(0, pares).size).toBe(0);
  });

  it('mismo paralelo en ambos lados: solo su pestaña', () => {
    expect([...conflictHorarioIdsForParaleloTab(3, pares)]).toEqual([11]);
    expect(conflictHorarioIdsForParaleloTab(1, [pares[1]]).size).toBe(0);
  });

  it('con solape en un solo lado resalta solo ese paralelo', () => {
    const solape = new Set(['2|10']);
    expect([...conflictHorarioIdsForParaleloTab(2, [pares[0]], solape)]).toEqual([10]);
    expect(conflictHorarioIdsForParaleloTab(1, [pares[0]], solape).size).toBe(0);
  });

  it('sin solape en ninguno resalta ambos; con solape en ambos también', () => {
    expect([...conflictHorarioIdsForParaleloTab(1, [pares[0]])]).toEqual([10]);
    expect([...conflictHorarioIdsForParaleloTab(2, [pares[0]])]).toEqual([10]);
    expect([...conflictHorarioIdsForParaleloTab(1, [pares[0]], new Set(['1|10', '2|10']))]).toEqual([10]);
    expect(conflictHorarioIdsForParaleloTab(9, [pares[0]]).size).toBe(0);
  });

  it('ignora pares sin horario válido', () => {
    expect(conflictHorarioIdsForParaleloTab(1, [{ paraleloGestionIdA: 1, paraleloGestionIdB: 2, horarioId: 0 }]).size).toBe(0);
  });
});
