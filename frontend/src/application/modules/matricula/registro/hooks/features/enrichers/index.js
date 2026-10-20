/**
 * Enrichers reutilizables para wizards (Strategy + useEnrichWizardSteps).
 *
 * Tras el rediseño del wizard (§4-C1) quedan los del paso Buscar y los del
 * paso Paralelo; «Carrera y plan» y «Periodo y materias» se renderizan con
 * organismos propios vía renderSectionContent (sin enrichers).
 */

export {
  enrichStudentSearchField,
  enrichStudentListField,
  studentEnrichers,
} from './studentEnrichers';

export { enrichParaleloListField, paraleloEnrichers } from './paraleloEnrichers';
