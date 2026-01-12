/**
 * inscripcionNuevaWizardSteps - Configuración de pasos para el wizard de inscripción de estudiantes nuevos
 * 
 * Single Responsibility: Definir los pasos y su configuración para el wizard de inscripción
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * 
 * Este archivo separa la configuración de los pasos de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los pasos sin tocar el componente.
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

/**
 * Crea la configuración de pasos para el wizard de inscripción de estudiantes nuevos
 * 
 * @returns {Array} Array de configuración de pasos para WizardForm
 */
export const createInscripcionNuevaWizardSteps = () => {
  return [
    {
      title: 'Buscar Estudiante',
      formTitle: 'Información del Estudiante',
      sections: ['buscarEstudiante'],
      config: {
        buscarEstudiante: {
          title: 'Datos del Estudiante',
          fields: [
            // TODO: Se implementarán los campos en pasos siguientes
            // Por ahora solo texto informativo
            {
              name: 'info',
              type: 'text',
              label: 'Información',
              placeholder: 'Buscar estudiante por CI o código...',
              // Este campo será reemplazado por un componente de búsqueda en pasos siguientes
            },
          ],
        },
      },
    },
    {
      title: 'Seleccionar Paralelos',
      formTitle: 'Paralelos Disponibles',
      sections: ['paralelos'],
      config: {
        paralelos: {
          title: 'Paralelos del Período',
          fields: [
            // TODO: Se implementarán los campos en pasos siguientes
            // Por ahora solo texto informativo
            {
              name: 'info',
              type: 'text',
              label: 'Información',
              placeholder: 'Se mostrarán los paralelos disponibles según la carrera del estudiante...',
              // Este campo será reemplazado por un componente de selección en pasos siguientes
            },
          ],
        },
      },
    },
    {
      title: 'Horario de Clases',
      formTitle: 'Configurar Horario',
      sections: ['horario'],
      config: {
        horario: {
          title: 'Horario de Clases',
          fields: [
            // TODO: Se implementarán los campos en pasos siguientes
            // Por ahora solo texto informativo
            {
              name: 'info',
              type: 'text',
              label: 'Información',
              placeholder: 'Se mostrará el horario completo de clases del estudiante...',
              // Este campo será reemplazado por un componente de horario en pasos siguientes
            },
          ],
        },
      },
    },
  ];
};
