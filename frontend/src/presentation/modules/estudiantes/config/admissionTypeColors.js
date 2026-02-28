/**
 * admissionTypeColors - Colores por tipo de admisión (fuente única)
 *
 * Single Responsibility: Definir color y fondo para cada tipo de admisión en todo el frontend.
 * Valores alineados con EstudiantesDetail.css (pill de la cabecera del detalle de estudiante).
 *
 * Uso: TipoAdmisionSelectionSection, tabla de estudiantes, Tag en tab Acádemico, etc.
 */

/** Color de texto principal (--text-700 en EstudiantesDetail) */
const TEXT_700 = '#374151';

/**
 * Configuración de color por tipo de admisión (NUEVO, ANTIGUO, TRASPASO, TRANSITABILIDAD).
 * @typedef {{ color: string, bgColor: string }} AdmissionTypeColors
 */

/** Colores del pill de la cabecera en EstudiantesDetail (sd-profile__admission-pill--*) */
export const ADMISSION_TYPE_COLORS = Object.freeze({
  NUEVO: {
    color: '#134d32',   // --primary-dark
    bgColor: '#e8f5e9', // --primary-light
  },
  ANTIGUO: {
    color: '#92400e',
    bgColor: '#fef3c7',
  },
  TRASPASO: {
    color: '#eb2f96',
    bgColor: '#fff0f6',
  },
  TRANSITABILIDAD: {
    color: '#722ed1',
    bgColor: '#f9f0ff',
  },
  default: {
    color: TEXT_700,
    bgColor: '#e5e7eb',
  },
});

/**
 * Obtiene los colores para un tipo de admisión (para Tag, pill, tarjeta).
 * @param {string} [tipoAdmision] - NUEVO | ANTIGUO | TRASPASO | TRANSITABILIDAD
 * @returns {AdmissionTypeColors}
 */
export function getAdmissionTypeColors(tipoAdmision) {
  if (!tipoAdmision) return ADMISSION_TYPE_COLORS.default;
  const key = String(tipoAdmision).toUpperCase();
  return ADMISSION_TYPE_COLORS[key] ?? ADMISSION_TYPE_COLORS.default;
}

/**
 * Estilo inline para un Tag/pill de tipo de admisión (backgroundColor + color).
 * @param {string} [tipoAdmision]
 * @returns {{ backgroundColor: string, color: string, border?: string } | undefined}
 */
export function getAdmissionTypeTagStyle(tipoAdmision) {
  const { color, bgColor } = getAdmissionTypeColors(tipoAdmision);
  return {
    backgroundColor: bgColor,
    color,
    border: `1px solid ${color}26`, // ~15% opacity
  };
}
