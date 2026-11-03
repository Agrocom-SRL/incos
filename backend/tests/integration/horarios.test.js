/**
 * Horarios (grilla del paralelo, bloques, conflictos, cobertura docente, carga) contra la BD real efímera.
 *
 * Recorre la cadena paralelos_gestion -> oferta_cursos -> asignaciones_docentes -> asignacion_horarios ->
 * horarios con los datos sembrados en 02-seeders (todos los paralelos de la gestión vigente están
 * PUBLICADOS). Como un paralelo PUBLICADO no admite crear/eliminar bloques, las escrituras se prueban
 * por validación (400/404) y por esa regla de negocio; no se altera ningún horario sembrado.
 *
 * Matriz: DIR_ACADEMICO/RECTOR arman (`institucional.horario.armado`) y publican; DIR_ADMIN ve oferta,
 * cursos y carga docente pero no la grilla; DOCENTE solo ve conflictos (y únicamente su propia grilla);
 * ESTUDIANTE no tiene acceso.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, sequelize } from './helpers/sistema.js';
import {
  esperarValidacion,
  esperarNoEncontrado,
  esperarDenegado,
  enviarComo,
} from './helpers/respuestas.js';

afterAll(cerrarSistema);
beforeAll(iniciarSistema);

const ARMADOR = 'DIR_ACADEMICO';
const ID_INEXISTENTE = 999999;

let bloque; // { id, asignacionDocenteId, horarioId, paraleloGestionId, docenteId }

beforeAll(async () => {
  const [fila] = await sequelize.query(
    `SELECT ah.id, ah.asignacion_docente_id AS asignacionDocenteId, ah.horario_id AS horarioId,
            oc.paralelo_gestion_id AS paraleloGestionId, ad.docente_id AS docenteId
       FROM asignacion_horarios ah
       JOIN asignaciones_docentes ad ON ad.id = ah.asignacion_docente_id
       JOIN oferta_cursos oc ON oc.id = ad.oferta_curso_id
      WHERE ah.deleted_at IS NULL AND ad.deleted_at IS NULL
      ORDER BY ah.id LIMIT 1`,
    { type: sequelize.QueryTypes.SELECT }
  );
  bloque = fila;
});

describe('Horarios · paralelo en gestión (detalle, oferta y cobertura)', () => {
  it('detalle por id: 200 con la cadena de oferta, 404 y 400', async () => {
    const ok = await como(ARMADOR, 'get', `/paralelos-gestion/${bloque.paraleloGestionId}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.paraleloGestion).toEqual(
      expect.objectContaining({ id: bloque.paraleloGestionId, turno: expect.any(String), estado: expect.any(String) })
    );
    esperarNoEncontrado(await como(ARMADOR, 'get', `/paralelos-gestion/${ID_INEXISTENTE}`));
    esperarValidacion(await como(ARMADOR, 'get', '/paralelos-gestion/abc'), 'id');
  });

  it('oferta de cursos del paralelo y su validación contra el plan', async () => {
    const oferta = await como(ARMADOR, 'get', `/paralelos-gestion/${bloque.paraleloGestionId}/oferta-cursos`);
    expect(oferta.status).toBe(200);
    expect(oferta.body.data.ofertaCursos.length).toBeGreaterThan(0);
    expect(oferta.body.data.ofertaCursos[0]).toEqual(
      expect.objectContaining({ paraleloGestionId: bloque.paraleloGestionId, materiaNombre: expect.any(String) })
    );
    const validacion = await como(ARMADOR, 'get', `/paralelos-gestion/${bloque.paraleloGestionId}/validar-oferta`);
    expect(validacion.status).toBe(200);
    expect(validacion.body.data.validacion.valido).toBe(true);
    expect(validacion.body.data.validacion.faltantes).toEqual([]);
    esperarNoEncontrado(await como(ARMADOR, 'get', `/paralelos-gestion/${ID_INEXISTENTE}/oferta-cursos`));
    esperarNoEncontrado(await como(ARMADOR, 'get', `/paralelos-gestion/${ID_INEXISTENTE}/validar-oferta`));
  });

  it('cobertura docente: porcentaje coherente con cursos con y sin docente', async () => {
    const res = await como(ARMADOR, 'get', `/paralelos-gestion/${bloque.paraleloGestionId}/cobertura-docente`);
    expect(res.status).toBe(200);
    const c = res.body.data.cobertura_docente;
    expect(c.cursos_con_docente + c.cursos_sin_docente).toBe(c.cursos_total);
    expect(c.faltantes.length).toBe(c.cursos_sin_docente);
    expect(c.cobertura_pct).toBeGreaterThanOrEqual(0);
    expect(c.cobertura_pct).toBeLessThanOrEqual(100);
    esperarNoEncontrado(await como(ARMADOR, 'get', `/paralelos-gestion/${ID_INEXISTENTE}/cobertura-docente`));
  });

  it('plan habilitado: lista sus paralelos en gestión (200) o 404 si no existe', async () => {
    const ok = await como(ARMADOR, 'get', '/gestiones-planes/1/paralelos-gestion');
    expect(ok.status).toBe(200);
    expect(ok.body.data.paralelosGestion.length).toBeGreaterThan(0);
    esperarNoEncontrado(await como(ARMADOR, 'get', `/gestiones-planes/${ID_INEXISTENTE}/paralelos-gestion`));
  });
});

describe('Horarios · grilla semanal y conflictos', () => {
  it('la grilla del paralelo agrupa los bloques por día', async () => {
    const res = await como(ARMADOR, 'get', `/paralelos-gestion/${bloque.paraleloGestionId}/grilla-horario`);
    expect(res.status).toBe(200);
    expect(res.body.data.paralelo_gestion_id).toBe(bloque.paraleloGestionId);
    const dias = Object.keys(res.body.data.grilla);
    expect(dias.length).toBeGreaterThan(0);
    const [primero] = res.body.data.grilla[dias[0]];
    expect(primero).toEqual(
      expect.objectContaining({
        asignacion_horario_id: expect.any(Number),
        horario_id: expect.any(Number),
        asignacion_docente_id: expect.any(Number),
      })
    );
    esperarNoEncontrado(await como(ARMADOR, 'get', `/paralelos-gestion/${ID_INEXISTENTE}/grilla-horario`));
  });

  it('conflictos del paralelo y de la gestión: estructura y 404', async () => {
    const paralelo = await como(ARMADOR, 'get', `/paralelos-gestion/${bloque.paraleloGestionId}/conflictos`);
    expect(paralelo.status).toBe(200);
    expect(paralelo.body.data.conflictos).toEqual(expect.any(Array));
    const gestion = await como(ARMADOR, 'get', '/gestiones/1/conflictos');
    expect(gestion.status).toBe(200);
    expect(gestion.body.data.conflictos).toEqual(expect.any(Array));
    esperarNoEncontrado(await como(ARMADOR, 'get', `/paralelos-gestion/${ID_INEXISTENTE}/conflictos`));
    esperarNoEncontrado(await como(ARMADOR, 'get', `/gestiones/${ID_INEXISTENTE}/conflictos`));
  });

  it('validar conflicto: choca consigo mismo salvo que se excluya el bloque', async () => {
    const choca = await enviarComo(ARMADOR, 'post', '/conflictos/validar', {
      asignacion_docente_id: bloque.asignacionDocenteId,
      horario_id: bloque.horarioId,
    });
    expect(choca.status).toBe(200);
    expect(choca.body.data.valido).toBe(false);
    expect(choca.body.data.conflictos.length).toBeGreaterThan(0);

    const excluido = await enviarComo(ARMADOR, 'post', '/conflictos/validar', {
      asignacion_docente_id: bloque.asignacionDocenteId,
      horario_id: bloque.horarioId,
      asignacion_horario_id: bloque.id,
    });
    expect(excluido.status).toBe(200);
    expect(excluido.body.data.valido).toBe(true);
    expect(excluido.body.data.conflictos).toEqual([]);

    const noVigente = await enviarComo(ARMADOR, 'post', '/conflictos/validar', {
      asignacion_docente_id: ID_INEXISTENTE,
      horario_id: bloque.horarioId,
    });
    expect(noVigente.status).toBe(200);
    expect(noVigente.body.data.valido).toBe(false);
  });

  it('validar conflicto exige asignación y horario', async () => {
    esperarValidacion(await enviarComo(ARMADOR, 'post', '/conflictos/validar', {}));
    esperarValidacion(
      await enviarComo(ARMADOR, 'post', '/conflictos/validar', { asignacion_docente_id: bloque.asignacionDocenteId })
    );
  });

  it('grilla de conflictos del docente: exige gestion_id (422), 404 si no existe y 200 con datos', async () => {
    const base = `/horarios/docentes/${bloque.docenteId}/grilla-conflictos`;
    const sinGestion = await como(ARMADOR, 'get', base);
    expect(sinGestion.status).toBe(422);
    expect(sinGestion.body.error.code).toBe('VALIDATION_ERROR');
    expect((await como(ARMADOR, 'get', `${base}?gestion_id=abc`)).status).toBe(422);

    const ok = await como(ARMADOR, 'get', `${base}?gestion_id=1`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.grilla_conflictos.docenteId).toBe(bloque.docenteId);
    expect(ok.body.data.grilla_conflictos.courseSchedules.length).toBeGreaterThan(0);

    esperarNoEncontrado(await como(ARMADOR, 'get', `/horarios/docentes/${ID_INEXISTENTE}/grilla-conflictos?gestion_id=1`));
  });

  it('el docente solo ve su propia grilla de conflictos', async () => {
    const [propio] = await sequelize.query("SELECT id FROM docentes WHERE ci = 'TEST-DOC-001'", {
      type: sequelize.QueryTypes.SELECT,
    });
    const propia = await como('DOCENTE', 'get', `/horarios/docentes/${propio.id}/grilla-conflictos?gestion_id=1`);
    expect(propia.status).toBe(200);
    expect(propia.body.data.grilla_conflictos.docenteId).toBe(propio.id);

    const ajena = await como('DOCENTE', 'get', `/horarios/docentes/${bloque.docenteId}/grilla-conflictos?gestion_id=1`);
    expect(ajena.status).toBe(403);
    expect(ajena.body.error.code).toBe('FORBIDDEN');
  });
});

describe('Horarios · carga docente y asignaciones', () => {
  it('carga docente de la gestión: totales coherentes (DIR_ADMIN también la ve)', async () => {
    for (const rol of [ARMADOR, 'DIR_ADMIN']) {
      const res = await como(rol, 'get', '/gestiones/1/carga-docentes');
      expect(res.status).toBe(200);
      const { totales, docentes } = res.body.data.carga_docentes;
      expect(totales.docentes_activos).toBeGreaterThan(0);
      expect(docentes.length).toBeGreaterThan(0);
      expect(totales.cobertura).toBeGreaterThanOrEqual(0);
      expect(totales.cobertura).toBeLessThanOrEqual(100);
    }
  });

  it('asignaciones docentes: listado, detalle por id y 404', async () => {
    const lista = await como(ARMADOR, 'get', '/asignaciones-docentes?page=1&limit=2');
    expect(lista.status).toBe(200);
    expect(lista.body.data.asignaciones.length).toBeGreaterThan(0);
    const detalle = await como(ARMADOR, 'get', `/asignaciones-docentes/${bloque.asignacionDocenteId}`);
    expect(detalle.status).toBe(200);
    expect(detalle.body.data.asignacion.id).toBe(bloque.asignacionDocenteId);
    expect(detalle.body.data.asignacion.docente_id).toBe(bloque.docenteId);
    esperarNoEncontrado(await como(ARMADOR, 'get', `/asignaciones-docentes/${ID_INEXISTENTE}`));
  });

  it('bloques horarios de un curso de la oferta (cursoId = oferta_curso_id)', async () => {
    const [{ ofertaCursoId }] = await sequelize.query(
      'SELECT oferta_curso_id AS ofertaCursoId FROM asignaciones_docentes WHERE id = :id',
      { replacements: { id: bloque.asignacionDocenteId }, type: sequelize.QueryTypes.SELECT }
    );
    const res = await como(ARMADOR, 'get', `/docentes/cursos/${ofertaCursoId}/horarios`);
    expect(res.status).toBe(200);
    expect(res.body.data.bloques.length).toBeGreaterThan(0);
    expect(res.body.data.bloques[0].cursoId).toBe(ofertaCursoId);
    esperarNoEncontrado(await como(ARMADOR, 'get', `/docentes/cursos/${ID_INEXISTENTE}/horarios`));
  });
});

describe('Horarios · escrituras (validación y reglas, sin alterar el horario sembrado)', () => {
  it.each([
    ['sin cuerpo', {}],
    ['asignación no numérica', { asignacion_docente_id: 'x', horario_id: 1 }],
  ])('crear bloque rechaza %s', async (_caso, cuerpo) => {
    esperarValidacion(await enviarComo(ARMADOR, 'post', '/asignacion-horarios', cuerpo));
  });

  it('crear bloque: asignación inexistente 404 y paralelo PUBLICADO 400', async () => {
    esperarNoEncontrado(
      await enviarComo(ARMADOR, 'post', '/asignacion-horarios', { asignacion_docente_id: ID_INEXISTENTE, horario_id: 1 })
    );
    const publicado = await enviarComo(ARMADOR, 'post', '/asignacion-horarios', {
      asignacion_docente_id: bloque.asignacionDocenteId,
      horario_id: bloque.horarioId,
    });
    esperarValidacion(publicado);
    expect(publicado.body.error.message).toContain('PUBLICADO');
  });

  it('editar y eliminar bloques: ids inválidos o inexistentes', async () => {
    esperarValidacion(await enviarComo(ARMADOR, 'put', '/asignacion-horarios/abc', {}), 'id');
    esperarNoEncontrado(await enviarComo(ARMADOR, 'put', `/asignacion-horarios/${ID_INEXISTENTE}`, { horario_id: 1 }));
    esperarNoEncontrado(await como(ARMADOR, 'delete', `/asignacion-horarios/${ID_INEXISTENTE}`));
    esperarValidacion(await enviarComo(ARMADOR, 'post', '/asignacion-horarios/bulk', {}));
    esperarValidacion(await enviarComo(ARMADOR, 'post', '/asignacion-horarios/bulk', { items: [] }));
  });

  it('paralelo en gestión: turno/estado inválidos (400) y paralelo inexistente (404)', async () => {
    esperarValidacion(
      await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${bloque.paraleloGestionId}/cambiar-turno`, {}),
      'turno'
    );
    esperarValidacion(
      await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${bloque.paraleloGestionId}/estado`, {}),
      'estado'
    );
    esperarValidacion(
      await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${ID_INEXISTENTE}/cambiar-turno-con-bloques`, {}),
      'turno'
    );
    esperarNoEncontrado(await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${ID_INEXISTENTE}/estado`, { estado: 'PUBLICADO' }));
    esperarNoEncontrado(await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${ID_INEXISTENTE}/publicar`));
    esperarNoEncontrado(await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${ID_INEXISTENTE}/generar-oferta`));
  });
});

describe('Horarios · permisos por rol (matriz)', () => {
  it('DIR_ADMIN ve la oferta pero no la grilla, ni arma ni publica', async () => {
    const id = bloque.paraleloGestionId;
    expect((await como('DIR_ADMIN', 'get', `/paralelos-gestion/${id}/oferta-cursos`)).status).toBe(200);
    esperarDenegado(await como('DIR_ADMIN', 'get', `/paralelos-gestion/${id}/grilla-horario`), 'institucional.horario.armado', 'LISTAR');
    esperarDenegado(await como('DIR_ADMIN', 'delete', `/asignacion-horarios/${bloque.id}`), 'institucional.horario.armado', 'EDITAR');
    esperarDenegado(await como('DIR_ADMIN', 'post', `/paralelos-gestion/${id}/publicar`), 'institucional.horario.publicacion', 'EDITAR');
  });

  it('SEC_ACADEMICA no ve el detalle del paralelo en gestión', async () => {
    esperarDenegado(
      await como('SEC_ACADEMICA', 'get', `/paralelos-gestion/${bloque.paraleloGestionId}`),
      'institucional.oferta.paralelo-gestion',
      'DETALLE'
    );
  });

  it('DOCENTE ve conflictos pero no arma: grilla, bloques y validación dan 403', async () => {
    const id = bloque.paraleloGestionId;
    expect((await como('DOCENTE', 'get', `/paralelos-gestion/${id}/conflictos`)).status).toBe(200);
    esperarDenegado(await como('DOCENTE', 'get', `/paralelos-gestion/${id}/grilla-horario`), 'institucional.horario.armado', 'LISTAR');
    esperarDenegado(
      await enviarComo('DOCENTE', 'post', '/asignacion-horarios', { asignacion_docente_id: 1, horario_id: 1 }),
      'institucional.horario.armado',
      'EDITAR'
    );
    esperarDenegado(
      await enviarComo('DOCENTE', 'post', '/conflictos/validar', { asignacion_docente_id: 1, horario_id: 1 }),
      'institucional.horario.armado',
      'EDITAR'
    );
  });

  it('ESTUDIANTE no accede a grilla ni a conflictos de docentes', async () => {
    esperarDenegado(
      await como('ESTUDIANTE', 'get', `/paralelos-gestion/${bloque.paraleloGestionId}/grilla-horario`),
      'institucional.horario.armado',
      'LISTAR'
    );
    esperarDenegado(
      await como('ESTUDIANTE', 'get', `/horarios/docentes/${bloque.docenteId}/grilla-conflictos?gestion_id=1`),
      'institucional.horario.conflictos',
      'LISTAR'
    );
  });
});
