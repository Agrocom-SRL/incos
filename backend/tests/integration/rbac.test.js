/**
 * RBAC extremo a extremo contra los seeds reales (02-seeders/55..67) y la matriz
 * docs/referencia/matriz-permisos-sistema.md: lo que /auth/me declara es lo que el
 * guard (`verificarPermiso`) de cada endpoint realmente aplica.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  iniciarSistema,
  cerrarSistema,
  como,
  sesionDe,
  request,
  app,
  API,
  sequelize,
  ROLES,
} from './helpers/sistema.js';
import { ACCIONES_VALIDAS, aSetDePares, tiene, rutasDeMenu } from './helpers/permisos.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const ADMIN = 'ADMIN_SISTEMA';
const DIRECTIVOS_ACAD = ['ADMIN_SISTEMA', 'RECTOR', 'DIR_ACADEMICO'];

/**
 * Endpoint de listado principal por módulo, con su permiso y los roles que (según los seeds
 * y la matriz) lo tienen. Todo rol que no figure en `permitidos` debe recibir 403.
 */
const ENDPOINTS = [
  { ruta: '/carreras', permiso: ['configuracion.carrera', 'LISTAR'], permitidos: DIRECTIVOS_ACAD },
  { ruta: '/materias', permiso: ['configuracion.materia', 'LISTAR'], permitidos: DIRECTIVOS_ACAD },
  { ruta: '/aulas', permiso: ['configuracion.aula', 'LISTAR'], permitidos: DIRECTIVOS_ACAD },
  { ruta: '/planes-estudios', permiso: ['configuracion.plan-estudio', 'LISTAR'], permitidos: DIRECTIVOS_ACAD },
  {
    ruta: '/docentes',
    permiso: ['docentes.ver', 'LISTAR'],
    permitidos: [...DIRECTIVOS_ACAD, 'DOCENTE'],
  },
  {
    ruta: '/supervision-docente',
    permiso: ['docentes.supervision.ficha', 'LISTAR'],
    permitidos: DIRECTIVOS_ACAD,
  },
  {
    ruta: '/estudiantes',
    permiso: ['matricula.admision.ver', 'LISTAR'],
    permitidos: ROLES.filter((r) => r !== 'DOCENTE'),
  },
  {
    ruta: '/inscripciones',
    permiso: ['matricula.inscribir', 'LISTAR'],
    permitidos: [...DIRECTIVOS_ACAD, 'SEC_ACADEMICA', 'ESTUDIANTE'],
  },
  {
    ruta: '/libros',
    permiso: ['academico.libro', 'LISTAR'],
    permitidos: [...DIRECTIVOS_ACAD, 'SEC_ACADEMICA'],
  },
  {
    ruta: '/proyectos-grado',
    permiso: ['titulacion.proyecto', 'LISTAR'],
    permitidos: [...DIRECTIVOS_ACAD, 'SEC_ACADEMICA', 'DOCENTE'],
  },
  {
    ruta: '/pasantias',
    permiso: ['titulacion.pasantia', 'LISTAR'],
    permitidos: [...DIRECTIVOS_ACAD, 'SEC_ACADEMICA', 'DOCENTE'],
  },
  {
    ruta: '/cursos-capacitacion',
    permiso: ['capacitacion.curso', 'LISTAR'],
    permitidos: [ADMIN, 'RECTOR', 'DIR_ADMIN', 'SEC_ADMIN'],
  },
  {
    ruta: '/cursos-capacitacion/grupos',
    permiso: ['capacitacion.grupo', 'LISTAR'],
    permitidos: [ADMIN, 'RECTOR', 'DIR_ADMIN', 'SEC_ADMIN'],
  },
  {
    ruta: '/ingresos',
    permiso: ['finanzas.pago.ver', 'LISTAR'],
    permitidos: [ADMIN, 'RECTOR', 'DIR_ADMIN', 'SEC_ADMIN'],
  },
  {
    ruta: '/usuarios',
    permiso: ['seguridad.usuario.administrar', 'LISTAR'],
    permitidos: [...DIRECTIVOS_ACAD, 'DIR_ADMIN'],
  },
  {
    ruta: '/roles',
    permiso: ['seguridad.rol.gestionar', 'LISTAR'],
    permitidos: [...DIRECTIVOS_ACAD, 'DIR_ADMIN'],
  },
];

describe('Guard por endpoint: 200 con el permiso, 403 sin él', () => {
  describe.each(ENDPOINTS)('GET $ruta', ({ ruta, permiso, permitidos }) => {
    it.each(ROLES)('%s', async (rol) => {
      const esperado = permitidos.includes(rol) ? 200 : 403;
      const res = await como(rol, 'get', ruta);
      expect(res.status).toBe(esperado);
      if (esperado === 403) {
        expect(res.body.error).toBe('Acceso denegado');
        expect(res.body.codigo).toBe(permiso[0]);
        expect(res.body.accion).toBe(permiso[1]);
      }
    });
  });

  it('la tabla de la prueba coincide con lo que /auth/me declara para cada rol', async () => {
    for (const { ruta, permiso, permitidos } of ENDPOINTS) {
      for (const rol of ROLES) {
        const { permisos } = await sesionDe(rol);
        const declarado = tiene(permisos, permiso[0], permiso[1]);
        expect({ ruta, rol, declarado }).toEqual({
          ruta,
          rol,
          declarado: permitidos.includes(rol),
        });
      }
    }
  });
});

describe('Permisos efectivos por rol (/auth/me)', () => {
  const ESPERADO = {
    RECTOR: {
      si: [
        ['configuracion.carrera', 'LISTAR'],
        ['finanzas.cuenta-cobrar.reporte', 'EXPORTAR'],
        ['seguridad.usuario.administrar', 'LISTAR'],
        ['titulacion.proyecto', 'APROBAR'],
      ],
      no: [],
    },
    DIR_ACADEMICO: {
      si: [
        ['configuracion.carrera', 'LISTAR'],
        ['academico.libro', 'LISTAR'],
        ['titulacion.proyecto', 'EXPORTAR'],
      ],
      no: [
        ['finanzas.pago.ver', 'LISTAR'],
        ['capacitacion.curso', 'LISTAR'],
      ],
    },
    DIR_ADMIN: {
      si: [
        ['finanzas.cuenta-cobrar.reporte', 'EXPORTAR'],
        ['capacitacion.curso', 'LISTAR'],
        ['seguridad.usuario.administrar', 'LISTAR'],
      ],
      no: [
        ['configuracion.carrera', 'LISTAR'],
        ['academico.libro', 'LISTAR'],
      ],
    },
    SEC_ACADEMICA: {
      si: [
        ['academico.libro', 'LISTAR'],
        ['matricula.admision.ver', 'LISTAR'],
      ],
      no: [
        ['finanzas.pago.ver', 'LISTAR'],
        ['capacitacion.curso', 'LISTAR'],
        ['seguridad.usuario.administrar', 'LISTAR'],
        ['academico.libro', 'APROBAR'],
      ],
    },
    SEC_ADMIN: {
      si: [
        ['finanzas.pago.ver', 'LISTAR'],
        ['capacitacion.curso', 'LISTAR'],
      ],
      no: [
        ['configuracion.carrera', 'LISTAR'],
        ['academico.libro', 'LISTAR'],
        ['seguridad.usuario.administrar', 'LISTAR'],
      ],
    },
    DOCENTE: {
      si: [
        ['docentes.ver', 'LISTAR'],
        ['titulacion.proyecto', 'LISTAR'],
      ],
      no: [
        ['configuracion.carrera', 'LISTAR'],
        ['finanzas.pago.ver', 'LISTAR'],
        ['seguridad.rol.gestionar', 'LISTAR'],
        ['docentes.crear', 'CREAR'],
      ],
    },
    ESTUDIANTE: {
      si: [
        ['matricula.inscribir', 'LISTAR'],
        ['titulacion.proyecto', 'DETALLE'],
      ],
      no: [
        ['docentes.ver', 'LISTAR'],
        ['finanzas.pago.ver', 'LISTAR'],
        ['seguridad.usuario.administrar', 'LISTAR'],
        ['configuracion.carrera', 'LISTAR'],
      ],
    },
  };

  it.each(Object.keys(ESPERADO))('%s tiene y no tiene los permisos de la matriz', async (rol) => {
    const { permisos } = await sesionDe(rol);
    for (const [codigo, accion] of ESPERADO[rol].si) {
      expect({ rol, codigo, accion, tiene: tiene(permisos, codigo, accion) }).toEqual({
        rol,
        codigo,
        accion,
        tiene: true,
      });
    }
    for (const [codigo, accion] of ESPERADO[rol].no) {
      expect({ rol, codigo, accion, tiene: tiene(permisos, codigo, accion) }).toEqual({
        rol,
        codigo,
        accion,
        tiene: false,
      });
    }
  });

  it('ADMIN_SISTEMA hereda exactamente el catálogo activo (sin filas en roles_permisos)', async () => {
    const { permisos } = await sesionDe(ADMIN);
    const [{ n }] = await sequelize.query(
      'SELECT COUNT(*) AS n FROM vista_catalogo_acciones_permisos_activas',
      { type: sequelize.QueryTypes.SELECT }
    );
    expect(aSetDePares(permisos).size).toBe(Number(n));
    expect(Number(n)).toBeGreaterThan(100);
    const [{ filas }] = await sequelize.query(
      `SELECT COUNT(*) AS filas FROM roles_permisos rp JOIN roles r ON r.id = rp.rol_id
        WHERE r.codigo = 'ADMIN_SISTEMA'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    expect(Number(filas)).toBe(0);
  });

  it.each(ROLES.filter((r) => r !== ADMIN))(
    '%s: /auth/me coincide con vista_usuario_permisos_efectivos',
    async (rol) => {
      const { permisos, usuario } = await sesionDe(rol);
      const filas = await sequelize.query(
        'SELECT permiso_codigo, accion FROM vista_usuario_permisos_efectivos WHERE usuario_id = :id',
        { replacements: { id: usuario.id }, type: sequelize.QueryTypes.SELECT }
      );
      const enBd = new Set(filas.map((f) => `${f.permiso_codigo}|${f.accion}`));
      expect(aSetDePares(permisos)).toEqual(enBd);
      expect(enBd.size).toBeGreaterThan(0);
    }
  );

  it.each(ROLES)('%s: solo acciones del vocabulario v2 (sin VER) y sin acciones vacías', async (rol) => {
    const { permisos } = await sesionDe(rol);
    for (const { codigo, acciones } of permisos) {
      expect(acciones.length).toBeGreaterThan(0);
      for (const accion of acciones) {
        expect({ codigo, accion, valida: ACCIONES_VALIDAS.includes(accion) }).toEqual({
          codigo,
          accion,
          valida: true,
        });
      }
    }
  });
});

describe('Menú (sidebar) derivado de los permisos LISTAR', () => {
  it.each(ROLES)('%s tiene al menos una entrada de menú', async (rol) => {
    const { permisos } = await sesionDe(rol);
    expect((await rutasDeMenu(permisos)).length).toBeGreaterThan(0);
  });

  it('cada rol ve en el menú sus módulos y no los ajenos', async () => {
    const menu = {};
    for (const rol of ROLES) menu[rol] = await rutasDeMenu((await sesionDe(rol)).permisos);

    // Rutas: permisos.ruta_sidebar de seguridad.usuario.administrar, docentes.ver, finanzas.pago.ver...
    expect(menu.RECTOR).toEqual(expect.arrayContaining(['/seguridad/usuarios', '/docentes/listar', '/pagos/listar']));
    expect(menu.DIR_ADMIN).toEqual(expect.arrayContaining(['/pagos/listar', '/capacitacion/cursos']));
    expect(menu.DIR_ADMIN).not.toContain('/configuracion/academico');
    expect(menu.SEC_ADMIN).toContain('/pagos/listar');
    expect(menu.SEC_ADMIN).not.toContain('/seguridad/usuarios');
    expect(menu.SEC_ACADEMICA).toContain('/academico/libros');
    expect(menu.SEC_ACADEMICA).not.toContain('/pagos/listar');
    expect(menu.DOCENTE).toContain('/docentes/listar');
    expect(menu.DOCENTE).not.toContain('/pagos/listar');
    expect(menu.ESTUDIANTE).toContain('/matricula/listar');
    expect(menu.ESTUDIANTE).not.toContain('/seguridad/usuarios');
    expect(menu.ESTUDIANTE).not.toContain('/configuracion/academico');
    expect(menu.ESTUDIANTE).not.toContain('/docentes/listar');

    // El rol con menú más acotado nunca supera al de jerarquía mayor.
    expect(menu.ESTUDIANTE.length).toBeLessThan(menu.RECTOR.length);
    expect(menu.SEC_ADMIN.length).toBeLessThan(menu.DIR_ADMIN.length);
  });

  it('toda entrada de menú de un rol tiene el LISTAR que exige el guard (menú visible => API accesible)', async () => {
    // Si el menú muestra un ítem por LISTAR, el listado de ese permiso no puede dar 403.
    for (const rol of ['DOCENTE', 'ESTUDIANTE', 'SEC_ADMIN']) {
      const { permisos } = await sesionDe(rol);
      expect(tiene(permisos, 'configuracion.carrera', 'LISTAR')).toBe(false);
      expect((await como(rol, 'get', '/carreras')).status).toBe(403);
    }
  });
});

describe('Rutas protegidas sin credenciales', () => {
  const RUTAS = [
    '/auth/me',
    '/dashboard/resumen',
    '/dashboard/mi-resumen',
    '/dashboard/mi-resumen-docente',
    ...ENDPOINTS.map((e) => e.ruta),
  ];

  it.each(RUTAS)('GET %s sin token responde 401', async (ruta) => {
    const res = await request(app).get(`${API}${ruta}`);
    expect(res.status).toBe(401);
  });

  it('un token válido de una sesión cerrada o inexistente responde 401', async () => {
    // JWT bien firmado pero sin fila en `sesiones` (auth stateful).
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ userId: 1, rolId: 1, rolCodigo: 'ADMIN_SISTEMA' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
      jwtid: 'sin-sesion',
    });
    const res = await request(app).get(`${API}/carreras`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});
