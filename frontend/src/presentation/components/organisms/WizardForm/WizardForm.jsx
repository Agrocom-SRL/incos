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
import { Steps, Form, Tabs, Alert, Typography } from 'antd';
import { FormCard } from '@atoms';
import { WizardActions, FormSection } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { useWizardForm } from './hooks/useWizardForm';

const WizardForm = React.forwardRef(({
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
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
  finishLabel = 'Finalizar registro',
  // ADITIVO: "steps" = Steps clásico dentro de FormCard (comportamiento histórico);
  // "tabs" = workspace único con pestañas (mismo lenguaje visual que CFG → Académico).
  variant = 'steps',
  // Mensaje de error puntual mostrado junto al footer del wizard (no permanente arriba de la página).
  errorMessage = '',
  // Solo variant="tabs": todo avance por click de pestaña —incluso a pasos ya visitados—
  // exige validar el paso visible vía onValidateBeforeNext; el retroceso queda siempre libre.
  strictForwardNavigation = false,
}, ref) => {
  // Hook que compone toda la lógica del wizard (navegación + formulario + cargadores)
  const {
    currentStep,
    next,
    prev,
    goTo,
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

  // API imperativa opcional (ej. avanzar de paso al elegir un ítem de una lista,
  // sin pasar por el botón "Siguiente" — goToStep NO corre onValidateBeforeNext,
  // úsala solo cuando el propio evento que dispara el salto ya garantiza que el
  // paso queda válido, como seleccionar una fila de una tabla).
  React.useImperativeHandle(ref, () => ({ goToStep: goTo }), [goTo]);

  // Paso más lejano alcanzado: gobierna qué pestañas son navegables por click (solo visitadas/completadas).
  // Se inicializa con initialStep para que, al abrir directo en un paso avanzado (vínculo y rol prefijados),
  // los pasos previos cuenten como completados y el usuario pueda finalizar sin recorrerlos.
  const [maxStepReached, setMaxStepReached] = React.useState(initialStep);
  React.useEffect(() => {
    setMaxStepReached((prevMax) => Math.max(prevMax, currentStep, initialStep));
  }, [currentStep, initialStep]);

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

  // Avance directo a un paso destino validando antes el paso visible (modo estricto de tabs).
  const navigateForwardTo = React.useCallback((target) => {
    const currentStepNumber = currentStep + 1;
    const proceed = () => {
      onBeforeNextStep?.(currentStepNumber, form);
      goTo(target);
    };
    if (onValidateBeforeNext) {
      const validationPromise = onValidateBeforeNext(currentStepNumber, form);
      if (!validationPromise || typeof validationPromise?.then !== 'function') {
        return;
      }
      validationPromise
        .then(proceed)
        .catch((err) => {
          if (typeof onValidationError === 'function') onValidationError(err);
        });
    } else {
      proceed();
    }
  }, [currentStep, form, goTo, onValidateBeforeNext, onBeforeNextStep, onValidationError]);

  // Si no hay step configurado, no renderizar nada
  if (!currentStepConfig) {
    return null;
  }

  // Navegación por click de pestaña (solo variant="tabs"):
  // - hacia atrás → salto directo, siempre permitido (notificando onBeforePrevStep, como "Anterior")
  // - hacia adelante con strictForwardNavigation → valida el paso visible antes de saltar
  // - sin modo estricto: paso ya visitado (<= maxStepReached) → salto directo;
  //   paso inmediatamente siguiente → handleNext (respeta onValidateBeforeNext)
  // - a pasos futuros no navegables → se ignora
  const handleTabChange = (key) => {
    const target = Number(key);
    if (!Number.isInteger(target) || target === currentStep) return;
    if (target < currentStep) {
      onBeforePrevStep?.(currentStep + 1, form);
      goTo(target);
      return;
    }
    const navigable = target <= maxStepReached || target === currentStep + 1;
    if (!navigable) return;
    if (strictForwardNavigation) {
      navigateForwardTo(target);
      return;
    }
    if (target <= maxStepReached) {
      goTo(target);
      return;
    }
    handleNext();
  };

  // Cuerpo del paso actual (compartido por ambas variantes).
  const stepBody = (
    <Form form={form} layout={variant === 'tabs' ? 'vertical' : 'horizontal'} initialValues={initialValues}>
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
  );

  // Footer de navegación + error puntual (compartido).
  const wizardFooter = (
    <>
      {errorMessage ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          className="wizard-form__footer-error"
        />
      ) : null}
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
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        finishLabel={finishLabel}
      />
    </>
  );

  // Variante "tabs": workspace único con pestañas (mismo shell que AcademicoPage).
  if (variant === 'tabs') {
    const tabItems = steps.map((step, index) => {
      const completed = index < maxStepReached;
      const navigable = index <= maxStepReached || index === currentStep + 1;
      return {
        key: String(index),
        disabled: !navigable,
        label: (
          <span className="sd-tab-label">
            <span className="wizard-form__tab-index" aria-hidden>
              {completed ? '✓' : index + 1}
            </span>
            {step.title}
          </span>
        ),
        children:
          index === currentStep ? (
            <div className="cfg-academico-tab-panel">
              {stepBody}
              <div className="cfg-academico-form-workspace__footer">{wizardFooter}</div>
            </div>
          ) : null,
      };
    });

    return (
      <section className={`cfg-academico-workspace cfg-academico-form-workspace ${className}`.trim()}>
        <header className="cfg-academico-workspace__header">
          <ListPanelHeader
            title={currentStepConfig.formTitle || 'Formulario'}
            actions={currentStepConfig.headerActions ?? null}
          />
          {currentStepConfig.description ? (
            <Typography.Paragraph type="secondary" className="cfg-academico-workspace__desc">
              {currentStepConfig.description}
            </Typography.Paragraph>
          ) : null}
        </header>

        <div className="sd-tabs-shell cfg-academico-tabs-shell">
          <Tabs
            className="sd-tabs cfg-academico-workspace__tabs"
            activeKey={String(currentStep)}
            items={tabItems}
            onChange={handleTabChange}
            destroyOnHidden={false}
          />
        </div>
      </section>
    );
  }

  // Variante "steps" (histórica): Steps clásico dentro de FormCard.
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
      {stepBody}

      {/* Botones de navegación */}
      {wizardFooter}
    </FormCard>
  );
});

WizardForm.displayName = 'WizardForm';

export default WizardForm;