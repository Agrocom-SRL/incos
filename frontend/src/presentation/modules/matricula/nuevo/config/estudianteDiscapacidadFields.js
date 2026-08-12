/**
 * estudianteDiscapacidadFields - Configuración de campos de discapacidad para el formulario de registro de estudiantes
 * 
 * Single Responsibility: Definir la configuración de campos de discapacidad
 * 
 * Este archivo separa la configuración de campos de discapacidad de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los campos sin tocar el componente.
 * 
 * Estructura de cada campo:
 * - name: Nombre del campo (debe coincidir con el nombre en el backend)
 * - label: Etiqueta visible para el usuario
 * - type: Tipo de campo (input, select, textarea, etc.)
 * - required: Si el campo es obligatorio
 * - span: Ancho del campo en columnas (12 = 50%, 24 = 100%)
 * - options: Opciones para campos select (string para resolver con resolveOptions, o array)
 * - placeholder: Texto de ayuda en el campo
 */

/**
 * Crea la configuración de campos de discapacidad para el registro de estudiantes
 * 
 * Los campos de discapacidad incluyen:
 * - Tipo de discapacidad (select)
 * - Descripción (textarea)
 * - Grado de discapacidad (radio)
 * - Causa (textarea)
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteDiscapacidadFields = () => {
  return {
    discapacidad: {
      title: 'Datos de discapacidad',
      fields: [
        // Tipo de discapacidad
        {
          name: 'tipoDiscapacidadId',
          label: 'Tipo de discapacidad',
          type: 'select',
          required: true,
          span: 12,
          options: 'discapacidades',
          placeholder: 'Seleccione tipo de discapacidad',
        },
        // Grado de discapacidad
        {
          name: 'gradoDiscapacidad',
          label: 'Grado de discapacidad',
          type: 'radio',
          required: true,
          span: 12,
          options: 'gradosDiscapacidad',
        },
        // Causa
        {
          name: 'causa',
          label: 'Causa',
          type: 'textarea',
          required: false,
          span: 12,
          placeholder: 'Ej: Congénito, Adquirido, Accidente de tránsito, Enfermedad crónica, etc.',
          maxLength: 100,
          rows: 4,
        },
        // Descripción
        {
          name: 'descripcion',
          label: 'Descripción',
          type: 'textarea',
          required: false,
          span: 12,
          placeholder: 'Descripción detallada de la discapacidad (ej: grado de ceguera, tipo de problema visual, etc.)',
          rows: 4,
        },
      ],
    },
  };
};

