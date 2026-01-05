/**
 * Hook: useFormSubsection (Co-localizado con FormSubsection)
 * 
 * Single Responsibility: Componer toda la lógica de FormSubsection
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente FormSubsection
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo compone lógica de subsección
 * - Dependency Inversion: Depende de utilidades compartidas (abstracciones)
 * - DRY: Reutiliza utilidades de FormSection para evitar duplicación
 * 
 * Este hook:
 * - Observa valores del formulario
 * - Evalúa si la subsección debe mostrarse (condicional)
 * - Normaliza campos
 * - Proporciona configuración de columnas
 * 
 * Uso: Solo dentro del componente FormSubsection
 */

import { useMemo, useCallback } from 'react';
import { Form } from 'antd';
import { shouldShowConditionalField } from '../../FormSection/hooks/useConditionalField';
import { getFieldColumns } from '../../FormSection/utils/fieldColumns';

/**
 * Hook para gestionar toda la lógica de FormSubsection
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.fields - Array de campos de la subsección
 * @param {FormInstance} options.form - Instancia del formulario de Ant Design
 * @param {boolean} options.conditional - Si la subsección es condicional
 * @param {string} [options.dependsOn] - Nombre del campo del que depende
 * @param {Function} [options.showIf] - Función personalizada para evaluar condición
 * @returns {Object} Objeto con campos procesados y helpers
 */
export const useFormSubsection = ({
  fields = [],
  form,
  conditional = false,
  dependsOn = null,
  showIf = null,
}) => {
  // Observar todos los campos del formulario para hacer reactivo el componente
  const allFormValues = Form.useWatch([], form);

  // Asegurar que fields siempre sea un array
  const safeFields = useMemo(() => {
    return Array.isArray(fields) ? fields : [];
  }, [fields]);

  // Determinar si la subsección debe mostrarse
  const shouldShow = useMemo(() => {
    return shouldShowConditionalField({
      conditional,
      dependsOn,
      showIf,
      allFormValues,
    });
  }, [conditional, dependsOn, showIf, allFormValues]);

  // Función helper para obtener columnas de un campo
  const getColumns = useCallback((field) => {
    const span = field.span || 24;
    return getFieldColumns(span);
  }, []);

  return {
    fields: safeFields,
    shouldShow,
    getColumns,
    hasFields: safeFields.length > 0,
  };
};

