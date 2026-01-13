/**
 * Error Utilities - Utilidades para manejo de errores
 * 
 * Single Responsibility: Re-exportar todas las utilidades relacionadas con errores
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades compartidas entre módulos para manejo de errores
 * 
 * Organización:
 * - errorHelpers: Normalización de errores para hooks
 * 
 * Futuro: Aquí se pueden agregar más utilidades relacionadas con errores:
 * - errorTypes: Constantes de tipos de error
 * - errorCodes: Códigos de error del backend
 * - errorMessages: Mensajes de error localizados
 * - errorLogger: Utilidades de logging de errores
 * - errorFormatter: Formateo de errores para UI
 */

export * from './errorHelpers';
