/**
 * FormField: Molécula genérica para renderizar campos de formulario (versión básica)
 * 
 * Single Responsibility: Orquestar la renderización de campos básicos usando componentes atómicos
 * 
 * Atomic Design: Usa átomos (FieldInput, FieldSelect) y componentes nativos de Ant Design (Form)
 * 
 * Esta versión básica solo maneja:
 * - input (text, email, tel)
 * - select
 * 
 * Para campos más complejos, usar FormField completo
 */

import { Form } from 'antd';
import {
  FieldInput,
  FieldSelect,
} from '../../atoms/fields';

const FormField = ({ field, form, resolveOptions, readOnly = false }) => {
  // Helper para obtener el nombre del campo
  const getFieldName = () => {
    return field.name;
  };

  // Props comunes
  const getDisabledValue = () => {
    if (readOnly) return true;
    return field.disabled || false;
  };

  const handleChange = (value) => {
    if (form) {
      form.setFieldValue(getFieldName(), value);
    }
  };

  // Obtener opciones para campos select
  const getSelectOptions = () => {
    if (typeof field.options === 'string') {
      return resolveOptions ? resolveOptions(field.options) : [];
    }
    return field.options || [];
  };

  const renderField = () => {
    switch (field.type) {
      case 'input':
        return (
          <FieldInput
            placeholder={field.placeholder}
            disabled={getDisabledValue()}
            readOnly={readOnly}
            type={field.inputType || 'text'}
            maxLength={field.maxLength}
            value={form ? form.getFieldValue(getFieldName()) : undefined}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'select':
        const selectOptions = getSelectOptions();
        
        return (
          <FieldSelect
            placeholder={field.placeholder}
            disabled={getDisabledValue()}
            options={selectOptions}
            value={form ? form.getFieldValue(getFieldName()) : undefined}
            onChange={handleChange}
          />
        );

      default:
        console.warn(`FormField: Tipo de campo no soportado: ${field.type}`);
        return null;
    }
  };

  return (
    <Form.Item
      name={getFieldName()}
      label={field.label}
      rules={field.required ? [{ required: true, message: `Por favor ingrese ${field.label.toLowerCase()}` }] : []}
    >
      {renderField()}
    </Form.Item>
  );
};

export default FormField;

