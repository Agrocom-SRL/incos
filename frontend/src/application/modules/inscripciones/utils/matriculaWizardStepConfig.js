/**
 * Índices y numeración del wizard de matrícula (crear / editar).
 * stepIndex: 0-based (WizardForm). stepNumber: 1-based (onValidateBeforeNext).
 */

import { requiereHistorialPrevio } from './historialPrevioHelpers';

export const WIZARD_SECTION_HISTORIAL = 'historialPrevio';

export function createMatriculaWizardStepMeta(includeHistorialPrevio) {
  const historialIndex = includeHistorialPrevio ? 4 : null;
  return {
    includeHistorialPrevio,
    indices: {
      buscar: 0,
      carrera: 1,
      periodo: 2,
      paralelo: 3,
      historial: historialIndex,
    },
    stepNumbers: {
      carrera: 2,
      periodo: 3,
      paralelo: 4,
      historial: includeHistorialPrevio ? 5 : null,
    },
  };
}

export function resolveMatriculaWizardStepMeta(tipoAdmision) {
  return createMatriculaWizardStepMeta(requiereHistorialPrevio(tipoAdmision));
}
