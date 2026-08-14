/**
 * step3PeriodoYMaterias - Paso «Periodo y materias» del wizard de inscripción.
 *
 * La selección se hace sobre la planilla estilo plan de estudios
 * (MateriasPlanillaSelector, renderizada vía renderSectionContent): checkbox
 * por fila, «marcar todo» por periodo y reglas por tipo de admisión (§2 del
 * plan matricula-wizard-rediseno). Los periodos se derivan de las materias
 * marcadas, por lo que esta config solo aporta título y descripción de la
 * sección (sin fields: ni checkboxGroup de periodo ni Alerts fijos).
 */

const PERIODO_MATERIAS_HEADER = {
  title: 'Periodos y materias a cursar',
  description:
    'Marque en la planilla las materias que el estudiante cursará en esta gestión; los periodos se seleccionan solos al marcar sus materias.',
};

export const getStep3Fields = () => ({
  periodoYMaterias: {
    ...PERIODO_MATERIAS_HEADER,
    fields: [],
  },
});
