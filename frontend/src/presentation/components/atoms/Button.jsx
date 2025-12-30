// components/atoms/Button.jsx
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
  const buttonClassName = className ? `button ${className}`.trim() : 'button';

  return (
    <AntButton
      type={variant === 'primary' ? 'primary' : 'default'}
      size={size}
      loading={loading}
      disabled={disabled}
      htmlType={htmlType}
      onClick={onClick}
      className={buttonClassName}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;

