/**
 * Button — diseño sd-btn (detalle estudiante / fichas).
 *
 * Convención:
 *   - Volver / cancelar / anterior → variant="back" (outline pill; nunca primary).
 *   - Una sola acción principal por grupo (header o footer del wizard).
 *   - Semánticas por acción: view/info (azul), warning (editar), danger (eliminar).
 *
 * Variantes:
 *   primary | success  → verde institucional
 *   back | outline | default | secondary → outline (Volver)
 *   info | view        → azul (ver / exportar / detalle)
 *   warning | warn     → ámbar (editar)
 *   danger | error     → rojo (eliminar)
 *   alternative        → violeta institucional (acción secundaria destacada)
 *
 * type="link" → Ant Design link (sin sd-btn).
 */

import { Button as AntButton } from 'antd';

const VARIANT_SD_CLASS = {
  primary: 'sd-btn--primary',
  success: 'sd-btn--primary',
  back: 'sd-btn--outline',
  outline: 'sd-btn--outline',
  default: 'sd-btn--outline',
  secondary: 'sd-btn--outline',
  info: 'sd-btn--info',
  view: 'sd-btn--info',
  warning: 'sd-btn--warn',
  warn: 'sd-btn--warn',
  danger: 'sd-btn--danger',
  error: 'sd-btn--danger',
  alternative: 'sd-btn--alternative',
};

const Button = ({
  variant = 'default',
  size = 'large',
  loading = false,
  disabled = false,
  htmlType,
  onClick,
  children,
  className = '',
  icon,
  type: antButtonType,
  buttonStyle: _buttonStyle,
  ...props
}) => {
  if (antButtonType === 'link') {
    return (
      <AntButton
        type="link"
        size={size}
        loading={loading}
        disabled={disabled}
        htmlType={htmlType}
        onClick={onClick}
        icon={icon}
        className={className || undefined}
        {...props}
      >
        {children}
      </AntButton>
    );
  }

  const sdModifier = VARIANT_SD_CLASS[variant] ?? 'sd-btn--outline';
  const sizeClass = size === 'small' ? 'sd-btn--sm' : '';
  const buttonClassName = ['sd-btn', sdModifier, sizeClass, className].filter(Boolean).join(' ');

  return (
    <AntButton
      type="default"
      size={size}
      loading={loading}
      disabled={disabled}
      htmlType={htmlType}
      onClick={onClick}
      icon={icon}
      className={buttonClassName}
      {...props}
    >
      {children}
    </AntButton>
  );
};

/** Botón «Volver» estándar (outline + flecha). */
export const BackButton = ({ children = 'Volver', icon, ...props }) => (
  <Button variant="back" icon={icon} {...props}>
    {children}
  </Button>
);

export default Button;
