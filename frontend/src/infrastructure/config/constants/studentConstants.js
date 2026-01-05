/**
 * Constantes relacionadas con estudiantes
 * 
 * Single Responsibility: Centralizar constantes estáticas relacionadas con formularios de estudiantes
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Configuraciones estáticas del sistema
 * - Estas constantes no son lógica de negocio, son configuraciones técnicas/estáticas
 */

/**
 * Lista de expediciones de CI (Carnet de Identidad) en Bolivia
 */
export const EXPEDICIONES = ['SC', 'LP', 'CB', 'TJ', 'BN', 'PD', 'OR', 'PT', 'CH'];

/**
 * Lista de géneros
 */
export const GENEROS = ['MASCULINO', 'FEMENINO', 'OTRO'];

/**
 * Lista de tipos de sangre (ordenados de más común a más raro)
 * O+ es el más común, AB- es el más raro
 */
export const TIPOS_SANGRE = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

/**
 * Edad mínima requerida para el registro de estudiantes (en años)
 * Se calcula desde el día de hoy hacia atrás
 */
export const EDAD_MINIMA_REGISTRO = 17;

/**
 * Lista de grados de discapacidad
 */
export const GRADO_DISCAPACIDAD = [
  { label: 'Leve', value: 'LEVE' },
  { label: 'Moderado', value: 'MODERADO' },
  { label: 'Severo', value: 'SEVERO' },
  { label: 'Profundo', value: 'PROFUNDO' },
];

/**
 * Lista de tipos de origen/nacionalidad
 */
export const TIPO_ORIGEN = [
  { label: 'Boliviana', value: 'BOLIVIANA' },
  { label: 'Extranjera', value: 'EXTRANJERA' },
  { label: 'Doble Nacionalidad', value: 'DOBLE_NACIONALIDAD' },
];

