/**
 * step2PeriodoYParalelos - Paso 2: Periodo y materias
 *
 * La carrera ya fue seleccionada. Aquí se elige el periodo y las materias:
 * - NUEVO: solo primer año, todas las materias pre-seleccionadas (solo lectura).
 * - ANTIGUO: uno o más periodos, marcar las materias que cursará.
 * En el paso 3 se elige el paralelo por periodo.
 */

import './step2PeriodoYParalelos.css';

const PERIODO_MATERIAS_HEADER = {
  title: 'Periodo y materias',
};

const PERIODO_MATERIAS_FIELDS = [
  {
    name: 'periodo',
    type: 'checkboxGroup',
    label: 'Periodo(s) académico(s)',
    placeholder: 'Seleccione uno o más periodos',
    required: true,
    span: 12,
    optionType: 'button',
    checkboxLayout: 'horizontal',
    className: 'step2-periodo-checkbox',
  },
  {
    name: 'infoPeriodoMaterias',
    type: 'alert',
    label: '',
    message: 'Información',
    description: 'Seleccione uno o más periodos. Luego marque las materias que cursará (estudiante antiguo) o revise las del primer año (estudiante nuevo). En el siguiente paso elija el paralelo por periodo.',
    alertType: 'info',
    span: 12,
    required: false,
  },
];

export const getStep2PeriodoYParalelosFields = () => ({
  periodoYParalelos: {
    ...PERIODO_MATERIAS_HEADER,
    fields: PERIODO_MATERIAS_FIELDS,
  },
});
