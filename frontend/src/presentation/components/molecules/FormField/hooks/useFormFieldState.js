/**
 * Hook: useFormFieldState (Co-localizado con FormField)
 * 
 * Single Responsibility: Calcular el estado (disabled/readOnly) de un campo de formulario
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente FormField
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo calcula estado disabled/readOnly
 * - Dependency Inversion: Depende de props inyectadas
 * 
 * Este hook:
 * - Calcula si un campo está disabled basado en readOnly y field.disabled
 * - Puede extenderse para lógica más compleja (dependencias entre campos, etc.)
 * 
 * Uso: Solo dentro del componente FormField
 */

import { useMemo } from 'react';

/**
 * Hook para calcular el estado de un campo de formulario
 * 
 * @param {Object} options - Opciones de estado
 * @param {boolean} [options.readOnly] - Si el formulario está en modo solo lectura
 * @param {boolean} [options.fieldDisabled] - Si el campo específico está disabled
 * @returns {Object} Objeto con estado calculado
 */
export const useFormFieldState = ({
  readOnly = false,
  fieldDisabled = false,
}) => {
  const disabled = useMemo(() => {
    // Si está en modo readOnly, siempre disabled
    if (readOnly) {
      return true;
    }
    // Si no, usar el valor del campo
    return fieldDisabled || false;
  }, [readOnly, fieldDisabled]);

  return {
    disabled,
  };
};

