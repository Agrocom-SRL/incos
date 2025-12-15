// components/atoms/Button/Button.jsx
/**
 * Button - Componente atómico para botones
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y posicionamiento
 * 
 * Ant Design aplica automáticamente:
 * - colorPrimary (desde theme.components.Button.colorPrimary)
 * - borderRadius (desde theme.components.Button.borderRadius)
 * - controlHeight (desde theme.components.Button.controlHeight)
 */

import { Button as AntButton } from 'antd';

const Button = ({
  type = 'default',
  variant = 'default', // 'primary' | 'secondary' | 'default'
  size = 'large',
  loading = false,
  disabled = false,
  htmlType,
  onClick,
  children,
  className = '',
  ...props
}) => {
  // Clase personalizada siguiendo la convención del proyecto (incos-*)
  // Ant Design ya aplica .ant-btn y todos los estilos del tema automáticamente
  const baseClassName = `incos-button`;
  const finalClassName = className ? `${baseClassName} ${className}`.trim() : baseClassName;

  // Ant Design aplica automáticamente el tema desde ConfigProvider
  // No necesitamos estilos inline, solo clases para layout
  return (
    <AntButton
      type={variant === 'primary' ? 'primary' : 'default'}
      size={size}
      loading={loading}
      disabled={disabled}
      htmlType={htmlType}
      onClick={onClick}
      className={finalClassName}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;
