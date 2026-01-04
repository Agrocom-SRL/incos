// components/organisms/WizardForm/hooks/useWizard.js
/**
 * useWizard: Hook para manejar la navegación del wizard
 * 
 * Single Responsibility: Gestionar el estado de navegación (paso actual) y handlers de navegación
 */

import { useState, useCallback } from 'react';

/**
 * Hook para manejar la navegación de un wizard
 * 
 * @param {number} initialStep - Paso inicial (default: 0)
 * @param {number} totalSteps - Total de pasos del wizard
 * @returns {Object} Objeto con estado y handlers de navegación
 */
export const useWizard = (initialStep = 0, totalSteps = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

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
