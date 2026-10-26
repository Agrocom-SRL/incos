/**
 * Horarios · escrituras con datos propios de la prueba.
 *
 * Cada prueba habilita el plan 1 en la gestión 2025 (no vigente) con `crearParaleloGestionPrueba`, arma
 * oferta, docentes y bloques por la API y recorre la máquina de estados del paralelo en gestión
 * (BORRADOR -> OFERTADO -> PUBLICADO -> CERRADO). Los paralelos sembrados (gestión vigente, PUBLICADOS)
 * no se tocan; todo lo creado se borra al terminar.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, sequelize } from './helpers/sistema.js';
import { esperarValidacion, esperarDenegado, enviarComo, idDe, conLimpieza } from './helpers/respuestas.js';
import { crearParaleloGestionPrueba } from './helpers/escenarios.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const ARMADOR = 'DIR_ACADEMICO';
const INGLES = 'INT-103'; // 2 horas semanales: la única materia del primer periodo que cabe en un bloque corto

const estadoDe = async (pgId) => {
  const [fila] = await sequelize.query('SELECT estado FROM paralelos_gestion WHERE id = :id', {
    replacements: { id: pgId },
    type: sequelize.QueryTypes.SELECT,
  });
  return fila.estado;
};

const cambiarEstado = (pgId, estado) =>
  enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}/estado`, { estado });

/** Docentes con color y sin asignaciones: no chocan con el horario sembrado. */
async function docentesLibres(cantidad) {
  const filas = await sequelize.query(
    `SELECT d.id FROM docentes d
      WHERE d.color_hex IS NOT NULL AND d.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM asignaciones_docentes ad WHERE ad.docente_id = d.id AND ad.deleted_at IS NULL)
      ORDER BY d.id LIMIT ${Number(cantidad)}`,
    { type: sequelize.QueryTypes.SELECT }
  );
  expect(filas.length).toBe(cantidad);
  return filas.map((f) => f.id);
}

async function horariosDelTurno(turno, cantidad) {
  const filas = await sequelize.query(
    `SELECT id FROM horarios WHERE turno = :turno AND dia = 'LUNES' AND deleted_at IS NULL
      ORDER BY numero_bloque LIMIT ${Number(cantidad)}`,
    { replacements: { turno }, type: sequelize.QueryTypes.SELECT }
  );
  return filas.map((f) => f.id);
}

/** Genera la oferta del paralelo y deja solo las materias de `conservar` (por código). */
async function generarOferta(pgId, conservar = [INGLES]) {
  const gen = await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${pgId}/generar-oferta`);
  expect(gen.status).toBe(200);
  const lista = await como(ARMADOR, 'get', `/paralelos-gestion/${pgId}/oferta-cursos`);
  return lista.body.data.ofertaCursos.filter((c) => conservar.includes(c.materiaCodigo));
}

async function quitarOtrasMaterias(pgId, conservar) {
  const lista = await como(ARMADOR, 'get', `/paralelos-gestion/${pgId}/oferta-cursos`);
  for (const curso of lista.body.data.ofertaCursos) {
    if (conservar.includes(curso.materiaCodigo)) continue;
    expect((await como(ARMADOR, 'delete', `/oferta-cursos/${curso.id}`)).status).toBe(200);
  }
}

async function asignarDocente(gestionPlanId, ofertaCursoId, docenteId, cargaHoraria) {
  const res = await enviarComo(ARMADOR, 'post', '/asignaciones-docentes', {
    gestion_plan_id: gestionPlanId,
    oferta_curso_id: ofertaCursoId,
    docente_id: docenteId,
    carga_horaria: cargaHoraria,
  });
  expect([res.status, res.body.error?.message]).toEqual([201, undefined]);
  return res.body.data.asignacion.id;
}

const crearBloque = (asignacionId, horarioId) =>
  enviarComo(ARMADOR, 'post', '/asignacion-horarios', { asignacion_docente_id: asignacionId, horario_id: horarioId });

/**
 * Paralelo propio listo para armar: aula asignada, oferta generada y en OFERTADO, con solo las materias
 * pedidas. Devuelve ids de asignación (un docente libre por materia) y los horarios del turno.
 */
async function prepararParaleloOfertado(limpiar, conservar = [INGLES]) {
  const base = await crearParaleloGestionPrueba(limpiar);
  const pgId = base.paraleloGestionId;
  await generarOferta(pgId, conservar);
  const aula = await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { aula_id: 14 });
  expect(aula.status).toBe(200);
  const ofertado = await cambiarEstado(pgId, 'OFERTADO');
  expect([ofertado.status, ofertado.body.error?.message]).toEqual([200, undefined]);
  await quitarOtrasMaterias(pgId, conservar);
  const cursos = (await como(ARMADOR, 'get', `/paralelos-gestion/${pgId}/oferta-cursos`)).body.data.ofertaCursos;
  const docentes = await docentesLibres(conservar.length);
  const asignaciones = [];
  for (let i = 0; i < cursos.length; i += 1) {
    asignaciones.push(await asignarDocente(base.gestionPlanId, cursos[i].id, docentes[i], cursos[i].horasSemanales));
  }
  const horarios = await horariosDelTurno(base.turno, 4);
  return { ...base, pgId, cursos, docentes, asignaciones, horarios };
}

describe('Horarios · máquina de estados del paralelo en gestión', () => {
  it('BORRADOR exige aula y oferta completa para pasar a OFERTADO y no salta a PUBLICADO ni a CERRADO', async () => {
    await conLimpieza(async (limpiar) => {
      const { paraleloGestionId: pgId } = await crearParaleloGestionPrueba(limpiar);
      expect(await estadoDe(pgId)).toBe('BORRADOR');

      for (const destino of ['PUBLICADO', 'CERRADO']) {
        const res = await cambiarEstado(pgId, destino);
        esperarValidacion(res);
        expect(res.body.error.message).toContain('Transición no permitida');
      }
      // Sin aula
      const sinAula = await cambiarEstado(pgId, 'OFERTADO');
      esperarValidacion(sinAula);
      expect(sinAula.body.error.message).toContain('aula');
      // Cupos incoherentes
      esperarValidacion(await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { aula_id: 14, cupo_maximo: 5, cupo_minimo: 9 }));
      // Con aula pero sin oferta de cursos generada
      expect((await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { aula_id: 14, cupo_maximo: 30 })).status).toBe(200);
      const sinOferta = await cambiarEstado(pgId, 'OFERTADO');
      esperarValidacion(sinOferta);
      expect(sinOferta.body.error.message).toContain('oferta');
      expect(await estadoDe(pgId)).toBe('BORRADOR');

      await generarOferta(pgId);
      const ok = await cambiarEstado(pgId, 'OFERTADO');
      expect([ok.status, ok.body.error?.message]).toEqual([200, undefined]);
      expect(await estadoDe(pgId)).toBe('OFERTADO');
      // OFERTADO puede volver a BORRADOR y volver a OFERTADO
      expect((await cambiarEstado(pgId, 'BORRADOR')).status).toBe(200);
      expect((await cambiarEstado(pgId, 'OFERTADO')).status).toBe(200);
    });
  });

  it('BORRADOR y OFERTADO admiten cambiar aula, cupos y turno; PUBLICADO y CERRADO los bloquean', async () => {
    await conLimpieza(async (limpiar) => {
      const p = await prepararParaleloOfertado(limpiar);
      const { pgId, asignaciones, horarios } = p;

      // OFERTADO: editable
      expect((await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { aula_id: 13, cupo_maximo: 28 })).status).toBe(200);
      expect((await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}/cambiar-turno`, { turno: 'TARDE' })).status).toBe(200);
      expect((await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}/cambiar-turno`, { turno: p.turno })).status).toBe(200);

      // Armar los 2 bloques y publicar
      for (const horarioId of horarios.slice(0, 2)) {
        expect((await crearBloque(asignaciones[0], horarioId)).status).toBe(200);
      }
      // Con bloques, el cambio simple de turno se rechaza (hay que usar cambiar-turno-con-bloques)
      const conBloques = await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}/cambiar-turno`, {
        turno: p.turno === 'NOCHE' ? 'TARDE' : 'NOCHE',
      });
      esperarValidacion(conBloques);
      expect(conBloques.body.error.message).toContain('cambiar-turno-con-bloques');

      const publicado = await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${pgId}/publicar`);
      expect([publicado.status, publicado.body.error?.message]).toEqual([200, undefined]);
      expect(await estadoDe(pgId)).toBe('PUBLICADO');

      // PUBLICADO: aula, cupos, turno y bloques bloqueados
      const aula = await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { aula_id: 12 });
      esperarValidacion(aula);
      expect(aula.body.error.message).toContain('PUBLICADO');
      esperarValidacion(await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { cupo_maximo: 20 }));
      esperarValidacion(await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}/cambiar-turno`, { turno: 'TARDE' }));
      const nuevoBloque = await crearBloque(asignaciones[0], horarios[2]);
      esperarValidacion(nuevoBloque);
      expect(nuevoBloque.body.error.message).toContain('PUBLICADO');
      // Observaciones no son datos bloqueados
      expect((await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { observaciones: 'ci-nota' })).status).toBe(200);

      // Despublicar devuelve a OFERTADO y vuelve a permitir editar
      expect((await cambiarEstado(pgId, 'OFERTADO')).status).toBe(200);
      expect((await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { aula_id: 12 })).status).toBe(200);
      expect((await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${pgId}/publicar`)).status).toBe(200);

      // CERRADO: terminal y bloquea todo
      const cerrado = await cambiarEstado(pgId, 'CERRADO');
      expect([cerrado.status, cerrado.body.error?.message]).toEqual([200, undefined]);
      const aulaCerrado = await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}`, { aula_id: 13 });
      esperarValidacion(aulaCerrado);
      expect(aulaCerrado.body.error.message).toContain('CERRADO');
      esperarValidacion(await enviarComo(ARMADOR, 'put', `/paralelos-gestion/${pgId}/cambiar-turno`, { turno: p.turno }));
      for (const destino of ['OFERTADO', 'BORRADOR', 'PUBLICADO']) {
        esperarValidacion(await cambiarEstado(pgId, destino));
      }
      esperarValidacion(await crearBloque(asignaciones[0], horarios[2]));
      // No se agrega oferta a un paralelo CERRADO
      const asignaturaPlanId = p.cursos[0].asignaturaPlanId;
      const agregar = await enviarComo(ARMADOR, 'post', '/oferta-cursos', {
        paralelo_gestion_id: pgId,
        asignatura_plan_id: asignaturaPlanId,
      });
      esperarValidacion(agregar);
      expect(agregar.body.error.message).toContain('CERRADO');
      expect(await estadoDe(pgId)).toBe('CERRADO');
    });
  });

  it('PUBLICADO puede volver a BORRADOR (no ofertado)', async () => {
    await conLimpieza(async (limpiar) => {
      const p = await prepararParaleloOfertado(limpiar);
      for (const horarioId of p.horarios.slice(0, 2)) {
        expect((await crearBloque(p.asignaciones[0], horarioId)).status).toBe(200);
      }
      expect((await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${p.pgId}/publicar`)).status).toBe(200);
      expect((await cambiarEstado(p.pgId, 'BORRADOR')).status).toBe(200);
      expect(await estadoDe(p.pgId)).toBe('BORRADOR');
    });
  });
});

describe('Horarios · bloques, conflictos y publicación', () => {
  it('publicar exige estado OFERTADO, cobertura completa y sin conflictos; DIR_ADMIN y SEC_ACADEMICA no publican', async () => {
    await conLimpieza(async (limpiar) => {
      const p = await prepararParaleloOfertado(limpiar);
      const url = `/paralelos-gestion/${p.pgId}/publicar`;

      // Cobertura incompleta (0 de 2 bloques)
      const vacio = await enviarComo(ARMADOR, 'post', url);
      expect(vacio.status).toBe(422);
      expect(vacio.body.error.details.map((d) => d.condicion)).toContain('cobertura');
      expect((await crearBloque(p.asignaciones[0], p.horarios[0])).status).toBe(200);
      const parcial = await enviarComo(ARMADOR, 'post', url);
      expect(parcial.status).toBe(422);
      expect(await estadoDe(p.pgId)).toBe('OFERTADO');

      esperarDenegado(await enviarComo('DIR_ADMIN', 'post', url), 'institucional.horario.publicacion', 'EDITAR');
      esperarDenegado(await enviarComo('SEC_ACADEMICA', 'post', url), 'institucional.horario.publicacion', 'EDITAR');

      expect((await crearBloque(p.asignaciones[0], p.horarios[1])).status).toBe(200);
      const grilla = await como(ARMADOR, 'get', `/paralelos-gestion/${p.pgId}/grilla-horario`);
      expect(grilla.status).toBe(200);
      expect(grilla.body.data.cobertura.completa).toBe(true);
      expect(grilla.body.data.paralelo_gestion_estado).toBe('OFERTADO');
      expect((await enviarComo(ARMADOR, 'post', url)).status).toBe(200);

      // Publicar de nuevo: ya no está OFERTADO
      const repetido = await enviarComo(ARMADOR, 'post', url);
      expect(repetido.status).toBe(422);
      expect(repetido.body.error.details[0].condicion).toBe('estado');
    });
  });

  it('un paralelo en BORRADOR no se publica', async () => {
    await conLimpieza(async (limpiar) => {
      const { paraleloGestionId } = await crearParaleloGestionPrueba(limpiar);
      const res = await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${paraleloGestionId}/publicar`);
      expect(res.status).toBe(422);
      expect(res.body.error.details[0].condicion).toBe('estado');
      expect(await estadoDe(paraleloGestionId)).toBe('BORRADOR');
    });
  });

  it('crear bloque: duplicado y choque con otra materia del paralelo dan 422; eliminar y mover bloques', async () => {
    await conLimpieza(async (limpiar) => {
      const p = await prepararParaleloOfertado(limpiar, [INGLES, 'HDC-104']);
      const [ingles, otra] = p.asignaciones;

      const creado = await crearBloque(ingles, p.horarios[0]);
      expect(creado.status).toBe(200);
      const bloqueId = idDe(creado, 'asignacion_horario');

      const duplicado = await crearBloque(ingles, p.horarios[0]);
      expect(duplicado.status).toBe(422);
      expect(duplicado.body.error.details[0].mensaje).toContain('ya tiene un bloque');

      const choque = await crearBloque(otra, p.horarios[0]);
      expect(choque.status).toBe(422);
      expect(choque.body.error.details.map((d) => d.tipo)).toContain('PARALELO');

      // Validar sin guardar
      const validar = await enviarComo(ARMADOR, 'post', '/conflictos/validar', {
        asignacion_docente_id: otra,
        horario_id: p.horarios[1],
      });
      expect(validar.status).toBe(200);

      // Mover el bloque a otro horario libre
      const mover = await enviarComo(ARMADOR, 'put', `/asignacion-horarios/${bloqueId}`, { horario_id: p.horarios[2] });
      expect([mover.status, mover.body.error?.message]).toEqual([200, undefined]);
      // y ahora el horario original queda libre para la otra materia
      expect((await crearBloque(otra, p.horarios[0])).status).toBe(200);

      // Eliminar el bloque (OFERTADO permite) y comprobar que la cobertura baja
      expect((await como(ARMADOR, 'delete', `/asignacion-horarios/${bloqueId}`)).status).toBe(200);
      const grilla = await como(ARMADOR, 'get', `/paralelos-gestion/${p.pgId}/grilla-horario`);
      const filaIngles = grilla.body.data.cobertura.asignaciones.find((a) => a.asignacion_docente_id === ingles);
      expect(filaIngles.bloques_asignados).toBe(0);
      expect((await como(ARMADOR, 'delete', `/asignacion-horarios/${bloqueId}`)).status).toBe(404);
    });
  });

  it('el mismo docente en dos paralelos de la misma gestión y horario: el conflicto DOCENTE bloquea la publicación hasta resolverlo', async () => {
    await conLimpieza(async (limpiar) => {
      const p = await prepararParaleloOfertado(limpiar);
      // Segundo paralelo de la misma gestión-plan: se le asigna el MISMO docente en otra materia
      const cursosB = await generarOferta(p.otroParaleloGestionId, ['MPI-101']);
      const asignacionB = await asignarDocente(p.gestionPlanId, cursosB[0].id, p.docentes[0], 4);

      const bloquesA = [];
      for (const horarioId of p.horarios.slice(0, 2)) {
        const res = await crearBloque(p.asignaciones[0], horarioId);
        expect(res.status).toBe(200);
        bloquesA.push(idDe(res, 'asignacion_horario'));
      }
      // NOTA: la pre-validación (validarPropuesta) solo ve choques ya persistidos; el doble reservado del
      // docente se guarda y se detecta después en el listado de conflictos (vista 126).
      const doble = await crearBloque(asignacionB, p.horarios[0]);
      expect(doble.status).toBe(200);
      const bloqueB = idDe(doble, 'asignacion_horario');

      for (const id of [p.pgId, p.otroParaleloGestionId]) {
        const res = await como(ARMADOR, 'get', `/paralelos-gestion/${id}/conflictos`);
        expect(res.status).toBe(200);
        expect(res.body.data.conflictos.map((c) => c.tipo)).toContain('DOCENTE');
      }

      // Con el conflicto abierto, la cobertura está completa pero no se puede publicar
      const bloqueado = await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${p.pgId}/publicar`);
      expect(bloqueado.status).toBe(422);
      expect(bloqueado.body.error.details.map((d) => d.condicion)).toContain('conflictos');
      expect(await estadoDe(p.pgId)).toBe('OFERTADO');

      // Resuelto el conflicto (se mueve el bloque del otro paralelo) sí se publica
      const mover = await enviarComo(ARMADOR, 'put', `/asignacion-horarios/${bloqueB}`, { horario_id: p.horarios[3] });
      expect([mover.status, mover.body.error?.message]).toEqual([200, undefined]);
      const libre = await como(ARMADOR, 'get', `/paralelos-gestion/${p.pgId}/conflictos`);
      expect(libre.body.data.conflictos).toEqual([]);
      expect((await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${p.pgId}/publicar`)).status).toBe(200);
      expect(await estadoDe(p.pgId)).toBe('PUBLICADO');
    });
  });

  it('con el paralelo PUBLICADO no se eliminan bloques; el docente (solo conflictos) no arma ni publica', async () => {
    await conLimpieza(async (limpiar) => {
      const p = await prepararParaleloOfertado(limpiar);
      const bloques = [];
      for (const horarioId of p.horarios.slice(0, 2)) {
        const res = await crearBloque(p.asignaciones[0], horarioId);
        expect(res.status).toBe(200);
        bloques.push(idDe(res, 'asignacion_horario'));
      }
      esperarDenegado(await enviarComo('DOCENTE', 'post', '/asignacion-horarios', { asignacion_docente_id: p.asignaciones[0], horario_id: p.horarios[2] }), 'institucional.horario.armado', 'EDITAR');
      expect((await enviarComo(ARMADOR, 'post', `/paralelos-gestion/${p.pgId}/publicar`)).status).toBe(200);

      const eliminar = await como(ARMADOR, 'delete', `/asignacion-horarios/${bloques[0]}`);
      esperarValidacion(eliminar);
      expect(eliminar.body.error.message).toContain('PUBLICADO');
      const [{ n }] = await sequelize.query(
        'SELECT COUNT(*) AS n FROM asignacion_horarios WHERE id = :id AND deleted_at IS NULL',
        { replacements: { id: bloques[0] }, type: sequelize.QueryTypes.SELECT }
      );
      expect(Number(n)).toBe(1);
    });
  });
});
