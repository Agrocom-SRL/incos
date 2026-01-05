// components/organisms/WizardForm/WizardForm.jsx
/**
 * WizardForm: Organismo para formularios multi-paso (wizard)
 * 
 * Single Responsibility: Orquestar la UI de un formulario de múltiples pasos usando Steps de Ant Design
 * 
 * Atomic Design: Usa moléculas (WizardActions, FormSection) y átomos (FormCard)
 * 
 * Nota: Este componente solo maneja la UI. La lógica de guardado y valores iniciales
 * debe venir desde la página que lo consume (via props).
 * 
 * Estructura:
 * - Cada step tiene un Card/FormCard que contiene un Form de Ant Design
 * - Cada Form contiene FormSections según la configuración del step
 * - La lógica (llamadas API, estado, resolveOptions) está en el hook del provider
 * 
 * Props especiales:
 * - minAge: Edad mínima para campos de fecha (se pasa a FormField)
 * - conditionalLoaders: Objeto con funciones de carga condicionales
 *   Ejemplo: { tieneDiscapacidad: loadDiscapacidades }
 *   Cuando un campo cambia a true, se ejecuta su función de carga correspondiente
 */

import React, { useMemo, useEffect } from 'react';
import { Steps, Form } from 'antd';
import { FormCard } from '@atoms';
import { WizardActions, FormSection } from '@molecules';
import { useWizard } from './hooks/useWizard';

const WizardForm = ({
  steps = [],
  viewMode = false,
  loading = false,
  onFinish,
  onSave,
  resolveOptions = () => [],
  minAge = null,
  conditionalLoaders = {},
  initialValues = {},
  className = '',
  form: externalForm,
}) => {
  const { currentStep, next, prev } = useWizard(0, steps.length);
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  // Observar todos los campos del formulario para hacer reactivo el componente
  // cuando cambien los campos condicionales
  const allFormValues = Form.useWatch([], form);

  // Ejecutar funciones de carga cuando los campos condicionales cambian a true
  useEffect(() => {
    if (!allFormValues) return;
    
    Object.entries(conditionalLoaders).forEach(([fieldName, loader]) => {
      if (loader && typeof loader === 'function') {
        const fieldValue = allFormValues[fieldName];
        if (fieldValue === true) {
          loader();
        }
      }
    });
  }, [allFormValues, conditionalLoaders]);

  // Obtener el step actual
  const currentStepConfig = useMemo(() => {
    return steps[currentStep] || null;
  }, [steps, currentStep]);

  // Si no hay step configurado, no renderizar nada
  if (!currentStepConfig) {
    return null;
  }

  return (
    <FormCard 
      className={className}
      title={currentStepConfig.formTitle || null}
    >
      {/* Steps indicator */}
      <Steps
        current={currentStep}
        items={steps.map((step) => ({
          title: step.title,
        }))}
        style={{ marginBottom: 32 }}
      />

      {/* Contenido del paso actual */}
      <Form
        form={form}
        layout="horizontal"
        initialValues={initialValues}
      >
        {currentStepConfig.sections.map((sectionKey) => {
          const section = currentStepConfig.config[sectionKey];
          if (!section) return null;

          // Si la sección es condicional, verificar si debe mostrarse
          if (section.conditional && section.dependsOn) {
            const dependsOnValue = allFormValues?.[section.dependsOn];
            if (!dependsOnValue) return null;
          }

          return (
            <FormSection
              key={sectionKey}
              title={section.title}
              fields={section.fields}
              form={form}
              resolveOptions={resolveOptions}
              minAge={minAge}
              readOnly={viewMode}
            />
          );
        })}
      </Form>

      {/* Botones de navegación */}
      <WizardActions
        currentStep={currentStep}
        totalSteps={steps.length}
        viewMode={viewMode}
        loading={loading}
        onPrev={prev}
        onNext={next}
        onFinish={onFinish}
        onSave={onSave}
      />
    </FormCard>
  );
};

export default WizardForm;