/**
 * Application Utils - Transformers Genéricos
 * 
 * Single Responsibility: Re-exportar transformadores genéricos compartidos entre módulos
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades genéricas de transformación de datos
 * 
 * Estos transformadores son independientes de cualquier módulo específico y proporcionan
 * funcionalidades comunes para transformar datos a diferentes formatos.
 */

export * from './optionTransformers';
export * from './filters';
export * from './responseTransformers';
export * from './groupByCarrera';

