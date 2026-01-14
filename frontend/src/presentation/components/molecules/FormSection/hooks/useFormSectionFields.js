/**
 * Hook: useFormSectionFields (Co-localizado con FormSection)
 * 
 * Single Responsibility: Componer toda la lógica de campos de FormSection
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente FormSection
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo compone lógica de campos de sección
 * - Dependency Inversion: Depende de hooks especializados (abstracciones)
 * - Composition over Inheritance: Compone hooks en lugar de crear uno monolítico
 * 
 * Este hook:
 * - Observa valores del formulario
 * - Filtra campos según condiciones
 * - Proporciona configuración de columnas
 * 
 * Uso: Solo dentro del componente FormSection
 */

import { useMemo, useCallback } from 'react';
import { Form } from 'antd';
import { shouldShowConditionalField } from './useConditionalField';
import { getFieldColumns } from '../utils/fieldColumns';
import { isSubsection } from '../utils/fieldTypes';

/**
 * Hook para gestionar toda la lógica de campos de FormSection
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.fields - Array de campos de la sección
 * @param {FormInstance} options.form - Instancia del formulario de Ant Design
 * @returns {Object} Objeto con campos procesados y helpers
 */
export const useFormSectionFields = ({ fields = [], form }) => {
  // Asegurar que fields siempre sea un array
  const safeFields = useMemo(() => {
    return Array.isArray(fields) ? fields : [];
  }, [fields]);

  // Observar todos los campos del formulario para hacer reactivo el componente
  // cuando cambien los campos condicionales
  const allFormValues = Form.useWatch([], form);

  // Función helper para verificar si un campo debe mostrarse
  const shouldShowField = useCallback((field) => {
    // Si el campo tiene hidden: true, no mostrarlo
    if (field.hidden === true) {
      return false;
    }

    // Si es una subsección, la lógica condicional está en FormSubsection
    if (isSubsection(field)) {
      return true;
    }

    // Si no es condicional, siempre mostrar
    if (!field.conditional) {
      return true;
    }

    // Usar función pura para determinar si debe mostrarse
    return shouldShowConditionalField({
      conditional: field.conditional,
      dependsOn: field.dependsOn,
      showIf: field.showIf,
      allFormValues,
    });
  }, [allFormValues]);

  // Función helper para obtener columnas de un campo
  const getColumns = useCallback((field) => {
    const span = field.span || 24;
    return getFieldColumns(span);
  }, []);

  return {
    fields: safeFields,
    allFormValues,
    shouldShowField,
    getColumns,
    hasFields: safeFields.length > 0,
  };
};

