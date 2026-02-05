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
import { Steps, Form, Card, Row, Col } from 'antd';
import { FormCard } from '@atoms';
import { WizardActions, FormSection } from '@molecules';
import { useWizardForm } from './hooks/useWizardForm';
import { TipoAdmisionSelectionSection, CarreraSelectionSection, GestionSelectionSection } from '@estudiantes/components/organisms';

const WizardForm = ({
  steps = [],
  viewMode = false,
  loading = false,
  onFinish,
  onSave,
  showSaveButton = true,
  hideSaveOnSteps = [],
  onValidateBeforeNext,
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
  cargarGestiones,
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

  // Ocultar botón Guardar en pasos indicados (ej. step 0)
  const showSaveButtonEffective = showSaveButton && !(hideSaveOnSteps || []).includes(currentStep);

  // Siguiente: validar paso actual antes de avanzar (si onValidateBeforeNext está definido)
  const handleNext = React.useCallback(() => {
    if (onValidateBeforeNext) {
      onValidateBeforeNext(currentStep, form)
        .then(() => next())
        .catch(() => { /* errores de validación ya mostrados por el formulario */ });
    } else {
      next();
    }
  }, [currentStep, form, next, onValidateBeforeNext]);

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
                  form.setFieldsValue({ tipoAdmision });
                  if (tipoAdmision === 'ANTIGUO' && typeof cargarGestiones === 'function') {
                    cargarGestiones();
                  }
                }}
              />
            );
          }

          // Renderizar componente visual especial para carreraId en datosAcademicosIniciales
          // Solo si estamos en step 0 y la sección es datosAcademicosIniciales
          if (currentStep === 0 && sectionKey === 'datosAcademicosIniciales') {
            const carreraField = section.fields?.find(f => f.name === 'carreraId');
            const esAntiguo = allFormValues?.tipoAdmision === 'ANTIGUO';

            return (
              <Card
                key={sectionKey}
                title={
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>
                    {section.title}
                  </span>
                }
                style={{
                  marginTop: 24,
                  marginBottom: 24,
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <Row gutter={24}>
                  {/* Col 4/12: Gestión de ingreso (solo si tipo ANTIGUO) */}
                  {esAntiguo && (
                    <Col xs={24} sm={24} md={8} lg={8}>
                      <GestionSelectionSection
                        form={form}
                        gestiones={gestiones}
                        loading={gestionesLoading}
                        error={gestionesError}
                      />
                    </Col>
                  )}
                  {/* Col 8/12: Carrera */}
                  {carreraField && (
                    <Col xs={24} sm={24} md={esAntiguo ? 16 : 24} lg={esAntiguo ? 16 : 24}>
                      <CarreraSelectionSection
                        form={form}
                        carreras={carreras}
                        loading={carrerasLoading}
                        error={carrerasError}
                        onCarreraChange={() => {}}
                        embedded
                        compact={!!esAntiguo}
                      />
                    </Col>
                  )}
                </Row>
              </Card>
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
        onNext={handleNext}
        onFinish={onFinish}
        onSave={onSave}
        showSaveButton={showSaveButtonEffective}
      />
    </FormCard>
  );
};

export default WizardForm;