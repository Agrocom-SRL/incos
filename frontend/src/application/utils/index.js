/**
 * Application Utils - Utilidades compartidas de la capa de aplicación
 * 
 * Single Responsibility: Re-exportar todas las utilidades compartidas
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades compartidas entre módulos de aplicación
 * 
 * Este index.js es el punto de entrada principal para todas las utilidades.
 * Permite importar desde @application/utils sin especificar la subcarpeta.
 * 
 * Organización:
 * - formatters: Funciones para formatear/transformar datos para presentación
 * - validators: Funciones de validación (si se necesitan en el futuro)
 * - helpers: Funciones auxiliares generales (si se necesitan en el futuro)
 * 
 * Ejemplo de uso:
 * import { buildFullName, buildCompleteCI } from '@application/utils';
 * 
 * Patrón: Barrel Export (re-exportación)
 * - Permite importar desde el nivel general o específico
 * - Facilita la organización y escalabilidad
 */

export * from './formatters';

