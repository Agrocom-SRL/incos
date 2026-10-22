/**
 * Hook: useFieldDatePicker
 * 
 * Single Responsibility: Gestionar la lógica del componente FieldDatePicker
 * 
 * Atomic Design: Hook de lógica para átomo
 * - Maneja formato de fecha personalizado (dd-mm-yyyy o dd/mm/yyyy)
 * - Calcula restricción de edad mínima
 * - Convierte valores a dayjs
 * - Calcula valor por defecto (fecha actual si no hay minAge)
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook de lógica de presentación para componente atómico
 * - Separa lógica de presentación del componente React
 */

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { ACCEPTED_FORMATS, DATE_FORMATS, toDayjs, parseDateString } from '../utils/dateHelpers';

/**
 * Hook para gestionar la lógica del FieldDatePicker
 * 
 * @param {number|null} minAge - Edad mínima requerida (en años). Si es null, no hay restricción
 * @param {any} value - Valor controlado del componente
 * @param {any} defaultValue - Valor por defecto del componente
 * @param {boolean} emptyByDefault - Si true, sin valor el campo queda vacío (no precarga la fecha actual)
 * @returns {Object} Objeto con format, acceptedFormats, disabledDate, value, defaultValue
 */
export const useFieldDatePicker = (minAge = null, value, defaultValue, emptyByDefault = false) => {
  // Calcular la fecha máxima permitida (hoy menos la edad mínima)
  const maxDate = useMemo(() => {
    if (minAge === null || minAge === undefined) {
      return null;
    }
    return dayjs().subtract(minAge, 'year');
  }, [minAge]);

  // Función para deshabilitar fechas que no cumplan con la restricción de edad
  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- el compilador no preserva la memoización; sin cambio de comportamiento
  const disabledDate = useMemo(() => {
    if (!maxDate) {
      return () => false; // No deshabilitar ninguna fecha si no hay restricción
    }
    
    return (current) => {
      if (!current) return false;
      // Deshabilitar fechas futuras
      if (current.isAfter(dayjs(), 'day')) {
        return true;
      }
      // Deshabilitar fechas que sean después de la fecha máxima (muy jóvenes)
      if (current.isAfter(maxDate, 'day')) {
        return true;
      }
      return false;
    };
  }, [maxDate]);

  // Convertir value a dayjs
  const dayjsValue = useMemo(() => {
    return toDayjs(value, parseDateString);
  }, [value]);

  // Convertir defaultValue a dayjs, o usar fecha actual si no hay minAge y no hay defaultValue
  const dayjsDefaultValue = useMemo(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      return toDayjs(defaultValue, parseDateString);
    }
    // Si no hay minAge (sin restricción) y no hay defaultValue, usar fecha actual
    // (salvo campos opcionales que deben quedar vacíos, p. ej. «Fecha de fin»)
    if (!emptyByDefault && (minAge === null || minAge === undefined)) {
      return dayjs();
    }
    return undefined;
  }, [defaultValue, minAge, emptyByDefault]);

  return {
    format: DATE_FORMATS.PRIMARY,
    acceptedFormats: ACCEPTED_FORMATS,
    disabledDate,
    maxDate,
    value: dayjsValue,
    defaultValue: dayjsDefaultValue,
  };
};

