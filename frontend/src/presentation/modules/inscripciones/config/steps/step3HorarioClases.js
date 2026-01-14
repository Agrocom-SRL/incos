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
        {
          name: 'horarioClases',
          type: 'timetable',
          label: '',
          span: 24,
          required: false,
          // El enricher agregará schedule, loading, config, etc.
          // Por ahora se define como campo vacío que será enriquecido
        },
      ],
    },
  };
};
