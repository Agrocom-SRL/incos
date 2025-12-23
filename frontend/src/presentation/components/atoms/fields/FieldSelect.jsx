// components/atoms/fields/FieldSelect.jsx
/**
 * FieldSelect: Átomo para campos de tipo select
 * 
 * Single Responsibility: Renderizar un select básico con opciones
 */

import { Select } from 'antd';

const { Option } = Select;

const FieldSelect = ({ 
  placeholder, 
  disabled, 
  allowClear,
  options = [],
  onChange,
  ...props 
}) => {
  return (
    <Select
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      onChange={onChange}
      {...props}
    >
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        const descripcion = typeof option === 'object' ? option.descripcion : null;
        return (
          <Option key={value} value={value} title={descripcion || label}>
            {label}
          </Option>
        );
      })}
    </Select>
  );
};

export default FieldSelect;

