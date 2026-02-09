/**
 * Hook: useFormFieldOptions (Co-localizado con FormField)
 * 
 * Single Responsibility: Resolver opciones para campos select/radio con soporte para exclusión
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente FormField
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo resuelve opciones con exclusión
 * - Open/Closed: Extensible sin modificar código existente
 * - Dependency Inversion: Depende de funciones inyectadas (resolveOptions, form)
 * 
 * Este hook:
 * - Resuelve opciones desde string o array
 * - Filtra opciones excluyendo el valor de otro campo (excludeFrom)
 * 
 * Uso: Solo dentro del componente FormField
 */

import { useMemo } from 'react';
import { Form } from 'antd';

/**
 * Hook para resolver opciones de campos select/radio con soporte para exclusión
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string} options.fieldType - Tipo de campo ('select' | 'radio')
 * @param {string|Array} options.fieldOptions - Opciones del campo (string para resolver, array directo)
 * @param {string} [options.excludeFrom] - Nombre del campo a excluir
 * @param {Function} [options.resolveOptions] - Función para resolver opciones desde string
 * @param {FormInstance} [options.form] - Instancia del formulario de Ant Design
 * @returns {Array} Array de opciones filtradas
 */
export const useFormFieldOptions = ({
  fieldType,
  fieldOptions,
  excludeFrom,
  resolveOptions,
  form,
}) => {
  // Observar cambios en el campo excluido si existe
  const excludeFieldValue = excludeFrom && form ? Form.useWatch(excludeFrom, form) : null;
  
  // Observar tipo de admisión si el campo es 'gestiones' para recargar opciones dinámicamente
  const tipoAdmision = form && typeof fieldOptions === 'string' && fieldOptions === 'gestiones' 
    ? Form.useWatch('tipoAdmision', form) 
    : null;

  // Resolver y filtrar opciones
  const selectOptions = useMemo(() => {
    // Procesar para select, radio y checkboxGroup (todos usan opciones value/label)
    if (fieldType !== 'select' && fieldType !== 'radio' && fieldType !== 'checkboxGroup') {
      return [];
    }

    // Resolver opciones
    let options = [];
    if (typeof fieldOptions === 'string') {
      // Si es string, usar resolveOptions para obtenerlas
      // Para 'gestiones', pasar el formulario para que pueda observar el tipo de admisión
      options = resolveOptions ? resolveOptions(fieldOptions, form) : [];
    } else if (Array.isArray(fieldOptions)) {
      // Si es array, usarlo directamente
      options = fieldOptions;
    } else {
      // Si no hay opciones definidas, retornar array vacío
      options = [];
    }

    // Si hay exclusión, filtrar las opciones
    if (excludeFrom && excludeFieldValue) {
      options = options.filter(option => {
        const optionValue = option.value || option.id || option;
        const excludeValueToCompare = typeof excludeFieldValue === 'object' 
          ? (excludeFieldValue.value || excludeFieldValue.id || excludeFieldValue) 
          : excludeFieldValue;
        return optionValue !== excludeValueToCompare;
      });
    }

    return options;
  }, [fieldType, fieldOptions, excludeFrom, resolveOptions, excludeFieldValue, tipoAdmision, form]);

  return selectOptions;
};

