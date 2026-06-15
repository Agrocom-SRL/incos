/**
 * Props de Card de sección alineados al sistema (tokens del theme).
 * Compartido por pantallas de Coordinación / Mis cursos (Calificaciones, Asistencia)
 * y demás secciones tipo panel. Fuente única; no duplicar el literal por módulo.
 */
import { allColors, componentConfig, shadows } from '@theme/tokens';

export const sectionCardProps = {
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
    backgroundColor: allColors.colorBgContainer,
  },
  styles: {
    body: { padding: `${componentConfig.Card.paddingLG}px` },
  },
};
