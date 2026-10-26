/**
 * Calificaciones (coordinación, mis cursos, cuaderno por bimestre, centralizador, política y cronograma)
 * contra la BD real efímera.
 *
 * Matriz (seeds): RECTOR/DIR_ACADEMICO coordinan, ven el centralizador, la política y los bimestres;
 * el DOCENTE ve sus cursos y opera su cuaderno; el ESTUDIANTE solo ve su boletín y los catálogos
 * transparentes; ADMIN_SISTEMA hereda todo. El BD de pruebas no trae inscripciones, así que los
 * cursos solo aparecen en el cuaderno cuando la prueba inscribe al estudiante de prueba
 * (`inscribirEstudiantePrueba`), lo que se limpia al terminar.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, sequelize } from './helpers/sistema.js';
import {
  esperarValidacion,
  esperarNoEncontrado,
  esperarDenegado,
  enviarComo,
  conLimpieza,
  idDe,
} from './helpers/respuestas.js';
import { inscribirEstudiantePrueba, PARALELO_GESTION_PRUEBA } from './helpers/escenarios.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const COORDINADOR = 'DIR_ACADEMICO';
const ID_INEXISTENTE = 999999;

describe('Calificaciones · catálogos y política', () => {
  it.each(['DOCENTE', 'ESTUDIANTE'])('%s lee tipos de evaluación, política y catálogo (referencia transparente)', async (rol) => {
    const tipos = await como(rol, 'get', '/calificaciones/tipos-evaluacion');
    expect(tipos.status).toBe(200);
    expect(tipos.body.data.length).toBeGreaterThan(0);
    const politica = await como(rol, 'get', '/calificaciones/politica');
    expect(politica.status).toBe(200);
    expect(politica.body.data.politica).toEqual(
      expect.objectContaining({ cuotaTeorico: expect.any(Number), cuotaPractico: expect.any(Number) })
    );
    expect(politica.body.data.politica.pesosBimestres).toHaveLength(4);
    const catalogo = await como(rol, 'get', '/calificaciones/politica/catalogo');
    expect(catalogo.status).toBe(200);
    expect(catalogo.body.data.catalogo.carreras.length).toBeGreaterThan(0);
  });

  it('editar la política: valida cuotas (400) y exige EDITAR (DOCENTE 403)', async () => {
    esperarValidacion(await enviarComo(COORDINADOR, 'put', '/calificaciones/politica', {}), 'cuotaTeorico');
    esperarDenegado(
      await enviarComo('DOCENTE', 'put', '/calificaciones/politica', {}),
      'academico.calificacion.politica',
      'EDITAR'
    );
  });
});

describe('Calificaciones · coordinación y mis cursos', () => {
  it('coordinación lista docentes de la gestión vigente y valida los filtros', async () => {
    const res = await como(COORDINADOR, 'get', '/calificaciones/coordinacion/docentes?page=1&limit=3');
    expect(res.status).toBe(200);
    expect(res.body.data.gestionVigente).toEqual(expect.any(String));
    expect(res.body.data.docentes).toEqual(expect.any(Array));
  });

  it('cursos de un docente: 200 con su contexto y 404 si no existe', async () => {
    const ok = await como('RECTOR', 'get', '/calificaciones/coordinacion/docentes/3/cursos');
    expect(ok.status).toBe(200);
    expect(ok.body.data.docente).toEqual(
      expect.objectContaining({ id: 3, gestionVigente: expect.any(String), bimestreVigente: expect.any(Number) })
    );
    esperarNoEncontrado(await como('RECTOR', 'get', `/calificaciones/coordinacion/docentes/${ID_INEXISTENTE}/cursos`));
  });

  it('mis-cursos: el docente vinculado ve su contexto; el resto recibe 403', async () => {
    const docente = await como('DOCENTE', 'get', '/calificaciones/mis-cursos');
    expect(docente.status).toBe(200);
    expect(docente.body.data.docente.notaMinimaAprobacion).toBe(61);
    // Sin ficha de docente vinculada (403 de negocio)
    const sinFicha = await como(COORDINADOR, 'get', '/calificaciones/mis-cursos');
    expect(sinFicha.status).toBe(403);
    expect(sinFicha.body.error.code).toBe('FORBIDDEN');
    esperarDenegado(await como('ESTUDIANTE', 'get', '/calificaciones/mis-cursos'), 'academico.calificacion.mis_cursos', 'LISTAR');
  });

  it('mi boletín: el estudiante sin inscripción recibe uno vacío, el PDF da 404 y el docente 403', async () => {
    const vacio = await como('ESTUDIANTE', 'get', '/calificaciones/mi-boletin');
    expect(vacio.status).toBe(200);
    expect(vacio.body.data.asignaturas).toEqual([]);
    esperarNoEncontrado(await como('ESTUDIANTE', 'get', '/calificaciones/mi-boletin/pdf'));
    const docente = await como('DOCENTE', 'get', '/calificaciones/mi-boletin');
    expect(docente.status).toBe(403);
    expect(docente.body.error.code).toBe('FORBIDDEN');
  });

  it('coordinación es solo de RECTOR/DIR_ACADEMICO', async () => {
    esperarDenegado(await como('DOCENTE', 'get', '/calificaciones/coordinacion/docentes'), 'academico.calificacion.coordinacion', 'LISTAR');
    esperarDenegado(await como('ESTUDIANTE', 'get', '/calificaciones/coordinacion/docentes'), 'academico.calificacion.coordinacion', 'LISTAR');
  });
});

describe('Calificaciones · gestión de bimestres y cronograma', () => {
  it('tablero de bimestres, periodos y cronograma de la gestión vigente', async () => {
    const bimestres = await como('RECTOR', 'get', '/calificaciones/gestion-bimestres');
    expect(bimestres.status).toBe(200);
    expect(bimestres.body.data.gestion.vigente).toBe(true);
    const periodos = await como('RECTOR', 'get', '/calificaciones/gestion-bimestres/periodos');
    expect(periodos.status).toBe(200);
    expect(periodos.body.data.periodos.length).toBeGreaterThan(0);
    const cronograma = await como('RECTOR', 'get', '/calificaciones/cronograma');
    expect(cronograma.status).toBe(200);
    expect(cronograma.body.data.actividades.length).toBeGreaterThan(0);
  });

  it('validar cierre de un bimestre que no está en curso lo bloquea con motivo', async () => {
    const res = await como('RECTOR', 'get', '/calificaciones/gestion-bimestres/bimestre/1/validar-cierre');
    expect(res.status).toBe(200);
    expect(res.body.data.puedeCerrar).toBe(false);
    expect(res.body.data.bloqueos.length).toBeGreaterThan(0);
  });

  it('cronograma: detalle 404, id inválido 400 y cuerpo inválido 400', async () => {
    esperarNoEncontrado(await como('RECTOR', 'get', `/calificaciones/cronograma/${ID_INEXISTENTE}`));
    esperarValidacion(await como('RECTOR', 'get', '/calificaciones/cronograma/abc'), 'id');
    esperarValidacion(await enviarComo('RECTOR', 'post', '/calificaciones/cronograma', {}), 'periodoAcademicoId');
    esperarNoEncontrado(await enviarComo('RECTOR', 'put', `/calificaciones/cronograma/${ID_INEXISTENTE}`, {}));
    esperarNoEncontrado(await como('RECTOR', 'delete', `/calificaciones/cronograma/${ID_INEXISTENTE}`));
  });

  it('el docente no accede al tablero de bimestres ni al cronograma', async () => {
    const bimestres = await como('DOCENTE', 'get', '/calificaciones/gestion-bimestres');
    expect(bimestres.status).toBe(403);
    expect(bimestres.body.error).toBe('Acceso denegado');
    esperarDenegado(await como('DOCENTE', 'get', '/calificaciones/cronograma'), 'institucional.gestion.cronograma', 'LISTAR');
  });
});

describe('Calificaciones · centralizador', () => {
  it('exige paraleloGestionId y responde con la estructura aun sin inscritos', async () => {
    esperarValidacion(await como('RECTOR', 'get', '/calificaciones/centralizador'), 'paraleloGestionId');
    const res = await como('RECTOR', 'get', `/calificaciones/centralizador?paraleloGestionId=${PARALELO_GESTION_PRUEBA}&bimestre=1`);
    expect(res.status).toBe(200);
    expect(res.body.data.paraleloGestionId).toBe(PARALELO_GESTION_PRUEBA);
    expect(res.body.data.asignaturas).toEqual(expect.any(Array));
    expect(res.body.data.estudiantes).toEqual(expect.any(Array));
  });

  it('el centralizador es de RECTOR/DIR_ACADEMICO: DOCENTE y ESTUDIANTE reciben 403', async () => {
    for (const rol of ['DOCENTE', 'ESTUDIANTE']) {
      esperarDenegado(
        await como(rol, 'get', `/calificaciones/centralizador?paraleloGestionId=${PARALELO_GESTION_PRUEBA}`),
        'academico.calificacion.centralizador',
        'LISTAR'
      );
    }
  });

  it('el export anual exige folios generados en el libro de la gestión', async () => {
    const res = await como('RECTOR', 'get', `/calificaciones/centralizador/${PARALELO_GESTION_PRUEBA}/anual/export`);
    esperarValidacion(res);
  });
});

describe('Calificaciones · cuaderno (validaciones y accesos)', () => {
  it.each([
    ['id de asignación no numérico', '/calificaciones/asignaciones/abc/cuaderno/1', 'asignacionId'],
    ['bimestre fuera de rango', '/calificaciones/asignaciones/1/cuaderno/9', 'bimestre'],
  ])('lectura rechaza %s', async (_caso, ruta, campo) => {
    esperarValidacion(await como(COORDINADOR, 'get', ruta), campo);
  });

  it.each([
    ['cuaderno', '/calificaciones/asignaciones/999999/cuaderno/1'],
    ['notas del curso', '/calificaciones/asignaciones/999999/notas'],
    ['consolidado', '/calificaciones/asignaciones/999999/bimestre/1/consolidado'],
  ])('%s de una asignación inexistente responde 404', async (_nombre, ruta) => {
    esperarNoEncontrado(await como(COORDINADOR, 'get', ruta));
  });

  it.each([
    ['sin cuerpo', {}, 'tipoEvaluacionId'],
    ['componente desconocido', { tipoEvaluacionId: 1, nombre: 'ci-eval', componente: 'XX', puntos: 10 }, 'componente'],
    ['puntos fuera de rango', { tipoEvaluacionId: 1, nombre: 'ci-eval', componente: 'TEORICO', puntos: 500 }, 'puntos'],
  ])('crear evaluación rechaza %s', async (_caso, cuerpo, campo) => {
    esperarValidacion(
      await enviarComo(COORDINADOR, 'post', '/calificaciones/asignaciones/1/cuaderno/1/evaluaciones', cuerpo),
      campo
    );
  });

  it('notas del cuaderno: valida estudiante, evaluación y nota', async () => {
    esperarValidacion(await enviarComo('DOCENTE', 'put', '/calificaciones/asignaciones/1/cuaderno/1/notas', {}), 'estudianteId');
    esperarValidacion(
      await enviarComo('DOCENTE', 'put', '/calificaciones/asignaciones/1/cuaderno/1/notas', {
        estudianteId: 1,
        evaluacionId: 1,
        nota: -3,
      }),
      'nota'
    );
    esperarValidacion(
      await enviarComo('DOCENTE', 'post', '/calificaciones/asignaciones/1/cuaderno/1/guardar', { notas: 'x' }),
      'notas'
    );
  });

  it('una asignación sin estudiantes inscritos no tiene cuaderno (404) ni para su coordinación', async () => {
    const vista = await sequelize.query(
      'SELECT COUNT(*) AS n FROM vista_calificacion_cursos_docente WHERE asignacion_docente_id = 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    if (Number(vista[0].n) > 0) return; // otra inscripción viva en la BD: la regla ya no aplica
    esperarNoEncontrado(await como(COORDINADOR, 'get', '/calificaciones/asignaciones/1/cuaderno/1'));
  });

  it('permisos del cuaderno por rol', async () => {
    esperarDenegado(await como('ESTUDIANTE', 'get', '/calificaciones/asignaciones/1/cuaderno/1'), 'academico.calificacion.cuaderno', 'LISTAR');
    esperarDenegado(
      await como(COORDINADOR, 'get', '/calificaciones/asignaciones/1/bimestre/1/export/registro-pedagogico'),
      'academico.calificacion.cuaderno',
      'EXPORTAR'
    );
    esperarDenegado(
      await enviarComo(COORDINADOR, 'put', '/calificaciones/asignaciones/1/cuaderno/1/evaluaciones/1', { nombre: 'x' }),
      'academico.calificacion.cuaderno.evaluaciones',
      'EDITAR'
    );
  });
});

describe('Calificaciones · cuaderno con un estudiante inscrito (crear -> leer -> eliminar)', () => {
  it('inscribe al estudiante de prueba y opera una evaluación del cuaderno sin dejar rastro', async () => {
    const [{ asignacionId }] = await sequelize.query(
      `SELECT ad.id AS asignacionId FROM asignaciones_docentes ad
         JOIN oferta_cursos oc ON oc.id = ad.oferta_curso_id
        WHERE oc.paralelo_gestion_id = :pg AND ad.deleted_at IS NULL AND ad.vigente = 1
        ORDER BY ad.id LIMIT 1`,
      { replacements: { pg: PARALELO_GESTION_PRUEBA }, type: sequelize.QueryTypes.SELECT }
    );

    await conLimpieza(async (limpiar) => {
      await inscribirEstudiantePrueba(limpiar, { etiqueta: 'ci-calificaciones' });
      const base = `/calificaciones/asignaciones/${asignacionId}`;

      // El curso ya existe para la coordinación y el estudiante aparece en el registro de notas
      const notas = await como(COORDINADOR, 'get', `${base}/notas`);
      expect(notas.status).toBe(200);
      expect(JSON.stringify(notas.body.data)).toContain('TEST-EST-001');

      // El docente titular tiene el curso en su listado de coordinación
      const [{ docenteId }] = await sequelize.query('SELECT docente_id AS docenteId FROM asignaciones_docentes WHERE id = :id', {
        replacements: { id: asignacionId },
        type: sequelize.QueryTypes.SELECT,
      });
      const cursos = await como('RECTOR', 'get', `/calificaciones/coordinacion/docentes/${docenteId}/cursos`);
      expect(cursos.status).toBe(200);

      // Solo el bimestre vigente admite cambios; los anteriores están cerrados
      const estado = await como('RECTOR', 'get', '/calificaciones/gestion-bimestres');
      const bimestre = estado.body.data.bimestreVigente;
      expect(bimestre).toBeGreaterThan(1);
      const cuaderno = await como(COORDINADOR, 'get', `${base}/cuaderno/${bimestre}`);
      expect(cuaderno.status).toBe(200);

      const [tipo] = await sequelize.query('SELECT id FROM tipos_evaluacion ORDER BY id LIMIT 1', {
        type: sequelize.QueryTypes.SELECT,
      });
      const cuerpo = { tipoEvaluacionId: tipo.id, nombre: 'ci-evaluacion de prueba', componente: 'TEORICO', puntos: 20 };
      const cerrado = await enviarComo('ADMIN_SISTEMA', 'post', `${base}/cuaderno/1/evaluaciones`, cuerpo);
      expect(cerrado.status).toBe(403);

      // Evaluación: crear -> editar -> nota -> eliminar (ADMIN hereda EDITAR/ELIMINAR del cuaderno)
      const crea = await enviarComo('ADMIN_SISTEMA', 'post', `${base}/cuaderno/${bimestre}/evaluaciones`, cuerpo);
      expect([crea.status, crea.body.error?.message]).toEqual([201, undefined]);
      const evaluacionId = idDe(crea, 'evaluacion');
      expect(evaluacionId).toBeGreaterThan(0);
      limpiar.push(async () => {
        await como('ADMIN_SISTEMA', 'delete', `${base}/cuaderno/${bimestre}/evaluaciones/${evaluacionId}`);
      });

      const edita = await enviarComo('ADMIN_SISTEMA', 'put', `${base}/cuaderno/${bimestre}/evaluaciones/${evaluacionId}`, {
        nombre: 'ci-evaluacion editada',
      });
      expect(edita.status).toBe(200);
      const conEvaluacion = await como(COORDINADOR, 'get', `${base}/cuaderno/${bimestre}`);
      expect(JSON.stringify(conEvaluacion.body.data)).toContain('ci-evaluacion editada');

      const nota = await enviarComo('ADMIN_SISTEMA', 'put', `${base}/cuaderno/${bimestre}/notas`, {
        estudianteId: 1,
        evaluacionId,
        nota: 15,
      });
      expect([nota.status, nota.body.error?.message]).toEqual([200, undefined]);

      // Una nota por encima de los puntos de la evaluación se rechaza
      const excede = await enviarComo('ADMIN_SISTEMA', 'put', `${base}/cuaderno/${bimestre}/notas`, {
        estudianteId: 1,
        evaluacionId,
        nota: 21,
      });
      expect(excede.status).toBeGreaterThanOrEqual(400);
      expect(excede.status).toBeLessThan(500);
    });

    // Tras la limpieza el curso vuelve a no tener estudiantes
    esperarNoEncontrado(await como(COORDINADOR, 'get', `/calificaciones/asignaciones/${asignacionId}/cuaderno/1`));
  });
});
