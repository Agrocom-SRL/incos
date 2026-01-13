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
 * - hooks: Hooks genéricos compartidos (useMessage, etc.)
 * - transformers: Transformadores genéricos para convertir datos (optionTransformers, filters)
 * - error: Utilidades para manejo de errores (errorHelpers, etc.)
 * 
 * Ejemplo de uso:
 * import { buildFullName, buildCompleteCI, useMessage, transformToOptions, excludeByField } from '@application/utils';
 * 
 * Patrón: Barrel Export (re-exportación)
 * - Permite importar desde el nivel general o específico
 * - Facilita la organización y escalabilidad
 */

export * from './formatters';
export * from './hooks';
export * from './transformers';
export * from './error';

