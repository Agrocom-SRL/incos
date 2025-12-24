// components/molecules/FormField/FormField.jsx
/**
 * FormField: Molécula genérica para renderizar campos de formulario
 * 
 * Single Responsibility: Renderizar un campo de formulario basado en configuración
 */

import { Form, Input, Select, DatePicker, InputNumber, Switch, Checkbox, Upload, Button, Tooltip, Tag, Space, Typography, Radio, Divider } from 'antd';
import { UploadOutlined, InfoCircleOutlined, FileTextOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Configurar dayjs para parsear formatos personalizados
dayjs.extend(customParseFormat);

const { Option } = Select;
const { TextArea } = Input;

const FormField = ({ field, form, resolveOptions, formValues, onFieldChange, readOnly = false }) => {
  // Ref para rastrear los valores previos de las dependencias y evitar loops infinitos
  const prevDependencyValuesRef = useRef(null);
  
  // Estado para controlar si se muestra el input de upload o el documento existente
  // Usar el nombre del campo como clave para rastrear múltiples campos de upload
  const [uploadStates, setUploadStates] = useState({});
  
  // Observar el valor de tipoDiscapacidadId para mostrar la descripción
  // Esto debe estar fuera del switch para que Form.useWatch funcione correctamente
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
        // Obtener las opciones del campo usando resolveOptions
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
  const isGeographicField = useMemo(() => {
    return field.type === 'select' && 
      field.dependencies && 
      field.dependencies.length > 0 &&
      (field.name.includes('departamento') || 
       field.name.includes('provincia') || 
       field.name.includes('municipio') ||
       field.name.includes('pais'));
  }, [field.type, field.dependencies, field.name]);
  
  // Ref para rastrear si ya se logueó la detección del campo geográfico
  const hasLoggedGeographicField = useRef(false);
  
  // DEBUG: Mostrar si el campo es detectado como geográfico (solo una vez)
  useEffect(() => {
    if (field.type === 'select' && (field.options === 'provincias' || field.options === 'municipios') && !hasLoggedGeographicField.current) {
      console.log(`[FormField] 🗺️ DETECCIÓN DE CAMPO GEOGRÁFICO - Campo: ${field.name}`, {
        campo: field.name,
        tipo: field.type,
        opciones: field.options,
        tieneDependencies: !!field.dependencies,
        dependencies: field.dependencies,
        isGeographicField,
      });
      hasLoggedGeographicField.current = true;
    }
  }, [field.name, field.type, field.options, field.dependencies, isGeographicField]);
  
  // Ref para rastrear el conteo de opciones y evitar logs duplicados
  const prevOptionsCountRef = useRef({});
  
  // Solo usar Form.useWatch para campos geográficos (select con dependencias)
  // Esto observa cambios en tiempo real
  // IMPORTANTE: Form.useWatch retorna un objeto con los valores observados cuando se pasa un array
  const dependencyValues = isGeographicField && form && field.dependencies && field.dependencies.length > 0
    ? Form.useWatch(field.dependencies, form)
    : null;
  
  // Observar directamente el primer campo de dependencia para forzar re-render cuando cambia
  const primaryDependencyValue = isGeographicField && form && field.dependencies && field.dependencies.length > 0
    ? Form.useWatch(field.dependencies[0], form)
    : null;
  
  // Estado para forzar re-render cuando cambian las dependencias
  // Esto es necesario para que las opciones se actualicen cuando se cargan desde el backend
  const [dependencyUpdateKey, setDependencyUpdateKey] = useState(0);
  
  // Efecto para actualizar la clave cuando cambian las dependencias
  // Esto fuerza un re-render del componente para mostrar las nuevas opciones
  useEffect(() => {
    if (isGeographicField && primaryDependencyValue !== undefined && primaryDependencyValue !== null) {
      setDependencyUpdateKey(prev => prev + 1);
    }
  }, [isGeographicField, primaryDependencyValue]);
  
  // Observar tipoNacionalidad específicamente para campos de departamento que dependen de él
  // Esto es necesario para filtrar departamentos de Bolivia automáticamente
  const needsTipoNacionalidad = (field.name === 'departamentoNacimientoId' || field.name === 'departamentoResidenciaId') &&
    field.dependencies?.includes('tipoNacionalidad');
  const tipoNacionalidadValue = needsTipoNacionalidad && form
    ? Form.useWatch('tipoNacionalidad', form)
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
  
  // Manejar dependencias: cuando cambia un campo del que depende, limpiar este campo si el valor actual no es válido
  // SOLO para campos geográficos (select)
  // IMPORTANTE: Solo limpiar si el valor actual no es válido para la nueva dependencia
  useEffect(() => {
    if (isGeographicField && form && field.dependencies && field.dependencies.length > 0) {
      // Obtener valor de dependencia (de dependencyValues observado o del valor actual)
      const depValue = effectiveDependencyValue;
      const normalizedDepValue = depValue !== null && depValue !== undefined ? Number(depValue) : null;
      
      // Convertir a string para comparación profunda
      const dependencyValueKey = JSON.stringify(normalizedDepValue);
      
      // Solo ejecutar si las dependencias realmente cambiaron
      if (prevDependencyValuesRef.current !== dependencyValueKey) {
        const prevDepValue = prevDependencyValuesRef.current ? JSON.parse(prevDependencyValuesRef.current) : null;
        prevDependencyValuesRef.current = dependencyValueKey;
        
        // Actualizar el valor actual si cambió
        if (normalizedDepValue !== currentDependencyValue) {
          setCurrentDependencyValue(normalizedDepValue);
        }
        
        // Si la dependencia cambió a un valor diferente (no solo se estableció por primera vez)
        // y hay un valor actual, verificar si es válido para la nueva dependencia
        if (prevDepValue !== null && normalizedDepValue !== null && normalizedDepValue !== prevDepValue) {
          const currentValue = form.getFieldValue(field.name);
          
          if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
            // Verificar si el valor actual es válido para la nueva dependencia
            // Obtener todas las opciones disponibles
            const allOptions = typeof field.options === 'string' && resolveOptions
              ? resolveOptions(field.options)
              : field.options || [];
            
            // Determinar qué tipo de filtrado aplicar
            const isProvinciasField = field.options === 'provincias' || (typeof field.options === 'string' && field.options === 'provincias');
            const isMunicipiosField = field.options === 'municipios' || (typeof field.options === 'string' && field.options === 'municipios');
            const dependencyFieldName = field.dependencies[0];
            const isDependenciaDepartamento = dependencyFieldName && dependencyFieldName.toLowerCase().includes('departamento');
            const isDependenciaProvincia = dependencyFieldName && dependencyFieldName.toLowerCase().includes('provincia');
            
            // Verificar si el valor actual es válido para la nueva dependencia
            let isValid = false;
            if (isProvinciasField && isDependenciaDepartamento) {
              const currentOption = allOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentValue);
              });
              isValid = currentOption && Number(currentOption.departamentoId) === normalizedDepValue;
            } else if (isMunicipiosField && isDependenciaProvincia) {
              const currentOption = allOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentValue);
              });
              isValid = currentOption && Number(currentOption.provinciaId) === normalizedDepValue;
            }
            
            // Si el valor actual no es válido para la nueva dependencia, limpiarlo
            if (!isValid) {
              form.setFieldValue(field.name, undefined);
            }
          }
        }
      }
    }
  }, [isGeographicField, field.dependencies, field.name, field.options, dependencyValues, effectiveDependencyValue, currentDependencyValue, form, resolveOptions]);
  
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
  // También manejar cambios en campos geográficos que necesitan cargar datos en cascada
  // IMPORTANTE: Este onChange debe permitir que Ant Design actualice el formulario primero
  const handleChange = (value) => {
    const isGeographicField = field.name.includes('departamento') || 
                              field.name.includes('provincia') || 
                              field.name.includes('municipio') ||
                              field.name.includes('pais');
    
    // DEBUG: Log cuando se cambia un campo geográfico
    if (isGeographicField) {
      console.log(`[FormField] 🔄 CAMBIO EN CAMPO GEOGRÁFICO - Campo: ${field.name}`, {
        campo: field.name,
        nuevoValor: value,
        tipo: field.type,
        opciones: field.options,
      });
    }
    
    // IMPORTANTE: Primero actualizar el formulario manualmente si es necesario
    // Ant Design Form.Item debería hacerlo automáticamente, pero lo hacemos explícitamente
    if (form) {
      form.setFieldValue(field.name, value);
    }
    
    // Llamar a onFieldChange si existe
    // Para campos geográficos (departamento, provincia, municipio), siempre llamar a onFieldChange
    // para que se carguen los datos en cascada (provincias cuando cambia departamento, etc.)
    if (onFieldChange) {
      // Si tiene dependencies, llamar con esas dependencies (para shouldRender)
      if (field.dependencies) {
        onFieldChange(field.name, value, field.dependencies);
      }
      
      // Si es un campo geográfico, también llamar sin dependencies para activar la cascada
      // Esto asegura que handleFieldChange en Registrar.jsx detecte el cambio y cargue provincias/municipios
      if (isGeographicField) {
        onFieldChange(field.name, value, []);
      }
    }
    
    // DEBUG: Verificar que el valor se guardó en el formulario después de un pequeño delay
    if (isGeographicField && form) {
      setTimeout(() => {
        const valorGuardado = form.getFieldValue(field.name);
        console.log(`[FormField] ✅ VALOR GUARDADO EN FORMULARIO - Campo: ${field.name}`, {
          campo: field.name,
          valorGuardado,
          valorEsperado: value,
          coincide: valorGuardado === value,
        });
      }, 100);
    }
  };

  const renderField = () => {
    // Separar props para campos que soportan readOnly vs disabled
    // IMPORTANTE: No incluir onChange en commonProps para Select
    // porque lo manejaremos específicamente para cada tipo de campo
    const commonProps = {
      placeholder: field.placeholder,
      disabled: field.disabled, // disabled solo para campos que no soportan readOnly
    };
    
    // Props para campos que soportan readOnly (Input, TextArea, InputNumber)
    const readOnlyProps = {
      readOnly: readOnly,
      disabled: field.disabled, // Mantener disabled del campo si existe
    };
    
    // Props para campos que solo soportan disabled (Select, DatePicker, Switch, Checkbox, Radio)
    // El disabled puede ser un booleano o una función que recibe formValues
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

    // Función para capitalizar texto (primera letra de cada palabra en mayúscula)
    const capitalizeText = (text) => {
      if (!text) return text;
      return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Función para manejar el cambio en inputs que requieren capitalización
    const handleCapitalizeChange = (e, fieldName) => {
      const value = e.target.value;
      const capitalizedValue = capitalizeText(value);
      if (form) {
        form.setFieldsValue({ [fieldName]: capitalizedValue });
      }
    };

    switch (field.type) {
      case 'input':
        // Campos que requieren capitalización automática
        const shouldCapitalize = ['nombres', 'apellidoPaterno', 'apellidoMaterno'].includes(field.name);
        
        // Para el campo de nacionalidad, cambiar placeholder dinámicamente si es extranjero
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
          <Input
            {...commonProps}
            {...readOnlyProps}
            type={field.inputType || 'text'}
            maxLength={field.maxLength}
            placeholder={dynamicPlaceholder}
            onChange={shouldCapitalize && !readOnly ? (e) => handleCapitalizeChange(e, field.name) : undefined}
            onBlur={shouldCapitalize && !readOnly ? (e) => {
              const value = e.target.value;
              const capitalizedValue = capitalizeText(value);
              if (form && value !== capitalizedValue) {
                form.setFieldsValue({ [field.name]: capitalizedValue });
              }
            } : undefined}
          />
        );

      case 'textarea':
        return (
          <TextArea
            {...commonProps}
            {...readOnlyProps}
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
        
        // DEBUG: Mostrar lista completa de provincias y municipios cuando se cargan (solo cuando cambia la cantidad)
        const optionsKey = `${field.name}-${field.options}`;
        const prevCount = prevOptionsCountRef.current[optionsKey] || 0;
        
        if (field.options === 'provincias' || (typeof field.options === 'string' && field.options === 'provincias')) {
          if (selectOptions.length > 0 && selectOptions.length !== prevCount) {
            console.log(`[FormField] 🔵 PROVINCIAS CARGADAS - Campo: ${field.name}`, {
              totalProvincias: selectOptions.length,
              provincias: selectOptions.slice(0, 10).map(opt => ({
                id: typeof opt === 'object' ? opt.value : opt,
                nombre: typeof opt === 'object' ? opt.label : opt,
                departamentoId: typeof opt === 'object' ? opt.departamentoId : null,
              })),
              muestra: 'Primeras 10 de ' + selectOptions.length,
            });
            prevOptionsCountRef.current[optionsKey] = selectOptions.length;
          }
        }
        if (field.options === 'municipios' || (typeof field.options === 'string' && field.options === 'municipios')) {
          if (selectOptions.length > 0 && selectOptions.length !== prevCount) {
            console.log(`[FormField] 🟢 MUNICIPIOS CARGADOS - Campo: ${field.name}`, {
              totalMunicipios: selectOptions.length,
              municipios: selectOptions.slice(0, 10).map(opt => ({
                id: typeof opt === 'object' ? opt.value : opt,
                nombre: typeof opt === 'object' ? opt.label : opt,
                provinciaId: typeof opt === 'object' ? opt.provinciaId : null,
              })),
              muestra: 'Primeros 10 de ' + selectOptions.length,
            });
            prevOptionsCountRef.current[optionsKey] = selectOptions.length;
          }
        }

        // Filtrar países según el contexto:
        // 1. Para extranjeros simples: excluir Bolivia
        // 2. Para segunda nacionalidad en doble nacionalidad: excluir el país de la primera nacionalidad
        if (field.options === 'paises' || (typeof field.options === 'string' && field.options === 'paises')) {
          const tipoNacionalidad = form ? form.getFieldValue('tipoNacionalidad') : null;
          const primeraNacionalidadPaisId = form ? form.getFieldValue('primeraNacionalidadPaisId') : null;
          const primeraNacionalidadTipo = form ? form.getFieldValue('primeraNacionalidadTipo') : null;
          
          // Buscar el ID de Bolivia (asumiendo que se llama "Bolivia" o tiene ID 1)
          const boliviaOption = selectOptions.find(opt => {
            const label = typeof opt === 'string' ? opt : opt.label;
            const value = typeof opt === 'string' ? opt : opt.value;
            return (typeof label === 'string' && label.toLowerCase().includes('bolivia')) || value === 1;
          });
          const boliviaId = boliviaOption ? (typeof boliviaOption === 'string' ? null : boliviaOption.value) : null;
          
          if (field.name === 'paisNacimientoId' && tipoNacionalidad === 'EXTRANJERA') {
            // Para extranjeros simples: excluir Bolivia
            if (boliviaId !== null) {
              selectOptions = selectOptions.filter(opt => {
                const value = typeof opt === 'string' ? opt : opt.value;
                return value !== boliviaId;
              });
            }
          } else if (field.name === 'segundaNacionalidadPaisId' && tipoNacionalidad === 'DOBLE_NACIONALIDAD') {
            // Para segunda nacionalidad: excluir el país de la primera nacionalidad
            const paisesAExcluir = [];
            if (primeraNacionalidadPaisId) {
              paisesAExcluir.push(primeraNacionalidadPaisId);
            }
            // Si la primera nacionalidad es boliviana, también excluir Bolivia
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

        // Obtener dependencyValue fuera del bloque if para que esté disponible en todo el scope
        // Esto es necesario para usarlo en el key del Select y forzar re-render
        let dependencyValue = null;
        if (field.dependencies && field.dependencies.length > 0 && isGeographicField) {
          // SOLO para campos geográficos, usar dependencyValues observado o leer directamente del formulario
          // IMPORTANTE: Siempre intentar obtener el valor del formulario directamente para asegurar
          // que tenemos el valor más reciente, incluso si Form.useWatch no se ha actualizado aún
          const watchedValue = dependencyValues?.[field.dependencies[0]];
          const formValue = form ? form.getFieldValue(field.dependencies[0]) : null;
          
          // DEBUG: Verificar todos los valores posibles
          const allFormValues = form ? form.getFieldsValue() : {};
          const dependencyFieldName = field.dependencies[0];
          
          // Priorizar el valor del formulario si está disponible, sino usar el valor observado
          // Normalizar a número para comparaciones consistentes
          const rawValue = formValue !== undefined && formValue !== null ? formValue : watchedValue;
          dependencyValue = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
          
          // DEBUG: Mostrar información de dependencias para campos geográficos (solo cuando cambia)
          const depLogKey = `${field.name}-${dependencyValue}`;
          if (field.options === 'provincias' || field.options === 'municipios') {
            const prevDepLog = prevOptionsCountRef.current[`dep-${field.name}`];
            if (prevDepLog !== depLogKey) {
              console.log(`[FormField] 📊 DEPENDENCIAS - Campo: ${field.name}`, {
                campo: field.name,
                tipoOpciones: field.options,
                dependencia: dependencyFieldName,
                watchedValue,
                formValue,
                dependencyValue,
                valorEnFormValues: allFormValues[dependencyFieldName],
                todosLosValores: Object.keys(allFormValues).filter(k => k.includes('departamento') || k.includes('provincia') || k.includes('municipio')).reduce((acc, k) => {
                  acc[k] = allFormValues[k];
                  return acc;
                }, {}),
                isGeographicField,
              });
              prevOptionsCountRef.current[`dep-${field.name}`] = depLogKey;
            }
          }
        }
        
        // Filtrar opciones basado en dependencias SOLO para campos geográficos
        // Los campos con shouldRender (como tipoDiscapacidadId) NO filtran opciones,
        // solo se muestran/ocultan basándose en shouldRender
        if (field.dependencies && field.dependencies.length > 0 && isGeographicField) {
          
          // Obtener el valor actual seleccionado en este campo (si existe)
          const currentFieldValue = form ? form.getFieldValue(field.name) : null;
          
          // Para departamentos: manejar caso especial de bolivianos
          if (field.name === 'departamentoNacimientoId' || field.name === 'departamentoResidenciaId') {
            // Usar el valor observado si está disponible, sino leer del formulario
            const tipoNacionalidad = tipoNacionalidadValue !== null && tipoNacionalidadValue !== undefined
              ? tipoNacionalidadValue
              : (form ? form.getFieldValue('tipoNacionalidad') : null);
            
            // Si es boliviano, usar ID de Bolivia automáticamente
            if (tipoNacionalidad === 'BOLIVIANA') {
              // Buscar el ID de Bolivia en la lista de países
              const paisesOptions = typeof field.options === 'string' && resolveOptions
                ? resolveOptions('paises')
                : [];
              const boliviaOption = paisesOptions.find(opt => {
                const label = typeof opt === 'string' ? opt : opt.label;
                const value = typeof opt === 'string' ? opt : opt.value;
                return (typeof label === 'string' && label.toLowerCase().includes('bolivia')) || value === 1;
              });
              const boliviaId = boliviaOption ? (typeof boliviaOption === 'string' ? null : Number(boliviaOption.value)) : null;
              
              // Filtrar departamentos por ID de Bolivia
              if (boliviaId !== null) {
                const originalOptions = [...selectOptions];
                selectOptions = selectOptions.filter(opt => {
                  const optPaisId = typeof opt === 'object' && opt.paisId !== undefined ? Number(opt.paisId) : null;
                  return optPaisId === boliviaId;
                });
                
                // Si hay un valor seleccionado pero no está en las opciones filtradas, agregarlo
                if (currentFieldValue && !selectOptions.find(opt => {
                  const optValue = typeof opt === 'string' ? opt : opt.value;
                  return Number(optValue) === Number(currentFieldValue);
                })) {
                  const selectedOption = originalOptions.find(opt => {
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    return Number(optValue) === Number(currentFieldValue);
                  });
                  if (selectedOption) {
                    selectOptions.push(selectedOption);
                  }
                }
              }
            } else if (dependencyValue !== null) {
              // Si hay un paisId explícito (para extranjeros o doble nacionalidad), usarlo
              const originalOptions = [...selectOptions];
              selectOptions = selectOptions.filter(opt => {
                const optPaisId = typeof opt === 'object' && opt.paisId !== undefined ? Number(opt.paisId) : null;
                return optPaisId === dependencyValue;
              });
              
              if (currentFieldValue && !selectOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentFieldValue);
              })) {
                const selectedOption = originalOptions.find(opt => {
                  const optValue = typeof opt === 'string' ? opt : opt.value;
                  return Number(optValue) === Number(currentFieldValue);
                });
                if (selectedOption) {
                  selectOptions.push(selectedOption);
                }
              }
            }
          } else if (dependencyValue !== null) {
            // Filtrar opciones según la dependencia geográfica de forma genérica
            // Determinar el tipo de filtrado basándose en el tipo de opciones y la dependencia
            const originalOptions = [...selectOptions];
            const dependencyFieldName = field.dependencies[0];
            
            // Determinar qué tipo de filtrado aplicar basándose en:
            // 1. El tipo de opciones (provincias o municipios)
            // 2. El nombre del campo padre en dependencies
            const isProvinciasField = field.options === 'provincias' || (typeof field.options === 'string' && field.options === 'provincias');
            const isMunicipiosField = field.options === 'municipios' || (typeof field.options === 'string' && field.options === 'municipios');
            const isDependenciaDepartamento = dependencyFieldName && dependencyFieldName.toLowerCase().includes('departamento');
            const isDependenciaProvincia = dependencyFieldName && dependencyFieldName.toLowerCase().includes('provincia');
            
            // Aplicar filtrado genérico basado en el tipo de campo y su dependencia
            if (isProvinciasField && isDependenciaDepartamento) {
              // Si es campo de provincias y depende de un departamento, filtrar por departamentoId
              const opcionesAntes = selectOptions.length;
              console.log(`[FormField] 🔍 INICIANDO FILTRADO DE PROVINCIAS - Campo: ${field.name}`, {
                campo: field.name,
                dependencia: dependencyFieldName,
                dependencyValue,
                opcionesAntes,
                opcionesOriginales: selectOptions.slice(0, 10).map(opt => ({
                  id: typeof opt === 'object' ? opt.value : opt,
                  nombre: typeof opt === 'object' ? opt.label : opt,
                  departamentoId: typeof opt === 'object' ? opt.departamentoId : null,
                })),
              });
              
              selectOptions = selectOptions.filter(opt => {
                const optDepartamentoId = typeof opt === 'object' && opt.departamentoId !== undefined ? Number(opt.departamentoId) : null;
                const coincide = optDepartamentoId === dependencyValue;
                return coincide;
              });
              
              const opcionesDespues = selectOptions.length;
              console.log(`[FormField] ✅ FILTRADO DE PROVINCIAS COMPLETADO - Campo: ${field.name}`, {
                campo: field.name,
                dependencia: dependencyFieldName,
                dependencyValue,
                opcionesAntes,
                opcionesDespues,
                provinciasFiltradas: selectOptions.map(opt => ({
                  id: typeof opt === 'object' ? opt.value : opt,
                  nombre: typeof opt === 'object' ? opt.label : opt,
                  departamentoId: typeof opt === 'object' ? opt.departamentoId : null,
                })),
              });
            } else if (isMunicipiosField && isDependenciaProvincia) {
              // Si es campo de municipios y depende de una provincia, filtrar por provinciaId
              const opcionesAntes = selectOptions.length;
              console.log(`[FormField] 🔍 INICIANDO FILTRADO DE MUNICIPIOS - Campo: ${field.name}`, {
                campo: field.name,
                dependencia: dependencyFieldName,
                dependencyValue,
                opcionesAntes,
                opcionesOriginales: selectOptions.slice(0, 10).map(opt => ({
                  id: typeof opt === 'object' ? opt.value : opt,
                  nombre: typeof opt === 'object' ? opt.label : opt,
                  provinciaId: typeof opt === 'object' ? opt.provinciaId : null,
                })),
              });
              
              selectOptions = selectOptions.filter(opt => {
                const optProvinciaId = typeof opt === 'object' && opt.provinciaId !== undefined ? Number(opt.provinciaId) : null;
                const coincide = optProvinciaId === dependencyValue;
                return coincide;
              });
              
              const opcionesDespues = selectOptions.length;
              console.log(`[FormField] ✅ FILTRADO DE MUNICIPIOS COMPLETADO - Campo: ${field.name}`, {
                campo: field.name,
                dependencia: dependencyFieldName,
                dependencyValue,
                opcionesAntes,
                opcionesDespues,
                municipiosFiltrados: selectOptions.map(opt => ({
                  id: typeof opt === 'object' ? opt.value : opt,
                  nombre: typeof opt === 'object' ? opt.label : opt,
                  provinciaId: typeof opt === 'object' ? opt.provinciaId : null,
                })),
              });
            }
            
            // IMPORTANTE: Si hay un valor seleccionado pero no está en las opciones filtradas,
            // agregarlo a las opciones para que se muestre correctamente
            // Esto puede pasar cuando se vuelve a un paso anterior y el valor ya está guardado
            if (currentFieldValue && !selectOptions.find(opt => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              return Number(optValue) === Number(currentFieldValue);
            })) {
              // Buscar el valor en las opciones originales (sin filtrar)
              const selectedOption = originalOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentFieldValue);
              });
              
              // Si se encuentra en las opciones originales, agregarlo a las opciones filtradas
              if (selectedOption) {
                selectOptions.push(selectedOption);
              }
            }
          } else {
            // Si no hay valor en la dependencia geográfica, intentar obtenerlo del formulario una vez más
            const latestDependencyValue = form ? form.getFieldValue(field.dependencies[0]) : null;
            const normalizedLatestValue = latestDependencyValue !== null && latestDependencyValue !== undefined ? Number(latestDependencyValue) : null;
            
            if (normalizedLatestValue !== null) {
              // Si hay un valor de dependencia en el formulario, filtrar con ese valor
              const originalOptions = [...selectOptions];
              const dependencyFieldName = field.dependencies[0];
              
              // Determinar el tipo de filtrado de forma genérica
              const isProvinciasField = field.options === 'provincias' || (typeof field.options === 'string' && field.options === 'provincias');
              const isMunicipiosField = field.options === 'municipios' || (typeof field.options === 'string' && field.options === 'municipios');
              const isDependenciaDepartamento = dependencyFieldName && dependencyFieldName.toLowerCase().includes('departamento');
              const isDependenciaProvincia = dependencyFieldName && dependencyFieldName.toLowerCase().includes('provincia');
              
              // Aplicar filtrado genérico
              if (isProvinciasField && isDependenciaDepartamento) {
                const opcionesAntes = selectOptions.length;
                console.log(`[FormField] 🔍 FILTRADO TARDÍO DE PROVINCIAS - Campo: ${field.name}`, {
                  campo: field.name,
                  dependencia: dependencyFieldName,
                  normalizedLatestValue,
                  opcionesAntes,
                });
                
                selectOptions = selectOptions.filter(opt => {
                  const optDepartamentoId = typeof opt === 'object' && opt.departamentoId !== undefined ? Number(opt.departamentoId) : null;
                  return optDepartamentoId === normalizedLatestValue;
                });
                
                console.log(`[FormField] ✅ FILTRADO TARDÍO COMPLETADO - Campo: ${field.name}`, {
                  campo: field.name,
                  opcionesDespues: selectOptions.length,
                });
              } else if (isMunicipiosField && isDependenciaProvincia) {
                const opcionesAntes = selectOptions.length;
                console.log(`[FormField] 🔍 FILTRADO TARDÍO DE MUNICIPIOS - Campo: ${field.name}`, {
                  campo: field.name,
                  dependencia: dependencyFieldName,
                  normalizedLatestValue,
                  opcionesAntes,
                });
                
                selectOptions = selectOptions.filter(opt => {
                  const optProvinciaId = typeof opt === 'object' && opt.provinciaId !== undefined ? Number(opt.provinciaId) : null;
                  return optProvinciaId === normalizedLatestValue;
                });
                
                console.log(`[FormField] ✅ FILTRADO TARDÍO COMPLETADO - Campo: ${field.name}`, {
                  campo: field.name,
                  opcionesDespues: selectOptions.length,
                });
              }
              
              // Si hay un valor seleccionado pero no está en las opciones filtradas, agregarlo
              if (currentFieldValue && !selectOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentFieldValue);
              })) {
                const selectedOption = originalOptions.find(opt => {
                  const optValue = typeof opt === 'string' ? opt : opt.value;
                  return Number(optValue) === Number(currentFieldValue);
                });
                if (selectedOption) {
                  selectOptions.push(selectedOption);
                }
              }
            } else if (!currentFieldValue) {
              // Si no hay valor seleccionado ni dependencia, no mostrar opciones
              console.log(`[FormField] ⚠️ SIN DEPENDENCIA NI VALOR - Campo: ${field.name}`, {
                campo: field.name,
                tipoOpciones: field.options,
                dependencia: field.dependencies[0],
                dependencyValue,
                latestDependencyValue,
                normalizedLatestValue,
                currentFieldValue,
                accion: 'Limpiando opciones (sin dependencia ni valor seleccionado)',
              });
              selectOptions = [];
            } else {
              // Si hay currentFieldValue pero no hay dependencyValue, mantener todas las opciones
              // para que el valor seleccionado se mantenga visible
              console.log(`[FormField] ⚠️ SIN DEPENDENCIA PERO CON VALOR - Campo: ${field.name}`, {
                campo: field.name,
                tipoOpciones: field.options,
                dependencia: field.dependencies[0],
                dependencyValue,
                latestDependencyValue,
                normalizedLatestValue,
                currentFieldValue,
                accion: 'Manteniendo todas las opciones (hay valor seleccionado)',
                totalOpciones: selectOptions.length,
              });
            }
          }
        }
        // Para campos no geográficos con dependencies (como tipoDiscapacidadId),
        // NO filtrar opciones - las dependencias solo se usan para shouldRender

        // La descripción se obtiene del estado local actualizado por el efecto

        // Usar dependencyUpdateKey para forzar re-render cuando cambian las dependencias
        // Esto es especialmente importante para campos geográficos que dependen de otros campos
        const selectKey = isGeographicField && field.dependencies && field.dependencies.length > 0
          ? `${field.name}-${dependencyUpdateKey}-${dependencyValue || 'none'}`
          : field.name;
        
        // Crear un onChange específico para Select que actualice el formulario y llame a handleChange
        const selectOnChange = (value) => {
          // IMPORTANTE: Actualizar el formulario primero para que Form.useWatch lo capture
          if (form) {
            form.setFieldValue(field.name, value);
          }
          // Luego llamar a handleChange para logs y lógica personalizada
          handleChange(value);
        };
        
        return (
          <div>
            <Select 
              key={selectKey}
              {...commonProps} 
              {...disabledProps} 
              allowClear={field.allowClear}
              onChange={readOnly ? undefined : selectOnChange}
            >
              {selectOptions.map((option) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                const descripcion = typeof option === 'object' ? option.descripcion : null;
                return (
                  <Option key={value} value={value} title={descripcion || label}>
                    {label}
                  </Option>
                );
              })}
            </Select>
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
        // Función para parsear fechas con guiones o barras (DD-MM-YYYY o DD/MM/YYYY)
        const parseDateWithMultipleFormats = (dateString) => {
          if (!dateString || typeof dateString !== 'string') return null;
          
          // Limpiar espacios
          const cleaned = dateString.trim();
          
          // Intentar parsear con guiones primero (DD-MM-YYYY)
          let parsed = dayjs(cleaned, 'DD-MM-YYYY', true);
          if (parsed.isValid()) {
            return parsed;
          }
          
          // Si no funciona, intentar con barras (DD/MM/YYYY)
          parsed = dayjs(cleaned, 'DD/MM/YYYY', true);
          if (parsed.isValid()) {
            return parsed;
          }
          
          return null;
        };
        
        // Handler personalizado para onChange que acepta ambos formatos
        const handleDateChange = (date, dateString) => {
          // Si hay un date válido (seleccionado del calendario), pasar directamente
          if (date && dayjs.isDayjs(date) && date.isValid()) {
            if (commonProps.onChange) {
              commonProps.onChange(date, dateString);
            }
            return;
          }
          
          // Si hay un dateString (input manual del usuario), intentar parsear ambos formatos
          if (dateString && dateString.trim()) {
            const parsed = parseDateWithMultipleFormats(dateString);
            if (parsed && parsed.isValid()) {
              // Usar el formato configurado para mostrar (normalizar al formato del campo)
              const format = field.format || 'DD-MM-YYYY';
              const formattedString = parsed.format(format);
              // Actualizar el valor del formulario con la fecha parseada
              if (form) {
                form.setFieldsValue({ [field.name]: parsed });
              }
              if (commonProps.onChange) {
                commonProps.onChange(parsed, formattedString);
              }
              return;
            }
          }
          
          // Si es null (limpiado), pasar directamente
          if (date === null || date === undefined) {
            if (commonProps.onChange) {
              commonProps.onChange(date, dateString);
            }
          }
        };
        
        // Handler para cuando el usuario presiona Enter o pierde el foco
        // Esto intercepta el valor del input antes de que el DatePicker lo rechace
        const handleBlur = (e) => {
          // Intentar obtener el valor del input de diferentes formas según la versión de Ant Design
          let inputValue = null;
          if (e?.target?.value) {
            inputValue = e.target.value;
          } else if (e?.target?.input?.value) {
            inputValue = e.target.input.value;
          } else if (typeof e === 'string') {
            inputValue = e;
          }
          
          if (inputValue && inputValue.trim()) {
            const parsed = parseDateWithMultipleFormats(inputValue);
            if (parsed && parsed.isValid()) {
              // Actualizar el valor del formulario con la fecha parseada
              if (form) {
                form.setFieldsValue({ [field.name]: parsed });
              }
            }
          }
        };
        
        // Handler para cuando el usuario presiona Enter
        const handlePressEnter = (e) => {
          // Intentar obtener el valor del input de diferentes formas
          let inputValue = null;
          if (e?.target?.value) {
            inputValue = e.target.value;
          } else if (e?.target?.input?.value) {
            inputValue = e.target.input.value;
          } else if (typeof e === 'string') {
            inputValue = e;
          }
          
          if (inputValue && inputValue.trim()) {
            const parsed = parseDateWithMultipleFormats(inputValue);
            if (parsed && parsed.isValid()) {
              if (form) {
                form.setFieldsValue({ [field.name]: parsed });
              }
            }
          }
        };
        
        return (
          <DatePicker
            style={{ width: '100%' }}
            format={field.format || 'DD-MM-YYYY'}
            disabledDate={field.disabledDate}
            getPopupContainer={(trigger) => trigger.parentElement}
            placeholder={field.placeholder || 'DD-MM-YYYY o DD/MM/YYYY'}
            {...commonProps}
            {...disabledProps}
            onChange={handleDateChange}
            onBlur={handleBlur}
            onPressEnter={handlePressEnter}
            allowClear
            inputReadOnly={false}
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
            {...readOnlyProps}
          />
        );

      case 'switch':
        return <Switch {...commonProps} {...disabledProps} />;

      case 'radio':
        const radioOptions = typeof field.options === 'string'
          ? resolveOptions(field.options)
          : field.options || [];
        
        return (
          <Radio.Group 
            {...commonProps} 
            {...disabledProps}
            style={{ 
              display: 'flex',
              width: '100%',
              gap: '12px',
            }}
          >
            {radioOptions.map((option) => (
              <Radio 
                key={option.value} 
                value={option.value}
                style={{
                  flex: 1,
                  marginRight: 0,
                  marginBottom: 0,
                  fontSize: '16px',
                  padding: '8px 12px',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                }}
              >
                <span style={{ paddingLeft: '8px' }}>{option.label}</span>
              </Radio>
            ))}
          </Radio.Group>
        );

      case 'divider':
        return <Divider style={{ margin: '16px 0' }} />;

      case 'checkbox':
        // En modo readOnly, mostrar el estado como texto con icono en lugar del checkbox
        if (readOnly) {
          const currentValue = form ? form.getFieldValue(field.name) : null;
          const isChecked = currentValue === true || currentValue === 1;
          
          // Si hay información de documento, mostrar solo el tooltip (sin badge) en el checkbox
          if (field.aceptaFotocopia !== undefined || field.descripcion) {
            const tooltipContent = field.descripcion 
              ? `${field.descripcion}${field.aceptaFotocopia ? ' (Se acepta fotocopia)' : ' (Solo original, no se acepta fotocopia)'}`
              : (field.aceptaFotocopia ? 'Se acepta fotocopia' : 'Solo original, no se acepta fotocopia');
            
            return (
              <Space size="small" style={{ color: isChecked ? '#52c41a' : '#8c8c8c' }}>
                {isChecked ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
                )}
                <Typography.Text style={{ color: 'inherit' }}>
                  {field.label}
                </Typography.Text>
                {tooltipContent && (
                  <Tooltip title={tooltipContent}>
                    <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                  </Tooltip>
                )}
              </Space>
            );
          }
          
          return (
            <Space size="small" style={{ color: isChecked ? '#52c41a' : '#8c8c8c' }}>
              {isChecked ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
              )}
              <Typography.Text style={{ color: 'inherit' }}>
                {field.label || 'Sin etiqueta'}
              </Typography.Text>
            </Space>
          );
        }
        
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
                {!readOnly && (
                  <Button 
                    type="link" 
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setMostrarInputUpload(true)}
                  >
                    Modificar
                  </Button>
                )}
              </Space>
            </Space>
          );
        }
        
        // Mostrar input de upload
        const currentFileList = form?.getFieldValue(field.name) || [];
        
        // Obtener el ID de documentación del nombre del campo
        // Formato: documento_{id}_archivo
        const docIdMatch = field.name?.match(/documento_(\d+)_archivo/);
        const docId = docIdMatch ? docIdMatch[1] : null;
        const checkboxFieldName = docId ? `documento_${docId}_entregado` : null;
        
        return (
          <Upload
            disabled={readOnly}
            beforeUpload={(file) => {
              // No subir automáticamente, solo agregar a la lista
              // La subida se manejará en el onSubmit del formulario
              return false;
            }}
            onChange={(info) => {
              // Cuando se agrega un archivo, marcar automáticamente el checkbox como entregado
              if (info.fileList.length > 0 && checkboxFieldName && form) {
                // Marcar el checkbox correspondiente como entregado
                form.setFieldValue(checkboxFieldName, true);
              }
              // Llamar al onChange original si existe
              if (handleChange) {
                handleChange(info.fileList);
              }
            }}
            fileList={currentFileList}
            maxCount={field.maxCount || 1}
            accept={field.accept}
            listType={field.listType || 'text'}
          >
            <Button icon={<UploadOutlined />} disabled={readOnly}>
              {field.uploadText || 'Seleccionar archivo'}
            </Button>
          </Upload>
        );

      default:
        return <Input {...commonProps} {...readOnlyProps} />;
    }
  };

  // Para divider, no usar Form.Item, solo renderizar el divider
  if (field.type === 'divider') {
    return renderField();
  }

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
