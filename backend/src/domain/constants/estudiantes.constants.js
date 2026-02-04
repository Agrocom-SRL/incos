/**
 * Constantes del dominio relacionadas con Estudiantes
 * 
 * Este archivo consolida todas las constantes relacionadas con estudiantes:
 * - Estados académicos
 * - Estados de registro
 * - Datos personales (géneros, tipos de sangre, expediciones CI)
 * - Documentos de estudiantes
 * - Orígenes y nacionalidades
 * - Discapacidades
 * 
 * Todas las constantes están organizadas por categorías funcionales para facilitar su uso.
 */

// ============================================
// ESTUDIANTES
// ============================================

/**
 * Estados académicos de estudiantes
 */
export const ESTADOS_ACADEMICOS = {
  REGULAR: 'REGULAR',
  NIVELACION: 'NIVELACION',
  RETIRADO: 'RETIRADO',
  EGRESADO: 'EGRESADO',
  ABANDONO: 'ABANDONO',
};

/**
 * Array de estados académicos válidos (útil para validators)
 */
export const ESTADOS_ACADEMICOS_VALUES = Object.values(ESTADOS_ACADEMICOS);

/**
 * Edad mínima requerida para ser estudiante (en años)
 */
export const EDAD_MINIMA_ESTUDIANTE = 17;

/**
 * Nota mínima para aprobar (0-100)
 */
export const NOTA_MINIMA_APROBACION = 60;

/**
 * Nota máxima posible
 */
export const NOTA_MAXIMA = 100;

// ============================================
// DOCUMENTOS DE IDENTIDAD
// ============================================

/**
 * Expediciones válidas del CI boliviano
 */
export const EXPEDICIONES_CI = {
  SANTA_CRUZ: 'SC',
  LA_PAZ: 'LP',
  COCHABAMBA: 'CB',
  TARIJA: 'TJ',
  BENI: 'BN',
  PANDO: 'PD',
  ORURO: 'OR',
  POTOSI: 'PT',
  CHUQUISACA: 'CH',
};

/**
 * Array de expediciones válidas (útil para validators)
 */
export const EXPEDICIONES_CI_VALUES = Object.values(EXPEDICIONES_CI);

/**
 * Longitud mínima del CI (dígitos)
 */
export const CI_LONGITUD_MINIMA = 7;

/**
 * Longitud máxima del CI (dígitos)
 */
export const CI_LONGITUD_MAXIMA = 9;

// ============================================
// DATOS PERSONALES
// ============================================

/**
 * Géneros permitidos
 */
export const GENEROS = {
  MASCULINO: 'MASCULINO',
  FEMENINO: 'FEMENINO',
  OTRO: 'OTRO',
};

/**
 * Array de géneros válidos (útil para validators)
 */
export const GENEROS_VALUES = Object.values(GENEROS);

/**
 * Tipos de sangre
 */
export const TIPOS_SANGRE = {
  A_POSITIVO: 'ARH (+)',
  A_NEGATIVO: 'ARH (-)',
  B_POSITIVO: 'BRH (+)',
  B_NEGATIVO: 'BRH (-)',
  AB_POSITIVO: 'ABRH (+)',
  AB_NEGATIVO: 'ABRH (-)',
  O_POSITIVO: 'ORH (+)',
  O_NEGATIVO: 'ORH (-)',
};

/**
 * Array de tipos de sangre válidos (útil para validators)
 */
export const TIPOS_SANGRE_VALUES = Object.values(TIPOS_SANGRE);

// ============================================
// DOCUMENTOS DE ESTUDIANTES
// ============================================

/**
 * Tipos de documentos de estudiantes
 * Nota: Para tipos de documentos requeridos del sistema, ver TIPOS_DOCUMENTO_SISTEMA en sistema.constants.js
 */
export const TIPOS_DOCUMENTO_ESTUDIANTE = {
  INSCRIPCION: 'INSCRIPCION',
  LICENCIA: 'LICENCIA',
  PASANTIA: 'PASANTIA',
  DESCUENTO: 'DESCUENTO',
  TITULACION: 'TITULACION',
  TRASPASO: 'TRASPASO',
  TRANSITABILIDAD: 'TRANSITABILIDAD',
  BECA: 'BECA',
  PAGO_INSCRIPCION: 'PAGO_INSCRIPCION',
  PAGO_TITULACION: 'PAGO_TITULACION',
  PAGO_TRASLADO_INSTITUTO: 'PAGO_TRASLADO_INSTITUTO',
  PAGO_CAMBIO_CARRERA: 'PAGO_CAMBIO_CARRERA',
  OTRO: 'OTRO',
};

/**
 * Array de tipos de documento válidos (útil para validators)
 */
export const TIPOS_DOCUMENTO_ESTUDIANTE_VALUES = Object.values(TIPOS_DOCUMENTO_ESTUDIANTE);

/**
 * Estados de documentos de estudiantes
 */
export const ESTADOS_DOCUMENTO = {
  PENDIENTE: 'PENDIENTE',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO'
};

/**
 * Array de estados de documento válidos (útil para validators)
 */
export const ESTADOS_DOCUMENTO_VALUES = Object.values(ESTADOS_DOCUMENTO);

// ============================================
// ESTADOS DE REGISTRO
// ============================================

/**
 * Estados del proceso de registro de estudiante
 */
export const ESTADOS_REGISTRO_ESTUDIANTE = {
  BORRADOR: 'BORRADOR',
  PENDIENTE: 'PENDIENTE',
  ADMITIDO: 'ADMITIDO',
};

/**
 * Array de estados de registro válidos (útil para validators)
 */
export const ESTADOS_REGISTRO_ESTUDIANTE_VALUES = Object.values(ESTADOS_REGISTRO_ESTUDIANTE);

// ============================================
// ORIGENES Y NACIONALIDADES
// ============================================

/**
 * Tipos de origen/nacionalidad
 */
export const TIPOS_ORIGEN = {
  BOLIVIANA: 'BOLIVIANA',
  EXTRANJERA: 'EXTRANJERA',
  DOBLE_NACIONALIDAD: 'DOBLE_NACIONALIDAD',
};

/**
 * Array de tipos de origen válidos (útil para validators)
 */
export const TIPOS_ORIGEN_VALUES = Object.values(TIPOS_ORIGEN);

// ============================================
// DISCAPACIDADES
// ============================================

/**
 * Grados de discapacidad
 */
export const GRADOS_DISCAPACIDAD = {
  LEVE: 'LEVE',
  MODERADO: 'MODERADO',
  SEVERO: 'SEVERO',
  PROFUNDO: 'PROFUNDO',
};

/**
 * Array de grados de discapacidad válidos (útil para validators)
 */
export const GRADOS_DISCAPACIDAD_VALUES = Object.values(GRADOS_DISCAPACIDAD);
