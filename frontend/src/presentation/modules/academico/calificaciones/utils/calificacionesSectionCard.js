/**
 * Props de Card alineados a Coordinación / Horarios (tokens del sistema).
 */
import { allColors, componentConfig, shadows } from '@theme/tokens';

export const calificacionesSectionCardProps = {
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
