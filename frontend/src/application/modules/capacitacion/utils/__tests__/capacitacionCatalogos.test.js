import { describe, it, expect } from 'vitest';
import {
  CONCEPTO_PAGO_OPTIONS,
  MODALIDAD_CURSO_OPTIONS,
  formatConceptoPago,
  formatModalidadCurso,
} from '../capacitacionCatalogos';

describe('capacitacionCatalogos', () => {
  it('expone las tres modalidades con etiqueta en español', () => {
    expect(MODALIDAD_CURSO_OPTIONS.map((o) => o.value)).toEqual([
      'VIRTUAL',
      'PRESENCIAL',
      'SEMIPRESENCIAL',
    ]);
    expect(formatModalidadCurso('SEMIPRESENCIAL')).toBe('Semipresencial');
    expect(formatModalidadCurso(null)).toBeNull();
  });

  it('expone los conceptos de pago', () => {
    expect(CONCEPTO_PAGO_OPTIONS.map((o) => o.value)).toEqual(['MATRICULA', 'CURSO']);
    expect(formatConceptoPago('MATRICULA')).toMatch(/instituto/);
    expect(formatConceptoPago(undefined)).toBe('—');
  });
});
