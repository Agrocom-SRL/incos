// components/atoms/fields/FieldRadio.jsx
/**
 * FieldRadio: Átomo para campos de tipo radio
 * 
 * Single Responsibility: Renderizar un radio group básico
 */

import { Radio } from 'antd';

const FieldRadio = ({ 
  disabled, 
  options = [],
  onChange,
  value,
  ...props 
}) => {
  return (
    <Radio.Group 
      disabled={disabled}
      value={value}
      onChange={onChange}
      style={{ 
        display: 'flex',
        width: '100%',
        gap: '12px',
      }}
      {...props}
    >
      {options.map((option) => (
        <Radio 
          key={option.value} 
          value={option.value}
          style={{
            flex: 1,
            marginRight: 0,
            marginBottom: 0,
            fontSize: '16px',
            padding: '8px 12px',
            textAlign: 'center',
            transition: 'all 0.3s',
          }}
        >
          <span style={{ paddingLeft: '8px' }}>{option.label}</span>
        </Radio>
      ))}
    </Radio.Group>
  );
};

export default FieldRadio;

