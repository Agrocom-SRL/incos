/**
 * Metadatos de paneles por tab en ComplementariosPage (título toolbar + descripción).
 * Gemelo de `academico/config/academicoTabPanels.js`.
 */

import { GlobalOutlined, SolutionOutlined, TeamOutlined } from '@ant-design/icons';
import { TAB_APODERADOS, TAB_DISCAPACIDAD, TAB_IDIOMAS } from './complementarioTabs';

export const COMPLEMENTARIO_TAB_PANEL_META = {
  [TAB_DISCAPACIDAD]: {
    title: 'Tipos de discapacidad',
    description:
      'Catálogo de tipos de discapacidad usado en la ficha del estudiante y en los reportes de inclusión.',
    shortLabel: 'Discapacidad',
    icon: SolutionOutlined,
  },
  [TAB_APODERADOS]: {
    title: 'Apoderados',
    description: 'Catálogo de tipos de parentesco usado para registrar apoderados de estudiantes.',
    shortLabel: 'Apoderados',
    icon: TeamOutlined,
  },
  [TAB_IDIOMAS]: {
    title: 'Idiomas',
    description: 'Catálogo de idiomas del instituto usado en la ficha del estudiante.',
    shortLabel: 'Idiomas',
    icon: GlobalOutlined,
  },
};
