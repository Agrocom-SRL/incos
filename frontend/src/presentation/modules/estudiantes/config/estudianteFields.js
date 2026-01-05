/**
 * estudianteFields - Configuración de campos para el formulario de registro de estudiantes
 * 
 * Single Responsibility: Definir la configuración de campos básicos para el formulario de registro
 * 
 * Este archivo separa la configuración de campos de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los campos sin tocar el componente.
 * 
 * Estructura de cada campo:
 * - name: Nombre del campo (debe coincidir con el nombre en el backend)
 * - label: Etiqueta visible para el usuario
 * - type: Tipo de campo (input, select, date, etc.)
 * - required: Si el campo es obligatorio
 * - span: Ancho del campo en columnas (12 = 50%, 24 = 100%)
 * - options: Opciones para campos select (string para resolver con resolveOptions, o array)
 * - placeholder: Texto de ayuda en el campo
 */

/**
 * Crea la configuración de campos básicos para el registro de estudiantes
 * 
 * Los campos básicos incluyen:
 * - CI (Cédula de Identidad) y Expedición
 * - Nombres, Apellido Paterno, Apellido Materno
 * - Género
 * - Email Personal
 * - Celular
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteFields = () => {
  return {
    datosPersonales: {
      title: 'Datos Personales',
      fields: [
        // CI y Expedición
        {
          name: 'ci',
          label: 'CI (Cédula de Identidad)',
          type: 'input',
          inputType: 'text',
          required: true,
          span: 12,
          placeholder: 'Ej: 1234567',
          maxLength: 15,
        },
        {
          name: 'expedicionId',
          label: 'Expedición',
          type: 'select',
          required: true,
          span: 12,
          options: 'expediciones',
          placeholder: 'Seleccione expedición',
        },
        // Nombres
        {
          name: 'nombres',
          label: 'Nombres',
          type: 'input',
          inputType: 'text',
          required: true,
          span: 12,
          placeholder: 'Ej: Juan Carlos',
          maxLength: 100,
        },
        // Apellidos
        {
          name: 'apellidoPaterno',
          label: 'Apellido Paterno',
          type: 'input',
          inputType: 'text',
          required: true,
          span: 12,
          placeholder: 'Ej: Pérez',
          maxLength: 100,
        },
        {
          name: 'apellidoMaterno',
          label: 'Apellido Materno',
          type: 'input',
          inputType: 'text',
          required: false,
          span: 12,
          placeholder: 'Ej: González',
          maxLength: 100,
        },
        // Género
        {
          name: 'generoId',
          label: 'Género',
          type: 'select',
          required: true,
          span: 12,
          options: 'generos',
          placeholder: 'Seleccione género',
        },
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

