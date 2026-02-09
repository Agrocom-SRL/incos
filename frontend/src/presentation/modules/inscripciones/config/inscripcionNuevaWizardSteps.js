/**
 * inscripcionNuevaWizardSteps - Configuración de los 4 pasos del wizard de inscripción
 *
 * Orden según flujo de INSCRIPCIÓN (numeración visual):
 * - Paso 1: Buscar estudiante (stepIndex 0)
 * - Paso 2: Seleccionar carrera (stepIndex 1)
 * - Paso 3: Periodo y materias (stepIndex 2) - elegir periodo(s) y qué materias cursar
 * - Paso 4: Paralelo (stepIndex 3) - resumen de inscripción y elegir paralelo por periodo
 *
 * Un archivo por paso: step1, step2, step3, step4.
 * Nota: Los nombres de archivos coinciden con la numeración visual (1-4), pero stepIndex es 0-based (0-3).
 */

import { getStep1Fields } from './steps/step1BuscarEstudiante.jsx';
import { getStep2Fields } from './steps/step2SeleccionarCarrera.js';
import { getStep3Fields } from './steps/step3PeriodoYMaterias.jsx';
import { getStep4Fields } from './steps/step4Paralelo.js';

const STEP0_HEADER = {
  title: 'Buscar Estudiante',
  formTitle: 'Información del Estudiante',
  sections: ['buscarEstudiante'],
};

const STEP1_HEADER = {
  title: 'Seleccionar Carrera',
  formTitle: 'Carrera',
  sections: ['carrera'],
};

const STEP2_HEADER = {
  title: 'Periodo y materias',
  formTitle: 'Periodo y materias',
  sections: ['periodoYMaterias'],
};

const STEP3_HEADER = {
  title: 'Paralelo',
  formTitle: 'Paralelo',
  sections: ['resumen', 'paralelos'],
};

/** Crea la configuración de los 4 pasos para WizardForm */
export const createInscripcionNuevaWizardSteps = () => [
  { ...STEP0_HEADER, config: getStep1Fields() }, // Paso visual 1 (stepIndex 0)
  { ...STEP1_HEADER, config: getStep2Fields() }, // Paso visual 2 (stepIndex 1)
  { ...STEP2_HEADER, config: getStep3Fields() }, // Paso visual 3 (stepIndex 2)
  { ...STEP3_HEADER, config: getStep4Fields() }, // Paso visual 4 (stepIndex 3)
];
