/**
 * Hook: useConditionalLoaders (Co-localizado con WizardForm)
 * 
 * Single Responsibility: Ejecutar funciones de carga cuando campos condicionales cambian a true
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente WizardForm
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja la ejecución de cargadores condicionales
 * - Dependency Inversion: Depende de funciones inyectadas (conditionalLoaders)
 * 
 * Este hook:
 * - Observa cambios en los valores del formulario
 * - Ejecuta funciones de carga cuando campos específicos cambian a true
 * 
 * Uso: Solo dentro del componente WizardForm
 */

import { useEffect } from 'react';
import { Form } from 'antd';

/**
 * Hook para ejecutar funciones de carga condicionales basadas en valores del formulario
 * 
 * @param {FormInstance} form - Instancia del formulario de Ant Design
 * @param {Object} conditionalLoaders - Objeto con funciones de carga indexadas por nombre de campo
 *   Ejemplo: { tieneDiscapacidad: loadDiscapacidades, esExtranjero: loadPaises }
 * @returns {void}
 */
export const useConditionalLoaders = (form, conditionalLoaders = {}) => {
  // Observar todos los campos del formulario para detectar cambios
  const allFormValues = Form.useWatch([], form);

  // Ejecutar funciones de carga cuando los campos condicionales cambian a true
  useEffect(() => {
    if (!allFormValues || !conditionalLoaders) return;
    
    Object.entries(conditionalLoaders).forEach(([fieldName, loader]) => {
      if (loader && typeof loader === 'function') {
        const fieldValue = allFormValues[fieldName];
        // Ejecutar loader cuando el campo cambia a true
        if (fieldValue === true) {
          loader();
        }
      }
    });
  }, [allFormValues, conditionalLoaders]);
};

