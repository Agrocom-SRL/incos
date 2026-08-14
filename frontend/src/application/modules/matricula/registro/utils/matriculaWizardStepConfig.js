/**
 * Índices y numeración del wizard de matrícula (crear / editar).
 * stepIndex: 0-based (WizardForm). stepNumber: 1-based (onValidateBeforeNext).
 *
 * El array de pasos es DINÁMICO (matriz de §2 de docs/plan/matricula-wizard-rediseno.md):
 * - Carrera y plan: solo estudiantes nuevos en el sistema (sin historial digital).
 * - Historial de notas: ANTIGUO/TRASPASO/TRANSITABILIDAD sin historial digital.
 * Los índices se derivan del ORDEN del array (nada de números mágicos): un paso
 * ausente queda en null y los consumidores deben tratarlo con null-guards.
 */

import { requiereHistorialPrevio } from './historialPrevioHelpers';

export const WIZARD_SECTION_HISTORIAL = 'historialPrevio';

/**
 * Orden canónico de pasos; buscar/periodo/paralelo siempre presentes.
 *
 * «Historial de notas» va ANTES de «Paralelo» (2026-08-14): completa las
 * materias que el estudiante NO cursa esta gestión, así que pertenece al bloque
 * académico junto a la planilla. Además el paso Paralelo cierra el asistente con
 * el resumen de la inscripción, y dejar un paso de captura después de ese
 * resumen daba la impresión de que ya estaba todo completado.
 */
const buildStepOrder = ({ includeCarrera, includeHistorial }) => [
  'buscar',
  ...(includeCarrera ? ['carrera'] : []),
  'periodo',
  ...(includeHistorial ? ['historial'] : []),
  'paralelo',
];

/**
 * @param {Object} flags
 * @param {boolean} [flags.includeCarrera=true] - Paso «Carrera y plan» (solo nuevos en el sistema)
 * @param {boolean} [flags.includeHistorial=false] - Paso «Historial de notas»
 */
export function createMatriculaWizardStepMeta({ includeCarrera = true, includeHistorial = false } = {}) {
  const order = buildStepOrder({ includeCarrera, includeHistorial });

  const indices = { buscar: null, carrera: null, periodo: null, paralelo: null, historial: null };
  order.forEach((key, index) => {
    indices[key] = index;
  });

  const stepNumbers = Object.fromEntries(
    Object.entries(indices).map(([key, index]) => [key, index != null ? index + 1 : null]),
  );

  return {
    includeCarrera,
    includeHistorialPrevio: includeHistorial,
    order,
    indices,
    stepNumbers,
  };
}

/**
 * Resuelve la meta de pasos a partir del perfil del estudiante.
 *
 * @param {string|null} tipoAdmision
 * @param {Object} [options]
 * @param {boolean|null} [options.esNuevoSistema] - null = dato aún no disponible →
 *   se preserva el comportamiento histórico (Carrera visible, historial por tipo).
 */
export function resolveMatriculaWizardStepMeta(tipoAdmision, { esNuevoSistema = null } = {}) {
  const tieneHistorialSistema = esNuevoSistema === false;
  return createMatriculaWizardStepMeta({
    includeCarrera: !tieneHistorialSistema,
    includeHistorial: requiereHistorialPrevio(tipoAdmision, esNuevoSistema),
  });
}
