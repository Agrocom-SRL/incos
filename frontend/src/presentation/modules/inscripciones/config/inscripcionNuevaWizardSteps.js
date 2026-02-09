/**
 * inscripcionNuevaWizardSteps - Configuración de los 4 pasos del wizard de inscripción
 *
 * Orden según flujo de INSCRIPCIÓN (turno + materias; horario es solo visualización):
 * - Paso 0: Buscar estudiante
 * - Paso 1: Seleccionar carrera
 * - Paso 2: Periodo y materias (elegir periodo(s) y qué materias cursar; paralelos por periodo)
 * - Paso 3: Paralelo y horario (elegir turno/paralelo, ver resumen de horario)
 *
 * La matriculación (horarios concretos, aulas, cupos) es concepto separado.
 * Un archivo por paso: step0, step1, step2, step3.
 */

import { getStep0Fields } from './steps/step0BuscarEstudiante.jsx';
import { getStep1CarreraFields } from './steps/step1SeleccionarCarrera.js';
import { getStep2PeriodoYMateriasFields } from './steps/step2PeriodoYMaterias.jsx';
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
  title: 'Periodo y materias',
  formTitle: 'Periodo y materias',
  sections: ['periodoYMaterias'],
};

const STEP3_HEADER = {
  title: 'Paralelo y horario',
  formTitle: 'Paralelo y horario',
  sections: ['horario'],
};

/** Crea la configuración de los 4 pasos para WizardForm */
export const createInscripcionNuevaWizardSteps = () => [
  { ...STEP0_HEADER, config: getStep0Fields() },
  { ...STEP1_HEADER, config: getStep1CarreraFields() },
  { ...STEP2_HEADER, config: getStep2PeriodoYMateriasFields() },
  { ...STEP3_HEADER, config: getStep3Fields() },
];
