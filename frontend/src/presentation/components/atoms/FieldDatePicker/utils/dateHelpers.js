/**
 * Date Helpers - Utilidades para parsing y formateo de fechas
 * 
 * Single Responsibility: Funciones puras para parsear y formatear fechas
 * 
 * Clean Architecture:
 * - Presentation Layer: Utilidades específicas del componente FieldDatePicker
 * - Funciones puras sin efectos secundarios
 * - No dependen de lógica de negocio, solo transformación de formato
 * 
 * Ubicación: presentation/components/atoms/FieldDatePicker/utils/
 * 
 * Patrón: Helper Functions / Utility Functions (Pure Functions)
 */

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Habilitar plugin para parsear formatos personalizados
dayjs.extend(customParseFormat);

/**
 * Formatos de fecha aceptados
 */
export const DATE_FORMATS = {
  PRIMARY: 'DD-MM-YYYY',
  ALTERNATIVE: 'DD/MM/YYYY',
};

/**
 * Array de formatos aceptados para entrada manual
 */
export const ACCEPTED_FORMATS = [DATE_FORMATS.PRIMARY, DATE_FORMATS.ALTERNATIVE];

/**
 * Verifica si un valor es una instancia de dayjs
 * 
 * @param {any} value - Valor a verificar
 * @returns {boolean} true si es una instancia de dayjs
 */
export const isDayjsInstance = (value) => {
  return value && typeof value.isValid === 'function';
};

/**
 * Parsea un string de fecha con formato flexible
 * Acepta formatos: DD-MM-YYYY o DD/MM/YYYY
 * 
 * @param {string} dateString - String de fecha a parsear
 * @returns {dayjs.Dayjs|null} Objeto dayjs parseado o null si es inválido
 */
export const parseDateString = (dateString) => {
  if (!dateString) return null;
  
  // Intentar parsear con los formatos aceptados (strict mode)
  for (const format of ACCEPTED_FORMATS) {
    const parsed = dayjs(dateString, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }
  
  // Si no coincide con ningún formato, intentar parseo automático
  const autoParsed = dayjs(dateString);
  return autoParsed.isValid() ? autoParsed : null;
};

/**
 * Convierte un valor a dayjs si es necesario
 * 
 * @param {any} value - Valor a convertir (string, dayjs, o null/undefined)
 * @param {Function} parseDate - Función para parsear strings (default: parseDateString)
 * @returns {dayjs.Dayjs|undefined} Objeto dayjs o undefined
 */
export const toDayjs = (value, parseDate = parseDateString) => {
  if (!value) return undefined;
  
  // Si ya es un objeto dayjs, retornarlo
  if (isDayjsInstance(value)) {
    return value;
  }
  
  // Si es string, parsearlo
  if (typeof value === 'string') {
    const parsed = parseDate(value);
    return parsed || dayjs(value); // Fallback a parseo automático
  }
  
  // Para otros tipos (number, Date), convertir directamente
  return dayjs(value);
};

/**
 * Formatea una fecha a string usando el formato principal
 * 
 * @param {dayjs.Dayjs|string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada como string o string vacío si es inválida
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dayjsDate = isDayjsInstance(date) ? date : dayjs(date);
  return dayjsDate.isValid() ? dayjsDate.format(DATE_FORMATS.PRIMARY) : '';
};

