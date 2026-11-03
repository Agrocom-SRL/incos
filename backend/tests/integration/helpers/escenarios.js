/**
 * Escenarios de datos reutilizables para las pruebas de integración de escritura.
 *
 * Cada escenario registra su limpieza en el arreglo `limpiar` de `conLimpieza` (se ejecuta en orden
 * inverso, también si la prueba falla). Todo se crea con la API y se elimina con la API (soft delete).
 */
import { expect } from '@jest/globals';
import { como, sequelize } from './sistema.js';
import { enviarComo, idDe } from './respuestas.js';

export const PARALELO_GESTION_PRUEBA = 1;

/**
 * Inscribe al estudiante de prueba (test.estudiante) en el paralelo en gestión 1 de la gestión vigente.
 * La inscripción exige un aporte con al menos un pago: registra una cuota de efectivo de Bs. 10 (`ci-`).
 * Limpieza: elimina la inscripción y anula la cuota.
 *
 * @returns {Promise<{ inscripcionId: number, estudianteId: number, gestionId: number }>}
 */
export async function inscribirEstudiantePrueba(limpiar, { etiqueta = 'ci-escenario' } = {}) {
  // La cabecera de aporte se crea al registrar la primera cuota del estudiante en la gestión vigente
  const [estudiante] = await sequelize.query("SELECT id FROM estudiantes WHERE ci = 'TEST-EST-001'", {
    type: sequelize.QueryTypes.SELECT,
  });
  const [gestion] = await sequelize.query('SELECT id FROM gestiones WHERE vigente = 1 ORDER BY id LIMIT 1', {
    type: sequelize.QueryTypes.SELECT,
  });
  const cuotaRes = await enviarComo('SEC_ADMIN', 'post', '/pagos-aportes', {
    student_id: estudiante.id,
    management_id: gestion.id,
    amount: 10,
    payment_method_id: 1,
    payment_date: '2026-03-01',
    descripcion: `${etiqueta}-cuota`,
  });
  expect(cuotaRes.status).toBe(201);
  const [cuota] = await sequelize.query(
    'SELECT id FROM pago_cuotas WHERE descripcion = :d AND deleted_at IS NULL ORDER BY id DESC LIMIT 1',
    { replacements: { d: `${etiqueta}-cuota` }, type: sequelize.QueryTypes.SELECT }
  );
  limpiar.push(async () => {
    await como('SEC_ADMIN', 'delete', `/pagos-aportes/cuotas/${cuota.id}`);
  });

  const inscribe = await enviarComo('SEC_ACADEMICA', 'post', '/inscripciones', {
    student_id: estudiante.id,
    parallel_id: PARALELO_GESTION_PRUEBA,
    plan_estudio_id: 1,
    enrollment_type: 'NUEVO',
    observations: `${etiqueta}-inscripcion`,
  });
  expect([inscribe.status, inscribe.body.error?.message]).toEqual([201, undefined]);
  const data = inscribe.body.data;
  const inscripcionId = data.id ?? data.inscripcion?.id ?? data.enrollment?.id;
  expect(inscripcionId).toBeGreaterThan(0);
  limpiar.push(async () => {
    await como('SEC_ACADEMICA', 'delete', `/inscripciones/${inscripcionId}`);
  });

  return { inscripcionId, estudianteId: estudiante.id, gestionId: gestion.id };
}

const GESTOR_TITULACION = 'DIR_ACADEMICO';

/**
 * Crea un proyecto de grado (modalidad PG, individual) del estudiante de prueba con una inscripción
 * vigente creada por el propio escenario. Limpieza: borra por SQL el proyecto y sus satélites
 * (los PDF de dictámenes quedan en `uploads/`, que está fuera del control de versiones).
 *
 * @returns {Promise<{ proyectoId: number, estudianteId: number, inscripcionId: number, gestionId: number }>}
 */
export async function crearProyectoGradoPrueba(limpiar, { etiqueta = 'ci-titulacion' } = {}) {
  const base = await inscribirEstudiantePrueba(limpiar, { etiqueta });
  const [modalidad] = await sequelize.query("SELECT id FROM modalidades_grado WHERE codigo = 'PG'", {
    type: sequelize.QueryTypes.SELECT,
  });
  const res = await enviarComo(GESTOR_TITULACION, 'post', '/proyectos-grado', {
    titulo: `${etiqueta} proyecto de prueba`,
    modalidadId: modalidad.id,
    estudianteIds: [base.estudianteId],
  });
  expect([res.status, res.body.error?.message]).toEqual([201, undefined]);
  const proyectoId = idDe(res, 'proyectoGrado');
  expect(proyectoId).toBeGreaterThan(0);
  limpiar.push(async () => {
    const r = { replacements: { id: proyectoId } };
    await sequelize.query(
      'DELETE FROM tribunal_acta_defensa WHERE acta_defensa_id IN (SELECT id FROM actas_defensa WHERE proyecto_grado_id = :id)',
      r
    );
    for (const tabla of [
      'actas_defensa',
      'avances_proyecto',
      'bitacora_proyecto',
      'dictamenes_proyecto',
      'integrantes_proyecto',
    ]) {
      await sequelize.query(`DELETE FROM ${tabla} WHERE proyecto_grado_id = :id`, r);
    }
    await sequelize.query('DELETE FROM proyectos_grado WHERE id = :id', r);
  });
  return { ...base, proyectoId };
}

const GESTOR_OFERTA = 'DIR_ACADEMICO';
const GESTION_NO_VIGENTE = 2;
const PLAN_SISTEMAS = 1;

/**
 * Habilita el plan 1 en una gestión NO vigente (la 2025 del seed) y genera sus paralelos en gestión
 * (BORRADOR). El primero es el paralelo de la prueba; el segundo sirve para conflictos entre paralelos. Todo es propio de la prueba y se borra por SQL
 * al terminar (la API no expone borrado de gestión-plan ni de paralelo en gestión).
 *
 * @returns {Promise<{ gestionPlanId: number, paraleloGestionId: number, turno: string, otroParaleloGestionId: number }>}
 */
export async function crearParaleloGestionPrueba(limpiar, { gestionId = GESTION_NO_VIGENTE } = {}) {
  const habilita = await enviarComo(GESTOR_OFERTA, 'post', '/gestiones-planes', {
    gestion_id: gestionId,
    plan_estudio_id: PLAN_SISTEMAS,
  });
  expect([habilita.status, habilita.body.error?.message]).toEqual([201, undefined]);
  const gestionPlanId = idDe(habilita, 'gestionPlan');
  expect(gestionPlanId).toBeGreaterThan(0);
  limpiar.push(async () => {
    const r = { replacements: { id: gestionPlanId } };
    const delPg = '(SELECT id FROM paralelos_gestion WHERE gestion_plan_id = :id)';
    const delOc = `(SELECT id FROM oferta_cursos WHERE paralelo_gestion_id IN ${delPg})`;
    const delAd = `(SELECT id FROM asignaciones_docentes WHERE oferta_curso_id IN ${delOc})`;
    await sequelize.query(`DELETE FROM asignacion_horarios WHERE asignacion_docente_id IN ${delAd}`, r);
    await sequelize.query(`DELETE FROM asignaciones_docentes WHERE oferta_curso_id IN ${delOc}`, r);
    await sequelize.query(`DELETE FROM oferta_cursos WHERE paralelo_gestion_id IN ${delPg}`, r);
    await sequelize.query('DELETE FROM paralelos_gestion WHERE gestion_plan_id = :id', r);
    await sequelize.query('DELETE FROM gestiones_planes WHERE id = :id', r);
  });

  const genera = await enviarComo(GESTOR_OFERTA, 'post', `/gestiones-planes/${gestionPlanId}/generar-paralelos-gestion`);
  expect([genera.status, genera.body.error?.message]).toEqual([200, undefined]);
  const paralelos = await sequelize.query(
    'SELECT id, turno FROM paralelos_gestion WHERE gestion_plan_id = :id ORDER BY id',
    { replacements: { id: gestionPlanId }, type: sequelize.QueryTypes.SELECT }
  );
  return {
    gestionPlanId,
    paraleloGestionId: paralelos[0].id,
    turno: paralelos[0].turno,
    otroParaleloGestionId: paralelos[1].id,
  };
}

/** Datos mínimos del informe de suficiencia que exige DESARROLLO -> SUFICIENCIA. */
export const INFORME_SUFICIENCIA_PRUEBA = {
  aspectosFormato: 'ci-formato correcto',
  contenidoProyecto: 'ci-contenido completo',
  procesoTutoria: 'ci-tutoria cumplida',
  resultadoSuficiencia: 'APROBADO',
};
