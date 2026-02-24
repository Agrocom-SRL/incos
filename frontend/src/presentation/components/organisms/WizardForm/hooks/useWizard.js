/**
 * Hook: useWizard (Co-localizado con WizardForm)
 * 
 * Single Responsibility: Gestionar el estado de navegación del wizard
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente WizardForm
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja navegación entre pasos
 * - Open/Closed: Extensible sin modificar código existente
 * - Dependency Inversion: No depende de implementaciones concretas
 * 
 * Uso: Solo dentro del componente WizardForm
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook para manejar la navegación de un wizard/stepper
 * 
 * @param {number} initialStep - Paso inicial (default: 0)
 * @param {number} totalSteps - Total de pasos del wizard
 * @returns {Object} Objeto con estado y handlers de navegación
 */
export const useWizard = (initialStep = 0, totalSteps = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Sincronizar currentStep con initialStep cuando cambia (útil cuando el estudiante se carga después)
  useEffect(() => {
    if (initialStep >= 0 && initialStep < totalSteps && initialStep !== currentStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep, totalSteps]);

  // Avanzar al siguiente paso
  const next = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < totalSteps - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [totalSteps]);

  // Retroceder al paso anterior
  const prev = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  // Ir a un paso específico
  const goTo = useCallback((step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  // Resetear al paso inicial
  const reset = useCallback(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  return {
    currentStep,
    next,
    prev,
    goTo,
    reset,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };
};

