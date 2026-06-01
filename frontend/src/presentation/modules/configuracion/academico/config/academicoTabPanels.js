/**
 * Metadatos de paneles por tab en AcademicoPage (título toolbar + descripción).
 */

import { BookOutlined, PartitionOutlined, ReadOutlined, TeamOutlined } from '@ant-design/icons';
import { TAB_CARRERAS, TAB_MATERIAS, TAB_PARALELOS, TAB_PLANES } from './academicoTabs';

export const ACADEMICO_TAB_PANEL_META = {
  [TAB_PLANES]: {
    title: 'Planes de estudio',
    description: 'Seleccione una carrera y administre sus planes vigentes e históricos.',
    shortLabel: 'Plan de estudio',
    icon: ReadOutlined,
  },
  [TAB_CARRERAS]: {
    title: 'Listado de Carreras',
    description: 'Catálogo de carreras del instituto: código, área, título otorgado y carga académica.',
    shortLabel: 'Carreras',
    icon: TeamOutlined,
  },
  [TAB_MATERIAS]: {
    title: 'Listado de Materias',
    description: 'Catálogo maestro de materias reutilizables en los planes de estudio.',
    shortLabel: 'Materias',
    icon: BookOutlined,
  },
  [TAB_PARALELOS]: {
    title: 'Paralelos maestro',
    description:
      'Plantillas por carrera, periodo del plan y turno. Se reutilizan al generar paralelos de gestión en Oferta académica.',
    shortLabel: 'Paralelos',
    icon: PartitionOutlined,
  },
};
