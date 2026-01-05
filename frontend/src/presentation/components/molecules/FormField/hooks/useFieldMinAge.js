/**
 * Hook: useFieldMinAge (Co-localizado con FormField)
 * 
 * Single Responsibility: Determinar el minAge a usar para campos de fecha
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente FormField
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo determina el minAge correcto
 * - Dependency Inversion: Depende de props inyectadas
 * 
 * Uso: Solo dentro del componente FormField
 */

import { useMemo } from 'react';

/**
 * Hook para determinar el minAge a usar para campos de fecha
 * 
 * @param {Object} options - Opciones de configuración
 * @param {number|null} [options.fieldMinAge] - minAge específico del campo
 * @param {number|null} [options.contextMinAge] - minAge del contexto
 * @returns {number|null} minAge a usar
 */
export const useFieldMinAge = ({ fieldMinAge, contextMinAge = null }) => {
  const minAge = useMemo(() => {
    // Si field.minAge es null o undefined, usar el del contexto
    // Si field.minAge tiene valor, usar el del field
    return fieldMinAge !== null && fieldMinAge !== undefined 
      ? fieldMinAge 
      : contextMinAge;
  }, [fieldMinAge, contextMinAge]);

  return minAge;
};

