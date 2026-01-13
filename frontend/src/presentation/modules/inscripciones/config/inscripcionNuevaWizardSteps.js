/**
 * inscripcionNuevaWizardSteps - Configuración de pasos para el wizard de inscripción de estudiantes nuevos
 * 
 * Single Responsibility: Orquestar y combinar todos los steps del wizard
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * 
 * Este archivo define la estructura común de cada step (title, formTitle, sections)
 * y combina los fields que vienen de archivos separados por step.
 * 
 * Estructura de cada step:
 * - title: Título del paso (se muestra en el indicador de Steps)
 * - formTitle: Título del formulario del paso (opcional)
 * - sections: Array de secciones a mostrar en este paso
 * - config: Configuración completa del formulario (secciones con campos)
 * 
 * Pasos del wizard:
 * 1. Buscar información del estudiante (con datos académicos)
 * 2. Mostrar paralelos del período según su carrera
 * 3. Armar horario de clases mostrando horarios
 */

import { getStep1Fields } from './steps/step1BuscarEstudiante.jsx';
import { getStep2Fields } from './steps/step2SeleccionarParalelos';
import { getStep3Fields } from './steps/step3HorarioClases';

/**
 * Configuración de cabecera del paso 1: Buscar Estudiante
 * 
 * Estos datos pueden depender de otros steps o configuraciones globales
 */
const STEP1_HEADER = {
  title: 'Buscar Estudiante',
  formTitle: 'Información del Estudiante',
  sections: ['buscarEstudiante'],
};

/**
 * Configuración de cabecera del paso 2: Seleccionar Paralelos
 * 
 * Estos datos pueden depender del paso 1 (estudiante seleccionado)
 */
const STEP2_HEADER = {
  title: 'Seleccionar Paralelos',
  formTitle: 'Paralelos Disponibles',
  sections: ['paralelos'],
};

/**
 * Configuración de cabecera del paso 3: Horario de Clases
 * 
 * Estos datos pueden depender de los pasos anteriores (estudiante y paralelos seleccionados)
 */
const STEP3_HEADER = {
  title: 'Horario de Clases',
  formTitle: 'Configurar Horario',
  sections: ['horario'],
};

/**
 * Crea la configuración completa de pasos para el wizard de inscripción de estudiantes nuevos
 * 
 * @returns {Array} Array de configuración de pasos para WizardForm
 */
export const createInscripcionNuevaWizardSteps = () => {
  return [
    {
      ...STEP1_HEADER,
      config: getStep1Fields(),
    },
    {
      ...STEP2_HEADER,
      config: getStep2Fields(),
    },
    {
      ...STEP3_HEADER,
      config: getStep3Fields(),
    },
  ];
};
