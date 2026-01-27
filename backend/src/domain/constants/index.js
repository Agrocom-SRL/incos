/**
 * Constantes del dominio
 * 
 * Este archivo centraliza todas las constantes del dominio organizadas por módulo.
 * Las constantes están separadas en archivos específicos para mantener la organización.
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio.
 */

// Re-exportar constantes de estudiantes (todas consolidadas en estudiantes.constants.js)
export * from './estudiantes.constants.js';

// Re-exportar constantes de configuración (implementado - Subject/Materias)
export * from './configuracion.constants.js';

// Re-exportar constantes de materias y asignaturas (modalidades)
export * from './materias.constants.js';

// Re-exportar constantes de usuarios (entidades existentes)
export * from './usuarios.constants.js';

// Re-exportar constantes de becas (entidades existentes)
export * from './becas.constants.js';

// Re-exportar constantes de licencias (entidades existentes)
export * from './licencias.constants.js';

// Re-exportar constantes de docentes (entidades existentes)
export * from './docentes.constants.js';

// Re-exportar constantes de gestiones (entidades existentes)
export * from './gestion.constants.js';

// Re-exportar constantes de cursos (entidades existentes)
export * from './cursos.constants.js';

// Re-exportar constantes de inscripciones
export * from './inscripciones.constants.js';

// Re-exportar constantes de pagos
export * from './pagos.constants.js';

// Re-exportar constantes del sistema
export * from './sistema.constants.js';
