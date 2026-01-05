/**
 * fieldTypes - Utilidades para identificar tipos de campos
 * 
 * Single Responsibility: Proporcionar funciones helper para identificar tipos de campos
 * 
 * Clean Architecture:
 * - Presentation Layer: Utilidades específicas del componente FormSection
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo identifica tipos de campos
 * - Open/Closed: Extensible agregando nuevos tipos sin modificar código existente
 * 
 * Uso: Solo dentro del componente FormSection
 */

/**
 * Verifica si un campo es una subsección
 * 
 * @param {Object} field - Campo a verificar
 * @returns {boolean} true si es una subsección
 */
export const isSubsection = (field) => {
  return field?.type === 'subsection';
};

/**
 * Verifica si un campo es condicional
 * 
 * @param {Object} field - Campo a verificar
 * @returns {boolean} true si es condicional
 */
export const isConditional = (field) => {
  return field?.conditional === true;
};

