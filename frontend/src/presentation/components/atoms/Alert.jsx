/**
 * Alert - Componente atómico para alertas/mensajes
 * 
 * Single Responsibility: Mostrar mensajes de alerta, error, éxito, etc.
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Ant Design aplica automáticamente:
 * - colorError, colorSuccess, colorWarning, colorInfo (desde theme.components.Alert)
 */

import { Alert as AntAlert } from 'antd';

const Alert = ({
  message,
  description,
  type = 'error', // 'success' | 'info' | 'warning' | 'error'
  showIcon = true,
  className = '',
  ...props
}) => {
  const alertClassName = className ? `alert ${className}`.trim() : 'alert';

  return (
    <AntAlert
      message={message}
      description={description}
      type={type}
      showIcon={showIcon}
      className={alertClassName}
      {...props}
    />
  );
};

export default Alert;

