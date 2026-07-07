/**
 * Metadatos de paneles por tab en RecursosPage (título toolbar + descripción).
 * Gemelo de `complementarios/config/complementarioTabPanels.js` / `academico/config/academicoTabPanels.js`.
 */

import { PartitionOutlined } from '@ant-design/icons';
import { TAB_PARALELOS } from './recursosTabs';

export const RECURSOS_TAB_PANEL_META = {
  [TAB_PARALELOS]: {
    title: 'Paralelos maestro',
    description:
      'Plantillas por carrera, periodo del plan y turno. Se reutilizan al generar paralelos de gestión en Oferta académica.',
    shortLabel: 'Paralelos',
    icon: PartitionOutlined,
  },
};
