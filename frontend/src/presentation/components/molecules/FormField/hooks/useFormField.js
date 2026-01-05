/**
 * useFormField - Hook personalizado para la lógica de FormField
 * 
 * Single Responsibility: Manejar la lógica de negocio de FormField
 * - Obtener nombre del campo
 * - Calcular valores disabled/readOnly
 * - Resolver opciones para selects
 * - Calcular reglas de validación
 * 
 * Separation of Concerns: Separa la lógica de la presentación
 * El hook solo calcula valores, no renderiza componentes React
 */

import { useMemo } from 'react';

/**
 * Hook para manejar la lógica de FormField
 * 
 * @param {Object} field - Configuración del campo
 * @param {Function} resolveOptions - Función para resolver opciones de select
 * @param {boolean} readOnly - Si el campo está en modo solo lectura
 * @returns {Object} Objeto con valores calculados
 */
export const useFormField = ({ field, resolveOptions, readOnly = false }) => {
  // Helper para obtener el nombre del campo
  const fieldName = useMemo(() => {
    return field.name;
  }, [field.name]);

  // Props comunes - calcular disabled
  const disabled = useMemo(() => {
    if (readOnly) return true;
    return field.disabled || false;
  }, [readOnly, field.disabled]);

  // Obtener opciones para campos select
  const selectOptions = useMemo(() => {
    if (field.type !== 'select') return [];
    
    if (typeof field.options === 'string') {
      return resolveOptions ? resolveOptions(field.options) : [];
    }
    return field.options || [];
  }, [field.type, field.options, resolveOptions]);

  // Reglas de validación
  const rules = useMemo(() => {
    if (field.required) {
      return [{ required: true, message: `Por favor ingrese ${field.label.toLowerCase()}` }];
    }
    return [];
  }, [field.required, field.label]);

  return {
    fieldName,
    disabled,
    selectOptions,
    rules,
  };
};

