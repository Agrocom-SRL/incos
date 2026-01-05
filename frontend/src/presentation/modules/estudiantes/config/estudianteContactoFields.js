/**
 * estudianteContactoFields - Configuración de campos de contacto para el formulario de registro de estudiantes
 * 
 * Single Responsibility: Definir la configuración de campos de contacto (email, teléfono)
 * 
 * Este archivo separa la configuración de campos de contacto de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los campos sin tocar el componente.
 * 
 * Estructura de cada campo:
 * - name: Nombre del campo (debe coincidir con el nombre en el backend)
 * - label: Etiqueta visible para el usuario
 * - type: Tipo de campo (input, select, date, etc.)
 * - required: Si el campo es obligatorio
 * - span: Ancho del campo en columnas (12 = 50%, 24 = 100%)
 * - placeholder: Texto de ayuda en el campo
 */

/**
 * Crea la configuración de campos de contacto para el registro de estudiantes
 * 
 * Los campos de contacto incluyen:
 * - Email Personal
 * - Celular
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteContactoFields = () => {
  return {
    contacto: {
      title: 'Datos de Contacto',
      fields: [
        // Email Personal
        {
          name: 'emailPersonal',
          label: 'Email Personal',
          type: 'input',
          inputType: 'email',
          required: false,
          span: 12,
          placeholder: 'Ej: juan.perez@email.com',
          maxLength: 255,
        },
        // Celular
        {
          name: 'celular',
          label: 'Celular',
          type: 'input',
          inputType: 'tel',
          required: false,
          span: 12,
          placeholder: 'Ej: 70000000',
          maxLength: 15,
        },
      ],
    },
  };
};

