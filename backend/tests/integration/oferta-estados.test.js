/**
 * Oferta académica · transiciones de estado de OfertaCurso y GestionPlan por API, con datos propios.
 *
 * - oferta_cursos: PROGRAMADA -> ACTIVA -> CERRADA; CANCELADA desde PROGRAMADA o ACTIVA; CERRADA y
 *   CANCELADA terminales (oferta.constants).
 * - gestiones_planes: PROPUESTO -> APROBADO -> VIGENTE -> CERRADO; CANCELADO desde cualquier estado no
 *   final; CERRADO y CANCELADO terminales (cursos.constants).
 * El plan se habilita en la gestión 2025 (no vigente) y se borra al terminar.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, sequelize } from './helpers/sistema.js';
import {
  esperarValidacion,
  esperarNoEncontrado,
  esperarDenegado,
  enviarComo,
  conLimpieza,
} from './helpers/respuestas.js';
import { crearParaleloGestionPrueba } from './helpers/escenarios.js';
import { ESTADOS_OFERTA_CURSO_VALUES } from '../../src/domain/constants/oferta.constants.js';
import {
  TRANSICIONES_GESTION_PLAN,
  ESTADOS_GESTION_PLAN_VALUES,
} from '../../src/domain/constants/cursos.constants.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const GESTOR = 'DIR_ACADEMICO';
const ID_INEXISTENTE = 999999;

const estadoOferta = async (id) => {
  const [fila] = await sequelize.query('SELECT estado FROM oferta_cursos WHERE id = :id', {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT,
  });
  return fila.estado;
};

const estadoPlan = async (id) => {
  const [fila] = await sequelize.query('SELECT estado FROM gestiones_planes WHERE id = :id', {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT,
  });
  return fila.estado;
};

const cambiarOferta = (id, estado) => enviarComo(GESTOR, 'put', `/oferta-cursos/${id}/estado`, { estado });
const cambiarPlan = (id, estado) => enviarComo(GESTOR, 'put', `/gestiones-planes/${id}/estado`, { estado });

/** Paralelo propio con la oferta generada; devuelve los ids de oferta_cursos. */
async function paraleloConOferta(limpiar) {
  const base = await crearParaleloGestionPrueba(limpiar);
  const gen = await enviarComo(GESTOR, 'post', `/paralelos-gestion/${base.paraleloGestionId}/generar-oferta`);
  expect(gen.status).toBe(200);
  const lista = await como(GESTOR, 'get', `/paralelos-gestion/${base.paraleloGestionId}/oferta-cursos`);
  const cursos = lista.body.data.ofertaCursos;
  expect(cursos.length).toBeGreaterThanOrEqual(4);
  return { ...base, cursos };
}

describe('Oferta · transiciones de estado de OfertaCurso', () => {
  it('recorre PROGRAMADA -> ACTIVA -> CERRADA y deja CERRADA como terminal', async () => {
    await conLimpieza(async (limpiar) => {
      const { cursos } = await paraleloConOferta(limpiar);
      const id = cursos[0].id;
      expect(await estadoOferta(id)).toBe('PROGRAMADA');

      // Salto no permitido y estado fuera del catálogo
      const salto = await cambiarOferta(id, 'CERRADA');
      esperarValidacion(salto);
      expect(salto.body.error.message).toContain('PROGRAMADA no puede pasar a CERRADA');
      esperarValidacion(await cambiarOferta(id, 'ABIERTA'), 'estado');
      expect(await estadoOferta(id)).toBe('PROGRAMADA');

      const activa = await cambiarOferta(id, 'ACTIVA');
      expect([activa.status, activa.body.error?.message]).toEqual([200, undefined]);
      expect(activa.body.data.estado).toBe('ACTIVA');
      // No se puede retroceder
      esperarValidacion(await cambiarOferta(id, 'PROGRAMADA'));
      expect((await cambiarOferta(id, 'CERRADA')).status).toBe(200);
      expect(await estadoOferta(id)).toBe('CERRADA');
      for (const destino of ESTADOS_OFERTA_CURSO_VALUES.filter((e) => e !== 'CERRADA')) {
        esperarValidacion(await cambiarOferta(id, destino));
      }
      expect(await estadoOferta(id)).toBe('CERRADA');
    });
  });

  it('CANCELADA desde PROGRAMADA y desde ACTIVA; es terminal', async () => {
    await conLimpieza(async (limpiar) => {
      const { cursos } = await paraleloConOferta(limpiar);
      const [desdeProgramada, desdeActiva] = cursos;

      expect((await cambiarOferta(desdeProgramada.id, 'CANCELADA')).status).toBe(200);
      expect((await cambiarOferta(desdeActiva.id, 'ACTIVA')).status).toBe(200);
      expect((await cambiarOferta(desdeActiva.id, 'CANCELADA')).status).toBe(200);

      for (const id of [desdeProgramada.id, desdeActiva.id]) {
        expect(await estadoOferta(id)).toBe('CANCELADA');
        for (const destino of ['PROGRAMADA', 'ACTIVA', 'CERRADA']) {
          esperarValidacion(await cambiarOferta(id, destino));
        }
      }
    });
  });

  it('estado inexistente 404, sin permiso 403 y cuerpo inválido 400', async () => {
    esperarNoEncontrado(await cambiarOferta(ID_INEXISTENTE, 'ACTIVA'));
    esperarValidacion(await enviarComo(GESTOR, 'put', `/oferta-cursos/${ID_INEXISTENTE}/estado`, {}), 'estado');
    for (const rol of ['DOCENTE', 'ESTUDIANTE']) {
      esperarDenegado(await enviarComo(rol, 'put', `/oferta-cursos/${ID_INEXISTENTE}/estado`, { estado: 'ACTIVA' }), 'institucional.oferta.cursos', 'EDITAR');
    }
  });

  it('agregar y eliminar oferta: duplicado, periodo ajeno y dependencias', async () => {
    await conLimpieza(async (limpiar) => {
      const p = await paraleloConOferta(limpiar);
      const [curso] = p.cursos;
      const crear = (asignatura) =>
        enviarComo(GESTOR, 'post', '/oferta-cursos', {
          paralelo_gestion_id: p.paraleloGestionId,
          asignatura_plan_id: asignatura,
        });

      // Ya está en la oferta generada
      const duplicada = await crear(curso.asignaturaPlanId);
      esperarValidacion(duplicada);
      expect(duplicada.body.error.message).toContain('ya está en la oferta');

      // Una asignatura de otro periodo del mismo plan no entra al paralelo
      const [ajena] = await sequelize.query(
        'SELECT id FROM asignaturas_plan WHERE plan_estudio_id = 1 AND periodo_id <> :periodo AND deleted_at IS NULL LIMIT 1',
        { replacements: { periodo: curso.periodoId }, type: sequelize.QueryTypes.SELECT }
      );
      const otroPeriodo = await crear(ajena.id);
      esperarValidacion(otroPeriodo);
      expect(otroPeriodo.body.error.message).toContain('plan de estudios y periodo');
      esperarNoEncontrado(await crear(ID_INEXISTENTE));

      // Eliminar y volver a agregar la misma asignatura
      expect((await como(GESTOR, 'delete', `/oferta-cursos/${curso.id}`)).status).toBe(200);
      const nueva = await crear(curso.asignaturaPlanId);
      expect([nueva.status, nueva.body.error?.message]).toEqual([201, undefined]);
      expect(nueva.body.data.estado).toBe('PROGRAMADA');
      esperarNoEncontrado(await como(GESTOR, 'delete', `/oferta-cursos/${curso.id}`));

      // Con docente asignado no se elimina
      const [otro] = p.cursos.slice(1);
      const [docente] = await sequelize.query(
        `SELECT d.id FROM docentes d WHERE d.color_hex IS NOT NULL AND d.deleted_at IS NULL
          AND NOT EXISTS (SELECT 1 FROM asignaciones_docentes ad WHERE ad.docente_id = d.id AND ad.deleted_at IS NULL)
          ORDER BY d.id LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );
      const asigna = await enviarComo(GESTOR, 'post', '/asignaciones-docentes', {
        gestion_plan_id: p.gestionPlanId,
        oferta_curso_id: otro.id,
        docente_id: docente.id,
        carga_horaria: otro.horasSemanales,
      });
      expect(asigna.status).toBe(201);
      const conAsignacion = await como(GESTOR, 'delete', `/oferta-cursos/${otro.id}`);
      esperarValidacion(conAsignacion);
      expect(conAsignacion.body.error.message).toContain('asignaciones docentes');
      expect(await estadoOferta(otro.id)).toBe('PROGRAMADA');
    });
  });
});

describe('Oferta · transiciones de estado de GestionPlan', () => {
  it('recorre PROPUESTO -> APROBADO -> VIGENTE -> CERRADO sin saltos ni retrocesos', async () => {
    await conLimpieza(async (limpiar) => {
      const { gestionPlanId } = await crearParaleloGestionPrueba(limpiar);
      expect(await estadoPlan(gestionPlanId)).toBe('PROPUESTO');

      for (const salto of ['VIGENTE', 'CERRADO']) {
        const res = await cambiarPlan(gestionPlanId, salto);
        esperarValidacion(res);
        expect(res.body.error.message).toContain(`PROPUESTO no puede pasar a ${salto}`);
      }
      esperarValidacion(await cambiarPlan(gestionPlanId, 'EN_CURSO'), 'estado');

      for (const [destino, retroceso] of [
        ['APROBADO', 'PROPUESTO'],
        ['VIGENTE', 'APROBADO'],
        ['CERRADO', 'VIGENTE'],
      ]) {
        const ok = await cambiarPlan(gestionPlanId, destino);
        expect([destino, ok.status, ok.body.error?.message]).toEqual([destino, 200, undefined]);
        expect(ok.body.data.estado).toBe(destino);
        expect(await estadoPlan(gestionPlanId)).toBe(destino);
        if (destino !== 'CERRADO') esperarValidacion(await cambiarPlan(gestionPlanId, retroceso));
      }
      // CERRADO es terminal
      for (const destino of ['PROPUESTO', 'APROBADO', 'VIGENTE', 'CANCELADO']) {
        esperarValidacion(await cambiarPlan(gestionPlanId, destino));
      }
      expect(await estadoPlan(gestionPlanId)).toBe('CERRADO');
    });
  });

  it('CANCELADO desde PROPUESTO, APROBADO y VIGENTE; es terminal', async () => {
    const caminos = { PROPUESTO: [], APROBADO: ['APROBADO'], VIGENTE: ['APROBADO', 'VIGENTE'] };
    for (const [origen, pasos] of Object.entries(caminos)) {
      // Cada origen necesita un plan propio: un plan cancelado ya no permite habilitar de nuevo en la misma gestión
      await conLimpieza(async (limpiar) => {
        const { gestionPlanId } = await crearParaleloGestionPrueba(limpiar);
        for (const paso of pasos) expect((await cambiarPlan(gestionPlanId, paso)).status).toBe(200);
        expect(await estadoPlan(gestionPlanId)).toBe(origen);
        const cancelado = await cambiarPlan(gestionPlanId, 'CANCELADO');
        expect([origen, cancelado.status]).toEqual([origen, 200]);
        for (const destino of ['PROPUESTO', 'APROBADO', 'VIGENTE', 'CERRADO']) {
          esperarValidacion(await cambiarPlan(gestionPlanId, destino));
        }
        expect(await estadoPlan(gestionPlanId)).toBe('CANCELADO');
      });
    }
  });

  it('la constante de transiciones del dominio cubre todos los estados del catálogo', () => {
    expect(Object.keys(TRANSICIONES_GESTION_PLAN).sort()).toEqual([...ESTADOS_GESTION_PLAN_VALUES].sort());
  });

  it('habilitar un plan: duplicado 400, gestión o plan inexistente 404, generar paralelos es idempotente', async () => {
    await conLimpieza(async (limpiar) => {
      const { gestionPlanId } = await crearParaleloGestionPrueba(limpiar);
      const duplicado = await enviarComo(GESTOR, 'post', '/gestiones-planes', { gestion_id: 2, plan_estudio_id: 1 });
      esperarValidacion(duplicado);
      expect(duplicado.body.error.message).toContain('ya está habilitado');
      esperarNoEncontrado(await enviarComo(GESTOR, 'post', '/gestiones-planes', { gestion_id: ID_INEXISTENTE, plan_estudio_id: 1 }));
      esperarNoEncontrado(await enviarComo(GESTOR, 'post', '/gestiones-planes', { gestion_id: 2, plan_estudio_id: ID_INEXISTENTE }));
      esperarValidacion(await enviarComo(GESTOR, 'post', '/gestiones-planes', {}));

      const [{ antes }] = await sequelize.query(
        'SELECT COUNT(*) AS antes FROM paralelos_gestion WHERE gestion_plan_id = :id',
        { replacements: { id: gestionPlanId }, type: sequelize.QueryTypes.SELECT }
      );
      const repetido = await enviarComo(GESTOR, 'post', `/gestiones-planes/${gestionPlanId}/generar-paralelos-gestion`);
      expect(repetido.status).toBe(200);
      expect(repetido.body.data.resumen).toEqual(
        expect.objectContaining({ creados: 0, existentes: Number(antes), totalMaestros: Number(antes) })
      );
      esperarNoEncontrado(await enviarComo(GESTOR, 'post', `/gestiones-planes/${ID_INEXISTENTE}/generar-paralelos-gestion`));
    });
  });

  it('estado de plan: inexistente 404 y sin permiso 403', async () => {
    esperarNoEncontrado(await cambiarPlan(ID_INEXISTENTE, 'APROBADO'));
    for (const rol of ['DOCENTE', 'ESTUDIANTE']) {
      esperarDenegado(
        await enviarComo(rol, 'put', `/gestiones-planes/${ID_INEXISTENTE}/estado`, { estado: 'APROBADO' }),
        'institucional.oferta.gestion-plan',
        'EDITAR'
      );
    }
  });
});
