// components/atoms/fields/FieldTextArea.jsx
/**
 * FieldTextArea: Átomo para campos de tipo textarea
 * 
 * Single Responsibility: Renderizar un textarea básico
 */

import { Input } from 'antd';

const { TextArea } = Input;

const FieldTextArea = ({ 
  placeholder, 
  disabled, 
  readOnly, 
  rows = 4,
  maxLength,
  onChange,
  ...props 
}) => {
  return (
    <TextArea
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
      maxLength={maxLength}
      onChange={onChange}
      {...props}
    />
  );
};

export default FieldTextArea;

