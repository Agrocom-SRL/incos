import { describe, it, expect, jest } from '@jest/globals';

/**
 * Invariantes de seguridad de TODO el árbol de rutas real (container DI + routers, sin BD):
 * toda ruta exige sesión salvo la raíz y el login; toda ruta autenticada exige un permiso
 * (verificarPermiso*) salvo las de autoservicio/catálogo listadas aquí; el vocabulario de
 * acciones es el v2; no hay rutas duplicadas.
 */

const real = await import('../../../../src/presentation/middleware/permisos.middleware.js');
jest.unstable_mockModule('../../../../src/presentation/middleware/permisos.middleware.js', () => ({
  ...real,
  verificarPermiso: (codigo, accion) => {
    const fn = real.verificarPermiso(codigo, accion);
    fn.__permisos = [[codigo, accion]];
    return fn;
  },
  verificarPermisoCualquiera: (pares) => {
    const fn = real.verificarPermisoCualquiera(pares);
    fn.__permisos = pares;
    return fn;
  },
}));

const { default: apiRouter } = await import('../../../../src/presentation/routes/index.js');
const { authenticate } = await import('../../../../src/presentation/middleware/auth.middleware.js');
const { aplanarRutas } = await import('../_helpers/routerWalker.js');

const ACCIONES_V2 = ['LISTAR', 'DETALLE', 'CREAR', 'EDITAR', 'ELIMINAR', 'ACTIVAR', 'APROBAR', 'EXPORTAR', 'GENERAR_PDF'];

const PUBLICAS = new Set(['GET /', 'POST /auth/login']);

/** Autoservicio: el alcance lo resuelve el use case desde la sesión (nunca desde ids del cliente). */
const AUTOSERVICIO = new Set([
  'GET /auth/me',
  'PATCH /auth/me/password',
  'POST /auth/logout',
  'GET /estudiantes/mis-datos',
  'GET /docentes/mis-datos',
  'GET /docentes/mis-estudiantes',
  'GET /supervision-docente/mis-fichas',
  'GET /dashboard/resumen',
  'GET /dashboard/mi-resumen',
  'GET /dashboard/mi-resumen-docente',
  'GET /calificaciones/tipos-evaluacion',
  'GET /calificaciones/politica/catalogo',
  'GET /calificaciones/politica',
]);

const filas = aplanarRutas(apiRouter);
const clave = (f) => `${f.metodo} ${f.ruta.replace(/\/$/, '') || '/'}`;
const esCatalogo = (f) => f.handlers.includes(real.listarCatalogoReferencia[1]);

describe('rutas reales: invariantes de autenticación y RBAC', () => {
  it('registra un árbol de rutas no trivial', () => {
    expect(filas.length).toBeGreaterThan(300);
  });

  it('no hay dos rutas con el mismo método y ruta', () => {
    const vistas = new Set();
    const duplicadas = [];
    for (const f of filas) {
      const k = clave(f);
      if (vistas.has(k)) duplicadas.push(k);
      vistas.add(k);
    }
    expect(duplicadas).toEqual([]);
  });

  it('toda ruta exige sesión (authenticate) salvo la raíz y el login', () => {
    const sinSesion = filas.filter((f) => !f.handlers.includes(authenticate)).map(clave);
    expect(new Set(sinSesion)).toEqual(PUBLICAS);
  });

  it('toda ruta autenticada declara un permiso, es catálogo de referencia o es autoservicio', () => {
    const sinPermiso = filas
      .filter((f) => !PUBLICAS.has(clave(f)))
      .filter((f) => !f.handlers.some((h) => h.__permisos?.length) && !esCatalogo(f))
      .map(clave)
      .filter((k) => !AUTOSERVICIO.has(k));
    expect(sinPermiso).toEqual([]);
  });

  it('las acciones usan solo el vocabulario v2 (sin VER) y los códigos tienen forma módulo.recurso', () => {
    const invalidas = [];
    for (const f of filas) {
      for (const h of f.handlers) {
        for (const [codigo, accion] of h.__permisos ?? []) {
          if (!ACCIONES_V2.includes(accion)) invalidas.push(`${clave(f)} -> ${accion}`);
          if (!/^[a-z0-9_]+(\.[a-z0-9_-]+)+$/.test(codigo)) invalidas.push(`${clave(f)} -> código ${codigo}`);
        }
      }
    }
    expect(invalidas).toEqual([]);
  });

  it('las bajas (DELETE) exigen ELIMINAR o EDITAR, nunca solo lectura', () => {
    const flojas = filas
      .filter((f) => f.metodo === 'DELETE')
      .filter((f) => !f.handlers.flatMap((h) => h.__permisos ?? []).some(([, a]) => ['ELIMINAR', 'EDITAR'].includes(a)))
      .map(clave);
    expect(flojas).toEqual([]);
  });
});
