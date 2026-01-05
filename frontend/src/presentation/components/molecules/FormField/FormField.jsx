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
  });

  // Los botones no se envuelven en Form.Item (no son campos de formulario)
  if (field.type === 'button') {
    return renderField();
  }

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

