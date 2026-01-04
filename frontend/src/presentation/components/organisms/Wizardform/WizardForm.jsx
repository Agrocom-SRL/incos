// components/organisms/WizardForm/WizardForm.jsx
/**
 * WizardForm: Organismo para formularios multi-paso (wizard)
 * 
 * Single Responsibility: Orquestar la UI de un formulario de múltiples pasos usando Steps de Ant Design
 * 
 * Atomic Design: Usa moléculas (WizardActions, Steps) y átomos (FormCard)
 * 
 * Nota: Este componente solo maneja la UI. La lógica de guardado y valores iniciales
 * debe venir desde la página que lo consume (via props).
 */

import React from 'react';
import { Steps } from 'antd';
import { FormCard } from '@atoms';
import { WizardActions } from '@molecules';
import { useWizard } from './hooks/useWizard';

const WizardForm = ({
  steps = [],
  viewMode = false,
  loading = false,
  onFinish,
  onSave,
  className = '',
}) => {
  const { currentStep, next, prev, isFirstStep, isLastStep } = useWizard(0, steps.length);

  return (
    <FormCard className={className}>
      {/* Steps indicator */}
      <Steps
        current={currentStep}
        items={steps.map((step, index) => ({
          title: step.title,
        }))}
        style={{ marginBottom: 32 }}
      />

      {/* Contenido del paso actual - inicialmente vacío */}
      {/* TODO: Agregar contenido del paso cuando esté listo */}

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