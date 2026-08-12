import {
  studentEnrichers,
  periodoEnrichers,
  carreraEnrichers,
  paraleloEnrichers,
  materiaEnrichers,
  horarioEnrichers,
} from './index';

export const matriculaWizardEnrichers = [
  ...studentEnrichers,
  ...periodoEnrichers,
  ...carreraEnrichers,
  ...paraleloEnrichers,
  ...materiaEnrichers,
  ...horarioEnrichers,
];
