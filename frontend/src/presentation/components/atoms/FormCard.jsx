// components/atoms/FormCard.jsx
/**
 * FormCard: Átomo para el contenedor Card
 * 
 * Single Responsibility: Wrapper simple de Card de Ant Design
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Ant Design aplica automáticamente:
 * - colorBgContainer (desde theme.components.Card.colorBgContainer)
 * - borderRadius (desde theme.components.Card.borderRadius)
 * - colorBorder (desde theme.components.Card.colorBorder)
 */

import { Card } from 'antd';

const FormCard = ({
  children,
  className = '',
  ...props
}) => {
  const formCardClassName = className ? `form-card ${className}`.trim() : 'form-card';

  return (
    <Card
      className={formCardClassName}
      {...props}
    >
      {children}
    </Card>
  );
};

export default FormCard;

