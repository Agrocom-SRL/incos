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

/**
 * Convierte todo el texto a mayúsculas
 * @param {string} text - Texto a convertir
 * @returns {string} Texto en mayúsculas
 */
const capitalizeFirstLetter = (text) => {
  if (!text || typeof text !== 'string') return text;
  // Si el texto está vacío o solo tiene espacios, retornar tal cual
  if (text.trim().length === 0) return text;
  
  // Convertir todo el texto a mayúsculas
  return text.toUpperCase();
};

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
  capitalize = false, // Si true, convierte automáticamente todo el texto a mayúsculas
  ...props
}) => {
  const inputClassName = className ? `field-input ${className}`.trim() : 'field-input';

  // Manejar onChange con capitalización si está habilitada
  const handleChange = (e) => {
    if (capitalize && onChange && e && e.target) {
      const originalValue = e.target.value;
      const capitalizedValue = capitalizeFirstLetter(originalValue);
      
      // Crear un nuevo evento con el valor capitalizado
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: capitalizedValue,
        },
      };
      
      onChange(syntheticEvent);
    } else if (onChange) {
      onChange(e);
    }
  };

  // Aplicar capitalización al value si está habilitada y hay un value
  const displayValue = capitalize && value ? capitalizeFirstLetter(value) : value;

  // Configurar icono según posición
  const inputProps = {
    className: inputClassName,
    placeholder,
    disabled: disabled || readOnly,
    type,
    maxLength,
    value: displayValue,
    defaultValue,
    onChange: handleChange,
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

