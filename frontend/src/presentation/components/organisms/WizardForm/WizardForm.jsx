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
import { TipoAdmisionSelectionSection, CarreraSelectionSection } from '@estudiantes/components/organisms';

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
  // Datos adicionales para componentes visuales
  carreras = [],
  gestiones = [],
  carrerasLoading = false,
  gestionesLoading = false,
  carrerasError = null,
  gestionesError = null,
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

          // Renderizar componente visual especial para tipoAdmision en step 0
          if (currentStep === 0 && sectionKey === 'tipoAdmision') {
            return (
              <TipoAdmisionSelectionSection
                key={sectionKey}
                form={form}
                onTipoAdmisionChange={(tipoAdmision) => {
                  // Notificar cambio para que las secciones condicionales se actualicen
                  form.setFieldsValue({ tipoAdmision });
                }}
              />
            );
          }

          // Renderizar componente visual especial para carreraId en datosAcademicosIniciales
          // Solo si estamos en step 0 y la sección es datosAcademicosIniciales
          if (currentStep === 0 && sectionKey === 'datosAcademicosIniciales') {
            // Separar campos: gestionIngresoId (select normal) y carreraId (componente visual)
            const gestionIngresoField = section.fields?.find(f => f.name === 'gestionIngresoId');
            const carreraField = section.fields?.find(f => f.name === 'carreraId');
            
            return (
              <div key={sectionKey}>
                {/* Campo de gestión de ingreso (select normal) */}
                {gestionIngresoField && (
                  <FormSection
                    key={`${sectionKey}-gestion`}
                    title={section.title}
                    fields={[gestionIngresoField]}
                    form={form}
                    resolveOptions={resolveOptions}
                    minAge={minAge}
                    readOnly={viewMode}
                  />
                )}
                
                {/* Componente visual de carrera */}
                {carreraField && (
                  <CarreraSelectionSection
                    key={`${sectionKey}-carrera`}
                    form={form}
                    carreras={carreras}
                    loading={carrerasLoading}
                    error={carrerasError}
                    onCarreraChange={(carrera) => {
                      // El componente ya actualiza el formulario internamente
                    }}
                  />
                )}
              </div>
            );
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