/**
 * fieldColumns - Configuración de columnas responsive para campos
 * 
 * Single Responsibility: Proporcionar configuración de columnas responsive
 * 
 * Clean Architecture:
 * - Presentation Layer: Utilidades específicas del componente FormSection
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo proporciona configuración de columnas
 * - Open/Closed: Extensible sin modificar código existente
 * 
 * Uso: Solo dentro del componente FormSection
 */

/**
 * Genera configuración de columnas responsive para un campo
 * 
 * Sistema de columnas de Ant Design (24 columnas totales):
 * - span: 24 = 1 columna (100% ancho)
 * - span: 12 = 2 columnas (50% ancho cada una)
 * - span: 8 = 3 columnas (33.33% ancho cada una)
 * - span: 6 = 4 columnas (25% ancho cada una)
 * 
 * @param {number} span - Span del campo (default: 24)
 * @returns {Object} Configuración de columnas responsive
 */
/**
 * Clave estable para React (soporta `name` anidado tipo `['personal', 'ci']`).
 */
export function fieldRowKey(field, index) {
  if (field?.key != null) return field.key;
  if (Array.isArray(field?.name)) return field.name.join('.');
  if (field?.name != null) return String(field.name);
  return `field-${index}`;
}

export const getFieldColumns = (span = 24) => {
  return {
    xs: 24,     // < 576px (Móviles): siempre 24 span (100% ancho)
    sm: 24,     // ≥ 576px (Tablets pequeñas): usar 24 columnas (100% ancho)
    md: 24,     // ≥ 768px (Tablets): usar 24 columnas (100% ancho)
    lg: span >= 8 ? 12 : span,  // ≥ 992px (Desktop): si span >= 8, usar 12, sino usar el span
    xl: span,   // ≥ 1200px (Desktop grande): usar el span definido
    xxl: span, // ≥ 1600px (Desktop extra grande): usar el span definido
  };
};

