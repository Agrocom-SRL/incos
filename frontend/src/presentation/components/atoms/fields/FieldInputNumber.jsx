// components/atoms/fields/FieldInputNumber.jsx
/**
 * FieldInputNumber: Átomo para campos de tipo inputNumber
 * 
 * Single Responsibility: Renderizar un inputNumber básico
 */

import { InputNumber } from 'antd';

const FieldInputNumber = ({ 
  placeholder, 
  disabled, 
  readOnly, 
  min,
  max,
  step,
  precision,
  onChange,
  ...props 
}) => {
  return (
    <InputNumber
      style={{ width: '100%' }}
      min={min}
      max={max}
      step={step}
      precision={precision}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      onChange={onChange}
      {...props}
    />
  );
};

export default FieldInputNumber;

