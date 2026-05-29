/**
 * Hook: useFieldRenderer (Co-localizado con FormField)
 * 
 * Single Responsibility: Proporcionar función para renderizar el campo apropiado según su tipo
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente FormField
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo proporciona función de renderizado
 * - Open/Closed: Usa Strategy Pattern para ser extensible
 * - Dependency Inversion: Depende de abstracciones (fieldRenderers)
 * 
 * Este hook:
 * - Usa el registry de renderers (Strategy Pattern)
 * - Proporciona una función memoizada para renderizar el campo
 * 
 * Uso: Solo dentro del componente FormField
 */

import { useCallback } from 'react';
import { getFieldRenderer } from '../utils/fieldRenderers'

/**
 * Hook para obtener función de renderizado del campo
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string} options.fieldType - Tipo de campo
 * @param {Object} options.field - Configuración del campo
 * @param {boolean} options.disabled - Si el campo está disabled
 * @param {boolean} options.readOnly - Si el campo está en modo readOnly
 * @param {Array} options.selectOptions - Opciones para select/radio
 * @param {number|null} options.minAge - minAge para campos de fecha
 * @returns {Function} Función para renderizar el campo
 */
export const useFieldRenderer = ({
  fieldType,
  field,
  disabled,
  readOnly,
  selectOptions,
  minAge,
  form,
  resolveOptions,
}) => {
  const renderField = useCallback(() => {
    const renderer = getFieldRenderer(fieldType);
    
    if (!renderer) {
      console.warn(`FormField: Tipo de campo no soportado: ${fieldType}`);
      return null;
    }

    // Determinar qué parámetros pasar según el tipo de campo
    // Strategy Pattern: cada renderer recibe exactamente los parámetros que necesita
    if (fieldType === 'select' || fieldType === 'radio') {
      // Select necesita form para combinar onChange personalizado con Form.Item
      return renderer(field, disabled, readOnly, selectOptions, form);
    }

    if (fieldType === 'checkboxGroup') {
      // CheckboxGroup necesita selectOptions (opciones) y form (valor/onChange)
      return renderer(field, disabled, readOnly, selectOptions, form);
    }
    
    if (fieldType === 'date') {
      return renderer(field, disabled, readOnly, minAge);
    }

    if (fieldType === 'number' || fieldType === 'color') {
      return renderer(field, disabled, readOnly);
    }

    if (fieldType === 'imageUpload') {
      return renderer(field, disabled, readOnly, form);
    }

    // Para search: necesita form, resolveOptions, minAge para renderizar children
    if (fieldType === 'search') {
      return renderer(field, disabled, readOnly, form, resolveOptions, minAge);
    }
    
    // Para input, switch, textarea: solo necesitan field, disabled, readOnly
    return renderer(field, disabled, readOnly);
  }, [fieldType, field, disabled, readOnly, selectOptions, minAge, form, resolveOptions]);

  return renderField;
};

