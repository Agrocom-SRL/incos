/**
 * Constantes del dominio relacionadas con Configuración del Sistema
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con configuración.
 */

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

/**
 * Tipos de dato para configuración del sistema
 */
export const TIPOS_CONFIGURACION = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON',
  DATE: 'DATE',
};

/**
 * Array de tipos de configuración válidos (útil para validators)
 */
export const TIPOS_CONFIGURACION_VALUES = Object.values(TIPOS_CONFIGURACION);

// ============================================
// DOCUMENTOS DEL SISTEMA
// ============================================

/**
 * Tipos de documento del sistema (documentación requerida)
 * Nota: Esta constante actualiza y expande TIPOS_DOCUMENTO_ESTUDIANTE de estudiantes.constants.js
 */
export const TIPOS_DOCUMENTO_SISTEMA = {
  INSCRIPCION: 'INSCRIPCION',
  LICENCIA: 'LICENCIA',
  PASANTIA: 'PASANTIA',
  DESCUENTO: 'DESCUENTO',
  TITULACION: 'TITULACION',
  TRASPASO: 'TRASPASO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  BECA: 'BECA',
  OTRO: 'OTRO',
};

/**
 * Array de tipos de documento del sistema válidos (útil para validators)
 */
export const TIPOS_DOCUMENTO_SISTEMA_VALUES = Object.values(TIPOS_DOCUMENTO_SISTEMA);
