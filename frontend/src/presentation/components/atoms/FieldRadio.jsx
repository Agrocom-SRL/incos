/**
 * FieldRadio - Componente atómico para campos de selección única (radio buttons)
 * 
 * Single Responsibility: Renderizar radio group con opciones configurables
 * 
 * Atomic Design: Atom
 * - Wrapper simple de Radio.Group de Ant Design
 * - No combina átomos propios, solo adapta un componente de Ant Design
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 */

import { Radio } from 'antd';

const FieldRadio = ({
  placeholder,
  disabled = false,
  readOnly = false,
  options = [],
  value,
  defaultValue,
  onChange,
  className = '',
  ...props
}) => {
  const radioClassName = className ? `field-radio ${className}`.trim() : 'field-radio';

  return (
    <Radio.Group
      className={radioClassName}
      disabled={disabled || readOnly}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      {...props}
    >
      {options.map((option) => (
        <Radio key={option.value} value={option.value}>
          {option.label}
        </Radio>
      ))}
    </Radio.Group>
  );
};

export default FieldRadio;

