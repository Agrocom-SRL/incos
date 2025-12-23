// components/atoms/fields/FieldInput.jsx
/**
 * FieldInput: Átomo para campos de tipo input
 * 
 * Single Responsibility: Renderizar un input de texto básico
 */

import { Input } from 'antd';

const FieldInput = ({ 
  placeholder, 
  disabled, 
  readOnly, 
  type = 'text',
  maxLength,
  onChange,
  onBlur,
  ...props 
}) => {
  return (
    <Input
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      type={type}
      maxLength={maxLength}
      onChange={onChange}
      onBlur={onBlur}
      {...props}
    />
  );
};

export default FieldInput;

