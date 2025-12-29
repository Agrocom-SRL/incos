// components/molecules/FormField/FormField.jsx
/**
 * FormField: Molécula genérica para renderizar campos de formulario
 * 
 * Single Responsibility: Orquestar la renderización de campos usando componentes atómicos
 * 
 * Atomic Design: Usa átomos (FieldInput, FieldSelect, etc.) y hooks personalizados
 */

import { Form, Tag, Space, Alert } from 'antd';
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
  FieldFormList,
} from '../../atoms/fields';
import {
  useGeographicFilter,
  useFieldDependencies,
  useTextCapitalization,
  useDateParsing,
} from '../../../modules/estudiantes/hooks';

const FormField = ({ field, form, resolveOptions, formValues, onFieldChange, readOnly = false }) => {
  // Estado para controlar si se muestra el input de upload o el documento existente
  const [uploadStates, setUploadStates] = useState({});
  
  // NOTA: Eliminamos el estado local para switches porque causa problemas de sincronización
  // Ahora confiamos completamente en el estado del formulario de Ant Design
  // Cada switch es independiente y maneja su propio estado a través del Form.Item
  
  // IMPORTANTE: Obtener la instancia del form usando Form.useFormInstance() como fallback
  // Esto asegura que los validators tengan acceso al form incluso si no se pasa como prop
  let formInstance = null;
  try {
    formInstance = Form.useFormInstance();
  } catch (e) {
    // Si no hay contexto de Form, usar el form pasado como prop
    formInstance = null;
  }
  const formToUse = form || formInstance;

  // Helper para obtener el nombre del campo como string (maneja arrays de Form.List)
  const getFieldNameString = (fieldName) => {
    if (Array.isArray(fieldName)) {
      // Si es un array (de Form.List), devolver el último elemento como string
      return fieldName[fieldName.length - 1]?.toString() || '';
    }
    return fieldName?.toString() || '';
  };

  // Helper para obtener el nombre completo del campo (para usar con form.getFieldValue, etc.)
  const getFieldName = () => {
    return field.name;
  };

  const fieldNameString = getFieldNameString(field.name);

  // Observar el valor de tipoDiscapacidadId para mostrar la descripción
  const shouldShowDescription = fieldNameString === 'tipoDiscapacidadId';
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
    if (field.type === 'upload' && uploadStates[fieldNameString] === undefined) {
      const mostrarInput = !field.documentoExistente;
      setUploadStates(prev => ({
        ...prev,
        [fieldNameString]: mostrarInput
      }));
    }
  }, [field.type, fieldNameString, field.documentoExistente, uploadStates]);

  const mostrarInputUpload = uploadStates[fieldNameString] ?? !field.documentoExistente;

  const setMostrarInputUpload = (value) => {
    setUploadStates(prev => ({
      ...prev,
      [fieldNameString]: value
    }));
  };

  // Determinar si es un campo geográfico
  const isGeographicField = useMemo(() => {
    return field.type === 'select' &&
      field.dependencies &&
      field.dependencies.length > 0 &&
      (fieldNameString.includes('departamento') ||
        fieldNameString.includes('provincia') ||
        fieldNameString.includes('municipio') ||
        fieldNameString.includes('pais'));
  }, [field.type, field.dependencies, field.name]);

  // Observar tipoNacionalidad específicamente para campos de departamento
  const needsTipoNacionalidad = (fieldNameString === 'departamentoNacimientoId' || fieldNameString === 'departamentoResidenciaId') &&
    field.dependencies?.includes('tipoNacionalidad');
  const tipoNacionalidadValue = needsTipoNacionalidad && form
    ? Form.useWatch('tipoNacionalidad', form)
    : null;

  // Observar primeraNacionalidadTipo para campos de primera nacionalidad
  const needsPrimeraNacionalidadTipo = fieldNameString === 'primeraNacionalidadDepartamentoId' &&
    field.dependencies?.includes('primeraNacionalidadTipo');
  const primeraNacionalidadTipoValue = needsPrimeraNacionalidadTipo && form
    ? Form.useWatch('primeraNacionalidadTipo', form)
    : null;

  // Observar segundaNacionalidadTipo para campos de segunda nacionalidad
  const needsSegundaNacionalidadTipo = fieldNameString === 'segundaNacionalidadDepartamentoId' &&
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
    const isGeographicField = fieldNameString.includes('departamento') ||
      fieldNameString.includes('provincia') ||
      fieldNameString.includes('municipio') ||
      fieldNameString.includes('pais');

    // Actualizar el formulario manualmente
    if (form) {
      form.setFieldValue(getFieldName(), value);
    }

    // Llamar a onFieldChange si existe
    if (onFieldChange) {
      if (field.dependencies) {
        onFieldChange(fieldNameString, value, field.dependencies);
      }

      if (isGeographicField) {
        onFieldChange(fieldNameString, value, []);
      }
    }
  };

  // Obtener opciones para campos select
  const getSelectOptions = () => {
    // Si el campo tiene opciones dinámicas, calcularlas basándose en los valores del formulario
    if (field.dynamicOptions && field.getDynamicOptions && form) {
      const formValues = form.getFieldsValue();
      return field.getDynamicOptions(formValues);
    }

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

      if (fieldNameString === 'paisNacimientoId' && tipoNacionalidad === 'EXTRANJERA') {
        if (boliviaId !== null) {
          selectOptions = selectOptions.filter(opt => {
            const value = typeof opt === 'string' ? opt : opt.value;
            return value !== boliviaId;
          });
        }
      } else if (fieldNameString === 'segundaNacionalidadPaisId' && tipoNacionalidad === 'DOBLE_NACIONALIDAD') {
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

  // Observar campos de dependencia para opciones dinámicas
  const alcanceDocumentoValue = field.dynamicOptions && field.watchFields?.includes('alcanceDocumento') && form
    ? Form.useWatch('alcanceDocumento', form)
    : null;

  // Obtener opciones base
  const selectOptions = getSelectOptions();

  // Recalcular opciones si hay opciones dinámicas y cambió el valor observado
  const baseSelectOptions = field.dynamicOptions && field.getDynamicOptions && form
    ? field.getDynamicOptions(form.getFieldsValue())
    : selectOptions;

  // Usar hook de filtrado geográfico
  const { filteredOptions, dependencyValue } = useGeographicFilter({
    field,
    form,
    selectOptions: baseSelectOptions,
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
  const { shouldCapitalize, handleCapitalizeChange, handleCapitalizeBlur } = useTextCapitalization(getFieldName(), form);

  // Usar hook de parsing de fechas
  const { handleDateChange, handleBlur, handlePressEnter } = useDateParsing(
    getFieldName(),
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

  // IMPORTANTE: Cada switch observa SOLO su propio campo, no otros switches
  // Esto asegura que cada switch sea completamente independiente
  const switchValue = field.type === 'switch' && form && getFieldName()
    ? Form.useWatch(getFieldName(), form) 
    : undefined;

  const renderField = () => {
    switch (field.type) {
      case 'input':
        let dynamicPlaceholder = field.placeholder;
        if (fieldNameString === 'nacionalidad' && form) {
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
            value={form ? form.getFieldValue(getFieldName()) : undefined}
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
            value={form ? form.getFieldValue(getFieldName()) : undefined}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'select':
        // Determinar opciones finales (filtradas o no)
        let finalOptions = filteredOptions;

        // Para departamentos: manejar caso especial de bolivianos
        // Incluye: departamentoNacimientoId, departamentoResidenciaId, 
        // primeraNacionalidadDepartamentoId, segundaNacionalidadDepartamentoId
        const isDepartamentoField = fieldNameString === 'departamentoNacimientoId' ||
          fieldNameString === 'departamentoResidenciaId' ||
          fieldNameString === 'primeraNacionalidadDepartamentoId' ||
          fieldNameString === 'segundaNacionalidadDepartamentoId';

        if (isDepartamentoField) {
          // Determinar el tipo de nacionalidad según el campo
          let tipoNacionalidad = null;

          if (fieldNameString === 'departamentoNacimientoId' || fieldNameString === 'departamentoResidenciaId') {
            tipoNacionalidad = tipoNacionalidadValue !== null && tipoNacionalidadValue !== undefined
              ? tipoNacionalidadValue
              : (form ? form.getFieldValue('tipoNacionalidad') : null);
          } else if (fieldNameString === 'primeraNacionalidadDepartamentoId') {
            tipoNacionalidad = primeraNacionalidadTipoValue !== null && primeraNacionalidadTipoValue !== undefined
              ? primeraNacionalidadTipoValue
              : (form ? form.getFieldValue('primeraNacionalidadTipo') : null);
          } else if (fieldNameString === 'segundaNacionalidadDepartamentoId') {
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

              const currentFieldValue = form ? form.getFieldValue(getFieldName()) : null;
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

            const currentFieldValue = form ? form.getFieldValue(getFieldName()) : null;
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
          const currentFieldValue = form ? form.getFieldValue(getFieldName()) : null;
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
        const isDepartamentoWithTipoNacionalidad = (fieldNameString === 'departamentoNacimientoId' ||
          fieldNameString === 'departamentoResidenciaId' ||
          fieldNameString === 'primeraNacionalidadDepartamentoId' ||
          fieldNameString === 'segundaNacionalidadDepartamentoId') &&
          (field.dependencies?.includes('tipoNacionalidad') ||
            field.dependencies?.includes('primeraNacionalidadTipo') ||
            field.dependencies?.includes('segundaNacionalidadTipo'));

        const selectKey = isGeographicField &&
          field.dependencies &&
          field.dependencies.length > 0 &&
          dependencyValue !== null &&
          !isDepartamentoWithTipoNacionalidad
          ? `${fieldNameString}-${dependencyUpdateKey}-${dependencyValue}`
          : fieldNameString;

        const selectOnChange = (value) => {
          // IMPORTANTE: Ant Design Form.Item maneja el valor automáticamente,
          // pero necesitamos actualizarlo explícitamente para que Form.useWatch lo capture
          if (form) {
            form.setFieldValue(getFieldName(), value);
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
            value={form ? form.getFieldValue(getFieldName()) : undefined}
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
        // IMPORTANTE: Cada switch es completamente independiente
        // Obtiene su valor SOLO de su propio campo en el formulario
        // No depende de otros switches ni comparte estado con ellos
        
        // Obtener el valor actual de ESTE switch específico
        const currentSwitchValue = switchValue !== undefined 
          ? Boolean(switchValue)
          : (field.initialValue !== undefined 
            ? Boolean(field.initialValue) 
            : true);
        
        // IMPORTANTE: Solo mostrar el texto dinámico para switches de documentos
        // Los switches de documentos tienen nombres que siguen el patrón: documento_X_entregado
        const isDocumentSwitch = fieldNameString && 
          fieldNameString.startsWith('documento_') && 
          fieldNameString.endsWith('_entregado');
        
        // Solo generar el texto si es un switch de documento
        const switchText = isDocumentSwitch
          ? (currentSwitchValue === true 
            ? 'Documento entregado' 
            : 'Documento sin presentar')
          : null;
        
        // Handler completamente independiente para ESTE switch específico
        // Solo actualiza el campo de este switch, no afecta a otros switches
        const handleSwitchChange = (checked) => {
          // IMPORTANTE: Solo actualizar el campo de ESTE switch
          // No tocar otros campos del formulario
          if (form && getFieldName()) {
            // Usar setFieldValue para actualizar solo este campo específico
            form.setFieldValue(getFieldName(), checked);
            // No llamar a handleChange aquí porque puede causar efectos secundarios
            // El Form.Item de Ant Design ya maneja la actualización del valor
          }
        };
        
        return (
          <div>
            <Space>
              <FieldSwitch 
                disabled={getDisabledValue()} 
                checked={currentSwitchValue}
                onChange={handleSwitchChange}
              />
              {/* Solo mostrar el texto si es un switch de documento */}
              {isDocumentSwitch && switchText && (
                <span style={{ color: currentSwitchValue === true ? '#52c41a' : '#ff4d4f' }}>
                  {switchText}
                </span>
              )}
            </Space>
            {field.descripcion && (
              <Alert
                banner
                type="info"
                style={{ marginTop: 8, borderRadius: 6 }}
                description={field.descripcion}
              />
            )}
          </div>
        );

      case 'radio':
        const radioOptions = typeof field.options === 'string'
          ? resolveOptions(field.options)
          : field.options || [];

        return (
          <FieldRadio
            disabled={getDisabledValue()}
            options={radioOptions}
            value={form ? form.getFieldValue(getFieldName()) : undefined}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'divider':
        return <FieldDivider />;

      case 'checkbox':
        // IMPORTANTE: Cada checkbox es completamente independiente
        // Observa SOLO su propio campo, no otros checkboxes
        const checkboxObservedValue = field.type === 'checkbox' && form && getFieldName()
          ? Form.useWatch(getFieldName(), form) 
          : undefined;
        
        // Usar el valor observado o el valor del formulario, con fallback a initialValue
        const checkboxValue = checkboxObservedValue !== undefined 
          ? Boolean(checkboxObservedValue)
          : (form && getFieldName()
            ? (form.getFieldValue(getFieldName()) !== undefined 
              ? Boolean(form.getFieldValue(getFieldName()))
              : (field.initialValue !== undefined ? Boolean(field.initialValue) : false))
            : (field.initialValue !== undefined ? Boolean(field.initialValue) : false));
        
        // Handler completamente independiente para ESTE checkbox específico
        // Solo actualiza el campo de este checkbox, no afecta a otros checkboxes
        const handleCheckboxChange = (e) => {
          const checked = e.target.checked;
          // IMPORTANTE: Solo actualizar el campo de ESTE checkbox
          // No tocar otros campos del formulario
          if (form && getFieldName()) {
            // Usar setFieldValue para actualizar solo este campo específico
            form.setFieldValue(getFieldName(), checked);
            // No llamar a handleChange aquí porque puede causar efectos secundarios
            // El Form.Item de Ant Design ya maneja la actualización del valor
          }
        };
        
        return (
          <div>
            <FieldCheckbox
              label={field.label}
              disabled={getDisabledValue()}
              readOnly={readOnly}
              checked={checkboxValue}
              onChange={handleCheckboxChange}
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
        const currentFileList = form?.getFieldValue(getFieldName()) || [];
        const docIdMatch = fieldNameString?.match(/documento_(\d+)_archivo/);
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

      case 'formList':
        return (
          <FieldFormList
            name={field.name}
            label={field.label}
            description={field.description}
            itemFields={field.itemFields || []}
            minItems={field.minItems || 0}
            maxItems={field.maxItems || 10}
            addButtonText={field.addButtonText || 'Agregar'}
            removeButtonText={field.removeButtonText || 'Eliminar'}
            form={form}
            resolveOptions={resolveOptions}
            formValues={formValues}
            onFieldChange={onFieldChange}
            readOnly={readOnly}
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

  // Para checkbox, no mostramos label en Form.Item porque ya está en el componente
  const formItemLabel = field.type === 'checkbox' ? null : field.label;
  const valuePropName = field.type === 'switch' || field.type === 'checkbox' ? 'checked' : 'value';

  const getValueFromEvent = field.type === 'checkbox'
    ? (e) => e.target.checked
    : field.type === 'upload'
      ? (e) => e.fileList
      : undefined;

  // Renderizar label con badge si es necesario (para documentos)
  // NO mostrar tooltip si showTooltip es false o si hay descripción (se mostrará en help)
  const renderLabel = () => {
    if (!formItemLabel) return null;

    if (field.aceptaFotocopia !== undefined) {
      const badgeColor = field.aceptaFotocopia ? 'green' : 'orange';
      const badgeText = field.aceptaFotocopia ? 'Acepta fotocopia' : 'Solo original';

      return (
        <Space>
          <span>{formItemLabel}</span>
          <Tag color={badgeColor} style={{ fontSize: '11px', margin: 0 }}>
            {badgeText}
          </Tag>
        </Space>
      );
    }

    return formItemLabel;
  };

  // IMPORTANTE: Procesar las rules para asegurar que los validators tengan acceso al form
  // Los validators en generateDocumentFields esperan recibir el form como tercer parámetro
  // Capturamos el form en el nivel del componente y lo pasamos al validator a través de un closure
  const processedRules = useMemo(() => {
    if (!field.rules || !Array.isArray(field.rules)) {
      return field.rules;
    }
    
    // Capturar el form actual para usarlo en el closure del validator
    const capturedForm = formToUse;
    
    return field.rules.map(rule => {
      // Si el rule tiene un validator que es una función, envolverlo para pasar el form
      if (rule.validator && typeof rule.validator === 'function') {
        const originalValidator = rule.validator;
        return {
          ...rule,
          validator: async (ruleParam, value) => {
            // Usar el form capturado en el closure
            // Esto asegura que el validator tenga acceso al form para obtener otros valores
            if (capturedForm && typeof capturedForm.getFieldsValue === 'function') {
              return await originalValidator(ruleParam, value, capturedForm);
            } else {
              // Si no hay form disponible, llamar sin el tercer parámetro
              return await originalValidator(ruleParam, value);
            }
          },
        };
      }
      return rule;
    });
  }, [field.rules, formToUse]);

  return (
    <Form.Item
      label={renderLabel()}
      name={field.name}
      rules={processedRules}
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

