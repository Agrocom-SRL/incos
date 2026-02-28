/**
 * useWizardActionsVisibility - Hook para determinar visibilidad de botones
 * 
 * Single Responsibility: Determinar qué botones deben mostrarse según el estado del wizard
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente WizardActions
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo determina visibilidad de botones
 * 
 * Este hook:
 * - Determina si mostrar el botón "Anterior"
 * - Determina si mostrar el botón "Guardar"
 * - Determina si mostrar el botón "Siguiente" o "Finalizar"
 * 
 * Uso: Solo dentro del componente WizardActions
 */

import { useMemo } from 'react';

/**
 * Hook para determinar la visibilidad de los botones del wizard
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.isFirstStep - Si estamos en el primer paso
 * @param {boolean} options.isLastStep - Si estamos en el último paso
 * @param {boolean} options.viewMode - Si estamos en modo visualización
 * @param {Function} [options.onSave] - Callback para guardar
 * @param {Function} [options.onFinish] - Callback para finalizar
 * @param {boolean} [options.showSaveButton=true] - Si mostrar el botón de guardar (por defecto true)
 * @returns {Object} Objeto con flags de visibilidad
 */
export const useWizardActionsVisibility = ({
  isFirstStep,
  isLastStep,
  viewMode = false,
  onSave,
  onFinish,
  showSaveButton = true,
}) => {
  const visibility = useMemo(() => {
    return {
      // Botón Anterior: mostrar solo si no es el primer paso
      showPrev: !isFirstStep,
      
      // Botón Guardar: mostrar solo si no es el último paso, showSaveButton, no viewMode y existe onSave
      // En el último paso solo se muestra Finalizar, no "Guardar y continuar"
      showSave: showSaveButton && !viewMode && !!onSave && !isLastStep,
      
      // Botón Siguiente: mostrar solo si no es el último paso
      showNext: !isLastStep,
      
      // Botón Finalizar: mostrar solo si es el último paso, no es viewMode y existe onFinish
      showFinish: isLastStep && !viewMode && !!onFinish,
    };
  }, [isFirstStep, isLastStep, viewMode, onSave, onFinish, showSaveButton]);

  return visibility;
};

