// components/organisms/WizardForm/WizardForm.jsx
/**
 * WizardForm: Organismo para formularios multi-paso (wizard)
 * 
 * Single Responsibility: Orquestar la UI de un formulario de múltiples pasos usando Steps de Ant Design
 * 
 * Atomic Design: Usa moléculas (WizardActions, FormSection) y átomos (FormCard)
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * - Toda la lógica está en hooks especializados (useWizardForm)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI, la lógica está en hooks
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Nota: Este componente solo maneja la UI. La lógica de guardado y valores iniciales
 * debe venir desde la página que lo consume (via props).
 * 
 * Estructura:
 * - Cada step tiene un Card/FormCard que contiene un Form de Ant Design
 * - Cada Form contiene FormSections según la configuración del step
 * - La lógica (llamadas API, estado, resolveOptions) está en el hook del provider
 * - La lógica del wizard (navegación, formulario, cargadores) está en useWizardForm
 * 
 * Props especiales:
 * - minAge: Edad mínima para campos de fecha (se pasa a FormField)
 * - conditionalLoaders: Objeto con funciones de carga condicionales
 *   Ejemplo: { tieneDiscapacidad: loadDiscapacidades }
 *   Cuando un campo cambia a true, se ejecuta su función de carga correspondiente
 */

import React from 'react';
import { Steps, Form } from 'antd';
import { FormCard } from '@atoms';
import { WizardActions, FormSection } from '@molecules';
import { useWizardForm } from './hooks/useWizardForm';

const WizardForm = ({
  steps = [],
  viewMode = false,
  loading = false,
  onFinish,
  onSave,
  showSaveButton = true,
  resolveOptions = () => [],
  minAge = null,
  conditionalLoaders = {},
  initialValues = {},
  className = '',
  form: externalForm,
  onFormValuesChange, // Callback opcional para notificar cambios en valores del formulario
  initialStep = 0, // Paso inicial del wizard (default: 0)
}) => {
  // Hook que compone toda la lógica del wizard (navegación + formulario + cargadores)
  const {
    currentStep,
    next,
    prev,
    form,
    allFormValues, // Valores actuales del formulario (reactivo)
    currentStepConfig,
    shouldShowSection,
  } = useWizardForm({
    steps,
    externalForm,
    conditionalLoaders,
    initialStep,
  });

  // Notificar cambios en valores del formulario al componente padre
  React.useEffect(() => {
    if (onFormValuesChange && typeof onFormValuesChange === 'function') {
      onFormValuesChange(allFormValues);
    }
  }, [allFormValues, onFormValuesChange]);

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

          // Usar función helper del hook para verificar si debe mostrarse
          if (!shouldShowSection(section)) {
            return null;
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
        showSaveButton={showSaveButton}
      />
    </FormCard>
  );
};

export default WizardForm;