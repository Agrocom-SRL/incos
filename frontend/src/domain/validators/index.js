/**
 * Validators del Domain Layer
 * 
 * Single Responsibility: Re-exportar todos los validators del dominio
 * 
 * Clean Architecture:
 * - Domain Layer: Validaciones de entrada para Use Cases
 * 
 * Organización:
 * - common/: Validators comunes para todos los módulos
 *   - searchQueryValidator: Validación de búsqueda por texto libre
 * - [modulo]/: Validators específicos por módulo (estudiantes, carreras, etc.)
 *   - Se crearán cuando se necesiten validators específicos
 * 
 * Estos validators son usados por:
 * - Use Cases (Domain Layer)
 * - Hooks (Application Layer) - Application puede depender de Domain
 * 
 * Patrón: Similar a domain/constants/ en el backend
 */

// Exportar validators comunes
export * from './common';

// TODO: Cuando se necesiten validators específicos por módulo, agregar:
// export * from './estudiantes';
// export * from './carreras';
// etc.
