import { describe, it, expect } from 'vitest';
import { buildFullName, buildCompleteCI, buildInitials } from '../personFormatters';
import { formatBs, formatBsConSimbolo } from '../montoFormatters';

describe('personFormatters', () => {
  it('buildFullName ordena APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES', () => {
    expect(buildFullName('Juan', 'Pérez', 'González')).toBe('Pérez González Juan');
  });
  it('buildFullName omite partes vacías y usa fallback', () => {
    expect(buildFullName('María', 'López', null)).toBe('López María');
    expect(buildFullName(null, null, null)).toBe('Sin nombre');
    expect(buildFullName('', '', '', 'N/A')).toBe('N/A');
  });
  it('buildCompleteCI une CI y expedición', () => {
    expect(buildCompleteCI('8159625', 'LP')).toBe('8159625 LP');
    expect(buildCompleteCI('123', null)).toBe('123');
    expect(buildCompleteCI(null, 'CB')).toBe('');
  });
  it('buildInitials toma primera y última palabra', () => {
    expect(buildInitials('Pérez González Juan')).toBe('PJ');
    expect(buildInitials(null)).toBe('—');
  });
});

describe('montoFormatters', () => {
  it('formatBs redondea a entero y tolera valores inválidos', () => {
    expect(formatBs(0)).toBe('0');
    expect(formatBs(null)).toBe('0');
    expect(formatBs('abc')).toBe('0');
    expect(formatBs(12.6)).toBe('13');
  });
  it('formatBsConSimbolo antepone Bs', () => {
    expect(formatBsConSimbolo(50)).toBe('Bs 50');
  });
});
