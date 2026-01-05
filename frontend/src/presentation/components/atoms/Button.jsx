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
 * 
 * Variantes semánticas:
 * - variant: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'
 * - style: 'filled' | 'outlined' (solo para variantes semánticas)
 */

import { Button as AntButton } from 'antd';

const Button = ({
  type = 'default',
  variant = 'default', // 'primary' | 'secondary' | 'default' | 'info' | 'success' | 'warning' | 'error'
  style = 'filled', // 'filled' | 'outlined' (solo para variantes semánticas)
  size = 'large',
  loading = false,
  disabled = false,
  htmlType,
  onClick,
  children,
  className = '',
  ...props
}) => {
  const baseClassName = 'button';
  const semanticVariants = ['info', 'success', 'warning', 'error'];
  const isSemantic = semanticVariants.includes(variant);
  const variantClassName = isSemantic ? `button--${variant}` : '';
  const styleClassName = isSemantic && style === 'filled' ? 'button--filled' : '';
  const buttonClassName = className 
    ? `${baseClassName} ${variantClassName} ${styleClassName} ${className}`.trim() 
    : `${baseClassName} ${variantClassName} ${styleClassName}`.trim();

  // Para variantes semánticas, SIEMPRE usar 'default' de Ant Design y aplicar estilos via CSS
  // Esto evita que Ant Design sobrescriba con colorPrimary
  // Para variantes normales, usar 'primary' o 'default' según variant
  const antButtonType = isSemantic 
    ? 'default' // Siempre 'default' para semánticos (filled y outlined se controlan via CSS)
    : (variant === 'primary' ? 'primary' : 'default');

  return (
    <AntButton
      type={antButtonType}
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

