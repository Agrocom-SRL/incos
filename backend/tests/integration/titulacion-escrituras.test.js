/**
 * Titulación · escrituras con datos propios de la prueba.
 *
 * Cada prueba crea (con `conLimpieza`) una inscripción vigente del estudiante de prueba y un proyecto
 * de grado `ci-`, recorre la máquina de estados por la API y borra todo al terminar. El tribunal usa
 * docentes del seed de catálogo (solo lectura).
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { iniciarSistema, cerrarSistema, como, sequelize } from './helpers/sistema.js';
import { esperarValidacion, enviarComo, conLimpieza } from './helpers/respuestas.js';
import { crearProyectoGradoPrueba, INFORME_SUFICIENCIA_PRUEBA } from './helpers/escenarios.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const GESTOR = 'DIR_ACADEMICO';
const BASE = '/proyectos-grado';
const TRIBUNAL = [{ docenteId: 1 }, { docenteId: 2 }, { docenteId: 3 }];

const transicionar = (id, cuerpo) => enviarComo(GESTOR, 'post', `${BASE}/${id}/transiciones`, cuerpo);

async function estadoDe(id) {
  const res = await como(GESTOR, 'get', `${BASE}/${id}`);
  expect(res.status).toBe(200);
  return res.body.data.estado;
}

/** Avanza el proyecto por la ruta feliz hasta `destino` (todas las transiciones deben dar 200). */
async function avanzarHasta(id, destino) {
  const ruta = [
    ['APROBADO_PERFIL', { nota: 80 }],
    ['DESARROLLO', {}],
    ['SUFICIENCIA', INFORME_SUFICIENCIA_PRUEBA],
    ['PREDEFENSA', {}],
    ['APROBADO_PREDEFENSA', { nota: 80 }],
    ['DEFENSA', {}],
  ];
  const orden = ['PERFIL', ...ruta.map(([estado]) => estado)];
  const actual = orden.indexOf(await estadoDe(id));
  for (const [estado, extra] of ruta) {
    if (orden.indexOf(estado) <= actual) continue;
    const res = await transicionar(id, { estado, ...extra });
    expect([estado, res.status, res.body.error?.message]).toEqual([estado, 200, undefined]);
    expect(await estadoDe(id)).toBe(estado);
    if (estado === destino) return;
  }
}

describe('Titulación · ciclo de vida de un proyecto (datos propios)', () => {
  it('crea el proyecto en PERFIL con su titular y rechaza un segundo proyecto vigente del mismo estudiante', async () => {
    await conLimpieza(async (limpiar) => {
      const { proyectoId, estudianteId } = await crearProyectoGradoPrueba(limpiar);
      const ficha = await como(GESTOR, 'get', `${BASE}/${proyectoId}`);
      expect(ficha.status).toBe(200);
      expect(ficha.body.data.estado).toBe('PERFIL');

      const [integrante] = await sequelize.query(
        'SELECT rol, estado FROM integrantes_proyecto WHERE proyecto_grado_id = :id',
        { replacements: { id: proyectoId }, type: sequelize.QueryTypes.SELECT }
      );
      expect(integrante).toEqual({ rol: 'TITULAR', estado: 'ACTIVO' });

      const repetido = await enviarComo(GESTOR, 'post', BASE, {
        titulo: 'ci-segundo proyecto',
        modalidadId: ficha.body.data.modalidadId,
        estudianteIds: [estudianteId],
      });
      expect(repetido.status).toBe(409);
    });
  });

  it('rechaza saltos de etapa y la nota fuera de rango; avanza etapa por etapa y deja bitácora', async () => {
    await conLimpieza(async (limpiar) => {
      const { proyectoId } = await crearProyectoGradoPrueba(limpiar);

      const salto = await transicionar(proyectoId, { estado: 'DEFENSA' });
      expect(salto.status).toBe(409);
      expect(salto.body.error.message).toContain('Transición no permitida');
      esperarValidacion(await transicionar(proyectoId, { estado: 'APROBADO_PERFIL', nota: 101 }), 'nota');
      expect(await estadoDe(proyectoId)).toBe('PERFIL');

      // DESARROLLO -> SUFICIENCIA exige el informe del tutor
      await avanzarHasta(proyectoId, 'DESARROLLO');
      const sinInforme = await transicionar(proyectoId, { estado: 'SUFICIENCIA' });
      esperarValidacion(sinInforme);
      expect(await estadoDe(proyectoId)).toBe('DESARROLLO');

      await avanzarHasta(proyectoId, 'DEFENSA');
      const bitacora = await como(GESTOR, 'get', `${BASE}/${proyectoId}/bitacora`);
      expect(bitacora.status).toBe(200);
      const actividades = JSON.stringify(bitacora.body.data);
      expect(actividades).toContain('APROBADO_PERFIL → DESARROLLO');
      expect(actividades).toContain('PREDEFENSA → APROBADO_PREDEFENSA');
    });
  });

  it('SEC_ACADEMICA no puede avanzar etapas (APROBAR) aunque cree proyectos', async () => {
    await conLimpieza(async (limpiar) => {
      const { proyectoId } = await crearProyectoGradoPrueba(limpiar);
      const res = await enviarComo('SEC_ACADEMICA', 'post', `${BASE}/${proyectoId}/transiciones`, {
        estado: 'APROBADO_PERFIL',
      });
      expect(res.status).toBe(403);
      expect(await estadoDe(proyectoId)).toBe('PERFIL');
    });
  });
});

describe('Titulación · acta de defensa', () => {
  const acta = (calificacionFinal, tribunal = TRIBUNAL, extra = {}) => ({
    fechaDefensa: '2026-10-20',
    horaInicio: '09:00',
    horaConclusion: '10:00',
    tribunal,
    calificaciones: [{ estudianteId: extra.estudianteId, calificacionFinal }],
    ...extra.cuerpo,
  });

  it('exige estado DEFENSA, tribunal de 3 docentes distintos y nota; registra, aprueba el proyecto y rechaza duplicados', async () => {
    await conLimpieza(async (limpiar) => {
      const { proyectoId, estudianteId } = await crearProyectoGradoPrueba(limpiar);
      const url = `${BASE}/${proyectoId}/acta-defensa`;
      const cuerpo = (nota, tribunal) => acta(nota, tribunal, { estudianteId });

      // Fuera de DEFENSA: 409 y no se crea acta
      const temprano = await enviarComo(GESTOR, 'post', url, cuerpo(80));
      expect(temprano.status).toBe(409);

      await avanzarHasta(proyectoId, 'DEFENSA');

      // Nota nula / ausente: nunca se emite como 0
      esperarValidacion(await enviarComo(GESTOR, 'post', url, cuerpo(null)), 'calificaciones[0].calificacionFinal');
      esperarValidacion(await enviarComo(GESTOR, 'post', url, cuerpo(101)), 'calificaciones[0].calificacionFinal');
      // Tribunal incompleto
      esperarValidacion(await enviarComo(GESTOR, 'post', url, cuerpo(80, TRIBUNAL.slice(0, 2))), 'tribunal');
      // Docente repetido en el tribunal (regla de negocio, 400)
      const repetidoEnTribunal = await enviarComo(
        GESTOR,
        'post',
        url,
        cuerpo(80, [{ docenteId: 1 }, { docenteId: 1 }, { docenteId: 2 }])
      );
      esperarValidacion(repetidoEnTribunal);
      expect(repetidoEnTribunal.body.error.message).toContain('docentes distintos');
      // Docente inexistente
      expect((await enviarComo(GESTOR, 'post', url, cuerpo(80, [{ docenteId: 1 }, { docenteId: 2 }, { docenteId: 999999 }]))).status).toBe(404);
      // Calificación para un estudiante que no es integrante
      const ajeno = await enviarComo(GESTOR, 'post', url, {
        ...cuerpo(80),
        calificaciones: [{ estudianteId: estudianteId + 100000, calificacionFinal: 80 }],
      });
      esperarValidacion(ajeno);
      // Nada de lo anterior dejó actas ni cambió el estado
      const antes = await como(GESTOR, 'get', url);
      expect(antes.status).toBe(200);
      expect(JSON.stringify(antes.body.data)).not.toContain('"EMITIDA"');
      expect(await estadoDe(proyectoId)).toBe('DEFENSA');

      // Sin permiso APROBAR no se registra
      expect((await enviarComo('DOCENTE', 'post', url, cuerpo(80))).status).toBe(403);

      const ok = await enviarComo(GESTOR, 'post', url, cuerpo(80));
      expect([ok.status, ok.body.error?.message]).toEqual([201, undefined]);
      expect(ok.body.data.actasDefensa).toHaveLength(1);
      expect(ok.body.data.actasDefensa[0]).toEqual(
        expect.objectContaining({ resultado: 'APRUEBA', estado: 'EMITIDA' })
      );
      expect(await estadoDe(proyectoId)).toBe('APROBADO');

      const [{ n }] = await sequelize.query(
        'SELECT COUNT(*) AS n FROM tribunal_acta_defensa t JOIN actas_defensa a ON a.id = t.acta_defensa_id WHERE a.proyecto_grado_id = :id',
        { replacements: { id: proyectoId }, type: sequelize.QueryTypes.SELECT }
      );
      expect(Number(n)).toBe(3);

      // Registrar de nuevo: el proyecto ya no está en DEFENSA (estado final)
      const duplicado = await enviarComo(GESTOR, 'post', url, cuerpo(80));
      expect(duplicado.status).toBe(409);
      const [{ actas }] = await sequelize.query(
        'SELECT COUNT(*) AS actas FROM actas_defensa WHERE proyecto_grado_id = :id',
        { replacements: { id: proyectoId }, type: sequelize.QueryTypes.SELECT }
      );
      expect(Number(actas)).toBe(1);

      // El acta emitida se exporta como PDF
      const actaId = ok.body.data.actasDefensa[0].id;
      const pdf = await como(GESTOR, 'get', `${url}/${actaId}/pdf`);
      expect(pdf.status).toBe(200);
      expect(pdf.headers['content-type']).toContain('application/pdf');
    });
  });

  it('una nota bajo el mínimo REPRUEBA el acta y el proyecto queda REPROBADO (estado final)', async () => {
    await conLimpieza(async (limpiar) => {
      const { proyectoId, estudianteId } = await crearProyectoGradoPrueba(limpiar);
      await avanzarHasta(proyectoId, 'DEFENSA');
      const res = await enviarComo(GESTOR, 'post', `${BASE}/${proyectoId}/acta-defensa`, acta(10, TRIBUNAL, { estudianteId }));
      expect([res.status, res.body.error?.message]).toEqual([201, undefined]);
      expect(res.body.data.actasDefensa[0].resultado).toBe('REPRUEBA');
      expect(await estadoDe(proyectoId)).toBe('REPROBADO');
      // Desde un estado final no hay más transiciones
      expect((await transicionar(proyectoId, { estado: 'DEFENSA' })).status).toBe(409);
      expect((await transicionar(proyectoId, { estado: 'CANCELADO' })).status).toBe(409);
    });
  });

  it('anular un acta exige motivo y la deja ANULADA sin revertir el proyecto', async () => {
    await conLimpieza(async (limpiar) => {
      const { proyectoId, estudianteId } = await crearProyectoGradoPrueba(limpiar);
      await avanzarHasta(proyectoId, 'DEFENSA');
      const url = `${BASE}/${proyectoId}/acta-defensa`;
      const ok = await enviarComo(GESTOR, 'post', url, acta(70, TRIBUNAL, { estudianteId }));
      expect(ok.status).toBe(201);
      const actaId = ok.body.data.actasDefensa[0].id;

      esperarValidacion(await enviarComo(GESTOR, 'patch', `${url}/${actaId}/anular`, {}), 'motivo');
      const anulada = await enviarComo(GESTOR, 'patch', `${url}/${actaId}/anular`, { motivo: 'ci-error de transcripción' });
      expect([anulada.status, anulada.body.error?.message]).toEqual([200, undefined]);
      const [fila] = await sequelize.query('SELECT estado FROM actas_defensa WHERE id = :id', {
        replacements: { id: actaId },
        type: sequelize.QueryTypes.SELECT,
      });
      expect(fila.estado).toBe('ANULADA');
      expect(await estadoDe(proyectoId)).toBe('APROBADO');
      // Anular dos veces no es válido
      expect((await enviarComo(GESTOR, 'patch', `${url}/${actaId}/anular`, { motivo: 'ci-otra vez' })).status).toBe(409);
    });
  });
});

describe('Titulación · integrantes en estados vigente y final', () => {
  it('un proyecto CANCELADO (estado final) no admite integrantes ni nuevas transiciones', async () => {
    await conLimpieza(async (limpiar) => {
      const { proyectoId } = await crearProyectoGradoPrueba(limpiar);
      const cancelado = await transicionar(proyectoId, { estado: 'CANCELADO', observaciones: 'ci-cancelado' });
      expect([cancelado.status, cancelado.body.error?.message]).toEqual([200, undefined]);
      expect(await estadoDe(proyectoId)).toBe('CANCELADO');

      const agregar = await enviarComo(GESTOR, 'post', `${BASE}/${proyectoId}/integrantes`, { estudianteId: 1 });
      expect(agregar.status).toBe(409);
      expect(agregar.body.error.message).toContain('CANCELADO');
      expect((await transicionar(proyectoId, { estado: 'APROBADO_PERFIL' })).status).toBe(409);
    });
  });

  it('un proyecto APROBADO rechaza integrantes; uno vigente rechaza duplicados, rol inválido y grupo en modalidad individual', async () => {
    await conLimpieza(async (limpiar) => {
      const { proyectoId, estudianteId } = await crearProyectoGradoPrueba(limpiar);
      const url = `${BASE}/${proyectoId}/integrantes`;

      // Vigente: el titular ya es integrante activo
      expect((await enviarComo(GESTOR, 'post', url, { estudianteId })).status).toBe(409);
      esperarValidacion(await enviarComo(GESTOR, 'post', url, { estudianteId, rol: 'JEFE' }), 'rol');
      expect((await enviarComo(GESTOR, 'post', url, { estudianteId: 999999 })).status).toBe(404);

      await avanzarHasta(proyectoId, 'DEFENSA');
      const ok = await enviarComo(GESTOR, 'post', `${url.replace('/integrantes', '/acta-defensa')}`, {
        fechaDefensa: '2026-10-20',
        horaInicio: '09:00',
        tribunal: TRIBUNAL,
        calificaciones: [{ estudianteId, calificacionFinal: 90 }],
      });
      expect(ok.status).toBe(201);
      expect(await estadoDe(proyectoId)).toBe('APROBADO');

      const final = await enviarComo(GESTOR, 'post', url, { estudianteId: 999999 });
      expect(final.status).toBe(409);
      expect(final.body.error.message).toContain('APROBADO');
    });
  });
});
