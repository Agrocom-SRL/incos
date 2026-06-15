import { BgColorsOutlined, ScheduleOutlined } from '@ant-design/icons';
import { DOCENTE_ASIGNACIONES_TABS } from './paths';

export const DOCENTE_ASIGNACIONES_TAB_PANEL_META = {
  [DOCENTE_ASIGNACIONES_TABS.HORARIO]: {
    key: DOCENTE_ASIGNACIONES_TABS.HORARIO,
    shortLabel: 'Horario semanal',
    title: 'Horario semanal del docente',
    description:
      'Vista de lectura de los bloques asignados en la gestión vigente. Para resolver choques de franja usá Gestión de horarios → Resolver conflictos.',
    icon: ScheduleOutlined,
  },
  [DOCENTE_ASIGNACIONES_TABS.COLOR]: {
    key: DOCENTE_ASIGNACIONES_TABS.COLOR,
    shortLabel: 'Carga horaria',
    title: 'Carga horaria asignada',
    description:
      'Configurá la carga horaria del docente en la grilla y revisá el detalle de materias ofertadas en la gestión vigente.',
    icon: BgColorsOutlined,
  },
};
