/**
 * Campos del paso «Formación y laboral» del wizard docente (FormSection por sección en el wizard).
 * Opciones alineadas a ENUM del backend (docentes.constants / modelo Sequelize).
 */

const PRESERVE = { preserve: true };

const NIVEL_ACADEMICO_OPTIONS = [
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'LICENCIATURA', label: 'Licenciatura' },
  { value: 'MAESTRIA', label: 'Maestría' },
  { value: 'DOCTORADO', label: 'Doctorado' },
];

const TIPO_CONTRATO_OPTIONS = [
  { value: 'PLANTA', label: 'Planta' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'HORARIO', label: 'Horario' },
  { value: 'CONSULTOR', label: 'Consultor' },
];

const ESTADO_LABORAL_OPTIONS = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'LICENCIA', label: 'Licencia' },
  { value: 'RETIRADO', label: 'Retirado' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
];

/** Nombres en el formulario (paso 2), incluidos los de subsecciones. */
export const DOCENTE_FORMACION_LABORAL_FIELD_NAMES = [
  'tituloProfesional',
  'especialidad',
  'nivelAcademico',
  'institucionEgreso',
  'anioEgreso',
  'aniosExperiencia',
  'tipoContrato',
  'estadoLaboral',
  'fechaContratacion',
  'fechaRetiro',
  'observaciones',
  'activo',
];

const createCamposFormacion = () => [
  {
    name: 'tituloProfesional',
    label: 'Título profesional',
    type: 'input',
    inputType: 'text',
    required: false,
    span: 12,
    maxLength: 200,
    ...PRESERVE,
  },
  {
    name: 'especialidad',
    label: 'Especialidad',
    type: 'input',
    inputType: 'text',
    required: false,
    span: 12,
    maxLength: 200,
    ...PRESERVE,
  },
  {
    name: 'nivelAcademico',
    label: 'Nivel académico',
    type: 'select',
    required: false,
    span: 12,
    options: NIVEL_ACADEMICO_OPTIONS,
    placeholder: 'Seleccione nivel',
    ...PRESERVE,
  },
  {
    name: 'institucionEgreso',
    label: 'Institución de egreso',
    type: 'input',
    inputType: 'text',
    required: false,
    span: 12,
    maxLength: 200,
    ...PRESERVE,
  },
  {
    name: 'anioEgreso',
    label: 'Año de egreso',
    type: 'input',
    inputType: 'number',
    required: false,
    span: 12,
    placeholder: 'Ej: 2020',
    ...PRESERVE,
  },
  {
    name: 'aniosExperiencia',
    label: 'Años de experiencia',
    type: 'input',
    inputType: 'number',
    required: false,
    span: 12,
    placeholder: '0',
    ...PRESERVE,
  },
];

const createCamposCondicionLaboral = () => [
  {
    name: 'tipoContrato',
    label: 'Tipo de contrato',
    type: 'select',
    required: false,
    span: 12,
    options: TIPO_CONTRATO_OPTIONS,
    placeholder: 'Seleccione tipo',
    ...PRESERVE,
  },
  {
    name: 'estadoLaboral',
    label: 'Estado laboral',
    type: 'select',
    required: false,
    span: 12,
    options: ESTADO_LABORAL_OPTIONS,
    placeholder: 'Seleccione estado',
    ...PRESERVE,
  },
  {
    name: 'fechaContratacion',
    label: 'Fecha de contratación',
    type: 'date',
    required: false,
    span: 12,
    placeholder: 'YYYY-MM-DD',
    ...PRESERVE,
  },
  {
    name: 'fechaRetiro',
    label: 'Fecha de retiro',
    type: 'date',
    required: false,
    span: 12,
    placeholder: 'YYYY-MM-DD',
    ...PRESERVE,
  },
  {
    name: 'observaciones',
    label: 'Observaciones',
    type: 'textarea',
    required: false,
    span: 12,
    rows: 3,
    maxLength: 5000,
    ...PRESERVE,
  },
  {
    name: 'activo',
    label: 'Registro activo',
    type: 'switch',
    required: false,
    span: 12,
    defaultChecked: true,
    checkedChildren: 'Activo',
    unCheckedChildren: 'Inactivo',
    ...PRESERVE,
  },
];

/**
 * @returns {{
 *  formacionAcademica: { title: string, fields: Object[] },
 *  condicionLaboral: { title: string, fields: Object[] }
 * }}
 */
export function createDocenteFormacionLaboralFields() {
  return {
    formacionAcademica: {
      title: 'FORMACIÓN ACADÉMICA',
      fields: createCamposFormacion(),
    },
    condicionLaboral: {
      title: 'CONDICIÓN LABORAL',
      fields: createCamposCondicionLaboral(),
    },
  };
}
