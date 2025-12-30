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
 * @param {string} shadowType - Tipo de sombra: 'elevation2' | 'primary' | 'success' | 'info' | 'warning' | 'error' (default: 'elevation2')
 * @param {boolean} bordered - Si debe mostrar borde (default: false)
 */

import { Card as AntCard } from 'antd';
import { componentConfig } from '@theme/tokens';

const Card = ({
  children,
  title,
  shadow = true,
  shadowType = 'elevation2',
  bordered = false,
  className = '',
  ...props
}) => {
  const cardClassName = className ? `card ${className}`.trim() : 'card';
  
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
    };
    
    return shadowMap[shadowType] || componentConfig.Card.boxShadow;
  };

  return (
    <AntCard
      className={cardClassName}
      title={title}
      bordered={bordered}
      style={{
        boxShadow: getShadow(),
        ...props.style,
      }}
      {...props}
    >
      {children}
    </AntCard>
  );
};

export default Card;

