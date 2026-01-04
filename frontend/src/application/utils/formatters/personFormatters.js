/**
 * Person Formatters - Utilidades para formatear datos de personas
 * 
 * Single Responsibility: Transformar datos de personas (estudiantes, docentes, personal)
 * al formato necesario para la presentación en la UI
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades compartidas entre módulos de aplicación
 * - NO contiene lógica de negocio, solo transformación/formateo de datos
 * 
 * Estas funciones son reutilizables en:
 * - Estudiantes (activos, abandonados, aprobados, con licencia, con becas)
 * - Docentes
 * - Personal administrativo
 * - Cualquier entidad que tenga CI y nombre completo
 * 
 * Ubicación: application/utils/formatters/
 * 
 * Patrón: Helper Functions / Utility Functions
 */

/**
 * Construye el CI completo desde el número de CI y la expedición
 * 
 * @param {string|null|undefined} ci - Número de cédula de identidad
 * @param {string|null|undefined} expedicion - Expedición del CI (LP, CB, SC, etc.)
 * @returns {string} CI completo en formato "CI EXPEDICION" o solo CI si no hay expedición
 * 
 * @example
 * buildCompleteCI('8159625', 'LP') // '8159625 LP'
 * buildCompleteCI('12345678', null) // '12345678'
 * buildCompleteCI(null, 'CB') // ''
 */
export const buildCompleteCI = (ci, expedicion) => {
  if (!ci) {
    return '';
  }

  if (ci && expedicion) {
    return `${ci} ${expedicion}`;
  }

  return ci;
};

/**
 * Construye el nombre completo desde nombres y apellidos
 * Formato: "APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES"
 * 
 * @param {string|null|undefined} nombres - Nombres de la persona
 * @param {string|null|undefined} apellidoPaterno - Apellido paterno
 * @param {string|null|undefined} apellidoMaterno - Apellido materno (opcional)
 * @param {string} fallback - Texto por defecto si no hay nombre (default: 'Sin nombre')
 * @returns {string} Nombre completo en formato "APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES"
 * 
 * @example
 * buildFullName('Juan', 'Pérez', 'González') // 'Pérez González Juan'
 * buildFullName('María', 'López', null) // 'López María'
 * buildFullName(null, null, null) // 'Sin nombre'
 * buildFullName(null, null, null, 'N/A') // 'N/A'
 */
export const buildFullName = (nombres, apellidoPaterno, apellidoMaterno, fallback = 'Sin nombre') => {
  const partesNombre = [
    apellidoPaterno,
    apellidoMaterno,
    nombres
  ].filter(Boolean);

  return partesNombre.length > 0 
    ? partesNombre.join(' ') 
    : fallback;
};

/**
 * Construye tanto el CI completo como el nombre completo de una persona
 * Útil para mappers que necesitan ambos campos
 * 
 * @param {Object} personData - Datos de la persona
 * @param {string|null|undefined} personData.ci - Número de CI
 * @param {string|null|undefined} personData.expedicion - Expedición del CI
 * @param {string|null|undefined} personData.nombres - Nombres
 * @param {string|null|undefined} personData.apellidoPaterno - Apellido paterno
 * @param {string|null|undefined} personData.apellidoMaterno - Apellido materno
 * @param {string} nameFallback - Texto por defecto para nombre (default: 'Sin nombre')
 * @returns {Object} Objeto con ciCompleto y nombreCompleto
 * 
 * @example
 * buildPersonDisplayData({
 *   ci: '8159625',
 *   expedicion: 'LP',
 *   nombres: 'Juan',
 *   apellidoPaterno: 'Pérez',
 *   apellidoMaterno: 'González'
 * })
 * // { ciCompleto: '8159625 LP', nombreCompleto: 'Pérez González Juan' }
 */
export const buildPersonDisplayData = (personData, nameFallback = 'Sin nombre') => {
  if (!personData) {
    return {
      ciCompleto: '',
      nombreCompleto: nameFallback,
    };
  }

  return {
    ciCompleto: buildCompleteCI(personData.ci, personData.expedicion),
    nombreCompleto: buildFullName(
      personData.nombres,
      personData.apellidoPaterno,
      personData.apellidoMaterno,
      nameFallback
    ),
  };
};

