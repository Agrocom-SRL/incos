/**
 * Hook: useTimetableData
 * 
 * Single Responsibility: Procesar y organizar datos del horario
 * 
 * Este hook:
 * - Procesa el array de clases
 * - Organiza por día y bloque horario
 * - Detecta conflictos de horario
 * - Genera estructura para el grid
 */

import { useMemo } from 'react';
import { DAYS_CONFIG, DEFAULT_TIME_SLOTS } from '../utils/timetableConstants';
import { 
  generateTimeSlots,
  detectConflicts,
  organizeScheduleByGrid,
} from '../utils/timetableHelpers';

/**
 * Hook para procesar datos del horario
 * 
 * @param {Array} schedule - Array de clases con horarios
 * @param {Object} config - Configuración del horario (días, horas, etc.)
 * @returns {Object} Objeto con processedSchedule, timeSlots, days, hasConflicts
 */
export const useTimetableData = (schedule = [], config = {}) => {
  // Días configurables (por defecto Lunes a Sábado)
  const days = useMemo(() => {
    return config.days || DAYS_CONFIG;
  }, [config.days]);

  // Bloques horarios configurables
  const timeSlots = useMemo(() => {
    if (config.timeSlots) {
      return config.timeSlots;
    }
    
    // Si se proporciona startTime y endTime, generar slots automáticamente
    if (config.startTime && config.endTime) {
      return generateTimeSlots(
        config.startTime,
        config.endTime,
        config.slotDuration || 60 // duración en minutos
      );
    }
    
    return DEFAULT_TIME_SLOTS;
  }, [config]);

  // Procesar schedule y organizar en grid
  const processedSchedule = useMemo(() => {
    return organizeScheduleByGrid(schedule, days, timeSlots);
  }, [schedule, days, timeSlots]);

  // Detectar conflictos de horario
  const hasConflicts = useMemo(() => {
    return detectConflicts(processedSchedule);
  }, [processedSchedule]);

  return {
    processedSchedule,
    timeSlots,
    days,
    hasConflicts,
  };
};
