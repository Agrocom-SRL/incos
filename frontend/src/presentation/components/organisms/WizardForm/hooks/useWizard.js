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

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook para manejar la navegación de un wizard/stepper
 * 
 * @param {number} initialStep - Paso inicial (default: 0)
 * @param {number} totalSteps - Total de pasos del wizard
 * @returns {Object} Objeto con estado y handlers de navegación
 */
export const useWizard = (initialStep = 0, totalSteps = 0) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const prevTotalStepsRef = useRef(totalSteps);

  // Sincronizar currentStep con initialStep cuando cambia (útil cuando el estudiante se carga después)
  useEffect(() => {
    if (initialStep >= 0 && initialStep < totalSteps && initialStep !== currentStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep, totalSteps]);

  // Si el número de pasos disminuye: solo ajustar currentStep si queda fuera de rango (clamp).
  // No resetear siempre a 0, porque con steps dinámicos el padre puede re-renderizar y totalSteps
  // puede bajar temporalmente (ej. tipoAdmision leído en otro tick) y luego volver a subir.
  useEffect(() => {
    if (totalSteps < prevTotalStepsRef.current) {
      setCurrentStep((prev) => Math.min(prev, Math.max(0, totalSteps - 1)));
    }
    prevTotalStepsRef.current = totalSteps;
  }, [totalSteps]);

  // Avanzar al siguiente paso
  const next = useCallback(() => {
    setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
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

