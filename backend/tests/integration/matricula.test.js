/**
 * Matrícula (estudiantes e inscripciones) contra la BD real efímera.
 *
 * Matriz: SEC_ACADEMICA, DIR_ACADEMICO y RECTOR inscriben (`matricula.inscribir`); eliminar una inscripción
 * (`matricula.inscripcion.editar` ELIMINAR) es solo de RECTOR y SEC_ACADEMICA; el ESTUDIANTE solo lista y
 * ve las suyas; DOCENTE y los roles administrativos no tienen acceso. La inscripción exige que el aporte
 * de la gestión tenga al menos un pago: el flujo de escritura registra una cuota de efectivo, inscribe al
 * estudiante de prueba, lee la inscripción y luego la elimina y anula la cuota.
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
import { inscribirEstudiantePrueba } from './helpers/escenarios.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const SECRETARIA = 'SEC_ACADEMICA';
const ID_INEXISTENTE = 999999;

describe('Matrícula · estudiantes', () => {
  it('listado paginado y búsqueda por nombre', async () => {
    esperarListadoPaginado(await como(SECRETARIA, 'get', '/estudiantes?page=1&limit=2'), { limit: 2 });
    const res = await como(SECRETARIA, 'get', '/estudiantes?search=Prueba');
    expect(res.status).toBe(200);
    expect(res.body.data.map((e) => e.codigoEstudiante)).toContain('TEST-EST-001');
    const vacio = await como(SECRETARIA, 'get', '/estudiantes?search=zzzzzz-ci-sin-resultados');
    expect(vacio.status).toBe(200);
    expect(vacio.body.data).toEqual([]);
  });

  it('ficha por id: 200 con sus datos y 404 si no existe', async () => {
    const ok = await como(SECRETARIA, 'get', '/estudiantes/1');
    expect(ok.status).toBe(200);
    expect(ok.body.data.student).toEqual(expect.objectContaining({ id: 1, studentCode: 'TEST-EST-001' }));
    esperarNoEncontrado(await como(SECRETARIA, 'get', `/estudiantes/${ID_INEXISTENTE}`));
  });

  it('el docente solo ve fichas de estudiantes de sus cursos (403 de negocio)', async () => {
    const res = await como('DOCENTE', 'get', '/estudiantes/1');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('Matrícula · inscripciones (lectura y validaciones)', () => {
  it('listado paginado, filtro sin resultados y validación de page', async () => {
    esperarListadoPaginado(await como(SECRETARIA, 'get', '/inscripciones?page=1&limit=2'), { limit: 2 });
    const vacio = await como(SECRETARIA, 'get', '/inscripciones?search=zzzzzz-ci-sin-resultados');
    esperarListadoPaginado(vacio);
    expect(vacio.body.data).toEqual([]);
    esperarValidacion(await como(SECRETARIA, 'get', '/inscripciones?page=0'), 'page');
  });

  it('detalle: 404 si no existe y 400 si el id no es numérico', async () => {
    esperarNoEncontrado(await como(SECRETARIA, 'get', `/inscripciones/${ID_INEXISTENTE}`));
    esperarValidacion(await como(SECRETARIA, 'get', '/inscripciones/abc'), 'id');
  });

  it('contexto de matrícula: valida estudiante, 404 si no existe y arma la oferta del plan', async () => {
    esperarValidacion(await como(SECRETARIA, 'get', '/inscripciones/contexto-matricula'), 'estudiante_id');
    esperarValidacion(await como(SECRETARIA, 'get', '/inscripciones/contexto-matricula?estudiante_id=abc'), 'estudiante_id');
    esperarNoEncontrado(await como(SECRETARIA, 'get', `/inscripciones/contexto-matricula?estudiante_id=${ID_INEXISTENTE}`));
    const ok = await como(SECRETARIA, 'get', '/inscripciones/contexto-matricula?estudiante_id=1&carrera_id=1');
    expect(ok.status).toBe(200);
    const { contexto } = ok.body.data;
    expect(contexto.carrera.id).toBe(1);
    expect(contexto.plan.id).toBeGreaterThan(0);
    expect(contexto.periodos.length).toBeGreaterThan(0);
    expect(contexto.periodos[0].asignaturas.length).toBeGreaterThan(0);
  });

  it.each([
    ['sin cuerpo', {}, 'student_id'],
    ['sin paralelo ni materias', { student_id: 1 }, 'body'],
    ['tipo de inscripción desconocido', { student_id: 1, parallel_id: 1, enrollment_type: 'XX' }, 'enrollment_type'],
    ['materias vacías', { student_id: 1, teacher_assignment_ids: [] }, 'teacher_assignment_ids'],
    ['historial previo mal formado', { student_id: 1, parallel_id: 1, prior_history: 'x' }, 'prior_history'],
  ])('crear inscripción rechaza %s', async (_caso, cuerpo, campo) => {
    esperarValidacion(await enviarComo(SECRETARIA, 'post', '/inscripciones', cuerpo), campo);
  });

  it('crear inscripción: estudiante o paralelo inexistente responde 404', async () => {
    esperarNoEncontrado(
      await enviarComo(SECRETARIA, 'post', '/inscripciones', { student_id: ID_INEXISTENTE, parallel_id: 1 })
    );
    esperarNoEncontrado(
      await enviarComo(SECRETARIA, 'post', '/inscripciones', { student_id: 1, parallel_id: ID_INEXISTENTE })
    );
  });

  it('sin aporte pagado no se puede inscribir (regla de negocio, no crea nada)', async () => {
    const [{ n }] = await sequelize.query(
      `SELECT COUNT(*) AS n FROM pago_cuotas pc
         JOIN pago_aporte pa ON pa.id = pc.pago_aporte_id
        WHERE pa.estudiante_id = 1 AND pc.deleted_at IS NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );
    if (Number(n) > 0) return; // otra prueba dejó una cuota viva: la regla ya no aplica
    const res = await enviarComo(SECRETARIA, 'post', '/inscripciones', {
      student_id: 1,
      parallel_id: 1,
      plan_estudio_id: 1,
    });
    esperarValidacion(res);
    expect(res.body.error.message).toContain('aporte');
  });

  it('editar, historial, activar cursado y eliminar sobre una inscripción inexistente', async () => {
    esperarNoEncontrado(await enviarComo(SECRETARIA, 'put', `/inscripciones/${ID_INEXISTENTE}`, { observations: 'ci' }));
    esperarValidacion(
      await enviarComo(SECRETARIA, 'put', `/inscripciones/${ID_INEXISTENTE}/historial-previo`, { prior_history: 'x' }),
      'prior_history'
    );
    esperarNoEncontrado(await enviarComo(SECRETARIA, 'patch', `/inscripciones/${ID_INEXISTENTE}/activar-cursado`));
    esperarNoEncontrado(await como(SECRETARIA, 'delete', `/inscripciones/${ID_INEXISTENTE}`));
  });
});

describe('Matrícula · permisos por rol (matriz)', () => {
  it('el estudiante lista y consulta, pero no inscribe ni elimina', async () => {
    esperarListadoPaginado(await como('ESTUDIANTE', 'get', '/inscripciones'));
    esperarNoEncontrado(await como('ESTUDIANTE', 'get', `/inscripciones/${ID_INEXISTENTE}`));
    esperarDenegado(await enviarComo('ESTUDIANTE', 'post', '/inscripciones', {}), 'matricula.inscribir', 'CREAR');
    esperarDenegado(await como('ESTUDIANTE', 'delete', `/inscripciones/${ID_INEXISTENTE}`), 'matricula.inscripcion.editar', 'ELIMINAR');
  });

  it('DIR_ACADEMICO inscribe pero no elimina; generar el formulario exige GENERAR_PDF de documentos', async () => {
    esperarDenegado(await como('DIR_ACADEMICO', 'delete', `/inscripciones/${ID_INEXISTENTE}`), 'matricula.inscripcion.editar', 'ELIMINAR');
    esperarDenegado(
      await como(SECRETARIA, 'post', `/inscripciones/${ID_INEXISTENTE}/generar-formulario`),
      'matricula.documento.ver',
      'GENERAR_PDF'
    );
  });

  it.each(['DOCENTE', 'SEC_ADMIN', 'DIR_ADMIN'])('%s no accede a inscripciones', async (rol) => {
    esperarDenegado(await como(rol, 'get', '/inscripciones'), 'matricula.inscribir', 'LISTAR');
    esperarDenegado(await como(rol, 'get', '/inscripciones/1'), 'matricula.inscribir', 'DETALLE');
  });
});

describe('Matrícula · inscribir -> leer -> eliminar (flujo completo y limpio)', () => {
  it('registra una cuota, inscribe al estudiante de prueba y deja todo como estaba', async () => {
    const creados = {};
    await conLimpieza(async (limpiar) => {
      const { inscripcionId } = await inscribirEstudiantePrueba(limpiar, { etiqueta: 'ci-matricula' });
      creados.inscripcionId = inscripcionId;

      const detalle = await como(SECRETARIA, 'get', `/inscripciones/${inscripcionId}`);
      expect(detalle.status).toBe(200);
      const listado = await como(SECRETARIA, 'get', '/inscripciones?search=Prueba');
      expect(JSON.stringify(listado.body.data)).toContain('TEST-EST-001');

      // El estudiante ve su propia inscripción
      const propias = await como('ESTUDIANTE', 'get', '/inscripciones');
      expect(propias.status).toBe(200);
      expect(JSON.stringify(propias.body.data)).toContain('TEST-EST-001');

      // Inscribir dos veces al mismo estudiante en la gestión se rechaza
      const repetida = await enviarComo(SECRETARIA, 'post', '/inscripciones', {
        student_id: 1,
        parallel_id: 1,
        plan_estudio_id: 1,
        enrollment_type: 'NUEVO',
      });
      expect(repetida.status).toBeGreaterThanOrEqual(400);
      expect(repetida.status).toBeLessThan(500);
    });

    esperarNoEncontrado(await como(SECRETARIA, 'get', `/inscripciones/${creados.inscripcionId}`));
  });
});
