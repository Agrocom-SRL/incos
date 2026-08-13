/**
 * Paso del wizard: historial de notas (ANTIGUO, TRASPASO, TRANSITABILIDAD).
 * Contenido renderizado en InscripcionesHistorialPrevioStepContent.
 */

import { WIZARD_SECTION_HISTORIAL } from '@application-matricula/registro/utils/matriculaWizardStepConfig';

/** Sin alerts aquí: el contenido lo muestra InscripcionesHistorialPrevioStepContent. */
export const getStepHistorialPrevioFields = () => ({
  [WIZARD_SECTION_HISTORIAL]: {
    title: 'Notas de periodos anteriores',
    description:
      'Ingrese la nota final de cada materia concluida o márquela como convalidada.',
    fields: [],
  },
});
