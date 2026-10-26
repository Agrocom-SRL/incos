/**
 * Pagos y aportes (Finanzas): cabeceras de aporte, cuotas, ingresos, reportes y catálogos de pago.
 *
 * Matriz: SEC_ADMIN registra/anula cuotas (`finanzas.pago.*`) pero no ve reportes de becas/cuentas por
 * cobrar ni configura (solo RECTOR/DIR_ADMIN); el ESTUDIANTE ve únicamente sus aportes
 * (`matricula.pago.aporte.ver`); el DOCENTE no tiene acceso. El listado de aportes también lo abre
 * `matricula.pago.aporte.ver` (SEC_ACADEMICA/DIR_ACADEMICO), por eso no es un 403 para ellos.
 *
 * Nota: la cabecera de aporte del estudiante de prueba se genera al consultar `mis-aportes`, así que las
 * aserciones no dependen de cuántas cabeceras existan. Las cuotas de prueba se crean y se anulan en el
 * mismo caso (soft delete).
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, sequelize } from './helpers/sistema.js';
import {
  esperarValidacion,
  esperarNoEncontrado,
  esperarDenegado,
  esperarListadoPaginado,
  enviarComo,
  conLimpieza,
} from './helpers/respuestas.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const CAJA = 'SEC_ADMIN';
const ID_INEXISTENTE = 999999;

describe('Pagos · listado de aportes', () => {
  it('listado paginado con meta y filtro de búsqueda sin resultados', async () => {
    esperarListadoPaginado(await como(CAJA, 'get', '/pagos-aportes?page=1&limit=2'), { limit: 2 });
    const vacio = await como(CAJA, 'get', '/pagos-aportes?search=zzzzzz-ci-sin-resultados');
    esperarListadoPaginado(vacio);
    expect(vacio.body.data).toEqual([]);
  });

  it.each([
    ['page = 0', '?page=0', 'page'],
    ['limit = 0', '?limit=0', 'limit'],
    ['search de 1 carácter', '?search=a', 'search'],
  ])('listado rechaza %s', async (_caso, query, campo) => {
    esperarValidacion(await como(CAJA, 'get', `/pagos-aportes${query}`), campo);
  });

  it('detalle y recibo: 404 si el aporte no existe, 400 si el id no es numérico', async () => {
    esperarNoEncontrado(await como(CAJA, 'get', `/pagos-aportes/${ID_INEXISTENTE}`));
    esperarNoEncontrado(await como(CAJA, 'get', `/pagos-aportes/${ID_INEXISTENTE}/recibo`));
    esperarValidacion(await como(CAJA, 'get', '/pagos-aportes/abc'), 'id');
  });

  it('el estudiante ve sus aportes y el detalle de uno propio; uno inexistente da 404', async () => {
    const mis = await como('ESTUDIANTE', 'get', '/pagos-aportes/mis-aportes');
    expect(mis.status).toBe(200);
    expect(mis.body.data.aportes.length).toBeGreaterThan(0);
    const [aporte] = mis.body.data.aportes;
    expect(aporte.student_id).toBeDefined();

    const detalle = await como('ESTUDIANTE', 'get', `/pagos-aportes/mis-aportes/${aporte.id}`);
    expect(detalle.status).toBe(200);
    esperarNoEncontrado(await como('ESTUDIANTE', 'get', `/pagos-aportes/mis-aportes/${ID_INEXISTENTE}`));

    // El mismo aporte es visible para caja por su id
    const porCaja = await como(CAJA, 'get', `/pagos-aportes/${aporte.id}`);
    expect(porCaja.status).toBe(200);
  });

  it('mis-aportes exige un usuario vinculado a un estudiante (403 de negocio para el personal)', async () => {
    const res = await como(CAJA, 'get', '/pagos-aportes/mis-aportes');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('Pagos · búsqueda de estudiantes y estado de registro', () => {
  it('buscar estudiantes: encuentra al estudiante de prueba y valida q/limit', async () => {
    const res = await como(CAJA, 'get', '/pagos-aportes/buscar-estudiantes-registro?q=Prueba');
    expect(res.status).toBe(200);
    expect(res.body.data.map((e) => e.codigoEstudiante)).toContain('TEST-EST-001');
    esperarValidacion(await como(CAJA, 'get', '/pagos-aportes/buscar-estudiantes-registro'), 'q');
    esperarValidacion(await como(CAJA, 'get', '/pagos-aportes/buscar-estudiantes-registro?q=ab&limit=500'), 'limit');
    esperarValidacion(await como(CAJA, 'get', '/pagos-aportes/buscar-estudiantes-registro?q=ab&preliminar=7'), 'preliminar');
    const preliminar = await como(CAJA, 'get', '/pagos-aportes/buscar-estudiantes-registro?preliminar=1');
    expect(preliminar.status).toBe(200);
  });

  it('estado-registro exige estudiante_id', async () => {
    const res = await como(CAJA, 'get', '/pagos-aportes/estado-registro');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ESTUDIANTE_ID');
  });
});

describe('Pagos · registrar cuota (validaciones)', () => {
  it.each([
    ['sin cuerpo', {}, 'student_id'],
    ['monto negativo', { student_id: 1, amount: -1, payment_method_id: 1, payment_date: '2026-01-01' }, 'amount'],
    ['método de pago fuera del catálogo', { student_id: 1, amount: 10, payment_method_id: 9, payment_date: '2026-01-01' }, 'payment_method_id'],
    ['fecha inválida', { student_id: 1, amount: 10, payment_method_id: 1, payment_date: 'x' }, 'payment_date'],
  ])('rechaza %s', async (_caso, cuerpo, campo) => {
    esperarValidacion(await enviarComo(CAJA, 'post', '/pagos-aportes', cuerpo), campo);
  });

  it('estudiante inexistente responde 404 y transferencia sin cuenta responde 400', async () => {
    esperarNoEncontrado(
      await enviarComo(CAJA, 'post', '/pagos-aportes', {
        student_id: ID_INEXISTENTE,
        amount: 10,
        payment_method_id: 1,
        payment_date: '2026-01-01',
      })
    );
    esperarValidacion(
      await enviarComo(CAJA, 'post', '/pagos-aportes', {
        student_id: 1,
        amount: 10,
        payment_method_id: 3,
        payment_date: '2026-01-01',
      })
    );
  });

  it('editar/anular cuota inexistente: 404 (anular) y 400 (cuerpo vacío al editar)', async () => {
    esperarNoEncontrado(await como(CAJA, 'delete', `/pagos-aportes/cuotas/${ID_INEXISTENTE}`));
    esperarNoEncontrado(await como(CAJA, 'delete', `/pagos-aportes/${ID_INEXISTENTE}`));
    esperarValidacion(await enviarComo(CAJA, 'put', `/pagos-aportes/cuotas/${ID_INEXISTENTE}`, {}), 'amount');
  });

  it('compromiso: lectura sin compromiso vigente y creación sin fecha', async () => {
    const lee = await como(CAJA, 'get', `/pagos-aportes/${ID_INEXISTENTE}/compromiso`);
    expect(lee.status).toBe(200);
    expect(lee.body.data.compromiso).toBeNull();
    const crea = await enviarComo(CAJA, 'post', `/pagos-aportes/${ID_INEXISTENTE}/compromiso`, {});
    expect(crea.status).toBe(400);
  });
});

describe('Pagos · cuota de efectivo: registrar -> leer -> anular', () => {
  it('registra una cuota del estudiante de prueba y la anula al terminar', async () => {
    // Garantiza que exista la cabecera de aporte del estudiante (se genera al consultar mis-aportes)
    const mis = await como('ESTUDIANTE', 'get', '/pagos-aportes/mis-aportes');
    expect(mis.status).toBe(200);
    const cabecera = mis.body.data.aportes[0];

    await conLimpieza(async (limpiar) => {
      const registra = await enviarComo(CAJA, 'post', '/pagos-aportes', {
        student_id: cabecera.student_id,
        management_id: cabecera.management_id,
        amount: 10,
        payment_method_id: 1,
        payment_date: '2026-03-01',
        descripcion: 'ci-cuota de prueba',
      });
      expect(registra.status).toBe(201);

      const [cuota] = await sequelize.query(
        "SELECT id FROM pago_cuotas WHERE descripcion = 'ci-cuota de prueba' AND deleted_at IS NULL ORDER BY id DESC LIMIT 1",
        { type: sequelize.QueryTypes.SELECT }
      );
      expect(cuota?.id).toBeGreaterThan(0);
      limpiar.push(async () => {
        await como(CAJA, 'delete', `/pagos-aportes/cuotas/${cuota.id}`);
      });

      const recibo = await como(CAJA, 'get', `/pagos-aportes/${cuota.id}/recibo`);
      expect([200, 404]).toContain(recibo.status);
      const detalle = await como(CAJA, 'get', `/pagos-aportes/${cabecera.id}`);
      expect(detalle.status).toBe(200);
    });

    const restantes = await sequelize.query(
      "SELECT id FROM pago_cuotas WHERE descripcion = 'ci-cuota de prueba' AND deleted_at IS NULL",
      { type: sequelize.QueryTypes.SELECT }
    );
    expect(restantes).toEqual([]);
  });
});

describe('Pagos · ingresos y reportes', () => {
  it('ingresos: paginación, validación de filtros y 403 sin finanzas', async () => {
    esperarListadoPaginado(await como(CAJA, 'get', '/ingresos?page=1&limit=2'), { limit: 2 });
    esperarValidacion(await como(CAJA, 'get', '/ingresos?search=a'), 'search');
    esperarValidacion(await como(CAJA, 'get', '/ingresos?limit=0'), 'limit');
    for (const rol of ['SEC_ACADEMICA', 'DIR_ACADEMICO', 'DOCENTE', 'ESTUDIANTE']) {
      esperarDenegado(await como(rol, 'get', '/ingresos'), 'finanzas.pago.ver', 'LISTAR');
    }
  });

  it('reportes de becas y cuentas por cobrar: DIR_ADMIN/RECTOR sí, SEC_ADMIN no', async () => {
    const becas = await como('DIR_ADMIN', 'get', '/pagos-aportes/reportes/becas-por-carrera');
    expect(becas.status).toBe(200);
    expect(becas.body.data.planillaBecas.filas).toEqual(expect.any(Array));
    const cobrar = await como('DIR_ADMIN', 'get', '/pagos-aportes/reportes/cuentas-por-cobrar');
    expect(cobrar.status).toBe(200);
    expect(cobrar.body.data.cuentasPorCobrar.carreras).toEqual(expect.any(Array));
    esperarDenegado(
      await como(CAJA, 'get', '/pagos-aportes/reportes/becas-por-carrera'),
      'finanzas.beca.reporte',
      'LISTAR'
    );
    esperarDenegado(
      await como(CAJA, 'get', '/pagos-aportes/reportes/cuentas-por-cobrar'),
      'finanzas.cuenta-cobrar.reporte',
      'LISTAR'
    );
  });

  it('exportar lista por carrera exige carrera_id válido', async () => {
    const res = await como(CAJA, 'get', '/pagos-aportes/export/lista-por-carrera');
    expect(res.status).toBe(400);
  });
});

describe('Pagos · permisos por rol (matriz)', () => {
  it('ESTUDIANTE no registra ni elimina pagos; DOCENTE no entra al módulo', async () => {
    esperarDenegado(await enviarComo('ESTUDIANTE', 'post', '/pagos-aportes', {}), 'finanzas.pago.registrar', 'CREAR');
    const docente = await como('DOCENTE', 'get', '/pagos-aportes');
    expect(docente.status).toBe(403);
    esperarDenegado(await como('DOCENTE', 'get', '/pagos-aportes/mis-aportes'), 'matricula.pago.aporte.ver', 'LISTAR');
  });

  it('SEC_ACADEMICA lista aportes pero no registra pagos', async () => {
    expect((await como('SEC_ACADEMICA', 'get', '/pagos-aportes')).status).toBe(200);
    esperarDenegado(
      await enviarComo('SEC_ACADEMICA', 'post', '/pagos-aportes', {}),
      'finanzas.pago.registrar',
      'CREAR'
    );
  });
});

describe('Pagos · configuración de aportes y catálogos', () => {
  it('configuración de aportes: DIR_ADMIN lista; SEC_ADMIN y académicos reciben 403', async () => {
    const res = await como('DIR_ADMIN', 'get', '/configuracion-aportes?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toEqual(expect.objectContaining({ gestionId: expect.any(Number), montoBase: expect.any(Number) }));
    for (const rol of ['SEC_ADMIN', 'DIR_ACADEMICO']) {
      esperarDenegado(await como(rol, 'get', '/configuracion-aportes'), 'finanzas.aporte', 'LISTAR');
    }
    esperarDenegado(await enviarComo('SEC_ADMIN', 'post', '/configuracion-aportes', {}), 'finanzas.aporte', 'CREAR');
    esperarValidacion(await enviarComo('DIR_ADMIN', 'post', '/configuracion-aportes', {}), 'monto_base');
    esperarNoEncontrado(await enviarComo('DIR_ADMIN', 'put', `/configuracion-aportes/${ID_INEXISTENTE}`, {}));
  });

  it('catálogos de pago sembrados se listan; editarlos es solo de RECTOR/DIR_ADMIN', async () => {
    for (const ruta of ['/metodos-pago', '/cuentas-pago', '/bancos-autorizados']) {
      const res = await como('DIR_ADMIN', 'get', ruta);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    }
    esperarDenegado(
      await enviarComo(CAJA, 'put', '/metodos-pago/1', {}),
      'finanzas.configuracion.pago',
      'EDITAR'
    );
    esperarNoEncontrado(await enviarComo('DIR_ADMIN', 'put', `/metodos-pago/${ID_INEXISTENTE}`, { nombre: 'ci-x' }));
    esperarNoEncontrado(
      await enviarComo('DIR_ADMIN', 'patch', `/metodos-pago/${ID_INEXISTENTE}/estado`, { activo: true })
    );
  });
});

describe('Pagos · becas y descuentos (catálogo): crear -> leer -> editar -> eliminar', () => {
  it('valida el cuerpo y respeta ACTIVAR/ELIMINAR por rol', async () => {
    esperarValidacion(await enviarComo('DIR_ADMIN', 'post', '/becas-descuentos', {}), 'nombre');
    esperarValidacion(
      await enviarComo('DIR_ADMIN', 'post', '/becas-descuentos', { nombre: 'ci-beca', porcentaje: 150 }),
      'porcentaje'
    );
    esperarNoEncontrado(await como('DIR_ADMIN', 'get', `/becas-descuentos/${ID_INEXISTENTE}`));
    esperarNoEncontrado(await enviarComo('DIR_ADMIN', 'put', `/becas-descuentos/${ID_INEXISTENTE}`, { nombre: 'ci-beca x' }));
    esperarNoEncontrado(await como('DIR_ADMIN', 'delete', `/becas-descuentos/${ID_INEXISTENTE}`));
    esperarDenegado(
      await enviarComo(CAJA, 'post', '/becas-descuentos', { nombre: 'ci-beca', porcentaje: 10 }),
      'finanzas.beca-descuento',
      'CREAR'
    );
    esperarDenegado(await como(CAJA, 'delete', `/becas-descuentos/${ID_INEXISTENTE}`), 'finanzas.beca-descuento', 'ELIMINAR');
  });

  it('crea una beca ci-, la lee, la edita y la elimina', async () => {
    const nombre = `ci-beca ${Date.now()}`;
    await conLimpieza(async (limpiar) => {
      const crea = await enviarComo('DIR_ADMIN', 'post', '/becas-descuentos', {
        nombre,
        codigo: `CI${String(Date.now()).slice(-8)}`,
        porcentaje: 12.5,
      });
      expect(crea.status).toBe(201);
      const id = crea.body.data.id ?? crea.body.data.becaDescuento?.id;
      expect(id).toBeGreaterThan(0);
      limpiar.push(async () => {
        await como('DIR_ADMIN', 'delete', `/becas-descuentos/${id}`);
      });

      const lee = await como('DIR_ADMIN', 'get', `/becas-descuentos/${id}`);
      expect(lee.status).toBe(200);
      expect(lee.body.data.nombre).toBe(nombre);

      const edita = await enviarComo('DIR_ADMIN', 'put', `/becas-descuentos/${id}`, { nombre: `${nombre} editada` });
      expect(edita.status).toBe(200);
      const listado = await como('DIR_ADMIN', 'get', '/becas-descuentos');
      expect(listado.body.data.map((b) => b.nombre)).toContain(`${nombre} editada`);
    });

    const despues = await como('DIR_ADMIN', 'get', '/becas-descuentos');
    expect(JSON.stringify(despues.body.data)).not.toContain('ci-beca');
  });
});
