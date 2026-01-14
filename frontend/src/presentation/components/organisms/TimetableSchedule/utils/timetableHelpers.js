/**
 * Utilidades para manejo de horarios
 * 
 * Single Responsibility: Funciones helper para procesar datos de horarios
 */

/**
 * Convierte hora string a minutos desde medianoche
 * @param {string} time - Hora en formato 'HH:MM'
 * @returns {number} Minutos desde medianoche
 */
const parseTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convierte minutos desde medianoche a formato 'HH:MM'
 * @param {number} minutes - Minutos desde medianoche
 * @returns {string} Hora en formato 'HH:MM'
 */
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Genera bloques horarios automáticamente
 * 
 * @param {string} startTime - Hora de inicio (ej: '07:00')
 * @param {string} endTime - Hora de fin (ej: '21:00')
 * @param {number} duration - Duración de cada bloque en minutos
 * @returns {Array} Array de bloques horarios
 */
export const generateTimeSlots = (startTime, endTime, duration = 60) => {
  const slots = [];
  let current = parseTime(startTime);
  const end = parseTime(endTime);
  let slotIndex = 1;

  while (current < end) {
    const next = current + duration;
    slots.push({
      key: `slot${slotIndex}`,
      startTime: formatTime(current),
      endTime: formatTime(next),
    });
    current = next;
    slotIndex++;
  }

  return slots;
};

/**
 * Encuentra el slot que corresponde a una hora específica
 * 
 * @param {string} time - Hora a buscar (ej: '08:30')
 * @param {Array} timeSlots - Array de bloques horarios
 * @returns {string|null} Key del slot encontrado o null
 */
const findTimeSlot = (time, timeSlots) => {
  const minutes = parseTime(time);
  
  return timeSlots.find(slot => {
    const slotStart = parseTime(slot.startTime);
    const slotEnd = parseTime(slot.endTime);
    return minutes >= slotStart && minutes < slotEnd;
  })?.key || null;
};

/**
 * Organiza el schedule en una estructura de grid (día x bloque horario)
 * 
 * @param {Array} schedule - Array de clases
 * @param {Array} days - Configuración de días
 * @param {Array} timeSlots - Bloques horarios
 * @returns {Object} Estructura organizada { monday: { slot1: {...}, slot2: {...} }, ... }
 */
export const organizeScheduleByGrid = (schedule, days, timeSlots) => {
  const grid = {};

  // Inicializar grid vacío
  days.forEach(day => {
    grid[day.key] = {};
  });

  // Llenar grid con clases
  schedule.forEach(classItem => {
    const dayKey = classItem.day?.toLowerCase();
    const slotKey = findTimeSlot(classItem.startTime, timeSlots);

    if (dayKey && slotKey && grid[dayKey]) {
      // Si ya existe una clase en este slot, marcar conflicto
      if (grid[dayKey][slotKey]) {
        grid[dayKey][slotKey].hasConflict = true;
        classItem.hasConflict = true;
      }
      
      grid[dayKey][slotKey] = classItem;
    }
  });

  return grid;
};

/**
 * Detecta conflictos de horario en el grid
 * 
 * @param {Object} grid - Grid de horarios
 * @returns {boolean} true si hay conflictos
 */
export const detectConflicts = (grid) => {
  return Object.values(grid).some(daySlots => 
    Object.values(daySlots).some(classData => classData?.hasConflict)
  );
};

/**
 * Genera un color basado en un string (para materias/paralelos)
 * 
 * @param {string} str - String base (nombre de materia, paralelo, etc.)
 * @returns {string} Color en formato hex
 */
export const generateColorFromString = (str) => {
  if (!str) return '#1890ff';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};
