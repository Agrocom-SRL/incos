// components/molecules/FormField/FormField.jsx
/**
 * FormField: Molécula genérica para renderizar campos de formulario
 * 
 * Single Responsibility: Renderizar un campo de formulario basado en configuración
 */

import { Form, Input, Select, DatePicker, InputNumber, Switch, Checkbox, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const FormField = ({ field, form, resolveOptions, formValues, onFieldChange }) => {
  // Ref para rastrear los valores previos de las dependencias y evitar loops infinitos
  const prevDependencyValuesRef = useRef(null);
  
  // Solo observar las dependencias específicas de este campo, no todo formValues
  // Esto evita re-renders innecesarios cuando otros campos cambian
  const dependencyValues = field.dependencies && field.dependencies.length > 0 && form
    ? Form.useWatch(field.dependencies, form)
    : null;
  
  // Manejar dependencias: cuando cambia un campo del que depende, limpiar este campo
  useEffect(() => {
    if (field.dependencies && field.dependencies.length > 0 && form && dependencyValues) {
      // Convertir a array de valores para comparación
      const depValues = field.dependencies.map(dep => dependencyValues?.[dep]);
      
      // Convertir a string para comparación profunda
      const dependencyValuesKey = JSON.stringify(depValues);
      
      // Solo ejecutar si las dependencias realmente cambiaron
      if (prevDependencyValuesRef.current !== dependencyValuesKey) {
        prevDependencyValuesRef.current = dependencyValuesKey;
        
        const hasAllDependencies = depValues.every(val => val !== undefined && val !== null && val !== '');
        
        if (!hasAllDependencies) {
          // Si falta alguna dependencia, limpiar el campo solo si tiene un valor
          const currentValue = form.getFieldValue(field.name);
          // Solo actualizar si el valor actual no es undefined/null/vacío
          // Esto evita loops infinitos
          if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
            // Usar setTimeout para evitar actualizaciones síncronas que causan loops
            setTimeout(() => {
              form.setFieldValue(field.name, undefined);
            }, 0);
          }
        }
      }
    }
  }, [field.dependencies, field.name, dependencyValues, form]);

  // Manejar cambios en campos con dependencias
  const handleChange = (value) => {
    if (onFieldChange && field.dependencies) {
      onFieldChange(field.name, value, field.dependencies);
    }
  };

  const renderField = () => {
    const commonProps = {
      placeholder: field.placeholder,
      disabled: field.disabled,
      onChange: handleChange,
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
        let options = typeof field.options === 'string'
          ? resolveOptions(field.options)
          : field.options || [];

        // Filtrar opciones basado en dependencias
        // Usar dependencyValues si está disponible (observado específicamente), sino usar formValues como fallback
        if (field.dependencies && field.dependencies.length > 0) {
          const dependencyValue = dependencyValues?.[field.dependencies[0]] ?? formValues?.[field.dependencies[0]];
          if (dependencyValue) {
            // Filtrar opciones según la dependencia
            // Por ejemplo, si depende de paisId, filtrar por paisId
            if (field.name === 'departamentoNacimientoId' || field.name === 'departamentoResidenciaId') {
              options = options.filter(opt => opt.paisId === dependencyValue);
            } else if (field.name === 'provinciaNacimientoId' || field.name === 'provinciaResidenciaId') {
              options = options.filter(opt => opt.departamentoId === dependencyValue);
            } else if (field.name === 'municipioNacimientoId' || field.name === 'municipioResidenciaId') {
              options = options.filter(opt => opt.provinciaId === dependencyValue);
            }
          } else {
            // Si no hay valor en la dependencia, no mostrar opciones
            options = [];
          }
        }

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

      case 'checkbox':
        return <Checkbox {...commonProps}>{field.label}</Checkbox>;

      case 'upload':
        // Obtener el fileList actual del formulario
        const currentFileList = form?.getFieldValue(field.name) || [];
        return (
          <Upload
            beforeUpload={(file) => {
              // No subir automáticamente, solo agregar a la lista
              // La subida se manejará en el onSubmit del formulario
              return false;
            }}
            fileList={currentFileList}
            maxCount={field.maxCount || 1}
            accept={field.accept}
            listType={field.listType || 'text'}
          >
            <Button icon={<UploadOutlined />}>
              {field.uploadText || 'Seleccionar archivo'}
            </Button>
          </Upload>
        );

      default:
        return <Input {...commonProps} />;
    }
  };

  // Para checkbox, no mostramos label en Form.Item porque ya está en el Checkbox
  const formItemLabel = field.type === 'checkbox' ? null : field.label;
  const valuePropName = field.type === 'switch' || field.type === 'checkbox' ? 'checked' : 'value';
  
  // Para upload, el valor es el fileList
  const getValueFromEvent = field.type === 'checkbox' 
    ? (e) => e.target.checked 
    : field.type === 'upload'
    ? (e) => e.fileList
    : undefined;

  return (
    <Form.Item
      label={formItemLabel}
      name={field.name}
      rules={field.rules}
      valuePropName={valuePropName}
      getValueFromEvent={getValueFromEvent}
    >
      {renderField()}
    </Form.Item>
  );
};

export default FormField;
