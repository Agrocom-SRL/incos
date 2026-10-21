import { describe, it, expect } from 'vitest';
import {
  actualizarItem,
  alternarEntregado,
  crearRequisitoVacio,
  hayCambiosRequisitos,
  quitarItem,
} from '../requisitosCapacitacion';

describe('requisitosCapacitacion', () => {
  it('crea filas obligatorias con key única', () => {
    const a = crearRequisitoVacio();
    const b = crearRequisitoVacio();
    expect(a.key).not.toBe(b.key);
    expect(a).toMatchObject({ id: null, descripcion: '', obligatorio: true });
  });

  it('quita y actualiza filas', () => {
    expect(quitarItem([1, 2, 3], 1)).toEqual([1, 3]);
    expect(actualizarItem([{ a: 1 }, { a: 2 }], 1, { a: 9 })).toEqual([{ a: 1 }, { a: 9 }]);
  });

  it('al marcar entregado registra la fecha y al desmarcar la limpia', () => {
    const base = [{ requisitoId: 1, entregado: false, fechaEntrega: null }];
    const marcado = alternarEntregado(base, 1, true, '2026-10-21');
    expect(marcado[0]).toMatchObject({ entregado: true, fechaEntrega: '2026-10-21' });
    expect(alternarEntregado(marcado, 1, false, '2026-10-21')[0]).toMatchObject({
      entregado: false,
      fechaEntrega: null,
    });
  });

  it('detecta cambios del checklist por requisitoId', () => {
    const original = [{ requisitoId: 1, entregado: false }];
    expect(hayCambiosRequisitos(original, [{ requisitoId: 1, entregado: false }])).toBe(false);
    expect(hayCambiosRequisitos(original, [{ requisitoId: 1, entregado: true }])).toBe(true);
    expect(hayCambiosRequisitos(original, [])).toBe(false);
  });
});
