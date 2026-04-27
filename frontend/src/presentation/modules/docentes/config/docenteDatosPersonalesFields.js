/**
 * Campos del paso «Datos personales» del wizard docente (FormSection / FormField).
 * Residencia: solo provincias y municipios del departamento Santa Cruz (seed id = 1).
 */

const PRESERVE = { preserve: true };

/** Departamento base para residencia del docente — coincide con `02-seed-departamentos.sql` (Santa Cruz = 1). */
export const DOCENTE_RESIDENCIA_DEPARTAMENTO_ID = 1;

/** Nombres de `name` en el formulario (paso 1) — para validateFields al avanzar. */
export const DOCENTE_DATOS_PERSONALES_FIELD_NAMES = [
  'nombres',
  'apellidoPaterno',
  'apellidoMaterno',
  'ci',
  'expedicion',
  'genero',
  'fechaNacimiento',
  'estadoCivilId',
  'nacionalidad',
  'residenciaProvinciaId',
  'municipioResidenciaId',
  'celular',
  'telefono',
  'emailPersonal',
  'zona',
  'direccion',
];

const identidadFields = {
  title: 'IDENTIDAD',
  fields: [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'input',
      inputType: 'text',
      required: true,
      span: 12,
      placeholder: 'Ej: Juan Carlos',
      maxLength: 150,
      capitalize: true,
      ...PRESERVE,
    },
    {
      name: 'apellidoPaterno',
      label: 'Apellido paterno',
      type: 'input',
      inputType: 'text',
      required: true,
      span: 12,
      placeholder: 'Ej: Pérez',
      maxLength: 100,
      capitalize: true,
      ...PRESERVE,
    },
    {
      name: 'apellidoMaterno',
      label: 'Apellido materno',
      type: 'input',
      inputType: 'text',
      required: false,
      span: 12,
      placeholder: 'Ej: González',
      maxLength: 100,
      capitalize: true,
      ...PRESERVE,
    },
    {
      name: 'ci',
      label: 'CI (Cédula de identidad)',
      type: 'input',
      inputType: 'text',
      required: true,
      span: 12,
      placeholder: 'Ej: 1234567',
      maxLength: 25,
      ...PRESERVE,
    },
    {
      name: 'expedicion',
      label: 'Expedición',
      type: 'select',
      required: false,
      span: 12,
      options: 'expedicionesDocente',
      placeholder: 'Seleccione expedición',
      ...PRESERVE,
    },
    {
      name: 'genero',
      label: 'Género',
      type: 'select',
      required: true,
      span: 12,
      options: 'generosDocente',
      placeholder: 'Seleccione género',
      ...PRESERVE,
    },
    {
      name: 'fechaNacimiento',
      label: 'Fecha de nacimiento',
      type: 'date',
      required: true,
      span: 12,
      placeholder: 'YYYY-MM-DD',
      ...PRESERVE,
    },
  ],
};

// Estado civil y nacionalidad quedan dentro de identidad/datos personales.
identidadFields.fields.push(
  {
    name: 'estadoCivilId',
    label: 'Estado civil',
    type: 'select',
    required: false,
    span: 12,
    options: 'estadosCivilesDocente',
    placeholder: 'Seleccione estado civil',
    ...PRESERVE,
  },
  {
    name: 'nacionalidad',
    label: 'Nacionalidad',
    type: 'input',
    inputType: 'text',
    required: false,
    span: 12,
    placeholder: 'Ej: Boliviana',
    maxLength: 50,
    ...PRESERVE,
  }
);

const contactoDomicilioFields = {
  title: 'CONTACTO Y DOMICILIO',
  fields: [
    // Residencia forma parte de contacto y domicilio.
    {
      name: 'residenciaProvinciaId',
      label: 'Provincia de residencia',
      type: 'select',
      required: false,
      span: 12,
      options: 'docenteProvinciasResidencia',
      placeholder: 'Seleccione provincia',
      description: 'Solo se listan provincias del departamento Santa Cruz.',
      ...PRESERVE,
    },
    {
      name: 'municipioResidenciaId',
      label: 'Municipio de residencia',
      type: 'select',
      required: false,
      span: 12,
      options: 'docenteMunicipiosResidencia',
      placeholder: 'Seleccione municipio',
      ...PRESERVE,
    },
    {
      name: 'celular',
      label: 'Celular',
      type: 'input',
      inputType: 'tel',
      required: true,
      span: 12,
      placeholder: 'Ej: 70000000',
      maxLength: 20,
      ...PRESERVE,
    },
    {
      name: 'telefono',
      label: 'Teléfono fijo',
      type: 'input',
      inputType: 'tel',
      required: false,
      span: 12,
      placeholder: 'Ej: 2123456',
      maxLength: 20,
      ...PRESERVE,
    },
    {
      name: 'emailPersonal',
      label: 'Correo personal',
      type: 'input',
      inputType: 'email',
      required: false,
      span: 12,
      placeholder: 'correo@ejemplo.com',
      maxLength: 150,
      rules: [{ type: 'email', message: 'Correo inválido' }],
      ...PRESERVE,
    },
    {
      name: 'zona',
      label: 'Zona / barrio',
      type: 'input',
      inputType: 'text',
      required: false,
      span: 12,
      placeholder: 'Localidad o zona',
      maxLength: 100,
      ...PRESERVE,
    },
    {
      name: 'direccion',
      label: 'Dirección',
      type: 'textarea',
      required: false,
      span: 12,
      placeholder: 'Dirección completa',
      rows: 3,
      maxLength: 2000,
      ...PRESERVE,
    },
  ],
};

/**
 * @returns {{
 *  identidad: { title: string, fields: Object[] },
 *  contactoDomicilio: { title: string, fields: Object[] }
 * }}
 */
export function createDocenteDatosPersonalesFields() {
  return {
    identidad: identidadFields,
    contactoDomicilio: contactoDomicilioFields,
  };
}
