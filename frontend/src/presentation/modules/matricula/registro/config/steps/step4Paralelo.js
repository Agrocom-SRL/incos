/**
 * step4Paralelo - Paso 4 del wizard de inscripción (Paso visual 4)
 * 
 * Single Responsibility: Definir únicamente los fields del paso 4 (Paralelo)
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * 
 * Este archivo contiene únicamente la definición de campos del cuarto paso,
 * permitiendo modificar los campos sin afectar la estructura del step.
 */

/**
 * Retorna la configuración de campos para el paso 4: Paralelo
 * - Sección resumen: Resumen de inscripción (estudiante, carrera, paralelo) arriba
 * - Sección paralelos: lista de paralelos por periodo (enriquecida con datos y renderItem)
 *
 * @returns {Object} Configuración de campos para las secciones resumen y paralelos
 */
export const getStep4Fields = () => {
  return {
    resumen: {
      title: 'Resumen de inscripción',
      description:
        'Verifique el estudiante, la carrera y las materias seleccionadas antes de elegir el paralelo.',
      fields: [
        {
          name: 'resumenInscripcion',
          type: 'alert',
          label: '',
          message: 'Resumen de inscripción',
          description: '', // Se enriquecerá dinámicamente por el enricher con los datos seleccionados
          alertType: 'info',
          span: 24,
          required: false,
        },
      ],
    },
    paralelos: {
      title: 'Paralelos por periodo',
      description:
        'Cada tarjeta muestra el turno y la cantidad de inscritos; seleccione una por periodo.',
      fields: [
        {
          name: 'listaParalelos',
          type: 'cards',
          label: '',
          span: 24,
          required: false,
          emptyMessage: 'No hay paralelos en este periodo.',
        },
      ],
    },
  };
};
