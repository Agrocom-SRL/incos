/**
 * Container - Componente atómico para contenedores
 * 
 * Single Responsibility: Wrapper de Flex de Ant Design para contenedores
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 */

import { Flex } from 'antd';
import { allSpacing } from '@theme/tokens';

const Container = ({
  children,
  className = '',
  vertical = false,
  gap,
  ...props
}) => {
  const containerClassName = className ? `container ${className}`.trim() : 'container';

  return (
    <Flex
      className={containerClassName}
      vertical={vertical}
      gap={gap || allSpacing.padding}
      {...props}
    >
      {children}
    </Flex>
  );
};

export default Container;

