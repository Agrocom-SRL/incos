/**
 * Enrichers reutilizables para wizards (Strategy + useEnrichWizardSteps).
 */

export {
  enrichStudentSearchField,
  enrichStudentInfoField,
  enrichStudentListField,
  enrichStudentSelectedField,
  buildStudentSelectedDescription,
  buildStep0StudentDescription,
  studentEnrichers,
} from './studentEnrichers';

export {
  enrichPeriodoSelectField,
  enrichInfoPeriodoParalelosField,
  enrichEstudianteSeleccionadoPeriodoStep,
  periodoEnrichers,
} from './periodoEnrichers';

export { enrichCarreraSelectField, carreraEnrichers } from './carreraEnrichers';

export { enrichParaleloListField, paraleloEnrichers } from './paraleloEnrichers';

export { enrichMateriaListField, materiaEnrichers } from './materiaEnrichers';

export {
  enrichHorarioField,
  enrichResumenInscripcionField,
  horarioEnrichers,
} from './horarioEnrichers';
