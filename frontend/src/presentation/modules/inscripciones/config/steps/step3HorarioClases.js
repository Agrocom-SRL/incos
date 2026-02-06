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
          name: 'infoGestionAcademica',
          type: 'alert',
          label: '',
          message: 'Gestión académica',
          description: 'Si el estudiante es de ingreso nuevo se usará la gestión vigente. Si es antiguo, la gestión se recupera de sus datos académicos.',
          alertType: 'info',
          span: 24,
          required: false,
        },
        {
          name: 'resumenInscripcion',
          type: 'alert',
          label: '',
          message: 'Resumen de Inscripción',
          description: '', // Se enriquecerá dinámicamente por el enricher con los datos seleccionados
          alertType: 'info',
          span: 24,
          required: false,
          // Este campo se enriquecerá por el enricher enrichResumenInscripcionField
          // Mostrará: Estudiante, Carrera, Paralelo (con turno y periodo)
        },
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
