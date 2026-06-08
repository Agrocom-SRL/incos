/**
 * Card - Componente atómico para contenedores tipo card
 * 
 * Single Responsibility: Wrapper de Card de Ant Design
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Ant Design aplica automáticamente:
 * - colorBgContainer (desde theme.components.Card.colorBgContainer)
 * - borderRadius (desde theme.components.Card.borderRadius)
 * - colorBorder (desde theme.components.Card.colorBorder)
 * 
 * @param {boolean} shadow - Si debe mostrar sombra (default: true)
 * @param {string} shadowType - Tipo de sombra: 'elevation2' | 'primary' | 'success' | 'info' | 'warning' | 'error' | 'accent' (default: 'elevation2')
 * @param {string} variant - Variante del card: 'outlined' | 'borderless' (default: 'borderless')
 * @param {string} headerColor - Color del header: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'error' | 'accent' (default: 'default'). Ignorado si hay `headerAccentHex` válido (el encabezado usa el tinte del curso).
 * @param {string|null} [headerAccentHex] - Hex del curso (#RRGGBB o RRGGBB). Con `title`, aplica tinte en el header (class `card--header-accent-hex` + estilos en `styles.header`).
 */

import { Card as AntCard } from 'antd';
import { componentConfig } from '@theme/tokens';

function sanitizeHeaderAccentHex(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{6}$/.test(s)) return `#${s}`;
  return null;
}

function hexToRgb(hex) {
  const h = String(hex).replace(/^#/, '');
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

const Card = ({
  children,
  title,
  shadow = true,
  shadowType = 'elevation2',
  variant = 'borderless',
  headerColor = 'default', // 'default' | 'primary' | 'success' | 'warning' | 'info' | 'error' | 'accent'
  headerAccentHex = null,
  className = '',
  style,
  styles: stylesProp,
  ...props
}) => {
  const accentHex = sanitizeHeaderAccentHex(headerAccentHex);
  const useAccentHeader = Boolean(title && accentHex);
  const rgb = useAccentHeader ? hexToRgb(accentHex) : null;

  // Construir className con headerColor y bodyColor
  let cardClassName = className ? `card ${className}`.trim() : 'card';
  if (title && headerColor !== 'default' && !useAccentHeader) {
    cardClassName = `${cardClassName} card--header-${headerColor}`.trim();
  }
  if (useAccentHeader) {
    cardClassName = `${cardClassName} card--header-accent-hex`.trim();
  }

  const mergedStyles =
    useAccentHeader && rgb
      ? {
          ...stylesProp,
          header: {
            backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.38)`,
            borderBottom: 'none',
            color: 'var(--color-text-primary)',
            boxShadow: `inset 0 0 0 1px rgba(${rgb.r},${rgb.g},${rgb.b},0.83)`,
            ...stylesProp?.header,
          },
        }
      : stylesProp;
  
  const cardVariant = variant;
  // Obtener sombra según el tipo
  const getShadow = () => {
    if (!shadow) return 'none';
    
    const shadowMap = {
      elevation2: componentConfig.Card.boxShadow,
      primary: componentConfig.Card.boxShadowPrimary,
      success: componentConfig.Card.boxShadowSuccess,
      info: componentConfig.Card.boxShadowInfo,
      warning: componentConfig.Card.boxShadowWarning,
      error: componentConfig.Card.boxShadowError,
      accent: componentConfig.Card.boxShadowAccent,
    };
    
    return shadowMap[shadowType] || componentConfig.Card.boxShadow;
  };

  return (
    <AntCard
      className={cardClassName}
      title={title}
      variant={cardVariant}
      style={{
        boxShadow: getShadow(),
        ...style,
      }}
      styles={mergedStyles}
      {...props}
    >
      {children}
    </AntCard>
  );
};

export default Card;

