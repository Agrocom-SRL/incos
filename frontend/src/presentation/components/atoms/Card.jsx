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
 */

import { Card as AntCard } from 'antd';

const Card = ({
  children,
  title,
  className = '',
  ...props
}) => {
  const cardClassName = className ? `card ${className}`.trim() : 'card';

  return (
    <AntCard
      className={cardClassName}
      title={title}
      {...props}
    >
      {children}
    </AntCard>
  );
};

export default Card;

