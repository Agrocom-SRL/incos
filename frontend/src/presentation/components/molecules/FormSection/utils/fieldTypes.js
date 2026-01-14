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

/**
 * Verifica si un campo es de tipo lista
 * 
 * @param {Object} field - Campo a verificar
 * @returns {boolean} true si es una lista
 */
export const isList = (field) => {
  return field?.type === 'list';
};

/**
 * Verifica si un campo es de tipo documento
 * 
 * @param {Object} field - Campo a verificar
 * @returns {boolean} true si es un documento
 */
export const isDocumento = (field) => {
  return field?.type === 'documento' && field?.documento;
};

/**
 * Verifica si un campo es de tipo cards
 * 
 * @param {Object} field - Campo a verificar
 * @returns {boolean} true si es cards
 */
export const isCards = (field) => {
  return field?.type === 'cards';
};

/**
 * Verifica si un campo es de tipo activity
 * 
 * @param {Object} field - Campo a verificar
 * @returns {boolean} true si es activity
 */
export const isActivity = (field) => {
  return field?.type === 'activity';
};

