import { describe, it, expect } from 'vitest';
import { cumplePermisoRef } from '../utils/cumplePermisoRef';

const hasPermiso = (codigo, accion) => codigo === 'a.x' && accion === 'EDITAR';

describe('cumplePermisoRef', () => {
  it('referencia única válida', () => {
    expect(cumplePermisoRef({ codigo: 'a.x', accion: 'EDITAR' }, hasPermiso)).toBe(true);
  });

  it('acción distinta → false', () => {
    expect(cumplePermisoRef({ codigo: 'a.x', accion: 'ELIMINAR' }, hasPermiso)).toBe(false);
  });

  it('arreglo: OR entre referencias', () => {
    expect(
      cumplePermisoRef(
        [
          { codigo: 'b.y', accion: 'EDITAR' },
          { codigo: 'a.x', accion: 'EDITAR' },
        ],
        hasPermiso,
      ),
    ).toBe(true);
  });

  it('sin referencia o sin código falla cerrado', () => {
    expect(cumplePermisoRef(undefined, hasPermiso)).toBe(false);
    expect(cumplePermisoRef([], hasPermiso)).toBe(false);
    expect(cumplePermisoRef({ accion: 'EDITAR' }, hasPermiso)).toBe(false);
    expect(cumplePermisoRef([null], hasPermiso)).toBe(false);
  });
});
