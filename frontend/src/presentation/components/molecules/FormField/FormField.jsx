/**
 * FormField: Molécula para renderizar campos de formulario
 * 
 * Single Responsibility: Renderizar un campo de formulario con layout horizontal
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * - Toda la lógica está en hooks especializados
 * 
 * Atomic Design: Molécula
 * - Usa átomos (FieldInput, FieldSelect, etc.) y componentes nativos de Ant Design (Form.Item)
 * - Usa hooks personalizados para separar lógica de presentación
 * - Layout horizontal: label fijo a un lado, input al otro lado
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI, la lógica está en hooks
 * - Open/Closed: Extensible agregando nuevos renderers sin modificar código existente (Strategy Pattern)
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Esta versión maneja:
 * - input (text, email, tel)
 * - select
 * - date (DatePicker)
 * - switch (Switch)
 * - textarea
 * - radio
 */

import { Form } from 'antd';
import { useFormField } from './hooks/useFormField';
import { useFieldRenderer } from './hooks/useFieldRenderer';
import { labelCol, wrapperCol } from './utils/formLayout';
import { fileListFromUploadEvent } from './components/FormImageUploadDragger';
import { FieldInput } from '@atoms';

const FormField = ({
  field,
  form,
  resolveOptions,
  minAge = null,
  readOnly = false,
  labelLayout = 'horizontal',
}) => {
  const isVertical = labelLayout === 'vertical' || field.labelLayout === 'vertical';
  const layoutProps = isVertical ? {} : { labelCol, wrapperCol };
  // Hook que compone toda la lógica del campo
  const { fieldName, disabled, selectOptions, rules, minAge: fieldMinAge } = useFormField({
    field,
    resolveOptions,
    readOnly,
    form,
    contextMinAge: minAge,
  });

  // Hook que proporciona función de renderizado (Strategy Pattern)
  const renderField = useFieldRenderer({
    fieldType: field.type,
    field,
    disabled,
    readOnly,
    selectOptions,
    minAge: fieldMinAge,
    form,
    resolveOptions,
  });

  // Los botones y alertas no se envuelven en Form.Item (no son campos de formulario)
  if (field.type === 'button' || field.type === 'alert') {
    return renderField();
  }

  // Campo oculto: Form.Item sin label ni espacio (noStyle) para enviar id u otros valores
  if (field.type === 'hidden') {
    const preserveHidden = field.preserve ? { preserve: true } : {};
    return (
      <Form.Item name={fieldName} noStyle {...preserveHidden}>
        {renderField()}
      </Form.Item>
    );
  }

  // Campos de tipo display: calculados automáticamente, no se guardan en el formulario
  if (field.type === 'display') {
    const preserveDisplay = field.preserve ? { preserve: true } : {};
    return (
      <Form.Item
        label={field.label}
        {...layoutProps}
        className="form-field"
        {...preserveDisplay}
        shouldUpdate={(prevValues, currentValues) => {
          // Actualizar cuando cambien los campos dependencies
          if (!field.dependencies || field.dependencies.length === 0) return false;
          return field.dependencies.some(dep => 
            prevValues[dep] !== currentValues[dep]
          );
        }}
      >
        {(formInstance) => {
          // Obtener el valor de la dependencia
          const watchedValue = field.dependencies?.[0] 
            ? formInstance.getFieldValue(field.dependencies[0])
            : null;
          
          // Calcular el valor directamente aquí
          const computedValue = field.computeValue 
            ? field.computeValue(formInstance, watchedValue)
            : '';

          return (
            <FieldInput
              value={computedValue}
              placeholder={field.placeholder}
              disabled={false} // Editable pero se recalcula automáticamente
              readOnly={false}
              type="text"
            />
          );
        }}
      </Form.Item>
    );
  }

  const verticalClass = isVertical ? 'form-field--vertical' : '';
  const formItemClassName = field.className
    ? `form-field ${verticalClass} ${field.className}`.trim()
    : `form-field ${verticalClass}`.trim();

  const preserveProps = field.preserve ? { preserve: true } : {};
  const extraRules = Array.isArray(field.rules) ? field.rules : [];
  const mergedRules = extraRules.length > 0 ? [...rules, ...extraRules] : rules;
  const depProps =
    Array.isArray(field.dependencies) && field.dependencies.length > 0
      ? { dependencies: field.dependencies }
      : {};
  const feedbackProps = field.hasFeedback === true ? { hasFeedback: true } : {};
  const extraProps = field.extra ? { extra: field.extra } : {};

  if (field.type === 'imageUpload') {
    return (
      <Form.Item
        name={fieldName}
        label={field.label}
        {...layoutProps}
        valuePropName="fileList"
        getValueFromEvent={fileListFromUploadEvent}
        normalize={(v) => (Array.isArray(v) ? v : [])}
        rules={mergedRules}
        className={formItemClassName}
        {...preserveProps}
        {...depProps}
        {...feedbackProps}
        {...extraProps}
      >
        {renderField()}
      </Form.Item>
    );
  }

  return (
    <Form.Item
      name={fieldName}
      label={field.label}
      {...layoutProps}
      rules={mergedRules}
      className={formItemClassName}
      {...preserveProps}
      {...depProps}
      {...feedbackProps}
      {...extraProps}
    >
      {renderField()}
    </Form.Item>
  );
};

export default FormField;

