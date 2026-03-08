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
  hideSaveOnSteps = [],
  onValidateBeforeNext,
  onBeforeNextStep, // (stepNumber, form) => void - stepNumber es 1-based (1, 2, 3...). Llamado tras validar y antes de next()
  onBeforePrevStep, // (stepNumber, form) => void - stepNumber es 1-based. Llamado antes de prev(), p. ej. para restaurar valores
  onValidationError, // (error) => void - opcional, se llama cuando falla la validación antes de "Siguiente" (útil para log o mensaje)
  resolveOptions = () => [],
  minAge = null,
  conditionalLoaders = {},
  initialValues = {},
  className = '',
  form: externalForm,
  onFormValuesChange, // Callback opcional para notificar cambios en valores del formulario
  initialStep = 0, // Paso inicial (índice 0-based interno: 0 = primer paso)
  // Contenido custom por sección: la página construye el panel (inscripciones step 1 carrera, estudiantes step 0 tipoAdmision/datosAcademicos)
  renderSectionContent, // (stepIndex, sectionKey, section, form) => ReactNode | null
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

  // stepNumber 1-based para la página (1 = primer paso, 2 = segundo, etc.)
  const stepNumber = currentStep + 1;
  // Ocultar botón Guardar en pasos indicados por número 1-based (ej. [1] = primer paso)
  const showSaveButtonEffective = showSaveButton && !(hideSaveOnSteps || []).includes(stepNumber);

  // Siguiente: validar paso actual antes de avanzar (si onValidateBeforeNext está definido)
  // IMPORTANTE: Usar currentStep directamente para calcular stepNumber dentro del callback
  // para evitar que se ejecute la validación del paso siguiente cuando currentStep cambia
  const handleNext = React.useCallback(() => {
    const currentStepNumber = currentStep + 1;

    if (onValidateBeforeNext) {
      const validationPromise = onValidateBeforeNext(currentStepNumber, form);
      if (!validationPromise || typeof validationPromise?.then !== 'function') {
        return;
      }
      validationPromise
        .then(() => {
          onBeforeNextStep?.(currentStepNumber, form);
          next();
        })
        .catch((err) => {
          if (typeof onValidationError === 'function') onValidationError(err);
        });
    } else {
      onBeforeNextStep?.(currentStepNumber, form);
      next();
    }
  }, [currentStep, form, next, onValidateBeforeNext, onBeforeNextStep]);

  // Anterior: notificar al padre con stepNumber 1-based (ej. al volver desde paso 2, stepNumber es 2)
  // IMPORTANTE: Usar currentStep directamente para calcular stepNumber dentro del callback
  const handlePrev = React.useCallback(() => {
    const currentStepNumber = currentStep + 1;
    onBeforePrevStep?.(currentStepNumber, form);
    prev();
  }, [currentStep, form, prev, onBeforePrevStep]);

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

          // Contenido custom por página: la página construye el panel (inscripciones, estudiantes, etc.)
          if (typeof renderSectionContent === 'function') {
            const customContent = renderSectionContent(currentStep, sectionKey, section, form);
            if (customContent != null) {
              return <React.Fragment key={sectionKey}>{customContent}</React.Fragment>;
            }
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
        onPrev={handlePrev}
        onNext={handleNext}
        onFinish={onFinish}
        onSave={onSave}
        showSaveButton={showSaveButtonEffective}
      />
    </FormCard>
  );
};

export default WizardForm;