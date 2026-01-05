/**
 * FieldSelect - Componente atómico para campos de selección (dropdown)
 * 
 * Single Responsibility: Renderizar select con opciones configurables
 * 
 * Atomic Design: Atom
 * - Wrapper simple de Select de Ant Design
 * - No combina átomos propios, solo adapta un componente de Ant Design
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 */

import { Select } from 'antd';

const FieldSelect = ({
  placeholder,
  disabled = false,
  readOnly = false,
  options = [],
  value,
  defaultValue,
  onChange,
  icon, // Icono a mostrar (suffixIcon para Select)
  className = '',
  ...props
}) => {
  const selectClassName = className ? `field-select ${className}`.trim() : 'field-select';

  const selectProps = {
    className: selectClassName,
    placeholder,
    disabled: disabled || readOnly,
    options,
    value,
    defaultValue,
    onChange,
    ...props,
  };

  // Agregar icono si se proporciona
  if (icon) {
    selectProps.suffixIcon = icon;
  }

  return <Select {...selectProps} />;
};

export default FieldSelect;

