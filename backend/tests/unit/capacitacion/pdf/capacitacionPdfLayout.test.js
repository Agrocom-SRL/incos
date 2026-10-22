import { describe, it, expect } from '@jest/globals';
import {
  computeFirmaColumnas,
  cabeBloque,
  formatearMonto,
  valorODefecto,
} from '../../../../src/infrastructure/external/pdf/capacitacion/capacitacionPdfLayout.js';
import { numberToWords } from '../../../../src/infrastructure/external/pdf/numberToWords.js';

describe('capacitacionPdfLayout', () => {
  it('reparte las firmas en columnas iguales con línea centrada', () => {
    const cols = computeFirmaColumnas({ count: 2, startX: 50, contentWidth: 500, lineWidth: 150 });
    expect(cols).toHaveLength(2);
    expect(cols[0]).toEqual({ x1: 100, x2: 250, centerX: 175 });
    expect(cols[1]).toEqual({ x1: 350, x2: 500, centerX: 425 });
  });

  it('acorta la línea si la columna es estrecha y no falla sin firmas', () => {
    const [col] = computeFirmaColumnas({ count: 1, startX: 0, contentWidth: 100, lineWidth: 150, gap: 30 });
    expect(col.x2 - col.x1).toBe(70);
    expect(computeFirmaColumnas({ count: 0, startX: 0, contentWidth: 100 })).toEqual([]);
  });

  it('decide si un bloque cabe sobre el piso', () => {
    expect(cabeBloque({ currentY: 200, requerido: 68, floorY: 95 })).toBe(true);
    expect(cabeBloque({ currentY: 150, requerido: 68, floorY: 95 })).toBe(false);
  });

  it('formatea montos y valores por defecto', () => {
    expect(formatearMonto(150)).toBe('150.00 Bs');
    expect(formatearMonto('12.5', '')).toBe('12.50 ');
    expect(formatearMonto(null)).toBe('0.00 Bs');
    expect(valorODefecto('  ', '—')).toBe('—');
    expect(valorODefecto('x', '—')).toBe('x');
  });

  it('escribe bien las centenas irregulares en letras', () => {
    expect(numberToWords(500)).toBe('quinientos');
    expect(numberToWords(750)).toBe('setecientos cincuenta');
    expect(numberToWords(915)).toBe('novecientos quince');
    expect(numberToWords(300)).toBe('trescientos');
    expect(numberToWords(100)).toBe('cien');
    expect(numberToWords(120)).toBe('ciento veinte');
  });
});
