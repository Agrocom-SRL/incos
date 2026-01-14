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
 * Encuentra todos los slots que están dentro de un rango de tiempo
 * 
 * @param {string} startTime - Hora de inicio (ej: '18:15')
 * @param {string} endTime - Hora de fin (ej: '19:00')
 * @param {Array} timeSlots - Array de bloques horarios
 * @returns {Array} Array de keys de slots que están en el rango
 */
const findTimeSlotsInRange = (startTime, endTime, timeSlots) => {
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  
  return timeSlots
    .filter(slot => {
      const slotStart = parseTime(slot.startTime);
      const slotEnd = parseTime(slot.endTime);
      // El slot está dentro del rango si:
      // - El slot empieza después o igual al startTime Y antes del endTime
      // - O el slot termina después del startTime Y antes o igual al endTime
      // - O el slot contiene completamente el rango
      return (slotStart >= startMinutes && slotStart < endMinutes) ||
             (slotEnd > startMinutes && slotEnd <= endMinutes) ||
             (slotStart <= startMinutes && slotEnd >= endMinutes);
    })
    .map(slot => slot.key);
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
  // Cada clase ocupa múltiples slots según su duración (startTime a endTime)
  schedule.forEach(classItem => {
    const dayKey = classItem.day?.toLowerCase();
    
    if (!dayKey || !grid[dayKey] || !classItem.startTime || !classItem.endTime) {
      return;
    }

    // Encontrar todos los slots que cubre esta clase
    const slotsInRange = findTimeSlotsInRange(classItem.startTime, classItem.endTime, timeSlots);

    if (slotsInRange.length === 0) {
      return;
    }

    // Marcar el primer slot como el principal (contiene toda la info de la clase)
    const firstSlotKey = slotsInRange[0];
    
    // Verificar conflictos en cualquier slot que vaya a ocupar
    let hasConflict = false;
    slotsInRange.forEach(slotKey => {
      if (grid[dayKey][slotKey]) {
        hasConflict = true;
        // Marcar el conflicto en el slot existente
        if (grid[dayKey][slotKey].hasConflict !== undefined) {
          grid[dayKey][slotKey].hasConflict = true;
        }
      }
    });

    if (hasConflict) {
      classItem.hasConflict = true;
    }

    // Colocar la clase en todos los slots que cubre
    // El primer slot tiene la información completa, los demás solo marcan que están ocupados
    slotsInRange.forEach((slotKey, index) => {
      if (index === 0) {
        // Primer slot: información completa
        grid[dayKey][slotKey] = {
          ...classItem,
          spanSlots: slotsInRange.length, // Número de slots que ocupa
          isFirstSlot: true,
        };
      } else {
        // Slots siguientes: referencia al primer slot
        grid[dayKey][slotKey] = {
          ...classItem,
          spanSlots: slotsInRange.length,
          isContinuation: true,
          firstSlotKey: firstSlotKey,
          hasConflict: hasConflict,
        };
      }
    });
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

/**
 * Mapeo de días del backend a keys del frontend
 */
export const DAY_MAPPING = {
  'LUNES': 'monday',
  'MARTES': 'tuesday',
  'MIERCOLES': 'wednesday',
  'MIÉRCOLES': 'wednesday',
  'JUEVES': 'thursday',
  'VIERNES': 'friday',
  'SABADO': 'saturday',
  'SÁBADO': 'saturday',
  'DOMINGO': 'sunday',
};

/**
 * Mapeo inverso: keys del frontend a labels
 */
export const DAY_LABELS = {
  'monday': { key: 'monday', label: 'Lunes', short: 'Lun' },
  'tuesday': { key: 'tuesday', label: 'Martes', short: 'Mar' },
  'wednesday': { key: 'wednesday', label: 'Miércoles', short: 'Mié' },
  'thursday': { key: 'thursday', label: 'Jueves', short: 'Jue' },
  'friday': { key: 'friday', label: 'Viernes', short: 'Vie' },
  'saturday': { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  'sunday': { key: 'sunday', label: 'Domingo', short: 'Dom' },
};
