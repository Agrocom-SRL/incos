// components/atoms/fields/FieldSwitch.jsx
/**
 * FieldSwitch: Átomo para campos de tipo switch
 * 
 * Single Responsibility: Renderizar un switch básico
 */

import { Switch } from 'antd';

const FieldSwitch = ({ 
  disabled, 
  onChange,
  ...props 
}) => {
  return (
    <Switch
      disabled={disabled}
      onChange={onChange}
      {...props}
    />
  );
};

export default FieldSwitch;

