/**
 * Hook: useWizardActions (Co-localizado con WizardActions)
 * 
 * Single Responsibility: Componer toda la lógica de WizardActions
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente WizardActions
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo compone lógica de acciones del wizard
 * - Dependency Inversion: Depende de hooks especializados (abstracciones)
 * - Composition over Inheritance: Compone hooks en lugar de crear uno monolítico
 * 
 * Este hook:
 * - Calcula estados del wizard
 * - Determina visibilidad de botones
 * 
 * Uso: Solo dentro del componente WizardActions
 */

import { useWizardActionsState } from './useWizardActionsState';
import { useWizardActionsVisibility } from './useWizardActionsVisibility';

/**
 * Hook para gestionar toda la lógica de WizardActions
 * 
 * @param {Object} options - Opciones de configuración
 * @param {number} options.currentStep - Paso actual (0-indexed)
 * @param {number} options.totalSteps - Total de pasos
 * @param {boolean} options.viewMode - Si estamos en modo visualización
 * @param {Function} [options.onSave] - Callback para guardar
 * @param {Function} [options.onFinish] - Callback para finalizar
 * @param {boolean} [options.showSaveButton=true] - Si mostrar el botón de guardar
 * @returns {Object} Objeto con estados y visibilidad
 */
export const useWizardActions = ({
  currentStep = 0,
  totalSteps = 0,
  viewMode = false,
  onSave,
  onFinish,
  showSaveButton = true,
}) => {
  // Calcular estados derivados
  const { isFirstStep, isLastStep } = useWizardActionsState({
    currentStep,
    totalSteps,
  });

  // Determinar visibilidad de botones
  const visibility = useWizardActionsVisibility({
    isFirstStep,
    isLastStep,
    viewMode,
    onSave,
    onFinish,
    showSaveButton,
  });

  return {
    isFirstStep,
    isLastStep,
    ...visibility,
  };
};

