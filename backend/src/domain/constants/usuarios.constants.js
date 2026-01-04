/**
 * Constantes del dominio relacionadas con Usuarios y Seguridad
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con usuarios.
 */

// ============================================
// USUARIOS Y SEGURIDAD
// ============================================

/**
 * Estados de usuarios
 */
export const ESTADOS_USUARIOS = {
  ACTIVO: null, // NULL = activo
  BLOQUEADO: 'BLOQUEADO',
  SUSPENDIDO: 'SUSPENDIDO',
  RETIRADO: 'RETIRADO',
};

/**
 * Array de estados de usuarios válidos (útil para validators)
 * Nota: null = activo, por lo que no se incluye en el array
 */
export const ESTADOS_USUARIOS_VALUES = ['BLOQUEADO', 'SUSPENDIDO', 'RETIRADO'];

/**
 * Tipos de referencia polimórfica
 */
export const TIPOS_REFERENCIA = {
  ESTUDIANTE: 'ESTUDIANTE',
  DOCENTE: 'DOCENTE',
  RECTOR: 'RECTOR',
  DIRECTOR: 'DIRECTOR',
  SECRETARIA: 'SECRETARIA',
};

/**
 * Array de tipos de referencia válidos (útil para validators)
 */
export const TIPOS_REFERENCIA_VALUES = Object.values(TIPOS_REFERENCIA);

/**
 * Acciones permitidas en permisos
 */
export const ACCIONES_PERMISOS = {
  VER: 'VER',
  CREAR: 'CREAR',
  EDITAR: 'EDITAR',
  ELIMINAR: 'ELIMINAR',
  APROBAR: 'APROBAR',
  EXPORTAR: 'EXPORTAR',
};

/**
 * Array de acciones válidas (útil para validators)
 */
export const ACCIONES_PERMISOS_VALUES = Object.values(ACCIONES_PERMISOS);

/**
 * Tipos de dispositivo
 */
export const TIPOS_DISPOSITIVO = {
  MOVIL: 'MOVIL',
  TABLET: 'TABLET',
  DESKTOP: 'DESKTOP',
};

/**
 * Array de tipos de dispositivo válidos (útil para validators)
 */
export const TIPOS_DISPOSITIVO_VALUES = Object.values(TIPOS_DISPOSITIVO);

