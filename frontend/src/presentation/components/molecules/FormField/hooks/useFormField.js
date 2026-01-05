/**
 * useFormField - Hook específico para FormField que compone hooks genéricos
 * 
 * Single Responsibility: Componer hooks genéricos para la lógica específica de FormField
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente FormField
 * - Compone hooks genéricos de Application Layer
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo compone hooks genéricos para FormField
 * - Dependency Inversion: Depende de hooks genéricos (abstracciones)
 * - Composition over Inheritance: Compone hooks en lugar de crear uno monolítico
 * 
 * Este hook:
 * - Usa hooks genéricos compartidos (useFormFieldOptions, useFormFieldValidation, useFormFieldState)
 * - Proporciona una interfaz específica para FormField
 * 
 * Separation of Concerns: Separa la lógica de la presentación
 * El hook solo calcula valores, no renderiza componentes React
 */

import { useMemo } from 'react';
import { useFormFieldOptions } from './useFormFieldOptions';
import { useFormFieldValidation } from './useFormFieldValidation';
import { useFormFieldState } from './useFormFieldState';
import { useFieldMinAge } from './useFieldMinAge';

/**
 * Hook para manejar la lógica de FormField
 * 
 * @param {Object} field - Configuración del campo
 * @param {Function} resolveOptions - Función para resolver opciones de select
 * @param {boolean} readOnly - Si el campo está en modo solo lectura
 * @param {FormInstance} form - Instancia del formulario de Ant Design
 * @param {number|null} contextMinAge - minAge del contexto (opcional)
 * @returns {Object} Objeto con valores calculados
 */
export const useFormField = ({ 
  field, 
  resolveOptions, 
  readOnly = false, 
  form,
  contextMinAge = null,
}) => {
  // Helper para obtener el nombre del campo
  const fieldName = useMemo(() => {
    return field.name;
  }, [field.name]);

  // Hook: calcular estado (disabled/readOnly)
  const { disabled } = useFormFieldState({
    readOnly,
    fieldDisabled: field.disabled,
  });

  // Hook: resolver opciones con exclusión
  const selectOptions = useFormFieldOptions({
    fieldType: field.type,
    fieldOptions: field.options,
    excludeFrom: field.excludeFrom,
    resolveOptions,
    form,
  });

  // Hook: generar reglas de validación
  const rules = useFormFieldValidation({
    required: field.required,
    label: field.label,
  });

  // Hook: determinar minAge
  const minAge = useFieldMinAge({
    fieldMinAge: field.minAge,
    contextMinAge,
  });

  return {
    fieldName,
    disabled,
    selectOptions,
    rules,
    minAge,
  };
};

