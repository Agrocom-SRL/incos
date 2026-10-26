/**
 * Capacitación (cursos, participantes, inscripciones y pagos) contra la BD real efímera.
 *
 * Cubre: detalle por id (404), validaciones 400, 403 por rol según la matriz, paginación/filtros
 * y un flujo de escritura completo (participante -> curso -> inscripción -> pago -> anular/eliminar)
 * que deja la BD como estaba (datos con prefijo `ci-`, limpieza en `finally`).
 *
 * Matriz: SEC_ADMIN opera (LISTAR/DETALLE/CREAR/EDITAR) pero NO tiene ELIMINAR ni ACTIVAR;
 * RECTOR y DIR_ADMIN sí. Los roles académicos, docente y estudiante no tienen capacitación.
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

const OPERA = 'SEC_ADMIN';
const ELIMINA = 'DIR_ADMIN';
const SIN_PERMISO = ['DIR_ACADEMICO', 'SEC_ACADEMICA', 'DOCENTE', 'ESTUDIANTE'];
const ID_INEXISTENTE = 999999;

describe('Capacitación · cursos', () => {
  it('listado paginado con meta y filtros', async () => {
    const res = await como(OPERA, 'get', '/cursos-capacitacion?page=1&limit=2');
    esperarListadoPaginado(res, { page: 1, limit: 2 });
    const abiertos = await como(OPERA, 'get', '/cursos-capacitacion?estado=ABIERTO');
    expect(abiertos.status).toBe(200);
    for (const curso of abiertos.body.data) expect(curso.estado).toBe('ABIERTO');
  });

  it.each([
    ['estado fuera del catálogo', '?estado=XX', 'estado'],
    ['incluirInactivos no booleano', '?incluirInactivos=maybe', 'incluirInactivos'],
    ['page = 0', '?page=0', 'page'],
    ['limit > 10000', '?limit=10001', 'limit'],
    ['search de 1 carácter', '?search=a', 'search'],
  ])('listado rechaza %s', async (_caso, query, campo) => {
    esperarValidacion(await como(OPERA, 'get', `/cursos-capacitacion${query}`), campo);
  });

  it('detalle: 404 si no existe y 400 si el id no es numérico', async () => {
    esperarNoEncontrado(await como(OPERA, 'get', `/cursos-capacitacion/${ID_INEXISTENTE}`));
    esperarValidacion(await como(OPERA, 'get', '/cursos-capacitacion/abc'), 'id');
    esperarValidacion(await como(OPERA, 'get', '/cursos-capacitacion/0'), 'id');
  });

  it('grupos y horarios: listados y filtros', async () => {
    esperarListadoPaginado(await como(OPERA, 'get', '/cursos-capacitacion/grupos'));
    esperarValidacion(await como(OPERA, 'get', '/cursos-capacitacion/grupos?cursoId=0'), 'cursoId');
    const horarios = await como(OPERA, 'get', '/cursos-capacitacion/horarios');
    expect(horarios.status).toBe(200);
    expect(Array.isArray(horarios.body.data.horarios)).toBe(true);
    esperarValidacion(await como(OPERA, 'get', '/cursos-capacitacion/horarios?sort=zz'), 'sort');
    esperarNoEncontrado(await como(OPERA, 'get', `/cursos-capacitacion/horarios/${ID_INEXISTENTE}`));
  });

  it('horarios disponibles exige aulaId y devuelve la grilla del aula', async () => {
    esperarValidacion(await como(OPERA, 'get', '/cursos-capacitacion/horarios-disponibles'), 'aulaId');
    const [aula] = await sequelize.query('SELECT id FROM aulas ORDER BY id LIMIT 1', {
      type: sequelize.QueryTypes.SELECT,
    });
    const res = await como(OPERA, 'get', `/cursos-capacitacion/horarios-disponibles?aulaId=${aula.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.horarios.length).toBeGreaterThan(0);
    expect(res.body.data.horarios[0]).toEqual(
      expect.objectContaining({ horarioId: expect.any(Number), dia: expect.any(String) })
    );
  });

  it.each([
    ['sin cuerpo', {}, 'titulo'],
    ['fecha inválida', { titulo: 'ci-curso', fechaInicio: 'no-fecha' }, 'fechaInicio'],
    ['costo negativo', { titulo: 'ci-curso', fechaInicio: '2026-11-01', costo: -5 }, 'costo'],
    ['modalidad desconocida', { titulo: 'ci-curso', fechaInicio: '2026-11-01', modalidad: 'XX' }, 'modalidad'],
    ['cupo cero', { titulo: 'ci-curso', fechaInicio: '2026-11-01', cupoMaximo: 0 }, 'cupoMaximo'],
  ])('crear curso rechaza %s', async (_caso, cuerpo, campo) => {
    esperarValidacion(await enviarComo(OPERA, 'post', '/cursos-capacitacion', cuerpo), campo);
  });

  it('editar, abrir y exportar inscritos de un curso inexistente dan 404', async () => {
    esperarNoEncontrado(
      await enviarComo(OPERA, 'put', `/cursos-capacitacion/${ID_INEXISTENTE}`, { titulo: 'ci-curso nuevo' })
    );
    esperarNoEncontrado(await enviarComo(OPERA, 'post', `/cursos-capacitacion/${ID_INEXISTENTE}/abrir`));
    esperarNoEncontrado(await como(OPERA, 'get', `/cursos-capacitacion/${ID_INEXISTENTE}/inscritos/exportar`));
  });

  it('crear horario rechaza día/hora inválidos', async () => {
    esperarValidacion(await enviarComo(OPERA, 'post', '/cursos-capacitacion/horarios', {}), 'dia');
    esperarValidacion(
      await enviarComo(OPERA, 'post', '/cursos-capacitacion/horarios', {
        dia: 'XX',
        horaInicio: '25:00',
        horaFin: '10:00',
      }),
      'horaInicio'
    );
  });

  it('SEC_ADMIN no puede eliminar ni activar cursos (solo RECTOR/DIR_ADMIN)', async () => {
    esperarDenegado(
      await como(OPERA, 'delete', `/cursos-capacitacion/${ID_INEXISTENTE}`),
      'capacitacion.curso',
      'ELIMINAR'
    );
    esperarDenegado(
      await enviarComo(OPERA, 'patch', `/cursos-capacitacion/${ID_INEXISTENTE}/estado`, {}),
      'capacitacion.curso',
      'ACTIVAR'
    );
    esperarNoEncontrado(await como(ELIMINA, 'delete', `/cursos-capacitacion/${ID_INEXISTENTE}`));
  });

  it.each(SIN_PERMISO)('%s recibe 403 en listado, detalle, grupos y creación', async (rol) => {
    esperarDenegado(await como(rol, 'get', '/cursos-capacitacion'), 'capacitacion.curso', 'LISTAR');
    esperarDenegado(await como(rol, 'get', '/cursos-capacitacion/1'), 'capacitacion.curso', 'DETALLE');
    esperarDenegado(await como(rol, 'get', '/cursos-capacitacion/grupos'), 'capacitacion.grupo', 'LISTAR');
    esperarDenegado(
      await enviarComo(rol, 'post', '/cursos-capacitacion', { titulo: 'ci-curso', fechaInicio: '2026-11-01' }),
      'capacitacion.curso',
      'CREAR'
    );
  });
});

describe('Capacitación · participantes', () => {
  it('listado paginado y filtros', async () => {
    esperarListadoPaginado(await como(OPERA, 'get', '/participantes?page=1&limit=2'), { limit: 2 });
    const porCi = await como(OPERA, 'get', '/participantes?ci=ci-no-existe-9999');
    expect(porCi.status).toBe(200);
    expect(porCi.body.data).toEqual([]);
    esperarValidacion(await como(OPERA, 'get', '/participantes?sinInscripcionActiva=x'), 'sinInscripcionActiva');
  });

  it('detalle y edición: 404 si no existe', async () => {
    esperarNoEncontrado(await como(OPERA, 'get', `/participantes/${ID_INEXISTENTE}`));
    esperarNoEncontrado(await enviarComo(OPERA, 'put', `/participantes/${ID_INEXISTENTE}`, { nombres: 'Ci Nuevo' }));
  });

  it.each([
    ['sin cuerpo', {}, 'ci'],
    ['ci y celular demasiado cortos', { ci: '1', nombres: 'Ci', celular: '1' }, 'ci'],
    ['correo inválido', { ci: 'ci-9001', nombres: 'Ci', celular: '7000000', email: 'no-email' }, 'email'],
  ])('crear participante rechaza %s', async (_caso, cuerpo, campo) => {
    esperarValidacion(await enviarComo(OPERA, 'post', '/participantes', cuerpo), campo);
  });

  it('SEC_ADMIN no puede eliminar participantes; roles ajenos reciben 403', async () => {
    esperarDenegado(
      await como(OPERA, 'delete', `/participantes/${ID_INEXISTENTE}`),
      'capacitacion.participante',
      'ELIMINAR'
    );
    for (const rol of SIN_PERMISO) {
      esperarDenegado(await como(rol, 'get', '/participantes'), 'capacitacion.participante', 'LISTAR');
    }
  });
});

describe('Capacitación · inscripciones y pagos (validaciones)', () => {
  it('listado paginado y filtros', async () => {
    esperarListadoPaginado(await como(OPERA, 'get', '/inscripciones-capacitacion?page=1&limit=3'), { limit: 3 });
    esperarValidacion(await como(OPERA, 'get', '/inscripciones-capacitacion?estado=XX'), 'estado');
    esperarValidacion(await como(OPERA, 'get', '/inscripciones-capacitacion?capacitacionId=0'), 'capacitacionId');
  });

  it('detalle, formulario y recibo: 404 si la inscripción no existe', async () => {
    const base = `/inscripciones-capacitacion/${ID_INEXISTENTE}`;
    esperarNoEncontrado(await como(OPERA, 'get', base));
    esperarNoEncontrado(await como(OPERA, 'get', `${base}/formulario-pdf`));
    esperarNoEncontrado(await como(OPERA, 'get', `${base}/pagos/1/recibo-pdf`));
    esperarNoEncontrado(await enviarComo(OPERA, 'post', `${base}/anular`, {}));
    esperarValidacion(await como(OPERA, 'get', `${base}/pagos/abc/comprobante`), 'pagoId');
  });

  it('crear inscripción: 400 sin curso y 404 con curso inexistente', async () => {
    esperarValidacion(await enviarComo(OPERA, 'post', '/inscripciones-capacitacion', {}), 'capacitacionId');
    esperarNoEncontrado(
      await enviarComo(OPERA, 'post', '/inscripciones-capacitacion', {
        capacitacionId: ID_INEXISTENTE,
        participanteId: 1,
      })
    );
  });

  it('registrar/anular pago y requisitos rechazan payload inválido', async () => {
    const base = `/inscripciones-capacitacion/${ID_INEXISTENTE}`;
    esperarValidacion(await enviarComo(OPERA, 'post', `${base}/pagos`, {}), 'concepto');
    esperarValidacion(
      await enviarComo(OPERA, 'post', `${base}/pagos`, { concepto: 'XX', monto: 0, metodoPagoId: 1 }),
      'monto'
    );
    esperarValidacion(await enviarComo(OPERA, 'post', `${base}/pagos/1/anular`, {}), 'motivo');
    esperarValidacion(await enviarComo(OPERA, 'put', `${base}/requisitos`, { requisitos: [] }), 'requisitos');
  });

  it('SEC_ADMIN no puede eliminar inscripciones; roles ajenos reciben 403', async () => {
    esperarDenegado(
      await como(OPERA, 'delete', `/inscripciones-capacitacion/${ID_INEXISTENTE}`),
      'capacitacion.inscripcion',
      'ELIMINAR'
    );
    for (const rol of SIN_PERMISO) {
      esperarDenegado(await como(rol, 'get', '/inscripciones-capacitacion'), 'capacitacion.inscripcion', 'LISTAR');
      esperarDenegado(await como(rol, 'get', '/inscripciones-capacitacion/1'), 'capacitacion.inscripcion', 'DETALLE');
    }
  });
});

describe('Capacitación · flujo completo y limpio (crear -> leer -> pagar -> eliminar)', () => {
  it('participante, curso, inscripción y pago se crean, se leen y se eliminan', async () => {
    const creados = {};
    await conLimpieza(async (limpiar) => {
      const sufijo = Date.now();
      creados.ci = `ci-${sufijo}`;

      // Participante
      const creaPart = await enviarComo(OPERA, 'post', '/participantes', {
        ci: `ci-${sufijo}`,
        nombres: 'Ci Participante',
        apellidoPaterno: 'Prueba',
        celular: '70000099',
      });
      expect(creaPart.status).toBe(201);
      const participanteId = creaPart.body.data.id ?? creaPart.body.data.participante?.id;
      expect(participanteId).toBeGreaterThan(0);
      creados.participanteId = participanteId;
      limpiar.push(async () => {
        await como(ELIMINA, 'delete', `/participantes/${participanteId}`);
      });

      const leePart = await como(OPERA, 'get', `/participantes/${participanteId}`);
      expect(leePart.status).toBe(200);
      const filtro = await como(OPERA, 'get', `/participantes?ci=ci-${sufijo}`);
      expect(filtro.body.data.length).toBe(1);

      // Curso (con costo, para poder registrar un pago)
      const creaCurso = await enviarComo(OPERA, 'post', '/cursos-capacitacion', {
        titulo: `ci-curso ${sufijo}`,
        fechaInicio: '2026-12-01',
        costo: 100,
        tieneCosto: true,
        cupoMaximo: 5,
        modalidad: 'PRESENCIAL',
      });
      expect(creaCurso.status).toBe(201);
      const cursoId = creaCurso.body.data.id ?? creaCurso.body.data.curso?.id;
      expect(cursoId).toBeGreaterThan(0);
      creados.cursoId = cursoId;
      limpiar.push(async () => {
        await como(ELIMINA, 'delete', `/cursos-capacitacion/${cursoId}`);
      });

      const leeCurso = await como(OPERA, 'get', `/cursos-capacitacion/${cursoId}`);
      expect(leeCurso.status).toBe(200);
      const buscaCurso = await como(OPERA, 'get', `/cursos-capacitacion?search=ci-curso ${sufijo}`);
      expect(buscaCurso.body.data.map((c) => c.id)).toContain(cursoId);

      // Regla de negocio: un curso no virtual necesita un grupo con horarios antes de abrirse
      const sinGrupo = await enviarComo(OPERA, 'post', `/cursos-capacitacion/${cursoId}/abrir`);
      esperarValidacion(sinGrupo);

      // Solo un curso ABIERTO admite inscripciones: se convierte en virtual (no exige horarios)
      const virtual = await enviarComo(OPERA, 'put', `/cursos-capacitacion/${cursoId}`, { modalidad: 'VIRTUAL' });
      expect(virtual.status).toBe(200);
      const abre = await enviarComo(OPERA, 'post', `/cursos-capacitacion/${cursoId}/abrir`);
      expect(abre.status).toBe(200);

      // Inscripción
      const inscribe = await enviarComo(OPERA, 'post', '/inscripciones-capacitacion', {
        capacitacionId: cursoId,
        participanteId,
      });
      expect(inscribe.status).toBe(201);
      const inscripcionId = inscribe.body.data.id ?? inscribe.body.data.inscripcion?.id;
      expect(inscripcionId).toBeGreaterThan(0);
      creados.inscripcionId = inscripcionId;
      limpiar.push(async () => {
        await como(ELIMINA, 'delete', `/inscripciones-capacitacion/${inscripcionId}`);
      });

      const leeInsc = await como(OPERA, 'get', `/inscripciones-capacitacion/${inscripcionId}`);
      expect(leeInsc.status).toBe(200);
      const porCurso = await como(OPERA, 'get', `/inscripciones-capacitacion?capacitacionId=${cursoId}`);
      expect(porCurso.body.data.length).toBe(1);

      // Pago
      const [metodo] = await sequelize.query('SELECT id FROM metodos_pago ORDER BY id LIMIT 1', {
        type: sequelize.QueryTypes.SELECT,
      });
      const pago = await enviarComo(OPERA, 'post', `/inscripciones-capacitacion/${inscripcionId}/pagos`, {
        concepto: 'CURSO',
        monto: 40,
        metodoPagoId: metodo.id,
      });
      expect(pago.status).toBe(201);
      expect(pago.body.success).toBe(true);
      expect(JSON.stringify(pago.body.data)).toContain('40');

      // Un pago que supera el costo del curso se rechaza (regla de negocio)
      const excede = await enviarComo(OPERA, 'post', `/inscripciones-capacitacion/${inscripcionId}/pagos`, {
        concepto: 'CURSO',
        monto: 1000,
        metodoPagoId: metodo.id,
      });
      esperarValidacion(excede);
    });

    // Tras la limpieza nada queda visible por la API (soft delete)
    esperarNoEncontrado(await como(OPERA, 'get', `/inscripciones-capacitacion/${creados.inscripcionId}`));
    esperarNoEncontrado(await como(OPERA, 'get', `/cursos-capacitacion/${creados.cursoId}`));
    const participantes = await como(OPERA, 'get', `/participantes?ci=${creados.ci}`);
    expect(participantes.body.data).toEqual([]);
  });
});
