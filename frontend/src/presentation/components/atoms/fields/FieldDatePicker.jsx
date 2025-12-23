// components/atoms/fields/FieldDatePicker.jsx
/**
 * FieldDatePicker: Átomo para campos de tipo datePicker
 * 
 * Single Responsibility: Renderizar un datePicker básico
 */

import { DatePicker } from 'antd';

const FieldDatePicker = ({ 
  placeholder, 
  disabled, 
  format = 'DD-MM-YYYY',
  disabledDate,
  onChange,
  onBlur,
  onPressEnter,
  ...props 
}) => {
  return (
    <DatePicker
      style={{ width: '100%' }}
      format={format}
      disabledDate={disabledDate}
      getPopupContainer={(trigger) => trigger.parentElement}
      placeholder={placeholder}
      disabled={disabled}
      onChange={onChange}
      onBlur={onBlur}
      onPressEnter={onPressEnter}
      allowClear
      inputReadOnly={false}
      {...props}
    />
  );
};

export default FieldDatePicker;

