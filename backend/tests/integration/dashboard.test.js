import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, ROLES } from './helpers/sistema.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

describe('GET /dashboard/resumen (panel general, catálogo de referencia)', () => {
  it.each(ROLES)('%s recibe el resumen con su contrato', async (rol) => {
    const res = await como(rol, 'get', '/dashboard/resumen');
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(Array.isArray(data.actividades)).toBe(true);
    expect(Array.isArray(data.ultimosDocentes)).toBe(true);
    expect(Array.isArray(data.ultimosEstudiantes)).toBe(true);
    expect(Array.isArray(data.carreras)).toBe(true);
    expect(data.stats).toEqual(
      expect.objectContaining({
        estudiantesRegistradosHoy: expect.any(Number),
        estudiantesRegistradosMes: expect.any(Number),
      })
    );
  });

  it('refleja los datos sembrados (carreras y docentes del esquema)', async () => {
    const { body } = await como('ADMIN_SISTEMA', 'get', '/dashboard/resumen');
    expect(body.data.carreras.length).toBeGreaterThan(0);
    expect(body.data.ultimosDocentes.length).toBeGreaterThan(0);
  });
});

describe('GET /dashboard/mi-resumen (portal del estudiante)', () => {
  it('el estudiante de prueba recibe su resumen resuelto en servidor', async () => {
    const res = await como('ESTUDIANTE', 'get', '/dashboard/mi-resumen');
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.estudiante).toEqual({ nombre: 'Estudiante Ficticio Prueba', codigo: 'TEST-EST-001' });
    expect(Array.isArray(data.docentes)).toBe(true);
    expect(Array.isArray(data.actividades)).toBe(true);
    expect(data.stats.sesionesHoy).toBeGreaterThanOrEqual(1);
    expect(data.saldoPendiente).toEqual(expect.any(Number));
  });

  it.each(ROLES.filter((r) => r !== 'ESTUDIANTE'))(
    '%s no está vinculado a un estudiante: 403',
    async (rol) => {
      const res = await como(rol, 'get', '/dashboard/mi-resumen');
      expect(res.status).toBe(403);
    }
  );
});

describe('GET /dashboard/mi-resumen-docente (portal del docente)', () => {
  it('el docente de prueba recibe su resumen con el contrato completo', async () => {
    const res = await como('DOCENTE', 'get', '/dashboard/mi-resumen-docente');
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.docente).toEqual({ id: expect.any(Number), nombre: 'Docente Ficticio Prueba' });
    expect(data.gestion).toEqual(expect.objectContaining({ anio: expect.any(Number) }));
    expect(data.carga).toEqual({ totalAsignaciones: 0, horasSemanales: 0 });
    expect(data.cursos).toEqual([]);
    expect(data.horarioBloques).toEqual([]);
    expect(Array.isArray(data.actividades)).toBe(true);
  });

  it.each(ROLES.filter((r) => r !== 'DOCENTE'))(
    '%s no está vinculado a un docente: 403',
    async (rol) => {
      const res = await como(rol, 'get', '/dashboard/mi-resumen-docente');
      expect(res.status).toBe(403);
    }
  );
});
