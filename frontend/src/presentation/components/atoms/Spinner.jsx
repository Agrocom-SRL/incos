/**
 * Spinner - Componente atómico para estados de carga
 * 
 * Single Responsibility: Mostrar indicador de carga
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 */

import { Spin } from 'antd';

const Spinner = ({
  size = 'large',
  tip,
  className = '',
  ...props
}) => {
  const spinnerClassName = className ? `spinner ${className}`.trim() : 'spinner';

  return (
    <Spin
      size={size}
      tip={tip}
      className={spinnerClassName}
      {...props}
    />
  );
};

export default Spinner;

