/**
 * Constantes del dominio relacionadas con Estudiantes
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con estudiantes.
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
  A_POSITIVO: 'A+',
  A_NEGATIVO: 'A-',
  B_POSITIVO: 'B+',
  B_NEGATIVO: 'B-',
  AB_POSITIVO: 'AB+',
  AB_NEGATIVO: 'AB-',
  O_POSITIVO: 'O+',
  O_NEGATIVO: 'O-',
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
 */
export const TIPOS_DOCUMENTO_ESTUDIANTE = {
  INSCRIPCION: 'INSCRIPCION',
  LICENCIA: 'LICENCIA',
  PASANTIA: 'PASANTIA',
  DESCUENTO: 'DESCUENTO',
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

