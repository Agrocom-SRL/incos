/**
 * Step 0 (Buscar estudiante) con estudiante PRE-SELECCIONADO desde el connector
 * (entrada por detalle del estudiante o modo edición): el buscador no aplica y
 * el paso queda reducido a título/descrición — los datos del estudiante los
 * muestra la franja InscripcionStudentStrip (encima del wizard), sin Alerts.
 */
export const step0EnrichmentStrategy = (step, stepIndex, _enrichers, context) => {
  const selectedStudent = context?.studentSearch?.selectedStudent;
  if (stepIndex !== 0 || !context?.hasPreselectedStudent || !selectedStudent?.id) return null;
  return {
    ...step,
    title: 'Estudiante a inscribir',
    formTitle: 'Estudiante a inscribir',
    description:
      'El estudiante ya está seleccionado; verifique sus datos en la franja superior y continúe con la inscripción.',
    config: {
      buscarEstudiante: {
        title: 'Estudiante a inscribir',
        description: 'Verifique los datos del estudiante antes de continuar.',
        fields: [],
      },
    },
  };
};
