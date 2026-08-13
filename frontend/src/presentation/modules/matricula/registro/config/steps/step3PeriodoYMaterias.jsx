/**
 * step3PeriodoYMaterias - Paso 3 del wizard de inscripción (Paso visual 3)
 *
 * La carrera ya fue seleccionada. Aquí se elige el periodo y las materias:
 * - NUEVO: solo primer año, todas las materias pre-seleccionadas (solo lectura).
 * - ANTIGUO: uno o más periodos, marcar las materias que cursará.
 * En el paso 4 se elige el paralelo por periodo.
 */

const PERIODO_MATERIAS_HEADER = {
  title: 'Periodos y materias a cursar',
  description:
    'Los estudiantes nuevos cursan todas las materias del primer año; los antiguos eligen periodos y materias.',
};

const PERIODO_MATERIAS_FIELDS = [
  {
    name: 'infoPeriodoMaterias',
    type: 'alert',
    label: '',
    message: 'Información',
    description: 'Seleccione uno o más periodos. Luego marque las materias que cursará (estudiante antiguo) o revise las del primer año (estudiante nuevo). En los pasos siguientes elija el paralelo y, si aplica, las notas del historial previo.',
    alertType: 'info',
    span: 12,
    required: false,
    className: 'step2-periodo-materias-section__info-alert',
  },
  {
    name: 'periodo',
    type: 'checkboxGroup',
    label: 'Periodo(s) académico(s)',
    placeholder: 'Seleccione uno o más periodos',
    required: true,
    span: 12,
    checkboxLayout: 'vertical',
    className: 'step2-periodo-checkbox',
  },
];

export const getStep3Fields = () => ({
  periodoYMaterias: {
    ...PERIODO_MATERIAS_HEADER,
    fields: PERIODO_MATERIAS_FIELDS,
  },
});
