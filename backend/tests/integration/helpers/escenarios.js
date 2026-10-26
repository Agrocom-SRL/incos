/**
 * Escenarios de datos reutilizables para las pruebas de integración de escritura.
 *
 * Cada escenario registra su limpieza en el arreglo `limpiar` de `conLimpieza` (se ejecuta en orden
 * inverso, también si la prueba falla). Todo se crea con la API y se elimina con la API (soft delete).
 */
import { expect } from '@jest/globals';
import { como, sequelize } from './sistema.js';
import { enviarComo } from './respuestas.js';

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
