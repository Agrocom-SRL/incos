/**
 * FormField: Molécula para renderizar campos de formulario (versión básica)
 * 
 * Single Responsibility: Renderizar un campo de formulario con layout horizontal
 * 
 * Atomic Design: Molécula
 * - Usa átomos (FieldInput, FieldSelect) y componentes nativos de Ant Design (Form.Item)
 * - Usa hook personalizado (useFormField) para separar lógica de presentación
 * - Layout horizontal: label fijo a un lado, input al otro lado
 * 
 * Esta versión básica maneja:
 * - input (text, email, tel)
 * - select
 * - date (DatePicker)
 * - switch (Switch)
 */

import { Form } from 'antd';
import { FieldInput, FieldSelect, FieldDatePicker, FieldSwitch } from '@atoms';
import { useFormField } from './hooks/useFormField';

const FormField = ({ field, form, resolveOptions, minAge = null, readOnly = false }) => {
  const { fieldName, disabled, selectOptions, rules } = useFormField({
    field,
    resolveOptions,
    readOnly,
  });

  // Determinar el minAge a usar: si field.minAge es null, usar el del contexto, sino usar el del field
  const fieldMinAge = field.minAge !== null && field.minAge !== undefined ? field.minAge : minAge;

  // Renderizar el componente de campo apropiado
  const renderField = () => {
    switch (field.type) {
      case 'input':
        return (
          <FieldInput
            placeholder={field.placeholder}
            disabled={disabled}
            readOnly={readOnly}
            type={field.inputType || 'text'}
            maxLength={field.maxLength}
            icon={field.icon}
            iconPosition={field.iconPosition}
            defaultValue={field.defaultValue}
          />
        );

      case 'select':
        return (
          <FieldSelect
            placeholder={field.placeholder}
            disabled={disabled}
            readOnly={readOnly}
            options={selectOptions}
            icon={field.icon}
            defaultValue={field.defaultValue}
          />
        );

      case 'date':
        return (
          <FieldDatePicker
            placeholder={field.placeholder}
            disabled={disabled}
            readOnly={readOnly}
            picker={field.picker || 'date'}
            minAge={fieldMinAge}
            defaultValue={field.defaultValue}
          />
        );

      case 'switch':
        return (
          <FieldSwitch
            disabled={disabled}
            readOnly={readOnly}
            defaultChecked={field.defaultChecked || false}
            checkedChildren={field.checkedChildren}
            unCheckedChildren={field.unCheckedChildren}
          />
        );

      default:
        console.warn(`FormField: Tipo de campo no soportado: ${field.type}`);
        return null;
    }
  };

  // Dimensiones responsive para labelCol y wrapperCol
  // Aplicando las mismas dimensiones responsive de FormSection
  const labelCol = {
    xs: { span: 24 },        // < 576px (Móviles): label ocupa 100% (layout vertical)
    sm: { span: 24 },        // ≥ 576px (Tablets pequeñas): label ocupa 100% (layout vertical)
    md: { span: 8 },         // ≥ 768px (Tablets): label ocupa 8 columnas (33%)
    lg: { span: 8 },         // ≥ 992px (Desktop): label ocupa 8 columnas (33%)
    xl: { span: 10 },        // ≥ 1200px (Desktop grande): label ocupa 10 columnas (42%)
    xxl: { span: 10 },       // ≥ 1600px (Desktop extra grande): label ocupa 10 columnas (42%)
  };

  const wrapperCol = {
    xs: { span: 24 },        // < 576px (Móviles): input ocupa 100% (layout vertical)
    sm: { span: 24 },        // ≥ 576px (Tablets pequeñas): input ocupa 100% (layout vertical)
    md: { span: 16 },        // ≥ 768px (Tablets): input ocupa 16 columnas (67%)
    lg: { span: 16 },        // ≥ 992px (Desktop): input ocupa 16 columnas (67%)
    xl: { span: 14 },        // ≥ 1200px (Desktop grande): input ocupa 14 columnas (58%)
    xxl: { span: 14 },       // ≥ 1600px (Desktop extra grande): input ocupa 14 columnas (58%)
  };

  return (
    <Form.Item
      name={fieldName}
      label={field.label}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      rules={rules}
      className="form-field"
    >
      {renderField()}
    </Form.Item>
  );
};

export default FormField;

