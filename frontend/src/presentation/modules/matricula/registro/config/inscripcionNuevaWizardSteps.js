/**
 * inscripcionNuevaWizardSteps - Configuración del wizard de inscripción
 *
 * Orden (stepIndex 0-based):
 * - 0: Buscar estudiante
 * - 1: Carrera
 * - 2: Periodo y materias
 * - 3: Paralelo
 * - 4: Historial de notas (solo ANTIGUO, TRASPASO, TRANSITABILIDAD) — último paso antes de finalizar
 */

import { WIZARD_SECTION_HISTORIAL } from '@application-matricula/registro/utils/matriculaWizardStepConfig';
import { getStep1Fields } from './steps/step1BuscarEstudiante.jsx';
import { getStep2Fields } from './steps/step2SeleccionarCarrera.js';
import { getStep3Fields } from './steps/step3PeriodoYMaterias.jsx';
import { getStep4Fields } from './steps/step4Paralelo.js';
import { getStepHistorialPrevioFields } from './steps/step5HistorialPrevio.js';

const STEP0_HEADER = {
  title: 'Buscar estudiante',
  formTitle: 'Información del estudiante',
  description:
    'Busque al estudiante por cédula de identidad, código o nombre y selecciónelo en la lista de resultados.',
  sections: ['buscarEstudiante'],
};

const STEP1_HEADER = {
  title: 'Seleccionar carrera',
  formTitle: 'Selección de carrera',
  description:
    'Confirme la carrera en la que se inscribirá el estudiante; la gestión académica se asigna automáticamente.',
  sections: ['carrera'],
};

const STEP2_HEADER = {
  title: 'Periodo y materias',
  formTitle: 'Periodo y materias',
  description:
    'Seleccione los periodos académicos y marque las materias que el estudiante cursará en esta gestión.',
  sections: ['periodoYMaterias'],
};

const STEP3_HEADER = {
  title: 'Paralelo',
  formTitle: 'Selección de paralelo',
  description:
    'Revise el resumen de la inscripción y elija un paralelo por cada periodo seleccionado.',
  sections: ['resumen', 'paralelos'],
};

const STEP_HISTORIAL_HEADER = {
  title: 'Historial de notas',
  formTitle: 'Historial de notas',
  description:
    'Registre las notas de las materias ya cursadas para completar el historial académico del estudiante.',
  sections: [WIZARD_SECTION_HISTORIAL],
};

/**
 * @param {boolean} [includeHistorialPrevio=false] - Paso extra para antiguo / traspaso / transitabilidad
 */
export const createInscripcionNuevaWizardSteps = (includeHistorialPrevio = false) => {
  const steps = [
    { ...STEP0_HEADER, config: getStep1Fields() },
    { ...STEP1_HEADER, config: getStep2Fields() },
    { ...STEP2_HEADER, config: getStep3Fields() },
    { ...STEP3_HEADER, config: getStep4Fields() },
  ];
  if (includeHistorialPrevio) {
    steps.push({ ...STEP_HISTORIAL_HEADER, config: getStepHistorialPrevioFields() });
  }
  return steps;
};
