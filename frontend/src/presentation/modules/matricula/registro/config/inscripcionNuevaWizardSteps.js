/**
 * inscripcionNuevaWizardSteps - Configuración del wizard de inscripción
 *
 * El array de pasos es dinámico y sigue el ORDEN de la meta
 * (matriculaWizardStepConfig.createMatriculaWizardStepMeta):
 * - Buscar estudiante (siempre)
 * - Carrera y plan (solo estudiantes nuevos en el sistema)
 * - Periodo y materias (siempre)
 * - Paralelo (siempre)
 * - Historial de notas (ANTIGUO/TRASPASO/TRANSITABILIDAD sin historial digital)
 */

import { WIZARD_SECTION_HISTORIAL } from '@application-matricula/registro/utils/matriculaWizardStepConfig';
import { getStep1Fields } from './steps/step1BuscarEstudiante.jsx';
import { getStep2Fields } from './steps/step2SeleccionarCarrera.js';
import { getStep3Fields } from './steps/step3PeriodoYMaterias.jsx';
import { getStep4Fields } from './steps/step4Paralelo.js';
import { getStepHistorialPrevioFields } from './steps/step5HistorialPrevio.js';

const STEP_BUSCAR_HEADER = {
  title: 'Buscar estudiante',
  formTitle: 'Información del estudiante',
  description:
    'Busque al estudiante por cédula de identidad, código o nombre y selecciónelo en la lista de resultados.',
  sections: ['buscarEstudiante'],
};

const STEP_CARRERA_HEADER = {
  title: 'Carrera y plan',
  formTitle: 'Carrera y plan de estudio',
  description:
    'Confirme la carrera en la que se inscribirá el estudiante y, si la carrera tiene más de un plan habilitado, elija el plan de estudio; la gestión académica se asigna automáticamente.',
  sections: ['carrera'],
};

const STEP_PERIODO_HEADER = {
  title: 'Periodo y materias',
  formTitle: 'Periodo y materias',
  description:
    'Seleccione los periodos académicos y marque las materias que el estudiante cursará en esta gestión.',
  sections: ['periodoYMaterias'],
};

const STEP_PARALELO_HEADER = {
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

/** Config de cada paso por clave de la meta (mismo vocabulario que indices/stepNumbers). */
const STEP_BUILDERS = {
  buscar: () => ({ ...STEP_BUSCAR_HEADER, config: getStep1Fields() }),
  carrera: () => ({ ...STEP_CARRERA_HEADER, config: getStep2Fields() }),
  periodo: () => ({ ...STEP_PERIODO_HEADER, config: getStep3Fields() }),
  paralelo: () => ({ ...STEP_PARALELO_HEADER, config: getStep4Fields() }),
  historial: () => ({ ...STEP_HISTORIAL_HEADER, config: getStepHistorialPrevioFields() }),
};

/**
 * @param {Object} stepMeta - Meta de createMatriculaWizardStepMeta (usa stepMeta.order)
 */
export const createInscripcionNuevaWizardSteps = (stepMeta) => {
  const order = Array.isArray(stepMeta?.order)
    ? stepMeta.order
    : ['buscar', 'carrera', 'periodo', 'paralelo'];
  return order.map((key) => STEP_BUILDERS[key]()).filter(Boolean);
};
