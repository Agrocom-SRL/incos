/**
 * step2SeleccionarCarrera - Paso «Carrera y plan» del wizard de inscripción.
 *
 * Solo se muestra a estudiantes NUEVOS EN EL SISTEMA (sin historial digital);
 * con historial, carrera y plan se resuelven del kardex y el paso se excluye
 * del array de pasos (matriculaWizardStepConfig).
 *
 * Los controles (picker de tarjetas de carrera + selector de plan) los renderiza
 * InscripcionesCarreraStepContent vía renderSectionContent; esta config solo
 * aporta título y descripción de la sección (sin Alerts fijos).
 */

const CARRERA_HEADER = {
  title: 'Carrera y plan de estudio',
  description:
    'Seleccione la carrera del estudiante. Si la carrera tiene más de un plan habilitado en la gestión, elija también el plan de estudio; con un solo plan se usa el vigente automáticamente.',
};

export const getStep2Fields = () => ({
  carrera: {
    ...CARRERA_HEADER,
    fields: [],
  },
});
