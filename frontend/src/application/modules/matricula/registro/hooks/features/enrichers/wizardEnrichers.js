import { studentEnrichers, paraleloEnrichers } from './index';

// Solo los pasos Buscar y Paralelo usan enrichers: «Carrera y plan» (CarreraCardPicker
// + selector de plan) y «Periodo y materias» (MateriasPlanillaSelector) los construye
// renderSectionContent con datos del contexto del wizard.
export const matriculaWizardEnrichers = [
  ...studentEnrichers,
  ...paraleloEnrichers,
];
