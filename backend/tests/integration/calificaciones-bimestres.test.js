/**
 * Calificaciones · cierre y reapertura de bimestres por curso, con datos propios de la prueba.
 *
 * El estado institucional de la gestión vigente es del seed y NO se altera (bimestres 1 a 3 cerrados). Cada
 * prueba inscribe al estudiante de prueba en el paralelo 1 y opera el cierre/reapertura POR CURSO
 * (`/asignaciones/:id/bimestre/:n/reabrir|cerrar`), que es lo que habilita o bloquea escribir en el cuaderno
 * de un bimestre ya cerrado. Reabrir exige permiso administrativo (EDITAR de gestión de bimestres o de ajuste
 * admin) y una gestión vigente; el docente del curso no puede reabrir su propio bimestre.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, sequelize } from './helpers/sistema.js';
import { esperarValidacion, esperarNoEncontrado, enviarComo, conLimpieza, idDe } from './helpers/respuestas.js';
import { inscribirEstudiantePrueba, PARALELO_GESTION_PRUEBA } from './helpers/escenarios.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const ADMINISTRATIVOS = ['RECTOR', 'DIR_ACADEMICO'];
const BIMESTRE_CERRADO = 1;

async function asignacionDelParalelo() {
  const [{ asignacionId }] = await sequelize.query(
    `SELECT ad.id AS asignacionId FROM asignaciones_docentes ad
       JOIN oferta_cursos oc ON oc.id = ad.oferta_curso_id
      WHERE oc.paralelo_gestion_id = :pg AND ad.deleted_at IS NULL AND ad.vigente = 1
      ORDER BY ad.id LIMIT 1`,
    { replacements: { pg: PARALELO_GESTION_PRUEBA }, type: sequelize.QueryTypes.SELECT }
  );
  return asignacionId;
}

const reabrir = (rol, asignacionId, bimestre = BIMESTRE_CERRADO) =>
  enviarComo(rol, 'post', `/calificaciones/asignaciones/${asignacionId}/bimestre/${bimestre}/reabrir`);
const cerrar = (rol, asignacionId, bimestre = BIMESTRE_CERRADO) =>
  enviarComo(rol, 'post', `/calificaciones/asignaciones/${asignacionId}/bimestre/${bimestre}/cerrar`);

describe('Calificaciones · reabrir y cerrar el bimestre de un curso', () => {
  it('reabrir exige curso con estudiantes inscritos; sin ellos el curso no existe para la coordinación', async () => {
    const asignacionId = await asignacionDelParalelo();
    // Sin inscripciones vivas el curso no aparece (mismo criterio que el cuaderno)
    const [{ n }] = await sequelize.query(
      'SELECT COUNT(*) AS n FROM vista_calificacion_cursos_docente WHERE asignacion_docente_id = :id',
      { replacements: { id: asignacionId }, type: sequelize.QueryTypes.SELECT }
    );
    if (Number(n) > 0) return; // otra inscripción viva en la BD: la regla ya no aplica
    esperarNoEncontrado(await reabrir('RECTOR', asignacionId));
    esperarNoEncontrado(await cerrar('RECTOR', asignacionId));
  });

  it('valida el bimestre y la asignación', async () => {
    const asignacionId = await asignacionDelParalelo();
    esperarValidacion(await reabrir('RECTOR', asignacionId, 9), 'bimestre');
    esperarValidacion(await reabrir('RECTOR', asignacionId, 0), 'bimestre');
    esperarValidacion(await reabrir('RECTOR', 'abc'), 'asignacionId');
    esperarNoEncontrado(await reabrir('RECTOR', 999999));
  });

  it('solo el personal administrativo reabre; docente y estudiante reciben 403 y el bimestre sigue cerrado', async () => {
    await conLimpieza(async (limpiar) => {
      const asignacionId = await asignacionDelParalelo();
      await inscribirEstudiantePrueba(limpiar, { etiqueta: 'ci-bimestres-permisos' });

      for (const rol of ['DOCENTE', 'ESTUDIANTE']) {
        const res = await reabrir(rol, asignacionId);
        expect({ rol, status: res.status }).toEqual({ rol, status: 403 });
        expect(res.body.error).toBe('Acceso denegado');
      }
      // Sigue cerrado: crear una evaluación en el bimestre 1 se rechaza igual
      const [tipo] = await sequelize.query('SELECT id FROM tipos_evaluacion ORDER BY id LIMIT 1', {
        type: sequelize.QueryTypes.SELECT,
      });
      const sigueCerrado = await enviarComo(
        'ADMIN_SISTEMA',
        'post',
        `/calificaciones/asignaciones/${asignacionId}/cuaderno/${BIMESTRE_CERRADO}/evaluaciones`,
        { tipoEvaluacionId: tipo.id, nombre: 'ci-evaluacion', componente: 'TEORICO', puntos: 10 }
      );
      expect(sigueCerrado.status).toBe(403);
    });
  });

  it.each(ADMINISTRATIVOS)(
    '%s reabre el bimestre cerrado: la evaluación pasa de rechazada (403) a permitida y vuelve a rechazarse al cerrar',
    async (rol) => {
      await conLimpieza(async (limpiar) => {
        const asignacionId = await asignacionDelParalelo();
        await inscribirEstudiantePrueba(limpiar, { etiqueta: 'ci-bimestres' });
        const base = `/calificaciones/asignaciones/${asignacionId}/cuaderno/${BIMESTRE_CERRADO}`;
        const [tipo] = await sequelize.query('SELECT id FROM tipos_evaluacion ORDER BY id LIMIT 1', {
          type: sequelize.QueryTypes.SELECT,
        });
        const cuerpo = { tipoEvaluacionId: tipo.id, nombre: 'ci-evaluacion bimestre', componente: 'TEORICO', puntos: 20 };

        // Cerrado: no se crean evaluaciones
        const rechazada = await enviarComo('ADMIN_SISTEMA', 'post', `${base}/evaluaciones`, cuerpo);
        expect(rechazada.status).toBe(403);
        expect(rechazada.body.error.message).toContain('cerrado');

        // Reabrir (la limpieza deja el curso cerrado otra vez, como en el seed)
        limpiar.push(async () => {
          await cerrar('ADMIN_SISTEMA', asignacionId);
        });
        const reabierto = await reabrir(rol, asignacionId);
        expect([reabierto.status, reabierto.body.error?.message]).toEqual([200, undefined]);
        expect(reabierto.body.data).toEqual(
          expect.objectContaining({ bimestre: BIMESTRE_CERRADO, reabierto: true })
        );
        expect(reabierto.body.data.matriculasReabiertas).toBeGreaterThan(0);

        // Reabierto: se puede operar la evaluación y su nota
        const crea = await enviarComo('ADMIN_SISTEMA', 'post', `${base}/evaluaciones`, cuerpo);
        expect([crea.status, crea.body.error?.message]).toEqual([201, undefined]);
        const evaluacionId = idDe(crea, 'evaluacion');
        limpiar.push(async () => {
          await como('ADMIN_SISTEMA', 'delete', `${base}/evaluaciones/${evaluacionId}`);
        });
        const edita = await enviarComo('ADMIN_SISTEMA', 'put', `${base}/evaluaciones/${evaluacionId}`, {
          nombre: 'ci-evaluacion reabierta',
        });
        expect(edita.status).toBe(200);

        // Reabrir otra vez es idempotente
        expect((await reabrir(rol, asignacionId)).status).toBe(200);

        // Cerrar el curso consolida y vuelve a bloquear las escrituras
        const cierre = await cerrar(rol, asignacionId);
        expect([cierre.status, cierre.body.error?.message]).toEqual([200, undefined]);
        expect(cierre.body.data).toEqual(expect.objectContaining({ bimestre: BIMESTRE_CERRADO, cerrado: true }));
        const otraVez = await enviarComo('ADMIN_SISTEMA', 'post', `${base}/evaluaciones`, cuerpo);
        expect(otraVez.status).toBe(403);
        const bloqueada = await enviarComo('ADMIN_SISTEMA', 'put', `${base}/evaluaciones/${evaluacionId}`, {
          nombre: 'ci-evaluacion cerrada',
        });
        expect(bloqueada.status).toBe(403);
        // y de nuevo reabierto para que la limpieza pueda eliminar la evaluación
        expect((await reabrir(rol, asignacionId)).status).toBe(200);
      });
    }
  );

  it('el estado institucional de la gestión no cambia: los bimestres 1 a 3 siguen cerrados', async () => {
    const res = await como('RECTOR', 'get', '/calificaciones/gestion-bimestres');
    expect(res.status).toBe(200);
    const estados = Object.fromEntries(res.body.data.bimestres.map((b) => [b.numero, b.estado]));
    expect([estados[1], estados[2], estados[3]]).toEqual(['cerrado', 'cerrado', 'cerrado']);
  });

  it('cierre de gestión: un bimestre que no está en curso no se cierra (422) y el docente no cierra', async () => {
    for (const numero of [1, 4]) {
      const res = await enviarComo('RECTOR', 'post', `/calificaciones/gestion-bimestres/bimestre/${numero}/cerrar`);
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('CIERRE_BLOQUEADO');
    }
    expect((await enviarComo('DOCENTE', 'post', '/calificaciones/gestion-bimestres/bimestre/4/cerrar')).status).toBe(403);
    expect((await enviarComo('DOCENTE', 'post', '/calificaciones/gestion-bimestres/bimestre/4/abrir')).status).toBe(403);
  });
});
