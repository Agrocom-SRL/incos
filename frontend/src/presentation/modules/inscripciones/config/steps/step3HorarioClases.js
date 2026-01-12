/**
 * step3HorarioClases - Campos del tercer paso del wizard de inscripción
 * 
 * Single Responsibility: Definir únicamente los fields del paso 3 (Horario de Clases)
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * 
 * Este archivo contiene únicamente la definición de campos del tercer paso,
 * permitiendo modificar los campos sin afectar la estructura del step.
 */

/**
 * Retorna la configuración de campos para el paso 3: Horario de Clases
 * 
 * @returns {Object} Configuración de campos para la sección horario
 */
export const getStep3Fields = () => {
  return {
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
  };
};
