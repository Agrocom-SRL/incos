// components/molecules/FormSection/FormSection.jsx
/**
 * FormSection: Molécula genérica para renderizar secciones de formulario
 * 
 * Single Responsibility: Renderizar una sección de formulario con campos organizados
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Ant Design aplica automáticamente:
 * - Card: colorBgContainer, borderRadius, colorBorder (desde theme.components.Card)
 * - Typography: colorTextHeading (desde theme.components.Typography)
 */

import { Card, Row, Col } from 'antd';
import { Form } from 'antd';
import { useEffect, useState, useRef, useMemo } from 'react';
import FormField from '../FormField';

const FormSection = ({ title, fields, form, resolveOptions, onFieldChange, readOnly = false }) => {
  // Solo observar los campos que tienen shouldRender o dependencies para evitar re-renders innecesarios
  const fieldsToWatch = useMemo(() => {
    const watchFields = [];
    fields.forEach(field => {
      if (field.shouldRender) {
        // Si tiene shouldRender, usar watchFields explícito o dependencies como fallback
        if (field.watchFields && field.watchFields.length > 0) {
          watchFields.push(...field.watchFields);
        } else if (field.dependencies && field.dependencies.length > 0) {
          // Si no hay watchFields explícito, usar dependencies como fallback
          watchFields.push(...field.dependencies);
        }
      }
      // Para campos geográficos con dependencies, observar las dependencias
      // Esto incluye: pais, departamento, provincia, municipio
      if (field.dependencies && field.dependencies.length > 0 && field.type === 'select') {
        const isGeographic = field.name.includes('departamento') || 
                            field.name.includes('provincia') || 
                            field.name.includes('municipio') ||
                            field.name.includes('pais');
        if (isGeographic) {
          watchFields.push(...field.dependencies);
        }
      }
      // IMPORTANTE: Si un campo tiene dependencies, también observar esas dependencias
      // Esto asegura que cuando cambia tieneDiscapacidad, se detecte el cambio
      if (field.dependencies && field.dependencies.length > 0) {
        watchFields.push(...field.dependencies);
      }
    });
    // Eliminar duplicados
    return [...new Set(watchFields)];
  }, [fields]);

  // Solo observar campos específicos si hay campos con shouldRender o dependencies
  // Si no hay campos especiales, no observar nada (evita re-renders innecesarios)
  // IMPORTANTE: No usar Form.useWatch si no hay campos para observar, para evitar re-renders innecesarios
  // Usar Form.useWatch con todos los campos a observar para que sea reactivo
  const formValues = fieldsToWatch.length > 0 && form
    ? Form.useWatch(fieldsToWatch, form) 
    : null;
  
  // Observar específicamente tieneDiscapacidad si hay campos que dependen de él
  // Esto asegura que los cambios en el switch se detecten inmediatamente
  const hasDiscapacidadFields = fields.some(f => 
    f.dependencies?.includes('tieneDiscapacidad') || f.watchFields?.includes('tieneDiscapacidad')
  );
  const tieneDiscapacidadValue = hasDiscapacidadFields && form
    ? Form.useWatch('tieneDiscapacidad', form)
    : null;
  
  // Observar específicamente esExtranjero si hay campos que dependen de él
  // Esto asegura que los cambios en el checkbox se detecten inmediatamente
  const hasExtranjeroFields = fields.some(f => 
    f.dependencies?.includes('esExtranjero') || f.watchFields?.includes('esExtranjero')
  );
  const esExtranjeroValue = hasExtranjeroFields && form
    ? Form.useWatch('esExtranjero', form)
    : null;
  
  // Observar específicamente tipoNacionalidad si hay campos que dependen de él
  // Esto asegura que los cambios en el radio group se detecten inmediatamente
  const hasTipoNacionalidadFields = fields.some(f => 
    f.dependencies?.includes('tipoNacionalidad') || f.watchFields?.includes('tipoNacionalidad')
  );
  const tipoNacionalidadValue = hasTipoNacionalidadFields && form
    ? Form.useWatch('tipoNacionalidad', form)
    : null;
  
  // Observar específicamente primeraNacionalidadTipo si hay campos que dependen de él
  // Esto asegura que los cambios en el radio group se detecten inmediatamente
  const hasPrimeraNacionalidadTipoFields = fields.some(f => 
    f.dependencies?.includes('primeraNacionalidadTipo') || f.watchFields?.includes('primeraNacionalidadTipo')
  );
  const primeraNacionalidadTipoValue = hasPrimeraNacionalidadTipoFields && form
    ? Form.useWatch('primeraNacionalidadTipo', form)
    : null;
  
  // Observar específicamente segundaNacionalidadTipo si hay campos que dependen de él
  // Esto asegura que los cambios en el radio group se detecten inmediatamente
  const hasSegundaNacionalidadTipoFields = fields.some(f => 
    f.dependencies?.includes('segundaNacionalidadTipo') || f.watchFields?.includes('segundaNacionalidadTipo')
  );
  const segundaNacionalidadTipoValue = hasSegundaNacionalidadTipoFields && form
    ? Form.useWatch('segundaNacionalidadTipo', form)
    : null;
  
  
  // Inicializar campos visibles - todos los campos inicialmente
  const [visibleFields, setVisibleFields] = useState(fields);
  const prevFormValuesRef = useRef(null);
  // Estado para forzar actualización cuando cambia tieneDiscapacidad
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Función para calcular campos visibles basándose en valores del formulario
  const calculateVisibleFields = useMemo(() => {
    return (formValues) => {
      return fields.filter((field) => {
        if (field.shouldRender) {
          // Normalizar valores booleanos (pueden venir como 1/0 desde el backend o como true/false del switch/checkbox)
          const normalizedValues = { ...formValues };
          if (normalizedValues.tieneDiscapacidad !== undefined) {
            normalizedValues.tieneDiscapacidad = Boolean(normalizedValues.tieneDiscapacidad);
          }
          if (normalizedValues.esExtranjero !== undefined) {
            normalizedValues.esExtranjero = Boolean(normalizedValues.esExtranjero);
          }
          // Normalizar tipoNacionalidad
          if (normalizedValues.tipoNacionalidad === '') {
            normalizedValues.tipoNacionalidad = null;
          }
          // Asegurar que tipoDiscapacidadId sea null/undefined si no tiene valor
          if (normalizedValues.tipoDiscapacidadId === '') {
            normalizedValues.tipoDiscapacidadId = null;
          }
          return field.shouldRender(normalizedValues);
        }
        return true;
      });
    };
  }, [fields]);

  // Inicializar campos visibles cuando el formulario está listo o cuando cambian los valores
  useEffect(() => {
    if (form) {
      const hasShouldRenderFields = fields.some(f => f.shouldRender);
      if (hasShouldRenderFields) {
        // Usar un pequeño delay para asegurar que los valores iniciales se hayan establecido
        const timeoutId = setTimeout(() => {
          const initialFormValues = form.getFieldsValue() || {};
          const initialFilteredFields = calculateVisibleFields(initialFormValues);
          setVisibleFields(initialFilteredFields);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [form, fields, calculateVisibleFields]);

  // Actualizar campos visibles cuando cambian los valores observados
  // IMPORTANTE: Solo observar campos específicos que afectan shouldRender (no todos los campos)
  useEffect(() => {
    // Si hay campos con shouldRender, siempre recalcular basándose en los valores actuales
    const hasShouldRenderFields = fields.some(f => f.shouldRender);
    if (hasShouldRenderFields && form) {
      // Obtener valores actuales del formulario (siempre obtener los más recientes)
      // Esto asegura que capturamos cambios inmediatos, incluso si Form.useWatch no los ha capturado aún
      const currentFormValues = form.getFieldsValue() || {};
      
      // Si hay formValues observados, combinarlos con los valores actuales
      // formValues tiene prioridad porque es reactivo, pero currentFormValues puede tener valores más recientes
      // También usar tieneDiscapacidadValue, esExtranjeroValue, tipoNacionalidadValue, primeraNacionalidadTipoValue y segundaNacionalidadTipoValue para asegurar que los cambios se detecten
      const mergedValues = formValues || tieneDiscapacidadValue !== null || esExtranjeroValue !== null || tipoNacionalidadValue !== null || primeraNacionalidadTipoValue !== null || segundaNacionalidadTipoValue !== null
        ? { 
            ...currentFormValues, 
            ...(formValues || {}),
            ...(tieneDiscapacidadValue !== null ? { tieneDiscapacidad: tieneDiscapacidadValue } : {}),
            ...(esExtranjeroValue !== null ? { esExtranjero: esExtranjeroValue } : {}),
            ...(tipoNacionalidadValue !== null ? { tipoNacionalidad: tipoNacionalidadValue } : {}),
            ...(primeraNacionalidadTipoValue !== null ? { primeraNacionalidadTipo: primeraNacionalidadTipoValue } : {}),
            ...(segundaNacionalidadTipoValue !== null ? { segundaNacionalidadTipo: segundaNacionalidadTipoValue } : {})
          }
        : currentFormValues;
      
      // Normalizar valores booleanos (pueden venir como 1/0 desde el backend o como true/false del switch/checkbox)
      if (mergedValues.tieneDiscapacidad !== undefined) {
        mergedValues.tieneDiscapacidad = Boolean(mergedValues.tieneDiscapacidad);
      }
      if (mergedValues.esExtranjero !== undefined) {
        mergedValues.esExtranjero = Boolean(mergedValues.esExtranjero);
      }
      // Normalizar tipoNacionalidad
      if (mergedValues.tipoNacionalidad === '') {
        mergedValues.tipoNacionalidad = null;
      }
      
      // Crear una clave basada solo en los campos que afectan shouldRender
      const relevantValues = {};
      fieldsToWatch.forEach(fieldName => {
        let value = mergedValues[fieldName];
        // Normalizar valores booleanos en la clave también
        if (fieldName === 'tieneDiscapacidad' && value !== undefined) {
          value = Boolean(value);
        }
        if (fieldName === 'esExtranjero' && value !== undefined) {
          value = Boolean(value);
        }
        // Normalizar strings vacíos a null para tipoDiscapacidadId
        if (fieldName === 'tipoDiscapacidadId' && value === '') {
          value = null;
        }
        relevantValues[fieldName] = value;
      });
      const formValuesKey = JSON.stringify(relevantValues);
      
      // Solo actualizar si los valores relevantes realmente cambiaron
      if (prevFormValuesRef.current !== formValuesKey) {
        prevFormValuesRef.current = formValuesKey;
        const newFilteredFields = calculateVisibleFields(mergedValues);
        setVisibleFields(newFilteredFields);
      }
    }
  }, [formValues, tieneDiscapacidadValue, esExtranjeroValue, tipoNacionalidadValue, primeraNacionalidadTipoValue, segundaNacionalidadTipoValue, fields, form, fieldsToWatch, calculateVisibleFields]);
  
  // Efecto adicional para forzar actualización cuando cambia tieneDiscapacidad
  // Esto asegura que los campos se muestren inmediatamente cuando se activa el switch
  useEffect(() => {
    if (form && hasDiscapacidadFields) {
      // Obtener el valor actual de tieneDiscapacidad
      const currentValue = form.getFieldValue('tieneDiscapacidad');
      const tipoValue = form.getFieldValue('tipoDiscapacidadId');
      
      // Recalcular campos visibles
      const currentValues = form.getFieldsValue() || {};
      const normalizedValues = {
        ...currentValues,
        tieneDiscapacidad: Boolean(currentValue),
        tipoDiscapacidadId: tipoValue === '' ? null : tipoValue,
      };
      
      const newFilteredFields = calculateVisibleFields(normalizedValues);
      setVisibleFields(newFilteredFields);
    }
  }, [tieneDiscapacidadValue, forceUpdate, form, hasDiscapacidadFields, calculateVisibleFields]);
  
  // Listener para detectar cambios en tieneDiscapacidad usando un intervalo corto
  // Esto es necesario porque Form.useWatch puede no capturar cambios en switches inmediatamente
  useEffect(() => {
    if (form && hasDiscapacidadFields) {
      let lastValue = form.getFieldValue('tieneDiscapacidad');
      
      const checkInterval = setInterval(() => {
        const currentValue = form.getFieldValue('tieneDiscapacidad');
        if (currentValue !== lastValue) {
          lastValue = currentValue;
          setForceUpdate(prev => prev + 1);
        }
      }, 100); // Verificar cada 100ms
      
      return () => clearInterval(checkInterval);
    }
  }, [form, hasDiscapacidadFields]);
  
  // Efecto adicional para forzar actualización cuando cambia esExtranjero
  // Esto asegura que los campos se muestren inmediatamente cuando se activa el checkbox
  useEffect(() => {
    if (form && hasExtranjeroFields) {
      // Obtener el valor actual de esExtranjero
      const currentValue = form.getFieldValue('esExtranjero');
      
      // Recalcular campos visibles
      const currentValues = form.getFieldsValue() || {};
      const normalizedValues = {
        ...currentValues,
        esExtranjero: Boolean(currentValue),
      };
      
      const newFilteredFields = calculateVisibleFields(normalizedValues);
      setVisibleFields(newFilteredFields);
    }
  }, [esExtranjeroValue, form, hasExtranjeroFields, calculateVisibleFields]);
  
  // Efecto adicional para forzar actualización cuando cambia tipoNacionalidad
  // Esto asegura que los campos se muestren inmediatamente cuando se cambia el radio group
  useEffect(() => {
    if (form && hasTipoNacionalidadFields) {
      // Obtener el valor actual de tipoNacionalidad
      const currentValue = form.getFieldValue('tipoNacionalidad');
      
      // Recalcular campos visibles
      const currentValues = form.getFieldsValue() || {};
      const normalizedValues = {
        ...currentValues,
        tipoNacionalidad: currentValue === '' ? null : currentValue,
      };
      
      const newFilteredFields = calculateVisibleFields(normalizedValues);
      setVisibleFields(newFilteredFields);
    }
  }, [tipoNacionalidadValue, form, hasTipoNacionalidadFields, calculateVisibleFields]);
  
  // Listener para detectar cambios en tipoNacionalidad usando un intervalo corto
  // Esto es necesario porque Form.useWatch puede no capturar cambios en radio groups inmediatamente
  useEffect(() => {
    if (form && hasTipoNacionalidadFields) {
      let lastValue = form.getFieldValue('tipoNacionalidad');
      
      const checkInterval = setInterval(() => {
        const currentValue = form.getFieldValue('tipoNacionalidad');
        if (currentValue !== lastValue) {
          lastValue = currentValue;
          // Forzar actualización recalculando campos visibles
          const currentValues = form.getFieldsValue() || {};
          const normalizedValues = {
            ...currentValues,
            tipoNacionalidad: currentValue === '' ? null : currentValue,
          };
          const newFilteredFields = calculateVisibleFields(normalizedValues);
          setVisibleFields(newFilteredFields);
        }
      }, 100); // Verificar cada 100ms
      
      return () => clearInterval(checkInterval);
    }
  }, [form, hasTipoNacionalidadFields, calculateVisibleFields]);
  

  return (
    <Card
      type="inner"
      className="molecule-form-section"
      title={title}
    >
      <Row gutter={[24, 8]}>
        {visibleFields.map((field) => {
          // Sistema de columnas de Ant Design (24 columnas totales)
          // span: 24 = 1 columna (100% ancho)
          // span: 12 = 2 columnas (50% ancho cada una)
          // span: 8 = 3 columnas (33.33% ancho cada una)
          // span: 6 = 4 columnas (25% ancho cada una)
          const span = field.span || 12; // Por defecto: 2 columnas
          
          return (
            <Col 
              key={field.name} 
              xs={24}        // Móviles: siempre 1 columna (100% ancho)
              sm={span >= 4 ? 24 : span}  // Tablets: si span >= 4, usar 24 (1 columna), sino usar el span
              md={span >= 8 ? 12 : span}      // Desktop: usar el span definido en el config
              lg={span}      // Desktop grande: usar el span definido
            >
              <FormField
                key={`${field.name}-${field.dependencies ? JSON.stringify(formValues?.[field.dependencies[0]]) : ''}`}
                field={field}
                form={form}
                resolveOptions={resolveOptions}
                formValues={field.dependencies ? formValues : undefined}
                onFieldChange={onFieldChange}
                readOnly={readOnly}
              />
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default FormSection;
