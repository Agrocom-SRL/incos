/**
 * step1SeleccionarCarrera - Paso 1: Seleccionar Carrera
 *
 * Orden del wizard: 0=Buscar estudiante, 1=Carrera, 2=Periodo y Paralelos, 3=Horario.
 * Si el estudiante es nuevo se usa la gestión vigente; si es antiguo la gestión
 * se recupera de sus datos académicos.
 */

const CARRERA_HEADER = {
  title: 'Seleccionar Carrera',
};

const CARRERA_FIELDS = [
  {
    name: 'estudianteSeleccionado',
    type: 'alert',
    label: '',
    message: 'Estudiante Seleccionado',
    description: '',
    alertType: 'success',
    span: 24,
    required: false,
  },
  {
    name: 'carrera',
    type: 'select',
    label: 'Carrera',
    placeholder: 'Seleccione una carrera',
    required: true,
    span: 12,
  },
];

export const getStep1CarreraFields = () => ({
  carrera: {
    ...CARRERA_HEADER,
    fields: CARRERA_FIELDS,
  },
});
