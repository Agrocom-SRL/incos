// components/molecules/FormField/FormField.jsx
/**
 * FormField: Molécula genérica para renderizar campos de formulario
 * 
 * Single Responsibility: Orquestar la renderización de campos usando componentes atómicos
 * 
 * Atomic Design: Usa átomos (FieldInput, FieldSelect, etc.) y hooks personalizados
 */

import { Form, Tooltip, Tag, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  FieldInput,
  FieldTextArea,
  FieldSelect,
  FieldDatePicker,
  FieldInputNumber,
  FieldSwitch,
  FieldCheckbox,
  FieldRadio,
  FieldUpload,
  FieldDivider,
} from '../../atoms/fields';
import {
  useGeographicFilter,
  useFieldDependencies,
  useTextCapitalization,
  useDateParsing,
} from '../../../hooks';

const FormField = ({ field, form, resolveOptions, formValues, onFieldChange, readOnly = false }) => {
  // Estado para controlar si se muestra el input de upload o el documento existente
  const [uploadStates, setUploadStates] = useState({});
  
  // Observar el valor de tipoDiscapacidadId para mostrar la descripción
  const shouldShowDescription = field.name === 'tipoDiscapacidadId';
  const tipoDiscapacidadValue = shouldShowDescription && form 
    ? Form.useWatch('tipoDiscapacidadId', form) 
    : undefined;
  
  // Estado para almacenar la descripción del tipo de discapacidad seleccionado
  const [selectedDescription, setSelectedDescription] = useState(null);
  
  // Efecto para actualizar la descripción cuando cambia el tipo de discapacidad seleccionado
  useEffect(() => {
    if (shouldShowDescription && form && resolveOptions) {
      const currentValue = tipoDiscapacidadValue !== undefined ? tipoDiscapacidadValue : form.getFieldValue('tipoDiscapacidadId');
      
      if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
        try {
          const options = typeof field.options === 'string' ? resolveOptions(field.options) : field.options || [];
          const selectedOption = options.find(opt => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            return optValue === currentValue;
          });
          
          if (selectedOption && typeof selectedOption === 'object' && selectedOption.descripcion) {
            setSelectedDescription(selectedOption.descripcion);
          } else {
            setSelectedDescription(null);
          }
        } catch (error) {
          console.warn('Error al obtener descripción de discapacidad:', error);
          setSelectedDescription(null);
        }
      } else {
        setSelectedDescription(null);
      }
    } else if (!shouldShowDescription) {
      setSelectedDescription(null);
    }
  }, [tipoDiscapacidadValue, shouldShowDescription, form, field.options, resolveOptions]);
  
  // Inicializar el estado cuando el campo cambia
  useEffect(() => {
    if (field.type === 'upload' && uploadStates[field.name] === undefined) {
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
  
  // Determinar si es un campo geográfico
  const isGeographicField = useMemo(() => {
    return field.type === 'select' && 
      field.dependencies && 
      field.dependencies.length > 0 &&
      (field.name.includes('departamento') || 
       field.name.includes('provincia') || 
       field.name.includes('municipio') ||
       field.name.includes('pais'));
  }, [field.type, field.dependencies, field.name]);
  
  // Observar tipoNacionalidad específicamente para campos de departamento
  const needsTipoNacionalidad = (field.name === 'departamentoNacimientoId' || field.name === 'departamentoResidenciaId') &&
    field.dependencies?.includes('tipoNacionalidad');
  const tipoNacionalidadValue = needsTipoNacionalidad && form
    ? Form.useWatch('tipoNacionalidad', form)
    : null;
  
  // Observar primeraNacionalidadTipo para campos de primera nacionalidad
  const needsPrimeraNacionalidadTipo = field.name === 'primeraNacionalidadDepartamentoId' &&
    field.dependencies?.includes('primeraNacionalidadTipo');
  const primeraNacionalidadTipoValue = needsPrimeraNacionalidadTipo && form
    ? Form.useWatch('primeraNacionalidadTipo', form)
    : null;
  
  // Observar segundaNacionalidadTipo para campos de segunda nacionalidad
  const needsSegundaNacionalidadTipo = field.name === 'segundaNacionalidadDepartamentoId' &&
    field.dependencies?.includes('segundaNacionalidadTipo');
  const segundaNacionalidadTipoValue = needsSegundaNacionalidadTipo && form
    ? Form.useWatch('segundaNacionalidadTipo', form)
    : null;
  
  // Estado para forzar re-render cuando cambian las dependencias
  const [dependencyUpdateKey, setDependencyUpdateKey] = useState(0);
  
  // Observar directamente el primer campo de dependencia para forzar re-render cuando cambia
  const primaryDependencyValue = isGeographicField && form && field.dependencies && field.dependencies.length > 0
    ? Form.useWatch(field.dependencies[0], form)
    : null;
  
  // Efecto para actualizar la clave cuando cambian las dependencias
  // Solo actualizar cuando el valor realmente cambia (no cuando se establece por primera vez)
  const prevPrimaryDependencyValue = useRef(null);
  useEffect(() => {
    if (isGeographicField && primaryDependencyValue !== undefined && primaryDependencyValue !== null) {
      if (prevPrimaryDependencyValue.current !== primaryDependencyValue) {
        prevPrimaryDependencyValue.current = primaryDependencyValue;
        setDependencyUpdateKey(prev => prev + 1);
      }
    } else if (primaryDependencyValue === null || primaryDependencyValue === undefined) {
      prevPrimaryDependencyValue.current = null;
    }
  }, [isGeographicField, primaryDependencyValue]);
  
  // Manejar cambios en campos con dependencias
  const handleChange = (value) => {
    const isGeographicField = field.name.includes('departamento') || 
                              field.name.includes('provincia') || 
                              field.name.includes('municipio') ||
                              field.name.includes('pais');
    
    // Actualizar el formulario manualmente
    if (form) {
      form.setFieldValue(field.name, value);
    }
    
    // Llamar a onFieldChange si existe
    if (onFieldChange) {
      if (field.dependencies) {
        onFieldChange(field.name, value, field.dependencies);
      }
      
      if (isGeographicField) {
        onFieldChange(field.name, value, []);
      }
    }
  };
  
  // Obtener opciones para campos select
  const getSelectOptions = () => {
    let selectOptions = typeof field.options === 'string'
      ? resolveOptions(field.options)
      : field.options || [];
    
    // Filtrar países según el contexto
    if (field.options === 'paises' || (typeof field.options === 'string' && field.options === 'paises')) {
      const tipoNacionalidad = form ? form.getFieldValue('tipoNacionalidad') : null;
      const primeraNacionalidadPaisId = form ? form.getFieldValue('primeraNacionalidadPaisId') : null;
      const primeraNacionalidadTipo = form ? form.getFieldValue('primeraNacionalidadTipo') : null;
      
      const boliviaOption = selectOptions.find(opt => {
        const label = typeof opt === 'string' ? opt : opt.label;
        const value = typeof opt === 'string' ? opt : opt.value;
        return (typeof label === 'string' && label.toLowerCase().includes('bolivia')) || value === 1;
      });
      const boliviaId = boliviaOption ? (typeof boliviaOption === 'string' ? null : boliviaOption.value) : null;
      
      if (field.name === 'paisNacimientoId' && tipoNacionalidad === 'EXTRANJERA') {
        if (boliviaId !== null) {
          selectOptions = selectOptions.filter(opt => {
            const value = typeof opt === 'string' ? opt : opt.value;
            return value !== boliviaId;
          });
        }
      } else if (field.name === 'segundaNacionalidadPaisId' && tipoNacionalidad === 'DOBLE_NACIONALIDAD') {
        const paisesAExcluir = [];
        if (primeraNacionalidadPaisId) {
          paisesAExcluir.push(primeraNacionalidadPaisId);
        }
        if (primeraNacionalidadTipo === 'BOLIVIANA' && boliviaId !== null) {
          paisesAExcluir.push(boliviaId);
        }
        if (paisesAExcluir.length > 0) {
          selectOptions = selectOptions.filter(opt => {
            const value = typeof opt === 'string' ? opt : opt.value;
            return !paisesAExcluir.includes(value);
          });
        }
      }
    }
    
    return selectOptions;
  };
  
  // Usar hook de filtrado geográfico
  const selectOptions = getSelectOptions();
  const { filteredOptions, dependencyValue } = useGeographicFilter({
    field,
    form,
    selectOptions,
    resolveOptions,
  });
  
  // Usar hook de dependencias
  useFieldDependencies({
    field,
    form,
    isGeographicField,
    dependencyValue,
    resolveOptions,
  });
  
  // Usar hook de capitalización de texto
  const { shouldCapitalize, handleCapitalizeChange, handleCapitalizeBlur } = useTextCapitalization(field.name, form);
  
  // Usar hook de parsing de fechas
  const { handleDateChange, handleBlur, handlePressEnter } = useDateParsing(
    field.name,
    field.format || 'DD-MM-YYYY',
    form
  );
  
  // Props comunes
  const getDisabledValue = () => {
    if (readOnly) return true;
    if (typeof field.disabled === 'function' && form) {
      const formValues = form.getFieldsValue();
      return field.disabled(formValues);
    }
    return field.disabled || false;
  };
  
  const disabledProps = {
    disabled: getDisabledValue(),
  };
  
  const renderField = () => {
    switch (field.type) {
      case 'input':
        let dynamicPlaceholder = field.placeholder;
        if (field.name === 'nacionalidad' && form) {
          const esExtranjero = Form.useWatch('esExtranjero', form);
          if (esExtranjero) {
            dynamicPlaceholder = 'Ej: Argentina, Boliviana, etc.';
          } else {
            dynamicPlaceholder = field.placeholder || 'Ej: Boliviana';
          }
        }
        
        return (
          <FieldInput
            placeholder={dynamicPlaceholder}
            disabled={getDisabledValue()}
            readOnly={readOnly}
            type={field.inputType || 'text'}
            maxLength={field.maxLength}
            value={form ? form.getFieldValue(field.name) : undefined}
            onChange={shouldCapitalize && !readOnly ? handleCapitalizeChange : (e) => handleChange(e.target.value)}
            onBlur={shouldCapitalize && !readOnly ? handleCapitalizeBlur : undefined}
          />
        );

      case 'textarea':
        return (
          <FieldTextArea
            placeholder={field.placeholder}
            disabled={getDisabledValue()}
            readOnly={readOnly}
            rows={field.rows || 4}
            maxLength={field.maxLength}
            value={form ? form.getFieldValue(field.name) : undefined}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'select':
        // Determinar opciones finales (filtradas o no)
        let finalOptions = filteredOptions;
        
        // Para departamentos: manejar caso especial de bolivianos
        // Incluye: departamentoNacimientoId, departamentoResidenciaId, 
        // primeraNacionalidadDepartamentoId, segundaNacionalidadDepartamentoId
        const isDepartamentoField = field.name === 'departamentoNacimientoId' || 
          field.name === 'departamentoResidenciaId' ||
          field.name === 'primeraNacionalidadDepartamentoId' ||
          field.name === 'segundaNacionalidadDepartamentoId';
        
        if (isDepartamentoField) {
          // Determinar el tipo de nacionalidad según el campo
          let tipoNacionalidad = null;
          
          if (field.name === 'departamentoNacimientoId' || field.name === 'departamentoResidenciaId') {
            tipoNacionalidad = tipoNacionalidadValue !== null && tipoNacionalidadValue !== undefined
              ? tipoNacionalidadValue
              : (form ? form.getFieldValue('tipoNacionalidad') : null);
          } else if (field.name === 'primeraNacionalidadDepartamentoId') {
            tipoNacionalidad = primeraNacionalidadTipoValue !== null && primeraNacionalidadTipoValue !== undefined
              ? primeraNacionalidadTipoValue
              : (form ? form.getFieldValue('primeraNacionalidadTipo') : null);
          } else if (field.name === 'segundaNacionalidadDepartamentoId') {
            tipoNacionalidad = segundaNacionalidadTipoValue !== null && segundaNacionalidadTipoValue !== undefined
              ? segundaNacionalidadTipoValue
              : (form ? form.getFieldValue('segundaNacionalidadTipo') : null);
          }
          
          if (tipoNacionalidad === 'BOLIVIANA') {
            const paisesOptions = typeof field.options === 'string' && resolveOptions
              ? resolveOptions('paises')
              : [];
            const boliviaOption = paisesOptions.find(opt => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const value = typeof opt === 'string' ? opt : opt.value;
              return (typeof label === 'string' && label.toLowerCase().includes('bolivia')) || value === 1;
            });
            const boliviaId = boliviaOption ? (typeof boliviaOption === 'string' ? null : Number(boliviaOption.value)) : null;
            
            if (boliviaId !== null) {
              const originalOptions = [...selectOptions];
              finalOptions = selectOptions.filter(opt => {
                const optPaisId = typeof opt === 'object' && opt.paisId !== undefined ? Number(opt.paisId) : null;
                return optPaisId === boliviaId;
              });
              
              const currentFieldValue = form ? form.getFieldValue(field.name) : null;
              if (currentFieldValue && !finalOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentFieldValue);
              })) {
                const selectedOption = originalOptions.find(opt => {
                  const optValue = typeof opt === 'string' ? opt : opt.value;
                  return Number(optValue) === Number(currentFieldValue);
                });
                if (selectedOption) {
                  finalOptions.push(selectedOption);
                }
              }
            }
          } else if (dependencyValue !== null) {
            const originalOptions = [...selectOptions];
            finalOptions = selectOptions.filter(opt => {
              const optPaisId = typeof opt === 'object' && opt.paisId !== undefined ? Number(opt.paisId) : null;
              return optPaisId === dependencyValue;
            });
            
            const currentFieldValue = form ? form.getFieldValue(field.name) : null;
            if (currentFieldValue && !finalOptions.find(opt => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              return Number(optValue) === Number(currentFieldValue);
            })) {
              const selectedOption = originalOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentFieldValue);
              });
              if (selectedOption) {
                finalOptions.push(selectedOption);
              }
            }
          }
        } else {
          // Para provincias y municipios, usar las opciones filtradas del hook
          finalOptions = filteredOptions;
          
          // Si hay un valor seleccionado pero no está en las opciones filtradas, agregarlo
          const currentFieldValue = form ? form.getFieldValue(field.name) : null;
          if (currentFieldValue && !finalOptions.find(opt => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            return Number(optValue) === Number(currentFieldValue);
          })) {
            const selectedOption = selectOptions.find(opt => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              return Number(optValue) === Number(currentFieldValue);
            });
            if (selectedOption) {
              finalOptions.push(selectedOption);
            }
          }
        }
        
        // Solo usar key cuando realmente cambia la dependencia numérica para evitar remontar innecesariamente
        // Para campos de departamento que dependen de tipoNacionalidad/primeraNacionalidadTipo/segundaNacionalidadTipo (string), no usar dependencyValue en el key
        const isDepartamentoWithTipoNacionalidad = (field.name === 'departamentoNacimientoId' || 
          field.name === 'departamentoResidenciaId' ||
          field.name === 'primeraNacionalidadDepartamentoId' ||
          field.name === 'segundaNacionalidadDepartamentoId') &&
          (field.dependencies?.includes('tipoNacionalidad') ||
           field.dependencies?.includes('primeraNacionalidadTipo') ||
           field.dependencies?.includes('segundaNacionalidadTipo'));
        
        const selectKey = isGeographicField && 
          field.dependencies && 
          field.dependencies.length > 0 && 
          dependencyValue !== null &&
          !isDepartamentoWithTipoNacionalidad
          ? `${field.name}-${dependencyUpdateKey}-${dependencyValue}`
          : field.name;
        
        const selectOnChange = (value) => {
          // IMPORTANTE: Ant Design Form.Item maneja el valor automáticamente,
          // pero necesitamos actualizarlo explícitamente para que Form.useWatch lo capture
          if (form) {
            form.setFieldValue(field.name, value);
          }
          // Llamar a handleChange para notificar cambios y activar cascadas
          handleChange(value);
        };
        
        return (
          <div>
            <FieldSelect
              key={selectKey}
              placeholder={field.placeholder}
              disabled={getDisabledValue()}
              allowClear={field.allowClear}
              options={finalOptions}
              onChange={readOnly ? undefined : selectOnChange}
            />
            {selectedDescription && (
              <div style={{ 
                marginTop: 8, 
                padding: '8px 12px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: 4,
                fontSize: '12px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                <strong>Descripción:</strong> {selectedDescription}
              </div>
            )}
          </div>
        );

      case 'datePicker':
        return (
          <FieldDatePicker
            placeholder={field.placeholder || 'DD-MM-YYYY o DD/MM/YYYY'}
            disabled={getDisabledValue()}
            format={field.format || 'DD-MM-YYYY'}
            disabledDate={field.disabledDate}
            onChange={handleDateChange}
            onBlur={handleBlur}
            onPressEnter={handlePressEnter}
            value={form ? form.getFieldValue(field.name) : undefined}
          />
        );

      case 'inputNumber':
        return (
          <FieldInputNumber
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={readOnly}
            min={field.min}
            max={field.max}
            step={field.step}
            precision={field.precision}
          />
        );

      case 'switch':
        return <FieldSwitch disabled={getDisabledValue()} />;

      case 'radio':
        const radioOptions = typeof field.options === 'string'
          ? resolveOptions(field.options)
          : field.options || [];
        
        return (
          <FieldRadio
            disabled={getDisabledValue()}
            options={radioOptions}
            value={form ? form.getFieldValue(field.name) : undefined}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'divider':
        return <FieldDivider />;

      case 'checkbox':
        const checkboxValue = form ? form.getFieldValue(field.name) : undefined;
        return (
          <div>
            <FieldCheckbox
              label={field.label}
              disabled={getDisabledValue()}
              readOnly={readOnly}
              checked={checkboxValue}
              onChange={(e) => handleChange(e.target.checked)}
              aceptaFotocopia={field.aceptaFotocopia}
              descripcion={field.descripcion}
            />
            {field.descripcion && (
              <div style={{ 
                marginTop: 4, 
                marginLeft: 24, // Alinear con el texto del checkbox
                padding: '6px 12px', 
                backgroundColor: '#f0f7ff', 
                borderRadius: 4,
                fontSize: '12px',
                color: '#666',
                lineHeight: '1.5',
                borderLeft: '3px solid #1890ff'
              }}>
                <strong>Descripción:</strong> {field.descripcion}
              </div>
            )}
          </div>
        );

      case 'upload':
        const currentFileList = form?.getFieldValue(field.name) || [];
        const docIdMatch = field.name?.match(/documento_(\d+)_archivo/);
        const docId = docIdMatch ? docIdMatch[1] : null;
        const checkboxFieldName = docId ? `documento_${docId}_entregado` : null;
        
        return (
          <FieldUpload
            disabled={readOnly}
            readOnly={readOnly}
            fileList={currentFileList}
            maxCount={field.maxCount || 1}
            accept={field.accept}
            listType={field.listType || 'text'}
            uploadText={field.uploadText || 'Seleccionar archivo'}
            documentoExistente={field.documentoExistente}
            mostrarInputUpload={mostrarInputUpload}
            onToggleUpload={() => setMostrarInputUpload(true)}
            onChange={(info) => {
              if (info.fileList.length > 0 && checkboxFieldName && form) {
                form.setFieldValue(checkboxFieldName, true);
              }
              handleChange(info.fileList);
            }}
          />
        );

      default:
        return (
          <FieldInput
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={readOnly}
          />
        );
    }
  };

  // Para divider, no usar Form.Item
  if (field.type === 'divider') {
    return renderField();
  }

  // Para checkbox, no mostramos label en Form.Item porque ya está en el Checkbox
  const formItemLabel = field.type === 'checkbox' ? null : field.label;
  const valuePropName = field.type === 'switch' || field.type === 'checkbox' ? 'checked' : 'value';
  
  const getValueFromEvent = field.type === 'checkbox' 
    ? (e) => e.target.checked 
    : field.type === 'upload'
    ? (e) => e.fileList
    : undefined;

  // Renderizar label con tooltip y badge si es necesario (para documentos)
  const renderLabel = () => {
    if (!formItemLabel) return null;
    
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

