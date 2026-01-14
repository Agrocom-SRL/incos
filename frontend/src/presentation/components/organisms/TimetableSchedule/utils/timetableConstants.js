/**
 * Constantes para TimetableSchedule
 * 
 * Single Responsibility: Definir constantes y configuraciones del horario
 */

/**
 * Días de la semana (configuración por defecto)
 */
export const DAYS_CONFIG = [
  { key: 'monday', label: 'Lunes', short: 'Lun' },
  { key: 'tuesday', label: 'Martes', short: 'Mar' },
  { key: 'wednesday', label: 'Miércoles', short: 'Mié' },
  { key: 'thursday', label: 'Jueves', short: 'Jue' },
  { key: 'friday', label: 'Viernes', short: 'Vie' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
];

/**
 * Bloques horarios por defecto (7:00 AM - 9:00 PM)
 */
export const DEFAULT_TIME_SLOTS = [
  { key: 'slot1', startTime: '07:00', endTime: '08:00' },
  { key: 'slot2', startTime: '08:00', endTime: '09:00' },
  { key: 'slot3', startTime: '09:00', endTime: '10:00' },
  { key: 'slot4', startTime: '10:00', endTime: '11:00' },
  { key: 'slot5', startTime: '11:00', endTime: '12:00' },
  { key: 'slot6', startTime: '12:00', endTime: '13:00' },
  { key: 'slot7', startTime: '13:00', endTime: '14:00' },
  { key: 'slot8', startTime: '14:00', endTime: '15:00' },
  { key: 'slot9', startTime: '15:00', endTime: '16:00' },
  { key: 'slot10', startTime: '16:00', endTime: '17:00' },
  { key: 'slot11', startTime: '17:00', endTime: '18:00' },
  { key: 'slot12', startTime: '18:00', endTime: '19:00' },
  { key: 'slot13', startTime: '19:00', endTime: '20:00' },
  { key: 'slot14', startTime: '20:00', endTime: '21:00' },
];
