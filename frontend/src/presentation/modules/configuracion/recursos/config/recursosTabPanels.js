/**
 * Metadatos de paneles por tab en RecursosPage (título toolbar + descripción).
 * Gemelo de `complementarios/config/complementarioTabPanels.js` / `academico/config/academicoTabPanels.js`.
 */

import { PartitionOutlined, BankOutlined, FileDoneOutlined } from '@ant-design/icons';
import { TAB_PARALELOS, TAB_AULAS, TAB_TIPOS_EVALUACION } from './recursosTabs';

export const RECURSOS_TAB_PANEL_META = {
  [TAB_PARALELOS]: {
    title: 'Paralelos maestro',
    description:
      'Plantillas por carrera, periodo del plan y turno. Se reutilizan al generar paralelos de gestión en Oferta académica.',
    shortLabel: 'Paralelos',
    icon: PartitionOutlined,
  },
  [TAB_AULAS]: {
    title: 'Aulas',
    description:
      'Catálogo maestro de espacios físicos (aulas, laboratorios, talleres y auditorios) usado al armar la oferta de cursos.',
    shortLabel: 'Aulas',
    icon: BankOutlined,
  },
  [TAB_TIPOS_EVALUACION]: {
    title: 'Tipos de evaluación',
    description:
      'Catálogo de tipos de evaluación (parciales, prácticas, exámenes...) usado por el cuaderno de calificaciones.',
    shortLabel: 'Tipos de evaluación',
    icon: FileDoneOutlined,
  },
};
