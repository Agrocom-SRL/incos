/**
 * Validators comunes del Domain Layer
 * 
 * Single Responsibility: Re-exportar todos los validators comunes
 * 
 * Clean Architecture:
 * - Domain Layer: Validaciones comunes para todos los módulos
 * 
 * Estos validators son genéricos y pueden ser usados por:
 * - Cualquier Use Case de cualquier módulo
 * - Hooks (Application Layer) - Application puede depender de Domain
 * 
 * Organización:
 * - common/: Validators comunes (búsqueda, paginación, etc.)
 * - [modulo]/: Validators específicos por módulo (se crearán cuando se necesiten)
 */

export { validateSearchQuery, validateSearchLimit } from './searchQueryValidator';
