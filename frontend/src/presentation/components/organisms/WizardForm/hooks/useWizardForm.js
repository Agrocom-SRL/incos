/**
 * Hook: useWizardForm
 * 
 * Single Responsibility: Componer toda la lógica del formulario wizard (navegación + formulario + cargadores)
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook que compone lógica específica del wizard form
 * 
 * SOLID Principles:
 * - Single Responsibility: Componer hooks especializados para el wizard
 * - Dependency Inversion: Depende de hooks especializados (abstracciones)
 * - Composition over Inheritance: Compone hooks en lugar de crear uno monolítico
 * 
 * Este hook:
 * - Gestiona la navegación del wizard (useWizard)
 * - Gestiona el formulario (Form.useForm o form externo)
 * - Gestiona cargadores condicionales (useConditionalLoaders)
 * - Proporciona configuración del step actual
 * 
 * Usado por: WizardForm component
 */

import { useMemo } from 'react';
import { Form } from 'antd';
import { useWizard } from './useWizard';
import { useConditionalLoaders } from './useConditionalLoaders';

/**
 * Hook principal para gestionar toda la lógica del formulario wizard
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.steps - Array de configuración de pasos
 * @param {FormInstance} [options.externalForm] - Formulario externo (opcional)
 * @param {Object} [options.conditionalLoaders] - Funciones de carga condicionales
 * @returns {Object} Objeto con toda la lógica del wizard form
 */
export const useWizardForm = ({ steps = [], externalForm, conditionalLoaders = {} }) => {
  // Hook de navegación del wizard
  const wizard = useWizard(0, steps.length);

  // Gestionar formulario: usar externo o crear interno
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  // Gestionar cargadores condicionales
  useConditionalLoaders(form, conditionalLoaders);

  // Observar todos los campos del formulario (para lógica condicional de secciones)
  const allFormValues = Form.useWatch([], form);

  // Obtener configuración del step actual
  const currentStepConfig = useMemo(() => {
    return steps[wizard.currentStep] || null;
  }, [steps, wizard.currentStep]);

  // Función helper para verificar si una sección debe mostrarse
  const shouldShowSection = useMemo(() => {
    return (section) => {
      if (!section.conditional || !section.dependsOn) {
        return true; // Mostrar si no es condicional
      }
      const dependsOnValue = allFormValues?.[section.dependsOn];
      return !!dependsOnValue; // Mostrar solo si el campo dependiente tiene valor
    };
  }, [allFormValues]);

  return {
    // Navegación
    ...wizard,
    
    // Formulario
    form,
    allFormValues,
    
    // Configuración
    currentStepConfig,
    shouldShowSection,
    
    // Helpers
    hasSteps: steps.length > 0,
  };
};

