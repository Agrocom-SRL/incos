// components/organisms/GenericForm/GenericForm.jsx
/**
 * GenericForm: Organismo genérico para formularios
 * 
 * Single Responsibility: Orquestar la renderización de un formulario completo
 * basado en configuración
 * 
 * Atomic Design: Usa moléculas (FormSection, FormActions) y átomos (FormCard, Button, Heading)
 */

import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormSection, FormActions } from '@molecules';
import { FormCard, Heading } from '@atoms';

const GenericForm = forwardRef(({
  title,
  config,
  sections = [],
  onSubmit,
  loading = false,
  mode = 'create',
  initialValues = {},
  resolveOptions = () => [],
  onCancel,
  onSuccess,
  onError,
  successMessage = 'Operación realizada correctamente',
  onFieldChange,
  wizardMode = false, // Si es true, no muestra botones de acción
}, ref) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Exponer el form via ref
  useImperativeHandle(ref, () => form, [form]);

  const handleSubmit = async (values) => {
    try {
      // Formatear fecha de nacimiento si existe
      const formattedValues = {
        ...values,
        fechaNacimiento: values.fechaNacimiento
          ? values.fechaNacimiento.format('YYYY-MM-DD')
          : values.fechaNacimiento,
      };

      // Remover campos undefined/null/vacíos
      Object.keys(formattedValues).forEach((key) => {
        if (formattedValues[key] === undefined || 
            formattedValues[key] === null || 
            formattedValues[key] === '') {
          delete formattedValues[key];
        }
      });

      const result = await onSubmit(formattedValues);
      
      // Manejar resultado del Provider
      if (result && result.success) {
        message.success(successMessage);
        form.resetFields();
        if (onSuccess) {
          onSuccess(result);
        }
      } else if (result) {
        // Manejar errores de validación del servidor
        if (result.validationErrors) {
          const fields = Object.keys(result.validationErrors);
          fields.forEach((field) => {
            form.setFields([
              {
                name: field,
                errors: [result.validationErrors[field]],
              },
            ]);
          });
          message.error('Por favor, corrige los errores en el formulario');
        } else {
          message.error(result.error || 'Error al procesar el formulario');
        }
        if (onError) {
          onError(result);
        }
      }
    } catch (error) {
      message.error('Error inesperado al procesar el formulario');
      console.error('Error:', error);
      if (onError) {
        onError({ error: error.message });
      }
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <FormCard>
      {title && <Heading level={3}>{title}</Heading>}
      <Form
        form={form}
        layout="vertical"
        onFinish={wizardMode ? undefined : handleSubmit}
        initialValues={initialValues}
      >
        {sections.map((sectionKey) => {
          const section = config[sectionKey];
          if (!section) return null;

          return (
            <FormSection
              key={sectionKey}
              title={section.title}
              fields={section.fields}
              form={form}
              resolveOptions={resolveOptions}
              onFieldChange={onFieldChange}
            />
          );
        })}

        {!wizardMode && (
          <FormActions
            mode={mode}
            loading={loading}
            onReset={handleReset}
            onCancel={handleCancel}
          />
        )}
      </Form>
    </FormCard>
  );
});

GenericForm.displayName = 'GenericForm';

export default GenericForm;
