// components/molecules/FormField/FormField.jsx
/**
 * FormField: Molécula genérica para renderizar campos de formulario
 * 
 * Single Responsibility: Renderizar un campo de formulario basado en configuración
 */

import { Form, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const FormField = ({ field, form, resolveOptions }) => {
  const renderField = () => {
    const commonProps = {
      placeholder: field.placeholder,
      disabled: field.disabled,
    };

    switch (field.type) {
      case 'input':
        return (
          <Input
            {...commonProps}
            type={field.inputType || 'text'}
            maxLength={field.maxLength}
          />
        );

      case 'textarea':
        return (
          <TextArea
            {...commonProps}
            rows={field.rows || 4}
            maxLength={field.maxLength}
          />
        );

      case 'select':
        const options = typeof field.options === 'string'
          ? resolveOptions(field.options)
          : field.options || [];

        return (
          <Select {...commonProps} allowClear={field.allowClear}>
            {options.map((option) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <Option key={value} value={value}>
                  {label}
                </Option>
              );
            })}
          </Select>
        );

      case 'datePicker':
        return (
          <DatePicker
            style={{ width: '100%' }}
            format={field.format || 'YYYY-MM-DD'}
            disabledDate={field.disabledDate}
            {...commonProps}
          />
        );

      case 'inputNumber':
        return (
          <InputNumber
            style={{ width: '100%' }}
            min={field.min}
            max={field.max}
            step={field.step}
            precision={field.precision}
            {...commonProps}
          />
        );

      case 'switch':
        return <Switch {...commonProps} />;

      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <Form.Item
      label={field.label}
      name={field.name}
      rules={field.rules}
      valuePropName={field.type === 'switch' ? 'checked' : 'value'}
    >
      {renderField()}
    </Form.Item>
  );
};

export default FormField;
