/**
 * Seguridad extremo a extremo contra la BD de pruebas (usuarios del seed 04-test-seeds):
 *  1) Matriz exhaustiva: TODA ruta registrada del router responde 401 sin token (salvo la lista pública).
 *  2) Matriz de 403: roles sin permiso no operan sobre endpoints sensibles (lectura y escritura).
 *  3) Escalada de privilegios: un rol con EDITAR en usuarios no puede tocar al ADMIN_SISTEMA.
 *  4) IDOR: el estudiante no lee a otro estudiante; el docente no lee a otro docente ni su grilla.
 *
 * La contraparte sin BD (mismas rutas, JWT manipulado, cabeceras, inyección…) vive en
 * tests/unit/seguridad-http/.
 */
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  iniciarSistema,
  cerrarSistema,
  como,
  request,
  app,
  API,
  sequelize,
  login,
  PASSWORD_PRUEBA,
  USUARIOS,
} from './helpers/sistema.js';
import { listarRutas, rutaConcreta } from '../helpers/rutas.js';
import { esPublica } from '../helpers/rutas-publicas.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const rutas = listarRutas(app);
const protegidas = rutas.filter((r) => !esPublica(r));
const sinPrefijo = (ruta) => ruta.replace(/^\/api\/v1/, '');
const llamar = (metodo, ruta) => request(app)[metodo.toLowerCase()](rutaConcreta(ruta));

describe('Matriz: toda ruta protegida responde 401 sin token', () => {
  it('el recorrido del router encuentra las rutas (sanidad)', () => {
    expect(protegidas.length).toBeGreaterThan(300);
  });

  it.each(protegidas.map((r) => [`${r.metodo} ${r.ruta}`, r]))('%s -> 401', async (_n, r) => {
    const res = await llamar(r.metodo, r.ruta);
    expect(res.status).toBe(401);
  });

  it('con un token firmado por otro secreto también 401 (muestra por módulo)', async () => {
    const falso = jwt.sign({ userId: 1, rolCodigo: 'ADMIN_SISTEMA' }, 'otro-secreto');
    const muestra = protegidas.filter((r) => r.metodo === 'GET' && !r.ruta.includes(':')).slice(0, 40);
    for (const r of muestra) {
      const res = await request(app).get(r.ruta).set('Authorization', `Bearer ${falso}`);
      expect({ ruta: r.ruta, status: res.status }).toEqual({ ruta: r.ruta, status: 401 });
    }
  });

  it('las rutas públicas son exactamente las declaradas y responden sin token', async () => {
    expect((await request(app).get('/health')).status).toBe(200);
    expect((await request(app).get(`${API}/health`)).status).toBe(200);
    expect((await request(app).get(`${API}`)).status).toBe(200);
    // login es público pero exige cuerpo válido
    expect((await request(app).post(`${API}/auth/login`).send({})).status).toBe(422);
  });
});

describe('Matriz 403: roles sin permiso no acceden a endpoints sensibles', () => {
  const SIN_PRIVILEGIOS = ['ESTUDIANTE', 'DOCENTE'];

  describe.each([
    '/usuarios',
    '/roles',
    '/carreras',
    '/materias',
    '/planes-estudios',
    '/ingresos',
    '/cursos-capacitacion',
  ])('GET %s', (ruta) => {
    it.each(SIN_PRIVILEGIOS)('%s -> 403', async (rol) => {
      const res = await como(rol, 'get', ruta);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Acceso denegado');
    });
  });

  const PREFIJOS_ADMIN = [
    '/api/v1/usuarios',
    '/api/v1/roles',
    '/api/v1/carreras',
    '/api/v1/materias',
    '/api/v1/planes-estudios',
    '/api/v1/configuracion-aportes',
    '/api/v1/cursos-capacitacion',
    '/api/v1/ingresos',
  ];
  const escrituras = protegidas.filter(
    (r) =>
      r.metodo !== 'GET' &&
      PREFIJOS_ADMIN.some((p) => r.ruta === p || r.ruta.startsWith(`${p}/`))
  );

  it('la matriz de escrituras sensibles no está vacía', () => {
    expect(escrituras.length).toBeGreaterThan(20);
  });

  describe.each(SIN_PRIVILEGIOS)('%s no puede escribir en módulos administrativos', (rol) => {
    it.each(escrituras.map((r) => [`${r.metodo} ${r.ruta}`, r]))('%s -> 403', async (_n, r) => {
      const res = await como(rol, r.metodo.toLowerCase(), sinPrefijo(rutaConcreta(r.ruta))).send({});
      expect(res.status).toBe(403);
    });
  });
});

describe('Escalada vertical: nadie sin ADMIN_SISTEMA toca a un ADMIN_SISTEMA', () => {
  let adminId;
  beforeAll(async () => {
    const [filas] = await sequelize.query("SELECT id FROM usuarios WHERE username = 'test.admin'");
    adminId = filas[0].id;
  });

  // Cuerpo "ocho espacios": pasa el validator de ruta pero lo rechazaría la política de claves;
  // así la prueba es inocua aunque el guard faltara (no cambia ninguna clave real).
  it.each(['RECTOR', 'DIR_ACADEMICO', 'DIR_ADMIN'])(
    '%s no puede cambiar la clave del administrador (403)',
    async (rol) => {
      const res = await como(rol, 'patch', `/usuarios/${adminId}/password`).send({
        password_nuevo: '        ',
      });
      expect(res.status).toBe(403);
    }
  );

  it('el administrador conserva su clave (el login sigue funcionando)', async () => {
    const res = await login(USUARIOS.ADMIN_SISTEMA, PASSWORD_PRUEBA);
    expect(res.status).toBe(200);
  });

  it.each(['RECTOR', 'DIR_ACADEMICO', 'DIR_ADMIN'])(
    '%s no puede asignar el rol ADMIN_SISTEMA a otro usuario (403/4xx, nunca 200)',
    async (rol) => {
      const [roles] = await sequelize.query("SELECT id FROM roles WHERE codigo = 'ADMIN_SISTEMA'");
      const [docente] = await sequelize.query("SELECT id FROM usuarios WHERE username = 'test.docente'");
      const res = await como(rol, 'put', `/usuarios/${docente[0].id}`).send({ rol_id: roles[0].id });
      expect(res.status).toBe(403);
    }
  );
});

describe('IDOR: cada usuario ve solo lo suyo', () => {
  let estudianteId;
  let docenteId;
  beforeAll(async () => {
    const [e] = await sequelize.query(
      "SELECT id FROM estudiantes WHERE codigo_estudiante = 'TEST-EST-001'"
    );
    const [d] = await sequelize.query("SELECT id FROM docentes WHERE ci = 'TEST-DOC-001'");
    estudianteId = e[0].id;
    docenteId = d[0].id;
  });

  it('el estudiante lee su propia ficha', async () => {
    const res = await como('ESTUDIANTE', 'get', `/estudiantes/${estudianteId}`);
    expect(res.status).toBe(200);
  });

  it.each([1, 2, 100000])('el estudiante NO lee la ficha del estudiante %i ajeno (403)', async (delta) => {
    const ajeno = estudianteId + delta;
    const res = await como('ESTUDIANTE', 'get', `/estudiantes/${ajeno}`);
    expect(res.status).toBe(403);
  });

  it('el docente lee su propia ficha y su propia grilla', async () => {
    expect((await como('DOCENTE', 'get', `/docentes/${docenteId}`)).status).toBe(200);
    expect(
      (await como('DOCENTE', 'get', `/horarios/docentes/${docenteId}/grilla-conflictos`)).status
    ).not.toBe(403);
  });

  it.each([1, 2, 100000])('el docente NO lee al docente %i ajeno (403)', async (delta) => {
    const ajeno = docenteId + delta;
    expect((await como('DOCENTE', 'get', `/docentes/${ajeno}`)).status).toBe(403);
    expect((await como('DOCENTE', 'get', `/docentes/${ajeno}/carga-gestion`)).status).toBe(403);
    expect(
      (await como('DOCENTE', 'get', `/horarios/docentes/${ajeno}/grilla-conflictos`)).status
    ).toBe(403);
  });

  it('el docente no ve la ficha de un estudiante ajeno a sus cursos', async () => {
    const res = await como('DOCENTE', 'get', `/estudiantes/${estudianteId + 100000}`);
    expect(res.status).toBe(403);
  });

  it('el estudiante no puede ver dashboards ni portales de otros roles', async () => {
    expect((await como('ESTUDIANTE', 'get', '/dashboard/mi-resumen-docente')).status).toBe(403);
    expect((await como('DOCENTE', 'get', '/dashboard/mi-resumen')).status).toBe(403);
  });
});
