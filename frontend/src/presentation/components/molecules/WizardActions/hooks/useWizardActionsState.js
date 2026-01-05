/**
 * useWizardActionsState - Hook para calcular el estado del wizard
 * 
 * Single Responsibility: Calcular estados derivados del wizard (isFirstStep, isLastStep)
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente WizardActions
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo calcula estados derivados
 * 
 * Este hook:
 * - Calcula si estamos en el primer paso
 * - Calcula si estamos en el último paso
 * 
 * Uso: Solo dentro del componente WizardActions
 */

import { useMemo } from 'react';

/**
 * Hook para calcular estados derivados del wizard
 * 
 * @param {Object} options - Opciones de configuración
 * @param {number} options.currentStep - Paso actual (0-indexed)
 * @param {number} options.totalSteps - Total de pasos
 * @returns {Object} Estados derivados
 */
export const useWizardActionsState = ({
  currentStep = 0,
  totalSteps = 0,
}) => {
  const isFirstStep = useMemo(() => {
    return currentStep === 0;
  }, [currentStep]);

  const isLastStep = useMemo(() => {
    return currentStep === totalSteps - 1;
  }, [currentStep, totalSteps]);

  return {
    isFirstStep,
    isLastStep,
  };
};

