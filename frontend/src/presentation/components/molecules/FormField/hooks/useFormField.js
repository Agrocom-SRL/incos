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
import { Form } from 'antd';

/**
 * Hook para manejar la lógica de FormField
 * 
 * @param {Object} field - Configuración del campo
 * @param {Function} resolveOptions - Función para resolver opciones de select
 * @param {boolean} readOnly - Si el campo está en modo solo lectura
 * @returns {Object} Objeto con valores calculados
 */
export const useFormField = ({ field, resolveOptions, readOnly = false, form }) => {
  // Helper para obtener el nombre del campo
  const fieldName = useMemo(() => {
    return field.name;
  }, [field.name]);

  // Props comunes - calcular disabled
  const disabled = useMemo(() => {
    if (readOnly) return true;
    return field.disabled || false;
  }, [readOnly, field.disabled]);

  // Observar cambios en el campo excluido si existe
  const excludeFieldValue = field.excludeFrom && form ? Form.useWatch(field.excludeFrom, form) : null;

  // Obtener opciones para campos select y radio
  // Si el campo tiene excludeFrom, filtrar las opciones excluyendo el valor del campo especificado
  const selectOptions = useMemo(() => {
    if (field.type !== 'select' && field.type !== 'radio') return [];
    
    let options = [];
    if (typeof field.options === 'string') {
      options = resolveOptions ? resolveOptions(field.options) : [];
    } else {
      options = field.options || [];
    }

    // Si el campo tiene excludeFrom, filtrar las opciones excluyendo el valor seleccionado
    if (field.excludeFrom && excludeFieldValue) {
      options = options.filter(option => {
        const optionValue = option.value || option.id || option;
        const excludeValueToCompare = typeof excludeFieldValue === 'object' ? (excludeFieldValue.value || excludeFieldValue.id || excludeFieldValue) : excludeFieldValue;
        return optionValue !== excludeValueToCompare;
      });
    }

    return options;
  }, [field.type, field.options, field.excludeFrom, resolveOptions, excludeFieldValue]);

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

