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

const FormSection = ({ title, fields, form, resolveOptions, onFieldChange }) => {
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
    });
    // Eliminar duplicados
    return [...new Set(watchFields)];
  }, [fields]);

  // Solo observar campos específicos si hay campos con shouldRender o dependencies
  // Si no hay campos especiales, no observar nada (evita re-renders innecesarios)
  // IMPORTANTE: No usar Form.useWatch si no hay campos para observar, para evitar re-renders innecesarios
  const formValues = fieldsToWatch.length > 0 && form
    ? Form.useWatch(fieldsToWatch, form) 
    : null;
  
  
  // Inicializar campos visibles - todos los campos inicialmente
  const [visibleFields, setVisibleFields] = useState(fields);
  const prevFormValuesRef = useRef(null);
  
  // Función para calcular campos visibles basándose en valores del formulario
  const calculateVisibleFields = useMemo(() => {
    return (formValues) => {
      return fields.filter((field) => {
        if (field.shouldRender) {
          // Normalizar valores booleanos (pueden venir como 1/0 desde el backend)
          const normalizedValues = { ...formValues };
          if (normalizedValues.tieneDiscapacidad !== undefined) {
            normalizedValues.tieneDiscapacidad = Boolean(normalizedValues.tieneDiscapacidad);
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
      const currentFormValues = form.getFieldsValue() || {};
      
      // Si hay formValues observados, combinarlos con los valores actuales
      // formValues tiene prioridad porque es reactivo
      const mergedValues = formValues 
        ? { ...currentFormValues, ...formValues }
        : currentFormValues;
      
      // Normalizar valores booleanos (pueden venir como 1/0 desde el backend)
      if (mergedValues.tieneDiscapacidad !== undefined) {
        mergedValues.tieneDiscapacidad = Boolean(mergedValues.tieneDiscapacidad);
      }
      
      // Crear una clave basada solo en los campos que afectan shouldRender
      const relevantValues = {};
      fieldsToWatch.forEach(fieldName => {
        relevantValues[fieldName] = mergedValues[fieldName];
      });
      const formValuesKey = JSON.stringify(relevantValues);
      
      // Solo actualizar si los valores relevantes realmente cambiaron
      if (prevFormValuesRef.current !== formValuesKey) {
        prevFormValuesRef.current = formValuesKey;
        const newFilteredFields = calculateVisibleFields(mergedValues);
        setVisibleFields(newFilteredFields);
      }
    }
  }, [formValues, fields, form, fieldsToWatch, calculateVisibleFields]);

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
              />
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default FormSection;
