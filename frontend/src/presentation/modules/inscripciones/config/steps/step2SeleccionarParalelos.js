/**
 * step2SeleccionarParalelos - Campos del segundo paso del wizard de inscripción
 * 
 * Single Responsibility: Definir únicamente los fields del paso 2 (Seleccionar Paralelos)
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * 
 * Este archivo contiene únicamente la definición de campos del segundo paso,
 * permitiendo modificar los campos sin afectar la estructura del step.
 */

/**
 * Retorna la configuración de campos para el paso 2: Seleccionar Paralelos
 * 
 * @returns {Object} Configuración de campos para la sección paralelos
 */
export const getStep2Fields = () => {
  return {
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
  };
};
