/**
 * Hook: useFormFieldValidation (Co-localizado con FormField)
 * 
 * Single Responsibility: Generar reglas de validación para campos de formulario
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente FormField
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo genera reglas de validación
 * - Open/Closed: Extensible agregando nuevos tipos de validación sin modificar código existente
 * 
 * Este hook:
 * - Genera reglas de validación básicas (required, etc.)
 * - Puede extenderse para validaciones más complejas
 * 
 * Uso: Solo dentro del componente FormField
 */

import { useMemo } from 'react';

/**
 * Hook para generar reglas de validación para campos de formulario
 * 
 * @param {Object} options - Opciones de validación
 * @param {boolean} [options.required] - Si el campo es requerido
 * @param {string} [options.label] - Label del campo (para mensajes de error)
 * @param {Array} [options.customRules] - Reglas personalizadas adicionales
 * @returns {Array} Array de reglas de validación para Ant Design Form
 */
export const useFormFieldValidation = ({
  required = false,
  label = '',
  customRules = [],
}) => {
  const rules = useMemo(() => {
    const validationRules = [];

    // Regla de requerido
    if (required) {
      const message = label 
        ? `Por favor ingrese ${label.toLowerCase()}` 
        : 'Este campo es requerido';
      validationRules.push({ required: true, message });
    }

    // Agregar reglas personalizadas
    if (Array.isArray(customRules) && customRules.length > 0) {
      validationRules.push(...customRules);
    }

    return validationRules;
  }, [required, label, customRules]);

  return rules;
};

