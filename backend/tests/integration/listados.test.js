/**
 * Smoke de listados principales por módulo con un rol que tiene el permiso: 200, contrato
 * `{ success, data }` y consultas (repositorios + vistas) sin error sobre la BD recién cargada.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como } from './helpers/sistema.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

// [módulo, ruta, rol con permiso]
const LISTADOS = [
  ['Seguridad', '/usuarios', 'ADMIN_SISTEMA'],
  ['Seguridad', '/roles', 'ADMIN_SISTEMA'],
  ['Seguridad', '/permisos', 'ADMIN_SISTEMA'],
  ['Configuración', '/carreras', 'RECTOR'],
  ['Configuración', '/materias', 'RECTOR'],
  ['Configuración', '/planes-estudios', 'RECTOR'],
  ['Configuración', '/aulas', 'RECTOR'],
  ['Configuración', '/gestiones', 'RECTOR'],
  ['Docentes', '/docentes', 'DIR_ACADEMICO'],
  ['Docentes', '/supervision-docente', 'DIR_ACADEMICO'],
  ['Docentes', '/asignaciones-docentes', 'DIR_ACADEMICO'],
  ['Matrícula', '/estudiantes', 'SEC_ACADEMICA'],
  ['Matrícula', '/inscripciones', 'SEC_ACADEMICA'],
  ['Académico', '/libros', 'SEC_ACADEMICA'],
  ['Titulación', '/proyectos-grado', 'DIR_ACADEMICO'],
  ['Titulación', '/pasantias', 'DIR_ACADEMICO'],
  ['Capacitación', '/cursos-capacitacion', 'SEC_ADMIN'],
  ['Finanzas', '/ingresos', 'SEC_ADMIN'],
  ['Finanzas', '/pagos-aportes', 'DIR_ADMIN'],
  ['Finanzas', '/becas-descuentos', 'DIR_ADMIN'],
  ['Catálogos', '/paises', 'ESTUDIANTE'],
];

describe('Listados principales (smoke)', () => {
  it.each(LISTADOS)('%s · GET %s (como %s)', async (_modulo, ruta, rol) => {
    const res = await como(rol, 'get', ruta);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('los listados sembrados traen datos de verdad', async () => {
    const carreras = await como('RECTOR', 'get', '/carreras');
    expect(carreras.body.data.length).toBeGreaterThanOrEqual(3);
    const roles = await como('ADMIN_SISTEMA', 'get', '/roles');
    expect(JSON.stringify(roles.body.data)).toContain('DOCENTE');
    const usuarios = await como('ADMIN_SISTEMA', 'get', '/usuarios');
    expect(JSON.stringify(usuarios.body.data)).toContain('test.estudiante');
  });
});
