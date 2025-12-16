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
        // Si tiene shouldRender, necesitamos observar todos los campos que usa en la condición
        // Por ahora, observamos todos los campos del formulario, pero de forma optimizada
        watchFields.push(...(field.watchFields || []));
      }
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
  const formValues = fieldsToWatch.length > 0 && form
    ? Form.useWatch(fieldsToWatch, form) 
    : null;
  
  const [visibleFields, setVisibleFields] = useState(fields);
  const prevFormValuesRef = useRef(null);

  // Memoizar los campos visibles para evitar recálculos innecesarios
  // Solo recalcular si hay campos con shouldRender y formValues cambió
  const filteredFields = useMemo(() => {
    const hasShouldRenderFields = fields.some(f => f.shouldRender);
    if (!hasShouldRenderFields) {
      // Si no hay campos con shouldRender, retornar todos los campos sin filtrar
      return fields;
    }
    
    // Solo obtener valores del formulario si hay campos con shouldRender
    const currentFormValues = form?.getFieldsValue() || {};
    return fields.filter((field) => {
      if (field.shouldRender) {
        return field.shouldRender(currentFormValues);
      }
      return true;
    });
  }, [fields, form]); // Removido formValues de las dependencias para evitar re-renders innecesarios

  // Actualizar campos visibles solo cuando realmente cambian
  useEffect(() => {
    // Solo actualizar si hay campos con shouldRender y formValues cambió
    if (formValues !== null) {
      const formValuesKey = JSON.stringify(formValues);
      if (prevFormValuesRef.current !== formValuesKey) {
        prevFormValuesRef.current = formValuesKey;
        // Recalcular campos visibles cuando formValues cambia
        const currentFormValues = form?.getFieldsValue() || {};
        const newFilteredFields = fields.filter((field) => {
          if (field.shouldRender) {
            return field.shouldRender(currentFormValues);
          }
          return true;
        });
        setVisibleFields(newFilteredFields);
      }
    }
  }, [formValues, fields, form]);

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
