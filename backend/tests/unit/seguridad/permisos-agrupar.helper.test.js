import { describe, it, expect } from '@jest/globals';
import {
  agruparPermisosEfectivos,
  agruparPermisosRolPorDominio,
} from '../../../src/application/use-cases/seguridad/permisos-agrupar.helper.js';
import { mapPermisosEfectivos } from '../../../src/application/use-cases/auth/mapPermisosEfectivos.js';

describe('agruparPermisosEfectivos / mapPermisosEfectivos', () => {
  const filas = [
    { permiso_codigo: 'A', accion: 'LISTAR' },
    { permiso_codigo: 'B', accion: 'CREAR' },
    { permiso_codigo: 'A', accion: 'EDITAR' },
  ];

  it('agrupa acciones por código de permiso', () => {
    const esperado = [
      { codigo: 'A', acciones: ['LISTAR', 'EDITAR'] },
      { codigo: 'B', acciones: ['CREAR'] },
    ];
    expect(agruparPermisosEfectivos(filas)).toEqual(esperado);
    expect(mapPermisosEfectivos(filas)).toEqual(esperado);
  });

  it('sin filas devuelve []', () => {
    expect(agruparPermisosEfectivos([])).toEqual([]);
    expect(mapPermisosEfectivos()).toEqual([]);
  });
});

describe('agruparPermisosRolPorDominio', () => {
  it('agrupa por dominio, une acciones y elimina acciones repetidas', () => {
    const out = agruparPermisosRolPorDominio([
      { dominio: 'SEG', permiso_id: 1, codigo: 'u', nombre: 'U', accion: 'LISTAR' },
      { dominio: 'SEG', permiso_id: 1, codigo: 'u', nombre: 'U', accion: 'CREAR' },
      { dominio: 'SEG', permiso_id: 1, codigo: 'u', nombre: 'U', accion: 'LISTAR' },
      { dominio: 'ACA', permiso_id: 2, codigo: 'm', nombre: 'M', accion: 'LISTAR' },
    ]);
    expect(out.SEG).toEqual([{ permiso_id: 1, codigo: 'u', nombre: 'U', acciones: ['LISTAR', 'CREAR'] }]);
    expect(out.ACA).toHaveLength(1);
  });

  it('sin filas devuelve objeto vacío', () => {
    expect(agruparPermisosRolPorDominio([])).toEqual({});
  });
});
