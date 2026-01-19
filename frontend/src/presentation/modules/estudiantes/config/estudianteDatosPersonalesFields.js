/**
 * estudianteDatosPersonalesFields - Configuración de campos de datos personales para el formulario de registro de estudiantes
 * 
 * Single Responsibility: Definir la configuración de campos de datos personales básicos
 * 
 * Este archivo separa la configuración de campos de datos personales de la lógica del componente,
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
 * Crea la configuración de campos de datos personales para el registro de estudiantes
 * 
 * Los campos de datos personales incluyen:
 * - CI (Cédula de Identidad) y Expedición
 * - Fecha de Nacimiento
 * - Nombres, Apellido Paterno, Apellido Materno
 * - Género
 * - Estado Civil
 * - Tipo de Sangre
 * - Tiene Discapacidad
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteDatosPersonalesFields = () => {
  return {
    datosPersonales: {
      title: 'Datos Personales',
      fields: [
        // CI
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
        // Expedición (NO REQUERIDO)
        {
          name: 'expedicionId',
          label: 'Expedición',
          type: 'select',
          required: false,
          span: 12,
          options: 'expediciones',
          placeholder: 'Seleccione expedición',
        },
        // Apellido Paterno (PRIMERO)
        {
          name: 'apellidoPaterno',
          label: 'Apellido Paterno',
          type: 'input',
          inputType: 'text',
          required: false,
          span: 12,
          placeholder: 'Ej: Pérez',
          maxLength: 100,
          capitalize: true, // Capitaliza automáticamente la primera letra
        },
        // Apellido Materno (NO REQUERIDO)
        {
          name: 'apellidoMaterno',
          label: 'Apellido Materno',
          type: 'input',
          inputType: 'text',
          required: false,
          span: 12,
          placeholder: 'Ej: González',
          maxLength: 100,
          capitalize: true, // Capitaliza automáticamente la primera letra
        },
        // Nombres (DESPUÉS DE APELLIDOS)
        {
          name: 'nombres',
          label: 'Nombres',
          type: 'input',
          inputType: 'text',
          required: true,
          span: 12,
          placeholder: 'Ej: Juan Carlos',
          maxLength: 100,
          capitalize: true, // Capitaliza automáticamente la primera letra
        },
        // Fecha de Nacimiento
        {
          name: 'fechaNacimiento',
          label: 'Fecha de Nacimiento',
          type: 'date',
          required: true,
          span: 12,
          placeholder: 'DD-MM-YYYY o DD/MM/YYYY',
          minAge: null, // Se reemplazará desde el contexto (EDAD_MINIMA_REGISTRO)
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
        // Estado Civil (OPCIONAL según schema)
        {
          name: 'estadoCivilId',
          label: 'Estado Civil',
          type: 'select',
          required: false,
          span: 12,
          options: 'estadosCiviles',
          placeholder: 'Seleccione estado civil',
        },
        // Tipo de Sangre (OPCIONAL según schema)
        {
          name: 'tipoSangre',
          label: 'Tipo de Sangre',
          type: 'select',
          required: false,
          span: 12,
          options: 'tiposSangre',
          placeholder: 'Seleccione tipo de sangre',
        },
        // Tiene Discapacidad (OPCIONAL según schema, tiene DEFAULT FALSE)
        {
          name: 'tieneDiscapacidad',
          label: 'Tiene Discapacidad',
          type: 'switch',
          required: false,
          span: 12,
          defaultChecked: false,
          checkedChildren: 'Sí',
          unCheckedChildren: 'No',
        },
        // Es Traspaso (OPCIONAL - para marcar si es estudiante por traspaso)
        {
          name: 'esTraspaso',
          label: 'Es Traspaso',
          type: 'switch',
          required: false,
          span: 12,
          defaultChecked: false,
          checkedChildren: 'Sí',
          unCheckedChildren: 'No',
          tooltip: 'Marcar si el estudiante viene por traspaso de otra sede',
        },
      ],
    },
  };
};

