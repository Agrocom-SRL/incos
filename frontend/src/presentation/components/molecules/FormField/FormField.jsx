// components/molecules/FormField/FormField.jsx
/**
 * FormField: Molécula genérica para renderizar campos de formulario
 * 
 * Single Responsibility: Renderizar un campo de formulario basado en configuración
 */

import { Form, Input, Select, DatePicker, InputNumber, Switch, Checkbox, Upload, Button, Tooltip, Tag, Space } from 'antd';
import { UploadOutlined, InfoCircleOutlined, FileTextOutlined, EditOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState, useMemo } from 'react';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const FormField = ({ field, form, resolveOptions, formValues, onFieldChange }) => {
  // Ref para rastrear los valores previos de las dependencias y evitar loops infinitos
  const prevDependencyValuesRef = useRef(null);
  
  // Estado para controlar si se muestra el input de upload o el documento existente
  // Usar el nombre del campo como clave para rastrear múltiples campos de upload
  const [uploadStates, setUploadStates] = useState({});
  
  // Inicializar el estado cuando el campo cambia
  useEffect(() => {
    if (field.type === 'upload' && uploadStates[field.name] === undefined) {
      // Si hay documento existente, no mostrar el input inicialmente
      const mostrarInput = !field.documentoExistente;
      setUploadStates(prev => ({
        ...prev,
        [field.name]: mostrarInput
      }));
    }
  }, [field.type, field.name, field.documentoExistente, uploadStates]);
  
  const mostrarInputUpload = uploadStates[field.name] ?? !field.documentoExistente;
  
  const setMostrarInputUpload = (value) => {
    setUploadStates(prev => ({
      ...prev,
      [field.name]: value
    }));
  };
  
  // Solo observar dependencias para campos SELECT con dependencias geográficas
  // NO observar dependencias para campos de texto/textarea para evitar re-renders constantes
  const isGeographicField = field.type === 'select' && 
    field.dependencies && 
    field.dependencies.length > 0 &&
    (field.name.includes('departamento') || 
     field.name.includes('provincia') || 
     field.name.includes('municipio') ||
     field.name.includes('pais'));
  
  // Solo usar Form.useWatch para campos geográficos (select con dependencias)
  // Esto observa cambios en tiempo real
  // IMPORTANTE: Form.useWatch retorna un objeto con los valores observados
  const dependencyValues = isGeographicField && form && field.dependencies && field.dependencies.length > 0
    ? Form.useWatch(field.dependencies, form)
    : null;
  
  // Debug: Log para verificar valores observados
  
  // También leer el valor actual del formulario para casos donde useWatch no ha capturado el valor inicial
  const [currentDependencyValue, setCurrentDependencyValue] = useState(null);
  
  // Leer el valor inicial del formulario cuando el componente se monta o cuando cambia el formulario
  useEffect(() => {
    if (isGeographicField && form && field.dependencies && field.dependencies.length > 0) {
      // Leer el valor del formulario (puede ser valor inicial o valor actual)
      const depValue = form.getFieldValue(field.dependencies[0]);
      setCurrentDependencyValue(depValue);
    }
  }, [isGeographicField, form, field.dependencies]);
  
  // Usar dependencyValues observado si está disponible y tiene valor, sino usar el valor actual del formulario
  const watchedValue = dependencyValues?.[field.dependencies?.[0]];
  const effectiveDependencyValue = watchedValue !== undefined && watchedValue !== null 
    ? watchedValue 
    : currentDependencyValue;
  
  // Manejar dependencias: cuando cambia un campo del que depende, limpiar este campo
  // SOLO para campos geográficos (select)
  // IMPORTANTE: NO limpiar si hay un valor seleccionado válido (puede ser restauración de valores guardados)
  useEffect(() => {
    if (isGeographicField && form) {
      // Obtener valor de dependencia (de dependencyValues observado o del valor actual)
      const depValue = effectiveDependencyValue;
      
      // Convertir a string para comparación profunda
      const dependencyValueKey = JSON.stringify(depValue);
      
      // Solo ejecutar si las dependencias realmente cambiaron
      if (prevDependencyValuesRef.current !== dependencyValueKey) {
        prevDependencyValuesRef.current = dependencyValueKey;
        
        // Actualizar el valor actual si cambió
        if (depValue !== currentDependencyValue && depValue !== undefined && depValue !== null) {
          setCurrentDependencyValue(depValue);
        }
        
        // IMPORTANTE: Solo limpiar el campo si:
        // 1. La dependencia cambió a un valor diferente (no solo si está vacía)
        // 2. Y el valor actual no es válido para la nueva dependencia
        // NO limpiar si la dependencia simplemente no está establecida pero hay un valor seleccionado
        // (esto puede pasar cuando se restaura un paso anterior)
        if (depValue !== undefined && depValue !== null && depValue !== '') {
          // Si hay una dependencia válida, verificar si el valor actual es válido
          const currentValue = form.getFieldValue(field.name);
          if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
            // Verificar si el valor actual es válido para la nueva dependencia
            // Esto se hace en el render del select, así que aquí solo limpiamos si es necesario
            // Por ahora, no limpiamos automáticamente - dejamos que el filtrado en el render maneje esto
          }
        }
        // NO limpiar si depValue está vacío - puede ser una restauración de valores guardados
        // El filtrado en el render se encargará de mostrar/ocultar opciones apropiadamente
      }
    }
  }, [isGeographicField, field.dependencies, field.name, dependencyValues, effectiveDependencyValue, currentDependencyValue, form]);
  
  // Sincronizar currentDependencyValue cuando dependencyValues cambia
  useEffect(() => {
    if (isGeographicField && dependencyValues && field.dependencies && field.dependencies.length > 0) {
      const watchedValue = dependencyValues[field.dependencies[0]];
      if (watchedValue !== undefined && watchedValue !== null && watchedValue !== currentDependencyValue) {
        setCurrentDependencyValue(watchedValue);
      }
    }
  }, [isGeographicField, dependencyValues, field.dependencies, currentDependencyValue]);

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
        // Calcular opciones directamente (sin useMemo) para que se recalcule en cada render
        // cuando cambian las dependencias
        let selectOptions = typeof field.options === 'string'
          ? resolveOptions(field.options)
          : field.options || [];

        // Filtrar opciones basado en dependencias SOLO para campos geográficos
        // Los campos con shouldRender (como tipoDiscapacidadId) NO filtran opciones,
        // solo se muestran/ocultan basándose en shouldRender
        if (field.dependencies && field.dependencies.length > 0 && isGeographicField) {
          // SOLO para campos geográficos, usar dependencyValues observado o leer directamente del formulario
          const watchedValue = dependencyValues?.[field.dependencies[0]];
          const formValue = form ? form.getFieldValue(field.dependencies[0]) : null;
          const dependencyValue = watchedValue !== undefined && watchedValue !== null ? watchedValue : formValue;
          
          // Obtener el valor actual seleccionado en este campo (si existe)
          const currentFieldValue = form ? form.getFieldValue(field.name) : null;
          
          if (dependencyValue) {
            // Filtrar opciones según la dependencia geográfica
            const originalOptions = [...selectOptions];
            if (field.name === 'departamentoNacimientoId' || field.name === 'departamentoResidenciaId') {
              selectOptions = selectOptions.filter(opt => opt.paisId === dependencyValue);
            } else if (field.name === 'provinciaNacimientoId' || field.name === 'provinciaResidenciaId') {
              selectOptions = selectOptions.filter(opt => opt.departamentoId === dependencyValue);
            } else if (field.name === 'municipioNacimientoId' || field.name === 'municipioResidenciaId') {
              selectOptions = selectOptions.filter(opt => opt.provinciaId === dependencyValue);
            }
            
            // IMPORTANTE: Si hay un valor seleccionado pero no está en las opciones filtradas,
            // agregarlo a las opciones para que se muestre correctamente
            // Esto puede pasar cuando se vuelve a un paso anterior y el valor ya está guardado
            if (currentFieldValue && !selectOptions.find(opt => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              return optValue === currentFieldValue;
            })) {
              // Buscar el valor en las opciones originales (sin filtrar)
              const selectedOption = originalOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return optValue === currentFieldValue;
              });
              
              // Si se encuentra en las opciones originales, agregarlo a las opciones filtradas
              if (selectedOption) {
                selectOptions.push(selectedOption);
              }
            }
          } else {
            // Si no hay valor en la dependencia geográfica, pero hay un valor seleccionado,
            // mostrar todas las opciones para que el valor seleccionado se mantenga visible
            // Esto puede pasar cuando se vuelve a un paso anterior y la dependencia aún no se ha establecido
            if (currentFieldValue) {
              // Mantener todas las opciones para que el valor seleccionado se muestre
              // El filtrado se aplicará cuando la dependencia tenga un valor
              // Esto es importante para que los valores guardados se muestren al volver a un paso anterior
            } else {
              // Si no hay valor seleccionado ni dependencia, no mostrar opciones
              selectOptions = [];
            }
          }
        }
        // Para campos no geográficos con dependencies (como tipoDiscapacidadId),
        // NO filtrar opciones - las dependencias solo se usan para shouldRender

        return (
          <Select {...commonProps} allowClear={field.allowClear}>
            {selectOptions.map((option) => {
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
        // Si hay información de documento, mostrar solo el tooltip (sin badge) en el checkbox
        if (field.aceptaFotocopia !== undefined || field.descripcion) {
          const tooltipContent = field.descripcion 
            ? `${field.descripcion}${field.aceptaFotocopia ? ' (Se acepta fotocopia)' : ' (Solo original, no se acepta fotocopia)'}`
            : (field.aceptaFotocopia ? 'Se acepta fotocopia' : 'Solo original, no se acepta fotocopia');
          
          return (
            <Checkbox {...commonProps}>
              <Space size="small">
                <span>{field.label}</span>
                {tooltipContent && (
                  <Tooltip title={tooltipContent}>
                    <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                  </Tooltip>
                )}
              </Space>
            </Checkbox>
          );
        }
        return <Checkbox {...commonProps}>{field.label}</Checkbox>;

      case 'upload':
        // Si hay un documento existente y no se está mostrando el input, mostrar enlace
        if (field.documentoExistente && !mostrarInputUpload) {
          const documento = field.documentoExistente;
          const url = documento.url || documento.rutaArchivo;
          
          return (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginRight: 8 }}
                >
                  {documento.nombreArchivo || 'Ver documento'}
                </a>
                <Button 
                  type="link" 
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setMostrarInputUpload(true)}
                >
                  Modificar
                </Button>
              </Space>
            </Space>
          );
        }
        
        // Mostrar input de upload
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

  // Renderizar label con tooltip y badge si es necesario (para documentos)
  const renderLabel = () => {
    if (!formItemLabel) return null;
    
    // Si hay información de documento (aceptaFotocopia, descripcion), mostrar badge y tooltip
    if (field.aceptaFotocopia !== undefined || field.descripcion) {
      const badgeColor = field.aceptaFotocopia ? 'green' : 'orange';
      const badgeText = field.aceptaFotocopia ? 'Acepta fotocopia' : 'Solo original';
      const tooltipContent = field.descripcion 
        ? `${field.descripcion}${field.aceptaFotocopia ? ' (Se acepta fotocopia)' : ' (Solo original, no se acepta fotocopia)'}`
        : (field.aceptaFotocopia ? 'Se acepta fotocopia' : 'Solo original, no se acepta fotocopia');
      
      return (
        <Space>
          <span>{formItemLabel}</span>
          <Tag color={badgeColor} style={{ fontSize: '11px', margin: 0 }}>
            {badgeText}
          </Tag>
          {tooltipContent && (
            <Tooltip title={tooltipContent}>
              <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
            </Tooltip>
          )}
        </Space>
      );
    }
    
    return formItemLabel;
  };

  return (
    <Form.Item
      label={renderLabel()}
      name={field.name}
      rules={field.rules}
      valuePropName={valuePropName}
      getValueFromEvent={getValueFromEvent}
      help={field.help}
      required={field.required}
    >
      {renderField()}
    </Form.Item>
  );
};

export default FormField;
