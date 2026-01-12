/**
 * step1BuscarEstudiante - Campos del primer paso del wizard de inscripción
 * 
 * Single Responsibility: Definir únicamente los fields del paso 1 (Buscar Estudiante)
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * 
 * Este archivo contiene únicamente la definición de campos del primer paso,
 * permitiendo modificar los campos sin afectar la estructura del step.
 */

/**
 * Configuración de cabecera de la sección buscarEstudiante
 * 
 * Estos datos pueden depender de configuraciones globales o del estado del wizard
 */
const BUSCAR_ESTUDIANTE_HEADER = {
  title: 'Datos del Estudiante',
};

/**
 * Configuración de campos para la sección buscarEstudiante
 * 
 * Estos campos pueden depender de configuraciones o validaciones dinámicas
 */
const BUSCAR_ESTUDIANTE_FIELDS = [

  {
    name: 'carnetEstudiante',
    type: 'search',
    label: 'Buscar Estudiante',
    placeholder: 'Ej: 1234567 o EST-2025-0001',
    required: true,
    span: 12,
    allowClear: true,
  },
  {
    name: 'infoBusqueda',
    type: 'alert',
    label: '',
    message: 'Instrucciones de búsqueda',
    description: 'Ingrese el CI (Cédula de Identidad) o el código de estudiante para buscar. Una vez encontrado el estudiante, se mostrarán sus datos académicos y podrá continuar al siguiente paso.',
    alertType: 'info',
    span: 12,
    required: false,
  },
];

/**
 * Retorna la configuración de campos para el paso 1: Buscar Estudiante
 * 
 * @returns {Object} Configuración de campos para la sección buscarEstudiante
 */
export const getStep1Fields = () => {
  return {
    buscarEstudiante: {
      ...BUSCAR_ESTUDIANTE_HEADER,
      fields: BUSCAR_ESTUDIANTE_FIELDS,
    },
  };
};
