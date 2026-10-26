/**
 * Titulación (proyectos de grado, bitácora, avances, actas de defensa) contra la BD real efímera.
 *
 * La BD de pruebas no trae proyectos ni inscripciones vigentes, por lo que el detalle se prueba con
 * ids inexistentes (404) y las escrituras con payload inválido (400) o referencias inexistentes (404);
 * no se crea ningún proyecto. Roles según la matriz: DIR_ACADEMICO/RECTOR/ADMIN gestionan; SEC_ACADEMICA
 * crea y lista; DOCENTE lista (sin crear/eliminar); ESTUDIANTE solo ve su propio proyecto (DETALLE).
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como } from './helpers/sistema.js';
import {
  esperarValidacion,
  esperarNoEncontrado,
  esperarDenegado,
  esperarListadoPaginado,
  enviarComo,
} from './helpers/respuestas.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const GESTOR = 'DIR_ACADEMICO';
const ID_INEXISTENTE = 999999;
const BASE = '/proyectos-grado';

describe('Titulación · listado y catálogos', () => {
  it('listado paginado respeta page/limit y devuelve la meta', async () => {
    esperarListadoPaginado(await como(GESTOR, 'get', `${BASE}?page=1&limit=5`), { page: 1, limit: 5 });
    const porDefecto = await como(GESTOR, 'get', BASE);
    esperarListadoPaginado(porDefecto);
    expect(porDefecto.body.pagination.limit).toBeGreaterThan(0);
  });

  it('un filtro sin coincidencias devuelve una página vacía', async () => {
    const res = await como(GESTOR, 'get', `${BASE}?search=zzzzzz-ci-sin-resultados`);
    esperarListadoPaginado(res);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it.each([
    ['page = 0', '?page=0', 'page'],
    ['limit = 0', '?limit=0', 'limit'],
    ['search de 1 carácter', '?search=a', 'search'],
    ['estado fuera del catálogo', '?estado=XX', 'estado'],
    ['gestionId no numérico', '?gestionId=abc', 'gestionId'],
    ['carreraId = 0', '?carreraId=0', 'carreraId'],
  ])('listado rechaza %s', async (_caso, query, campo) => {
    esperarValidacion(await como(GESTOR, 'get', `${BASE}${query}`), campo);
  });

  it('catálogo de modalidades sembrado (seed 57)', async () => {
    const res = await como(GESTOR, 'get', `${BASE}/modalidades`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toEqual(
      expect.objectContaining({ id: expect.any(Number), codigo: expect.any(String), nombre: expect.any(String) })
    );
    expect(res.body.data.map((m) => m.codigo)).toContain('PSP');
  });

  it('estudiantes elegibles y reportes responden con su contrato', async () => {
    esperarListadoPaginado(await como(GESTOR, 'get', `${BASE}/estudiantes-elegibles`));
    const avance = await como(GESTOR, 'get', `${BASE}/reportes/avance-carrera`);
    expect(avance.status).toBe(200);
    expect(avance.body.data.avanceTutoriaCarrera).toEqual(
      expect.objectContaining({ resumenPorCarrera: expect.any(Array), detalle: expect.any(Array) })
    );
    const seguimiento = await como(GESTOR, 'get', `${BASE}/reportes/seguimiento-tutoria-docentes`);
    expect(seguimiento.status).toBe(200);
    expect(seguimiento.body.data.seguimientoTutoriaDocentes.docentes).toEqual(expect.any(Array));
  });

  it('reportes validan sus filtros', async () => {
    esperarValidacion(await como(GESTOR, 'get', `${BASE}/reportes/seguimiento-tutoria-docentes?mes=13`), 'mes');
    esperarValidacion(await como(GESTOR, 'get', `${BASE}/reportes/seguimiento-tutoria-docentes?anio=1999`), 'anio');
    esperarValidacion(await como(GESTOR, 'get', `${BASE}/reportes/bitacora-mensual`), 'mes');
    esperarValidacion(await como(GESTOR, 'get', `${BASE}/reportes/bitacora-mensual?mes=2026-1`), 'mes');
  });

  it('el reporte de avance por carrera exporta un PDF real', async () => {
    const res = await como('RECTOR', 'get', `${BASE}/reportes/avance-carrera/pdf`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  it('autoservicio: el estudiante no tiene proyecto y el tutor no tiene tutorados', async () => {
    const mi = await como('ESTUDIANTE', 'get', `${BASE}/mi-proyecto`);
    expect(mi.status).toBe(200);
    expect(mi.body.data.proyectoGrado).toBeNull();
    const tutorados = await como('DOCENTE', 'get', `${BASE}/mis-tutorados`);
    expect(tutorados.status).toBe(200);
    expect(tutorados.body.data.misTutorados).toEqual([]);
    expect(tutorados.body.data.total).toBe(0);
  });

  it('mis-tutorados exige estar vinculado a un docente (403 de negocio, no de permisos)', async () => {
    const res = await como(GESTOR, 'get', `${BASE}/mis-tutorados`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('Titulación · detalle por id y sub-recursos (404 / 400)', () => {
  it.each([
    ['ficha', ''],
    ['bitácora', '/bitacora'],
    ['avances', '/avances'],
    ['dictámenes', '/dictamenes'],
    ['actas de defensa', '/acta-defensa'],
  ])('%s de un proyecto inexistente responde 404', async (_nombre, sufijo) => {
    esperarNoEncontrado(await como(GESTOR, 'get', `${BASE}/${ID_INEXISTENTE}${sufijo}`));
  });

  it('PDF de un acta inexistente responde 404', async () => {
    esperarNoEncontrado(await como(GESTOR, 'get', `${BASE}/${ID_INEXISTENTE}/acta-defensa/1/pdf`));
  });

  it.each(['abc', '0', '-3'])('id inválido "%s" responde 400', async (id) => {
    esperarValidacion(await como(GESTOR, 'get', `${BASE}/${id}`), 'id');
  });

  it('el estudiante (solo DETALLE) obtiene 404 sobre un proyecto que no existe', async () => {
    esperarNoEncontrado(await como('ESTUDIANTE', 'get', `${BASE}/${ID_INEXISTENTE}`));
  });
});

describe('Titulación · escrituras (validación y referencias inexistentes, sin crear datos)', () => {
  it.each([
    ['sin cuerpo', {}, 'titulo'],
    ['título demasiado corto', { titulo: 'ab', modalidadId: 1, estudianteIds: [1] }, 'titulo'],
    ['sin estudiantes', { titulo: 'ci-proyecto de prueba', modalidadId: 1, estudianteIds: [] }, 'estudianteIds'],
    ['estudiante no numérico', { titulo: 'ci-proyecto de prueba', modalidadId: 1, estudianteIds: ['x'] }, 'estudianteIds[0]'],
    ['fecha de perfil inválida', { titulo: 'ci-proyecto de prueba', modalidadId: 1, estudianteIds: [1], fechaPresentacionPerfil: 'ayer' }, 'fechaPresentacionPerfil'],
  ])('crear proyecto rechaza %s', async (_caso, cuerpo, campo) => {
    esperarValidacion(await enviarComo(GESTOR, 'post', BASE, cuerpo), campo);
  });

  it('crear proyecto con modalidad inexistente responde 404 y sin inscripción vigente responde 400', async () => {
    esperarNoEncontrado(
      await enviarComo(GESTOR, 'post', BASE, {
        titulo: 'ci-proyecto de prueba',
        modalidadId: ID_INEXISTENTE,
        estudianteIds: [ID_INEXISTENTE],
      })
    );
    // El estudiante de prueba existe pero no tiene inscripción vigente: regla de negocio, nada se crea.
    const sinInscripcion = await enviarComo('SEC_ACADEMICA', 'post', BASE, {
      titulo: 'ci-proyecto de prueba',
      modalidadId: 1,
      estudianteIds: [1],
    });
    esperarValidacion(sinInscripcion);
    const listado = await como(GESTOR, 'get', `${BASE}?search=ci-proyecto de prueba`);
    expect(listado.body.data).toEqual([]);
  });

  it('actualizar valida notas y 404 si el proyecto no existe', async () => {
    esperarValidacion(await enviarComo(GESTOR, 'put', `${BASE}/${ID_INEXISTENTE}`, { notaFinal: 500 }), 'notaFinal');
    esperarValidacion(await enviarComo(GESTOR, 'put', `${BASE}/${ID_INEXISTENTE}`, { titulo: 'ab' }), 'titulo');
    esperarNoEncontrado(await enviarComo(GESTOR, 'put', `${BASE}/${ID_INEXISTENTE}`, { titulo: 'ci-titulo nuevo' }));
  });

  it('eliminar un proyecto inexistente responde 404', async () => {
    esperarNoEncontrado(await como(GESTOR, 'delete', `${BASE}/${ID_INEXISTENTE}`));
  });

  it('asignar tutor y transicionar validan el cuerpo y el proyecto', async () => {
    esperarValidacion(await enviarComo(GESTOR, 'post', `${BASE}/${ID_INEXISTENTE}/tutor`, {}), 'tutorId');
    esperarValidacion(
      await enviarComo(GESTOR, 'post', `${BASE}/${ID_INEXISTENTE}/transiciones`, { estado: 'XX' }),
      'estado'
    );
    esperarValidacion(
      await enviarComo(GESTOR, 'post', `${BASE}/${ID_INEXISTENTE}/transiciones`, { estado: 'PERFIL', nota: 101 }),
      'nota'
    );
    esperarNoEncontrado(
      await enviarComo(GESTOR, 'post', `${BASE}/${ID_INEXISTENTE}/transiciones`, { estado: 'PERFIL' })
    );
  });

  it('acta de defensa: exige fecha, hora, tribunal y calificaciones', async () => {
    const res = await enviarComo(GESTOR, 'post', `${BASE}/${ID_INEXISTENTE}/acta-defensa`, {});
    esperarValidacion(res, 'fechaDefensa');
    const campos = res.body.error.details.map((d) => d.field);
    expect(campos).toEqual(expect.arrayContaining(['horaInicio', 'tribunal', 'calificaciones']));

    esperarValidacion(
      await enviarComo(GESTOR, 'post', `${BASE}/${ID_INEXISTENTE}/acta-defensa`, {
        fechaDefensa: '2026-12-01',
        horaInicio: '25:00',
        tribunal: [{ docenteId: 1 }],
        calificaciones: [{ estudianteId: 1, calificacionFinal: 150 }],
      }),
      'horaInicio'
    );
  });

  it('anular acta exige motivo', async () => {
    esperarValidacion(
      await enviarComo(GESTOR, 'patch', `${BASE}/${ID_INEXISTENTE}/acta-defensa/1/anular`, {}),
      'motivo'
    );
  });

  it('integrantes y bitácora validan rol/estado/porcentaje', async () => {
    esperarValidacion(await enviarComo(GESTOR, 'post', `${BASE}/${ID_INEXISTENTE}/integrantes`, {}), 'estudianteId');
    esperarValidacion(
      await enviarComo(GESTOR, 'post', `${BASE}/${ID_INEXISTENTE}/bitacora`, { porcentajeAvance: 150 }),
      'porcentajeAvance'
    );
  });
});

describe('Titulación · permisos por rol (matriz)', () => {
  it('SEC_ACADEMICA lista y crea pero no aprueba (tutor, transiciones, acta) ni elimina', async () => {
    expect((await como('SEC_ACADEMICA', 'get', BASE)).status).toBe(200);
    esperarDenegado(
      await enviarComo('SEC_ACADEMICA', 'post', `${BASE}/${ID_INEXISTENTE}/tutor`, { tutorId: 1 }),
      'titulacion.proyecto',
      'APROBAR'
    );
    esperarDenegado(
      await enviarComo('SEC_ACADEMICA', 'post', `${BASE}/${ID_INEXISTENTE}/transiciones`, { estado: 'PERFIL' }),
      'titulacion.proyecto',
      'APROBAR'
    );
    esperarDenegado(await como('SEC_ACADEMICA', 'delete', `${BASE}/${ID_INEXISTENTE}`), 'titulacion.proyecto', 'ELIMINAR');
  });

  it('DOCENTE lista pero no crea, edita ni elimina', async () => {
    expect((await como('DOCENTE', 'get', BASE)).status).toBe(200);
    esperarDenegado(
      await enviarComo('DOCENTE', 'post', BASE, { titulo: 'ci-proyecto de prueba', modalidadId: 1, estudianteIds: [1] }),
      'titulacion.proyecto',
      'CREAR'
    );
    esperarDenegado(
      await enviarComo('DOCENTE', 'put', `${BASE}/${ID_INEXISTENTE}`, { titulo: 'ci-titulo nuevo' }),
      'titulacion.proyecto',
      'EDITAR'
    );
    esperarDenegado(await como('DOCENTE', 'delete', `${BASE}/${ID_INEXISTENTE}`), 'titulacion.proyecto', 'ELIMINAR');
  });

  it('ESTUDIANTE no lista proyectos ni catálogos del módulo', async () => {
    esperarDenegado(await como('ESTUDIANTE', 'get', BASE), 'titulacion.proyecto', 'LISTAR');
    esperarDenegado(await como('ESTUDIANTE', 'get', `${BASE}/modalidades`), 'titulacion.proyecto', 'LISTAR');
    esperarDenegado(await como('ESTUDIANTE', 'get', `${BASE}/estudiantes-elegibles`), 'titulacion.proyecto', 'LISTAR');
  });

  it.each(['SEC_ADMIN', 'DIR_ADMIN'])('%s no tiene acceso a Titulación', async (rol) => {
    esperarDenegado(await como(rol, 'get', BASE), 'titulacion.proyecto', 'LISTAR');
    esperarDenegado(await como(rol, 'get', `${BASE}/modalidades`), 'titulacion.proyecto', 'LISTAR');
  });
});
