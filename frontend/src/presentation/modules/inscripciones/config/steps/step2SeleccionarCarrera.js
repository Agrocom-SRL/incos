/**
 * step2SeleccionarCarrera - Paso 2 del wizard de inscripción (Paso visual 2)
 *
 * Orden del wizard visual: 1=Buscar estudiante, 2=Carrera, 3=Periodo y materias, 4=Paralelo.
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

export const getStep2Fields = () => ({
  carrera: {
    ...CARRERA_HEADER,
    fields: CARRERA_FIELDS,
  },
});
