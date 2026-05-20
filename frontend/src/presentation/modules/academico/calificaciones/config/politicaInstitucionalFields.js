/**
 * Campos de política institucional (Nivel 1) — FormSection / FormField.
 */

import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';

const opcionesPoliticaAsistencia = POLITICAS_ASISTENCIA.map((p) => ({
  value: p.value,
  label: p.label,
  description: p.descripcion,
}));

const campoPorcentaje = (overrides) => ({
  type: 'number',
  min: 0,
  max: 100,
  step: 0.01,
  precision: 2,
  addonAfter: '%',
  required: true,
  ...overrides,
});

/** Cuota teórico / práctico por bimestre */
export const createPoliticaCuotaFields = () => [
  campoPorcentaje({
    name: 'cuotaTeorico',
    label: 'Teórico',
    span: 12,
  }),
  campoPorcentaje({
    name: 'cuotaPractico',
    label: 'Práctico',
    span: 12,
  }),
];

/** Pesos de los 4 bimestres en la nota anual */
export const createPoliticaBimestresFields = () =>
  [1, 2, 3, 4].map((num, index) =>
    campoPorcentaje({
      name: ['pesosBimestres', index],
      label: `Bim. ${num}`,
      span: 6,
    }),
  );

/** Política de asistencia default y campos condicionales */
export const createPoliticaAsistenciaFields = () => [
  {
    name: ['politicaAsistenciaDefault', 'politica'],
    label: 'Modo de asistencia',
    type: 'radio',
    span: 24,
    required: true,
    options: opcionesPoliticaAsistencia,
    className: 'cal-politica__politica-field',
  },
  campoPorcentaje({
    name: ['politicaAsistenciaDefault', 'pesoAsistencia'],
    label: 'Peso default de asistencia',
    span: 12,
    min: 0.01,
    conditional: true,
    dependsOn: ['politicaAsistenciaDefault'],
    showIf: (vals) => vals?.politica === 'COMPUTA_NOTA',
  }),
  campoPorcentaje({
    name: ['politicaAsistenciaDefault', 'minimoAsistencia'],
    label: 'Asistencia mínima default',
    span: 12,
    conditional: true,
    dependsOn: ['politicaAsistenciaDefault'],
    showIf: (vals) => vals?.politica === 'CAUSA_REPROBACION',
  }),
  {
    name: ['politicaAsistenciaDefault', 'notaReprobada'],
    label: 'Nota default si reprueba por asistencia',
    type: 'number',
    span: 12,
    min: 0,
    max: 100,
    step: 0.01,
    precision: 2,
    required: true,
    conditional: true,
    dependsOn: ['politicaAsistenciaDefault'],
    showIf: (vals) => vals?.politica === 'CAUSA_REPROBACION',
  },
];
