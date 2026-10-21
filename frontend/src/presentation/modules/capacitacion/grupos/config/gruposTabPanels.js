/**
 * Metadatos de los tabs de «Grupos» (CAP): título del header, descripción y
 * etiqueta/ícono del tab. Espejo de `recursosTabPanels` (CFG Recursos).
 */

import { ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import {
  GRUPOS_TAB_GRUPOS,
  GRUPOS_TAB_HORARIOS,
} from '@application-capacitacion/config/paths';

export const GRUPOS_TAB_PANEL_META = {
  [GRUPOS_TAB_HORARIOS]: {
    icon: ClockCircleOutlined,
    shortLabel: 'Horarios',
    title: 'Lista de horarios',
    description:
      'Franjas de día y hora que se asignan a los grupos de los cursos de capacitación. Un horario en uso por algún curso no se puede eliminar.',
  },
  [GRUPOS_TAB_GRUPOS]: {
    icon: TeamOutlined,
    shortLabel: 'Grupos',
    title: 'Grupos disponibles',
    description:
      'Grupos de todos los cursos de capacitación con su horario, aula y cupo. Solo lectura: los grupos se editan desde el formulario de cada curso.',
  },
};
