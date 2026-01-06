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
 * 
 * Soporta gap para espaciar elementos hijos
 */

import { Typography, Flex } from 'antd';

const { Title } = Typography;

const Heading = ({
  level = 3,
  children,
  className = '',
  gap,
  ...props
}) => {
  const headingClassName = className ? `heading heading--h${level} ${className}`.trim() : `heading heading--h${level}`;

  return (
    <Title
      level={level}
      className={headingClassName}
      {...props}
    >
      <Flex align="center" gap={gap} wrap="wrap">
        {children}
      </Flex>
    </Title>
  );
};

export default Heading;

