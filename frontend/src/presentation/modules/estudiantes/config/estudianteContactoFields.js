/**
 * estudianteContactoFields - Configuración de campos de contacto para el formulario de registro de estudiantes
 * 
 * Single Responsibility: Definir la configuración de campos de contacto (email, teléfono, dirección)
 * 
 * Este archivo separa la configuración de campos de contacto de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los campos sin tocar el componente.
 * 
 * Estructura de cada campo:
 * - name: Nombre del campo (debe coincidir con el nombre en el backend)
 * - label: Etiqueta visible para el usuario
 * - type: Tipo de campo (input, select, textarea, etc.)
 * - required: Si el campo es obligatorio
 * - span: Ancho del campo en columnas (12 = 50%, 24 = 100%)
 * - options: Opciones para campos select (string para resolver con resolveOptions)
 * - placeholder: Texto de ayuda en el campo
 */

/**
 * Crea los campos de división política para residencia
 * 
 * Nota: El departamento está fijo en Santa Cruz (donde está el instituto)
 * Solo se muestran provincia y municipio
 * 
 * @returns {Array} Array de campos de división política (provincia, municipio)
 */
const createCamposResidencia = () => {
  return [
    {
      name: 'provinciaResidenciaId',
      label: 'Provincia de residencia',
      type: 'select',
      required: false,
      span: 12,
      options: 'provinciasResidencia',
      placeholder: 'Seleccione provincia',
    },
    {
      name: 'municipioResidenciaId',
      label: 'Municipio de residencia',
      type: 'select',
      required: false,
      span: 12,
      options: 'municipiosResidencia',
      placeholder: 'Seleccione municipio',
    },
  ];
};

/**
 * Crea la configuración de campos de contacto para el registro de estudiantes
 * 
 * Los campos de contacto incluyen:
 * - Email personal (input email)
 * - Celular (input tel)
 * - Teléfono fijo (input tel)
 * - División Política de Residencia (departamento, provincia, municipio)
 * - Dirección (textarea)
 * - Zona (input)
 * - Datos laborales: trabaja (switch), empresa/institución, cargo
 * - Observaciones (textarea)
 *
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteContactoFields = () => {
  return {
    contacto: {
      title: 'DATOS REFERENCIALES DEL ESTUDIANTE',
      fields: [
        // Email personal
        {
          name: 'emailPersonal',
          label: 'Email personal',
          type: 'input',
          inputType: 'email',
          required: false,
          span: 12,
          placeholder: 'Ej: juan.perez@email.com',
          maxLength: 150,
        },
        // Celular
        {
          name: 'celular',
          label: 'Celular',
          type: 'input',
          inputType: 'tel',
          required: true,
          span: 12,
          placeholder: 'Ej: 70000000',
          maxLength: 20,
        },
        // Teléfono fijo
        {
          name: 'telefonoFijo',
          label: 'Teléfono fijo',
          type: 'input',
          inputType: 'tel',
          required: false,
          span: 12,
          placeholder: 'Ej: 2123456',
          maxLength: 20,
        },
        // División Política de Residencia
        ...createCamposResidencia(),
        // Zona
        {
          name: 'zona',
          label: 'Localidad / Zona / Barrio',
          type: 'input',
          required: false,
          span: 12,
          placeholder: 'Ej: Localidad: Lagunillas, Zona Sur, Barrio San Pedro',
          maxLength: 100,
        },
        // Dirección
        {
          name: 'direccion',
          label: 'Dirección',
          type: 'textarea',
          required: false,
          span: 12,
          placeholder: 'Ingrese dirección completa',
          rows: 3,
        },
        // Datos laborales: solo si marca "¿Trabaja?" se muestran empresa y cargo
        {
          name: 'trabaja',
          label: '¿El estudiante trabaja?',
          type: 'switch',
          required: false,
          span: 12,
        },
        {
          name: 'empresaInstitucion',
          label: 'Empresa / Institución',
          type: 'input',
          required: false,
          span: 12,
          placeholder: 'Nombre de la empresa o institución donde trabaja',
          maxLength: 200,
          conditional: true,
          dependsOn: 'trabaja',
        },
        {
          name: 'cargo',
          label: 'Cargo',
          type: 'input',
          required: false,
          span: 12,
          placeholder: 'Cargo o puesto que ocupa',
          maxLength: 150,
          conditional: true,
          dependsOn: 'trabaja',
        },
      ],
    },
  };
};

