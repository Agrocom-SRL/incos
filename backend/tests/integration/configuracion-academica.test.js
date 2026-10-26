/**
 * Configuración académica (carreras, materias, planes de estudio, periodos, asignaturas del plan,
 * gestiones, aulas, tipos de evaluación, actividades) contra la BD real efímera.
 *
 * Matriz: RECTOR tiene todo; DIR_ACADEMICO lista/ve/crea/edita pero no elimina carreras ni materias,
 * ni crea actividades; el resto de roles recibe 403. Las escrituras crean datos `ci-`/`CI-` y los
 * eliminan en la misma prueba (soft delete), verificando que dejan de verse en la API.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como } from './helpers/sistema.js';
import {
  esperarValidacion,
  esperarNoEncontrado,
  esperarDenegado,
  esperarListadoPaginado,
  enviarComo,
  conLimpieza,
  idDe,
} from './helpers/respuestas.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const ADMIN_ACAD = 'RECTOR';
const ID_INEXISTENTE = 999999;

describe('Configuración · carreras', () => {
  it('listado paginado con las carreras sembradas', async () => {
    const res = await como(ADMIN_ACAD, 'get', '/carreras?page=1&limit=2');
    esperarListadoPaginado(res, { limit: 2 });
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
    const pagina2 = await como(ADMIN_ACAD, 'get', '/carreras?page=2&limit=2');
    esperarListadoPaginado(pagina2, { page: 2, limit: 2 });
    const idsP1 = res.body.data.map((c) => c.id);
    for (const carrera of pagina2.body.data) expect(idsP1).not.toContain(carrera.id);
  });

  it('detalle por id: 200, 404 y 400', async () => {
    const ok = await como(ADMIN_ACAD, 'get', '/carreras/1');
    expect(ok.status).toBe(200);
    expect(ok.body.data.carrera).toEqual(expect.objectContaining({ id: 1, codigo: expect.any(String) }));
    esperarNoEncontrado(await como(ADMIN_ACAD, 'get', `/carreras/${ID_INEXISTENTE}`));
    esperarValidacion(await como(ADMIN_ACAD, 'get', '/carreras/abc'), 'id');
  });

  it('crear rechaza payload inválido; editar/eliminar inexistente da 404', async () => {
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/carreras', {}), 'nombre');
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/carreras', { nombre: 'x' }), 'nombre');
    esperarNoEncontrado(await enviarComo(ADMIN_ACAD, 'put', `/carreras/${ID_INEXISTENTE}`, { nombre: 'ci-carrera x' }));
    esperarNoEncontrado(await como(ADMIN_ACAD, 'delete', `/carreras/${ID_INEXISTENTE}`));
  });

  it('DIR_ACADEMICO no puede eliminar carreras', async () => {
    esperarDenegado(await como('DIR_ACADEMICO', 'delete', `/carreras/${ID_INEXISTENTE}`), 'configuracion.carrera', 'ELIMINAR');
  });

  it('crear -> leer -> editar -> eliminar una carrera ci-', async () => {
    const sufijo = String(Date.now()).slice(-8);
    await conLimpieza(async (limpiar) => {
      const crea = await enviarComo(ADMIN_ACAD, 'post', '/carreras', {
        codigo: `ci-${sufijo}`,
        nombre: `ci-carrera ${sufijo}`,
      });
      expect(crea.status).toBe(201);
      const id = idDe(crea, 'carrera');
      expect(id).toBeGreaterThan(0);
      limpiar.push(async () => {
        await como(ADMIN_ACAD, 'delete', `/carreras/${id}`);
      });

      const lee = await como(ADMIN_ACAD, 'get', `/carreras/${id}`);
      expect(lee.status).toBe(200);
      expect(lee.body.data.carrera.nombre).toBe(`ci-carrera ${sufijo}`);
      const busca = await como(ADMIN_ACAD, 'get', `/carreras?search=ci-carrera ${sufijo}`);
      expect(busca.body.data.map((c) => c.id)).toContain(id);

      const edita = await enviarComo(ADMIN_ACAD, 'put', `/carreras/${id}`, { nombre: `ci-carrera ${sufijo} editada` });
      expect(edita.status).toBe(200);
      const releida = await como(ADMIN_ACAD, 'get', `/carreras/${id}`);
      expect(releida.body.data.carrera.nombre).toBe(`ci-carrera ${sufijo} editada`);
    });
    const busca = await como(ADMIN_ACAD, 'get', `/carreras?search=ci-carrera ${sufijo}`);
    expect(busca.body.data).toEqual([]);
  });
});

describe('Configuración · materias', () => {
  it('listado paginado y búsqueda por sigla/nombre (sin resultados y con resultados)', async () => {
    esperarListadoPaginado(await como(ADMIN_ACAD, 'get', '/materias?page=1&limit=2'), { limit: 2 });
    const vacio = await como(ADMIN_ACAD, 'get', '/materias?search=zzzzzz-ci-sin-resultados');
    esperarListadoPaginado(vacio);
    expect(vacio.body.data).toEqual([]);
    const conResultados = await como(ADMIN_ACAD, 'get', '/materias?search=MPI-101');
    expect(conResultados.status).toBe(200);
    expect(conResultados.body.data.map((m) => m.sigla)).toContain('MPI-101');
  });

  it('detalle por id y escrituras inválidas', async () => {
    const ok = await como(ADMIN_ACAD, 'get', '/materias/1');
    expect(ok.status).toBe(200);
    expect(ok.body.data.materia).toEqual(expect.objectContaining({ id: 1, sigla: expect.any(String) }));
    esperarNoEncontrado(await como(ADMIN_ACAD, 'get', `/materias/${ID_INEXISTENTE}`));
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/materias', {}), 'sigla');
    esperarNoEncontrado(await como(ADMIN_ACAD, 'delete', `/materias/${ID_INEXISTENTE}`));
    esperarDenegado(await como('DIR_ACADEMICO', 'delete', `/materias/${ID_INEXISTENTE}`), 'configuracion.materia', 'ELIMINAR');
  });

  it('crear -> leer -> eliminar una materia CI-', async () => {
    const sufijo = String(Date.now()).slice(-8);
    const sigla = `CI-${sufijo}`;
    await conLimpieza(async (limpiar) => {
      const crea = await enviarComo(ADMIN_ACAD, 'post', '/materias', {
        sigla,
        nombre: `ci-materia ${sufijo}`,
        tipo: 'TEORICA',
        clasificacion: 'PRUEBA',
      });
      expect(crea.status).toBe(201);
      const id = idDe(crea, 'materia');
      expect(id).toBeGreaterThan(0);
      limpiar.push(async () => {
        await como(ADMIN_ACAD, 'delete', `/materias/${id}`);
      });

      const lee = await como(ADMIN_ACAD, 'get', `/materias/${id}`);
      expect(lee.status).toBe(200);
      expect(lee.body.data.materia.sigla).toBe(sigla);
      const busca = await como(ADMIN_ACAD, 'get', `/materias?search=${sigla}`);
      expect(busca.body.data.map((m) => m.id)).toContain(id);
    });
    const busca = await como(ADMIN_ACAD, 'get', `/materias?search=CI-${sufijo}`);
    expect(busca.body.data).toEqual([]);
  });
});

describe('Configuración · planes de estudio, periodos y asignaturas', () => {
  it('listado paginado y detalle del plan sembrado', async () => {
    esperarListadoPaginado(await como(ADMIN_ACAD, 'get', '/planes-estudios?page=1&limit=2'), { limit: 2 });
    const ok = await como(ADMIN_ACAD, 'get', '/planes-estudios/1');
    expect(ok.status).toBe(200);
    expect(ok.body.data.plan_estudio.id).toBe(1);
    esperarNoEncontrado(await como(ADMIN_ACAD, 'get', `/planes-estudios/${ID_INEXISTENTE}`));
    esperarValidacion(await como(ADMIN_ACAD, 'get', '/planes-estudios/abc'), 'id');
  });

  it('matriz, validación de horas, periodos y asignaturas del plan', async () => {
    const matriz = await como(ADMIN_ACAD, 'get', '/planes-estudios/1/matriz');
    expect(matriz.status).toBe(200);
    expect(matriz.body.data.plan.id).toBe(1);
    esperarNoEncontrado(await como(ADMIN_ACAD, 'get', `/planes-estudios/${ID_INEXISTENTE}/matriz`));

    const validar = await como(ADMIN_ACAD, 'get', '/planes-estudios/1/validar');
    expect(validar.status).toBe(200);
    expect(validar.body.data.valido).toBe(true);
    expect(validar.body.data.periodos.length).toBeGreaterThan(0);

    const periodos = await como(ADMIN_ACAD, 'get', '/planes-estudios/1/periodos');
    expect(periodos.status).toBe(200);
    expect(periodos.body.data.periodos.length).toBeGreaterThan(0);
    const asignaturas = await como(ADMIN_ACAD, 'get', '/planes-estudios/1/asignaturas');
    expect(asignaturas.status).toBe(200);
    expect(asignaturas.body.data.asignaturas.length).toBeGreaterThan(0);

    const porPeriodo = await como(ADMIN_ACAD, 'get', `/periodos/${periodos.body.data.periodos[0].id}/asignaturas`);
    expect(porPeriodo.status).toBe(200);
    expect(porPeriodo.body.data.asignaturas.length).toBeGreaterThan(0);
  });

  it('escrituras inválidas o sobre ids inexistentes', async () => {
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/planes-estudios', {}));
    esperarNoEncontrado(await enviarComo(ADMIN_ACAD, 'put', `/planes-estudios/${ID_INEXISTENTE}`, {}));
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'patch', `/planes-estudios/${ID_INEXISTENTE}/estado`, {}), 'activo');
    esperarNoEncontrado(await enviarComo(ADMIN_ACAD, 'post', `/planes-estudios/${ID_INEXISTENTE}/clonar`, {}));
    esperarNoEncontrado(await enviarComo(ADMIN_ACAD, 'put', `/periodos/${ID_INEXISTENTE}`, {}));
    esperarNoEncontrado(await como(ADMIN_ACAD, 'delete', `/periodos/${ID_INEXISTENTE}`));
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/asignaturas-plan', {}), 'plan_estudio_id');
    esperarNoEncontrado(await como(ADMIN_ACAD, 'delete', `/asignaturas-plan/${ID_INEXISTENTE}`));
  });

  it('prerrequisitos de una asignatura devuelven una lista (vacía si no hay)', async () => {
    const res = await como(ADMIN_ACAD, 'get', '/asignaturas-plan/1/prerrequisitos');
    expect(res.status).toBe(200);
    expect(res.body.data.prerrequisitos).toEqual(expect.any(Array));
  });

  it('DOCENTE y ESTUDIANTE no acceden a planes ni materias', async () => {
    esperarDenegado(await como('DOCENTE', 'get', '/planes-estudios'), 'configuracion.plan-estudio', 'LISTAR');
    esperarDenegado(await como('ESTUDIANTE', 'get', '/materias'), 'configuracion.materia', 'LISTAR');
    esperarDenegado(await como('DOCENTE', 'get', '/planes-estudios/1'), 'configuracion.plan-estudio', 'DETALLE');
  });
});

describe('Configuración · gestiones, aulas, tipos de evaluación y actividades', () => {
  it('gestiones: listado paginado, creación inválida y edición inexistente', async () => {
    esperarListadoPaginado(await como(ADMIN_ACAD, 'get', '/gestiones?page=1&limit=2'), { limit: 2 });
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/gestiones', {}));
    esperarNoEncontrado(await enviarComo(ADMIN_ACAD, 'put', `/gestiones/${ID_INEXISTENTE}`, {}));
  });

  it('la gestión vigente sembrada es consistente en el listado', async () => {
    const res = await como(ADMIN_ACAD, 'get', '/gestiones');
    expect(res.status).toBe(200);
    const vigentes = res.body.data.filter((g) => g.vigente === true || g.vigente === 1);
    expect(vigentes.length).toBeLessThanOrEqual(1);
  });

  it('aulas: listado paginado, detalle, 404 y validación', async () => {
    esperarListadoPaginado(await como(ADMIN_ACAD, 'get', '/aulas?page=1&limit=2'), { limit: 2 });
    const ok = await como(ADMIN_ACAD, 'get', '/aulas/1');
    expect(ok.status).toBe(200);
    expect(ok.body.data.id).toBe(1);
    esperarNoEncontrado(await como(ADMIN_ACAD, 'get', `/aulas/${ID_INEXISTENTE}`));
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/aulas', {}), 'codigo');
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/aulas', { codigo: 'ci-x', nombre: 'ci-aula', categoria: 'XX' }), 'categoria');
    esperarValidacion(await enviarComo(ADMIN_ACAD, 'post', '/aulas', { codigo: 'ci-x', nombre: 'ci-aula', capacidad: -1 }), 'capacidad');
  });

  it('el catálogo de aulas (picker) no se confunde con GET /aulas/:id', async () => {
    const res = await como('DIR_ACADEMICO', 'get', '/aulas/catalogo');
    expect(res.status).toBe(200);
    expect(res.body.data.aulas.length).toBeGreaterThan(0);
  });

  it('crear -> leer -> eliminar un aula ci-', async () => {
    const sufijo = String(Date.now()).slice(-8);
    await conLimpieza(async (limpiar) => {
      const crea = await enviarComo(ADMIN_ACAD, 'post', '/aulas', {
        codigo: `ci-${sufijo}`,
        nombre: `ci-aula ${sufijo}`,
        capacidad: 10,
      });
      expect(crea.status).toBe(201);
      const id = idDe(crea, 'aula');
      expect(id).toBeGreaterThan(0);
      limpiar.push(async () => {
        await como(ADMIN_ACAD, 'delete', `/aulas/${id}`);
      });

      const lee = await como(ADMIN_ACAD, 'get', `/aulas/${id}`);
      expect(lee.status).toBe(200);
      expect(lee.body.data.codigo).toBe(`ci-${sufijo}`);
    });
    const busca = await como(ADMIN_ACAD, 'get', `/aulas?search=ci-aula ${sufijo}`);
    expect(busca.body.data).toEqual([]);
  });

  it('tipos de evaluación y actividades: lectura y 404', async () => {
    const tipos = await como(ADMIN_ACAD, 'get', '/tipos-evaluacion');
    expect(tipos.status).toBe(200);
    expect(tipos.body.data.length).toBeGreaterThan(0);
    const actividades = await como(ADMIN_ACAD, 'get', '/actividades');
    expect(actividades.status).toBe(200);
    expect(actividades.body.data.length).toBeGreaterThan(0);
    esperarNoEncontrado(await como(ADMIN_ACAD, 'get', `/actividades/${ID_INEXISTENTE}`));
  });

  it('DIR_ACADEMICO no crea actividades; SEC_ADMIN y DOCENTE no ven aulas ni planes', async () => {
    esperarDenegado(await enviarComo('DIR_ACADEMICO', 'post', '/actividades', {}), 'configuracion.actividad', 'CREAR');
    esperarDenegado(await como('SEC_ADMIN', 'get', '/aulas'), 'configuracion.aula', 'LISTAR');
    esperarDenegado(await como('DOCENTE', 'get', '/aulas'), 'configuracion.aula', 'LISTAR');
  });
});
