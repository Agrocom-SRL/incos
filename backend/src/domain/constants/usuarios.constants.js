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
 * Flujos de creación de usuario (administración SEG).
 * - ACCESO_SISTEMA: solo tabla usuarios (rol administrador del sistema).
 * - PERSONAL_INSTITUCIONAL: personal + fila de cargo + usuario vinculado a personal.id.
 * - ASIGNAR_ESTUDIANTE / ASIGNAR_DOCENTE: crear usuario y enlazar ficha existente sin usuario.
 */
export const CATEGORIAS_CREACION_USUARIO = {
  ACCESO_SISTEMA: 'ACCESO_SISTEMA',
  PERSONAL_INSTITUCIONAL: 'PERSONAL_INSTITUCIONAL',
  ASIGNAR_ESTUDIANTE: 'ASIGNAR_ESTUDIANTE',
  ASIGNAR_DOCENTE: 'ASIGNAR_DOCENTE',
};

export const CATEGORIAS_CREACION_USUARIO_VALUES = Object.values(CATEGORIAS_CREACION_USUARIO);

/**
 * Acciones permitidas en permisos
 */
export const ACCIONES_PERMISOS = {
  LISTAR: 'LISTAR',
  DETALLE: 'DETALLE',
  CREAR: 'CREAR',
  EDITAR: 'EDITAR',
  ELIMINAR: 'ELIMINAR',
  ACTIVAR: 'ACTIVAR',
  APROBAR: 'APROBAR',
  EXPORTAR: 'EXPORTAR',
  GENERAR_PDF: 'GENERAR_PDF',
};

/**
 * Array de acciones válidas (útil para validators)
 */
export const ACCIONES_PERMISOS_VALUES = Object.values(ACCIONES_PERMISOS);

/** Permiso técnico: combos de formularios (GET /api/v1/paises, etc.). No aparece en la grilla de roles. */
export const PERMISO_CATALOGO_REFERENCIA_CODIGO = 'sistema.catalogo.referencia';
/** Seed 54 — id 105; no se asigna en roles_permisos (AuthRepository lo concede a cualquier rol). */
export const PERMISO_CATALOGO_REFERENCIA_ID = 105;

export function esPermisoCatalogoReferencia(codigo, accion) {
  return codigo === PERMISO_CATALOGO_REFERENCIA_CODIGO && accion === ACCIONES_PERMISOS.LISTAR;
}

/**
 * Override de permiso por usuario (usuarios_permisos.tipo)
 */
export const TIPOS_USUARIO_PERMISO = {
  GRANT: 'GRANT',
  REVOKE: 'REVOKE',
};

export const TIPOS_USUARIO_PERMISO_VALUES = Object.values(TIPOS_USUARIO_PERMISO);

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
