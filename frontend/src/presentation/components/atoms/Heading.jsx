// components/atoms/Heading.jsx
/**
 * Heading - Componente atómico para títulos/encabezados
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Ant Design aplica automáticamente:
 * - colorTextHeading (desde theme.components.Typography.colorTextHeading)
 * - fontSize (desde theme.components.Typography.fontSize)
 */

import { Typography } from 'antd';

const { Title } = Typography;

const Heading = ({
  level = 3,
  children,
  className = '',
  ...props
}) => {
  const headingClassName = className ? `heading heading--h${level} ${className}`.trim() : `heading heading--h${level}`;

  return (
    <Title
      level={level}
      className={headingClassName}
      {...props}
    >
      {children}
    </Title>
  );
};

export default Heading;

