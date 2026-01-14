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
import { 
  generateTimeSlots,
  detectConflicts,
  organizeScheduleByGrid,
  DAY_LABELS,
} from '../utils/timetableHelpers';

/**
 * Hook para procesar datos del horario
 * 
 * @param {Array} schedule - Array de clases con horarios
 * @param {Object} config - Configuración del horario (días, horas, etc.)
 * @returns {Object} Objeto con processedSchedule, timeSlots, days, hasConflicts
 */
export const useTimetableData = (schedule = [], config = {}) => {
  // Días configurables - ahora siempre vienen dinámicamente desde el enricher
  // Si no vienen, calcular desde el schedule
  const days = useMemo(() => {
    if (config.days && Array.isArray(config.days) && config.days.length > 0) {
      return config.days;
    }
    
    // Fallback: calcular días desde el schedule si no vienen en config
    if (Array.isArray(schedule) && schedule.length > 0) {
      const uniqueDays = new Set();
      schedule.forEach(item => {
        if (item.day) {
          uniqueDays.add(item.day);
        }
      });
      
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return Array.from(uniqueDays)
        .filter(day => dayOrder.includes(day))
        .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
        .map(day => DAY_LABELS[day])
        .filter(Boolean);
    }
    
    // Último fallback: días por defecto (solo si no hay schedule)
    return Object.values(DAY_LABELS).slice(0, 6); // Lunes a Sábado
  }, [config.days, schedule]);

  // Bloques horarios configurables - ahora siempre vienen dinámicamente desde el enricher
  // Si no vienen, calcular desde el schedule
  const timeSlots = useMemo(() => {
    if (config.timeSlots && Array.isArray(config.timeSlots) && config.timeSlots.length > 0) {
      return config.timeSlots;
    }
    
    // Si se proporciona startTime y endTime, generar slots automáticamente
    if (config.startTime && config.endTime) {
      return generateTimeSlots(
        config.startTime,
        config.endTime,
        config.slotDuration || 15 // duración en minutos (15 por defecto para mayor precisión)
      );
    }
    
    // Fallback: calcular desde el schedule si no vienen en config
    if (Array.isArray(schedule) && schedule.length > 0) {
      const allTimes = [];
      schedule.forEach(item => {
        if (item.startTime) allTimes.push(item.startTime);
        if (item.endTime) allTimes.push(item.endTime);
      });
      
      if (allTimes.length > 0) {
        const parseTime = (time) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        const formatTime = (minutes) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        };
        
        const timesInMinutes = allTimes.map(parseTime).sort((a, b) => a - b);
        const minTime = Math.floor(timesInMinutes[0] / 15) * 15;
        const maxTime = Math.ceil(timesInMinutes[timesInMinutes.length - 1] / 15) * 15;
        
        return generateTimeSlots(formatTime(minTime), formatTime(maxTime), 15);
      }
    }
    
    // Último fallback: slots por defecto (solo si no hay schedule ni config)
    return generateTimeSlots('07:00', '21:00', 60);
  }, [config.timeSlots, config.startTime, config.endTime, config.slotDuration, schedule]);

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
