/**
 * inscripcionNuevaWizardSteps - Configuración de los 4 pasos del wizard de inscripción
 *
 * Orden según flujo y schema (estudiantes_datos_academicos, carreras, periodos, paralelos, horarios):
 * - Paso 0: Buscar estudiante
 * - Paso 1: Seleccionar carrera (gestión: nuevo = vigente, antiguo = datos académicos)
 * - Paso 2: Periodo y paralelos (materias para armar horario)
 * - Paso 3: Horario de clases
 *
 * Un archivo por paso: step0, step1, step2, step3.
 */

import { getStep0Fields } from './steps/step0BuscarEstudiante.jsx';
import { getStep1CarreraFields } from './steps/step1SeleccionarCarrera.js';
import { getStep2PeriodoYParalelosFields } from './steps/step2PeriodoYParalelos.jsx';
import { getStep3Fields } from './steps/step3HorarioClases';

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
  title: 'Periodo y Paralelos',
  formTitle: 'Periodo y Paralelos',
  sections: ['periodoYParalelos'],
};

const STEP3_HEADER = {
  title: 'Horario de Clases',
  formTitle: 'Configurar Horario',
  sections: ['horario'],
};

/** Crea la configuración de los 4 pasos para WizardForm */
export const createInscripcionNuevaWizardSteps = () => [
  { ...STEP0_HEADER, config: getStep0Fields() },
  { ...STEP1_HEADER, config: getStep1CarreraFields() },
  { ...STEP2_HEADER, config: getStep2PeriodoYParalelosFields() },
  { ...STEP3_HEADER, config: getStep3Fields() },
];
