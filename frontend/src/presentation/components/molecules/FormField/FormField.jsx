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
import { FieldInput } from '@atoms';

const FormField = ({ field, form, resolveOptions, minAge = null, readOnly = false }) => {
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
    return (
      <Form.Item name={fieldName} noStyle>
        {renderField()}
      </Form.Item>
    );
  }

  // Campos de tipo display: calculados automáticamente, no se guardan en el formulario
  if (field.type === 'display') {
    return (
      <Form.Item
        label={field.label}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        className="form-field"
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

  const formItemClassName = field.className
    ? `form-field ${field.className}`.trim()
    : 'form-field';

  return (
    <Form.Item
      name={fieldName}
      label={field.label}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      rules={rules}
      className={formItemClassName}
    >
      {renderField()}
    </Form.Item>
  );
};

export default FormField;

