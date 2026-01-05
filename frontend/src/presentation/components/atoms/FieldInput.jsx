/**
 * FieldInput - Componente atómico para campos de entrada de texto
 * 
 * Single Responsibility: Renderizar input de texto con configuración básica
 * 
 * Atomic Design: Atom
 * - Wrapper simple de Input de Ant Design
 * - No combina átomos propios, solo adapta un componente de Ant Design
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 */

import { Input } from 'antd';

const FieldInput = ({
  placeholder,
  disabled = false,
  readOnly = false,
  type = 'text',
  maxLength,
  value,
  defaultValue,
  onChange,
  icon, // Icono a mostrar (puede ser prefix o suffix)
  iconPosition = 'prefix', // 'prefix' | 'suffix' - posición del icono
  className = '',
  ...props
}) => {
  const inputClassName = className ? `field-input ${className}`.trim() : 'field-input';

  // Configurar icono según posición
  const inputProps = {
    className: inputClassName,
    placeholder,
    disabled: disabled || readOnly,
    type,
    maxLength,
    value,
    defaultValue,
    onChange,
    ...props,
  };

  // Agregar icono según posición
  if (icon) {
    if (iconPosition === 'prefix') {
      inputProps.prefix = icon;
    } else {
      inputProps.suffix = icon;
    }
  }

  return <Input {...inputProps} />;
};

export default FieldInput;

