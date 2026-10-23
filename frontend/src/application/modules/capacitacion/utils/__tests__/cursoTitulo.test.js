import { describe, it, expect } from 'vitest';
import { tituloConEdicion } from '../cursoTitulo';

describe('tituloConEdicion', () => {
  it('une título y edición', () => {
    expect(tituloConEdicion('Guaraní', '2027 – 1ª edición')).toBe('Guaraní · 2027 – 1ª edición');
  });

  it('sin edición o con edición vacía devuelve solo el título', () => {
    expect(tituloConEdicion('Guaraní', null)).toBe('Guaraní');
    expect(tituloConEdicion('Guaraní', '  ')).toBe('Guaraní');
  });
});
