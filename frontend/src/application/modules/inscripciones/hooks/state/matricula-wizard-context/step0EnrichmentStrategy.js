import { buildStep0StudentDescription } from '../../features/enrichers/studentEnrichers';

/**
 * Step 0: estudiante pre-seleccionado → alerta en lugar del buscador.
 */
export const step0EnrichmentStrategy = (step, stepIndex, _enrichers, context) => {
  const selectedStudent = context?.studentSearch?.selectedStudent;
  if (stepIndex !== 0 || !selectedStudent?.id) return null;
  const carreraNombre =
    selectedStudent.carreraNombre ||
    context?.carrerasData?.carreras?.find((c) => c.id === selectedStudent.careerId)?.nombre;
  const description = buildStep0StudentDescription({ ...selectedStudent, carreraNombre });
  return {
    ...step,
    title: 'Estudiante a inscribir',
    config: {
      buscarEstudiante: {
        title: 'Estudiante a inscribir',
        fields: [
          {
            name: 'estudianteSeleccionado',
            type: 'alert',
            label: '',
            message: 'Estudiante a inscribir',
            description,
            alertType: 'success',
            span: 24,
            required: false,
          },
        ],
      },
    },
  };
};
