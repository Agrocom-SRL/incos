/**
 * Campos ABM plan de estudio — FormField / workspace (config en application).
 */

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

export const createPlanFormSections = () => ({
  datosPlan: {
    title: 'Datos del plan de estudio',
    description:
      'Resolución ministerial y carga horaria. El estado vigente se gestiona desde la ficha del plan.',
    fields: [
      {
        name: 'nombrePlan',
        label: 'Nombre del plan',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Plan de Estudios 2024',
        maxLength: 150,
        rules: [MIN_TEXT],
      },
      {
        name: 'resolucionMinisterial',
        label: 'Resolución ministerial',
        type: 'input',
        span: 12,
        placeholder: 'Ej. No.0210/2023',
        maxLength: 100,
      },
      {
        name: 'cargaHorariaTotal',
        label: 'Carga horaria total',
        type: 'number',
        required: true,
        span: 12,
        min: 1,
        placeholder: 'Ej. 3600',
        addonAfter: 'hrs',
      },
      {
        name: 'horasSemana',
        label: 'Horas por semana',
        type: 'number',
        required: true,
        span: 12,
        min: 1,
        placeholder: 'Ej. 30',
        addonAfter: 'hrs',
      },
      {
        name: 'horasMes',
        label: 'Horas por mes',
        type: 'number',
        required: true,
        span: 12,
        min: 1,
        placeholder: 'Ej. 120',
        addonAfter: 'hrs',
      },
      {
        name: 'horasAnio',
        label: 'Horas por año',
        type: 'number',
        required: true,
        span: 12,
        min: 1,
        placeholder: 'Ej. 1200',
        addonAfter: 'hrs',
      },
      {
        name: 'observaciones',
        label: 'Observaciones',
        type: 'textarea',
        span: 24,
        rows: 4,
        placeholder: 'Cambios o características del plan (opcional)',
      },
    ],
  },
  carreraPeriodos: {
    title: 'Carrera y periodos',
    description:
      'Carrera a la que pertenece el plan. La duración determina cuántos periodos (años) se generan al crear el plan.',
    fields: [
      {
        name: 'duracionAnios',
        label: 'Duración (años)',
        type: 'number',
        required: true,
        span: 12,
        min: 1,
        max: 10,
        placeholder: 'Ej. 3',
        extra: 'Se generará 1 periodo por cada año de duración.',
      },
    ],
  },
});

export const PLAN_FORM_FIELD_NAMES = [
  'carreraId',
  'nombrePlan',
  'resolucionMinisterial',
  'duracionAnios',
  'cargaHorariaTotal',
  'horasSemana',
  'horasMes',
  'horasAnio',
  'observaciones',
];
