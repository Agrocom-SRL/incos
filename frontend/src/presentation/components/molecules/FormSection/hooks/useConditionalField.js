/**
 * shouldShowConditionalField - Función pura para determinar si un campo condicional debe mostrarse
 * 
 * Single Responsibility: Determinar si un campo condicional debe mostrarse
 * 
 * Clean Architecture:
 * - Presentation Layer: Utilidad específica del componente FormSection
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo determina si un campo debe mostrarse
 * - Dependency Inversion: Depende de valores inyectados (allFormValues)
 * 
 * Esta función:
 * - Evalúa condiciones de campos condicionales
 * - Soporta showIf personalizado o evaluación por defecto (truthy)
 * 
 * Uso: Solo dentro del componente FormSection
 */

/**
 * Función pura para determinar si un campo condicional debe mostrarse
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.conditional - Si el campo es condicional
 * @param {string} [options.dependsOn] - Nombre del campo del que depende
 * @param {Function} [options.showIf] - Función personalizada para evaluar condición
 * @param {Object} [options.allFormValues] - Todos los valores del formulario
 * @returns {boolean} true si el campo debe mostrarse, false en caso contrario
 */
export const shouldShowConditionalField = ({
  conditional = false,
  dependsOn,
  showIf,
  allFormValues = {},
}) => {
  // Si no es condicional, siempre mostrar
  if (!conditional) {
    return true;
  }

  // Si es condicional pero no tiene dependsOn, no mostrar
  if (!dependsOn) {
    return false;
  }

  // Obtener el valor del campo del que depende
  const dependsOnValue = allFormValues?.[dependsOn];

  // Si tiene showIf personalizado, evaluarlo
  if (showIf && typeof showIf === 'function') {
    return showIf(dependsOnValue);
  }

  // Por defecto, mostrar si el valor es truthy
  return !!dependsOnValue;
};

