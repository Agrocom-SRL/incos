import { describe, it, expect } from '@jest/globals';
import { mapUsuarioAdminRow } from '../../../src/application/use-cases/seguridad/usuario-admin.mapper.js';

describe('mapUsuarioAdminRow', () => {
  const fila = {
    id: 3,
    username: 'ana',
    email: 'ana@x.bo',
    activo: 1,
    created_at: '2026-01-01',
    password_hash: '$2a$12$secreto',
    password: 'texto-plano',
    rol_id: 2,
    rol_codigo: 'DOCENTE',
    rol_nombre: 'Docente',
    rol_is_system: 0,
  };

  it('nunca expone password ni password_hash', () => {
    const out = mapUsuarioAdminRow(fila);
    expect(JSON.stringify(out)).not.toMatch(/password|secreto|texto-plano/);
    expect(out).not.toHaveProperty('password_hash');
  });

  it('mapea rol y normaliza booleanos y nulos', () => {
    expect(mapUsuarioAdminRow(fila)).toMatchObject({
      id: 3,
      activo: true,
      estado: null,
      foto_url: null,
      rol: { id: 2, codigo: 'DOCENTE', nombre: 'Docente', tipo: null, is_system: false },
    });
  });

  it('sin rol_id devuelve rol null; activo 0 es false', () => {
    const out = mapUsuarioAdminRow({ ...fila, rol_id: null, activo: 0 });
    expect(out.rol).toBeNull();
    expect(out.activo).toBe(false);
  });
});
