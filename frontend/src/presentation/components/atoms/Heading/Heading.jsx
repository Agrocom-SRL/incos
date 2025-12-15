// components/atoms/Heading/Heading.jsx
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
  // Clase personalizada siguiendo la convención del proyecto (incos-*)
  // Ant Design ya aplica .ant-typography y todos los estilos del tema automáticamente
  const baseClassName = `incos-heading incos-heading--h${level}`;
  const finalClassName = className ? `${baseClassName} ${className}`.trim() : baseClassName;

  // Ant Design aplica automáticamente el tema desde ConfigProvider
  // No necesitamos estilos inline, solo clases para layout
  return (
    <Title
      level={level}
      className={finalClassName}
      {...props}
    >
      {children}
    </Title>
  );
};

export default Heading;
