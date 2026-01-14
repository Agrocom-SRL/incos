/**
 * Horario Enrichers: Funciones específicas para enriquecer campos relacionados con horarios
 * 
 * Single Responsibility: Definir cómo se enriquecen los campos de horarios en el wizard
 * 
 * Clean Architecture:
 * - Application Layer: Lógica de enriquecimiento específica de horarios
 * 
 * SOLID Principles:
 * - Single Responsibility: Cada enricher tiene una responsabilidad específica
 * - Open/Closed: Se pueden agregar nuevos enrichers sin modificar el hook base
 * 
 * Patrón: Strategy Pattern
 * - Cada enricher es una estrategia de enriquecimiento
 * - El hook base aplica todas las estrategias
 * 
 * Ventajas:
 * - Extensible: Agregar nuevos enrichers sin modificar el hook
 * - Testeable: Cada enricher se puede testear independientemente
 * - Reutilizable: Los enrichers se pueden usar en otros contextos
 */

// Importar helpers del componente TimetableSchedule
// Usamos el alias @presentation configurado en vite.config.js
import {
  generateColorFromString,
  generateTimeSlots,
  DAY_MAPPING,
  DAY_LABELS,
} from '@organisms/TimetableSchedule/utils/timetableHelpers';

/**
 * Convierte hora del backend (HH:MM:SS) a formato del frontend (HH:MM)
 */
const formatTimeString = (timeString) => {
  if (!timeString) return null;
  // Si viene en formato HH:MM:SS, tomar solo HH:MM
  return timeString.substring(0, 5);
};

/**
 * Calcula el Máximo Común Divisor (MCD) de dos números
 * @param {number} a - Primer número
 * @param {number} b - Segundo número
 * @returns {number} MCD de a y b
 */
const calculateGCD = (a, b) => {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

/**
 * Calcula el MCD de un array de números
 * @param {Array<number>} numbers - Array de números
 * @returns {number} MCD de todos los números
 */
const calculateGCDArray = (numbers) => {
  if (numbers.length === 0) return 30; // Default si no hay números
  if (numbers.length === 1) return numbers[0];

  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    result = calculateGCD(result, numbers[i]);
  }
  return result;
};

/**
 * Calcula la duración óptima de cada celda basándose en las diferencias
 * entre horarios iniciales y finales
 * 
 * Estrategia:
 * 1. Calcula todas las duraciones de los horarios
 * 2. Encuentra el MCD para determinar el tamaño base de celda
 * 3. Si el MCD es muy pequeño, usa el tamaño de celda más común
 * 4. Asegura que todas las duraciones sean múltiplos del tamaño de celda elegido
 * 
 * @param {Array} schedule - Array de clases transformadas
 * @returns {number} Duración en minutos para cada celda
 */
const calculateOptimalSlotDuration = (schedule = []) => {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return 30; // Default: 30 minutos si no hay horarios
  }

  // Convertir a minutos
  const parseTimeToMinutes = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calcular duraciones de cada horario
  const durations = [];
  schedule.forEach(item => {
    if (item.startTime && item.endTime) {
      const startMinutes = parseTimeToMinutes(item.startTime);
      const endMinutes = parseTimeToMinutes(item.endTime);

      if (startMinutes !== null && endMinutes !== null && endMinutes > startMinutes) {
        const duration = endMinutes - startMinutes;
        if (duration > 0) {
          durations.push(duration);
        }
      }
    }
  });

  if (durations.length === 0) {
    return 30; // Default: 30 minutos si no se pueden calcular duraciones
  }

  // Verificar si todas las duraciones son iguales
  const uniqueDurations = [...new Set(durations)];
  if (uniqueDurations.length === 1) {
    // Si todos los horarios tienen la misma duración, usar esa duración directamente
    const singleDuration = uniqueDurations[0];
    // Asegurar que esté en un rango razonable y sea un intervalo común
    if (singleDuration >= 5 && singleDuration <= 60) {
      const commonIntervals = [5, 10, 15, 30, 45, 60];
      // Si la duración exacta está en los intervalos comunes, usarla
      if (commonIntervals.includes(singleDuration)) {
        return singleDuration;
      }
      // Si no, encontrar el intervalo común más cercano
      let bestMatch = commonIntervals[0];
      let minDiff = Math.abs(singleDuration - bestMatch);
      for (const interval of commonIntervals) {
        const diff = Math.abs(singleDuration - interval);
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = interval;
        }
      }
      return bestMatch;
    }
  }

  // Calcular el MCD de todas las duraciones
  const gcd = calculateGCDArray(durations);

  // Asegurar que el tamaño esté en un rango razonable (mínimo 5 minutos, máximo 60 minutos)
  let optimalDuration = Math.max(5, Math.min(60, gcd));

  // Verificar que todas las duraciones sean múltiplos del tamaño elegido
  // Si no, reducir el tamaño hasta que todas sean múltiplos
  let finalDuration = optimalDuration;
  for (let testDuration = optimalDuration; testDuration >= 5; testDuration -= 5) {
    const allAreMultiples = durations.every(d => d % testDuration === 0);
    if (allAreMultiples) {
      finalDuration = testDuration;
      break;
    }
  }

  // Redondear a múltiplos comunes (5, 10, 15, 30, 45, 60) para mejor visualización
  // Priorizar intervalos que dividan perfectamente todas las duraciones
  const commonIntervals = [5, 10, 15, 30, 45, 60];
  let bestMatch = commonIntervals[0];
  let minDiff = Math.abs(finalDuration - bestMatch);
  let foundPerfectMatch = false;

  // Primero buscar un intervalo que divida perfectamente todas las duraciones
  for (const interval of commonIntervals) {
    const allAreMultiples = durations.every(d => d % interval === 0);
    if (allAreMultiples) {
      const diff = Math.abs(finalDuration - interval);
      if (!foundPerfectMatch || diff < minDiff) {
        minDiff = diff;
        bestMatch = interval;
        foundPerfectMatch = true;
      }
    }
  }

  // Si no se encontró un intervalo perfecto, usar el más cercano al MCD
  if (!foundPerfectMatch) {
    for (const interval of commonIntervals) {
      const diff = Math.abs(finalDuration - interval);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = interval;
      }
    }
  }

  return bestMatch;
};

/**
 * Calcula los timeSlots dinámicos basados en los horarios
 * Usa generateTimeSlots del helper para generar los slots
 * La duración de cada celda se calcula automáticamente basándose en las diferencias
 * entre horarios iniciales y finales
 * 
 * @param {Array} schedule - Array de clases transformadas
 * @returns {Array} Array de timeSlots
 */
const calculateDynamicTimeSlots = (schedule = []) => {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return [];
  }

  // Extraer todas las horas de inicio y fin
  const allTimes = [];
  schedule.forEach(item => {
    if (item.startTime) allTimes.push(item.startTime);
    if (item.endTime) allTimes.push(item.endTime);
  });

  if (allTimes.length === 0) {
    return [];
  }

  // Convertir a minutos para encontrar min/max
  const parseTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Calcular la duración óptima de cada celda
  const slotDuration = calculateOptimalSlotDuration(schedule);

  const timesInMinutes = allTimes.map(parseTimeToMinutes).sort((a, b) => a - b);
  // Redondear hacia abajo/arriba a múltiplos de la duración calculada
  const minTimeMinutes = Math.floor(timesInMinutes[0] / slotDuration) * slotDuration;
  const maxTimeMinutes = Math.ceil(timesInMinutes[timesInMinutes.length - 1] / slotDuration) * slotDuration;

  // Convertir de vuelta a formato HH:MM
  const startTime = formatMinutesToTime(minTimeMinutes);
  const endTime = formatMinutesToTime(maxTimeMinutes);

  // Usar generateTimeSlots con la duración calculada dinámicamente
  return generateTimeSlots(startTime, endTime, slotDuration);
};

/**
 * Calcula los días dinámicos basados en los horarios
 * 
 * @param {Array} schedule - Array de clases transformadas
 * @returns {Array} Array de días
 */
const calculateDynamicDays = (schedule = []) => {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return [];
  }

  // Extraer días únicos
  const uniqueDays = new Set();
  schedule.forEach(item => {
    if (item.day) {
      uniqueDays.add(item.day);
    }
  });

  // Ordenar días según el orden estándar
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const sortedDays = Array.from(uniqueDays)
    .filter(day => dayOrder.includes(day))
    .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    .map(day => DAY_LABELS[day])
    .filter(Boolean);

  return sortedDays;
};

/**
 * Transforma los datos del backend al formato esperado por TimetableSchedule
 * 
 * @param {Array} scheduleData - Datos del backend (array de cursos con horarios)
 * @param {Array} materias - Array de materias para obtener nombres
 * @returns {Object} Objeto con schedule, timeSlots y days calculados dinámicamente
 */
const transformScheduleData = (scheduleData = [], materias = []) => {
  if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
    return { schedule: [], timeSlots: [], days: [] };
  }

  const transformedSchedule = [];

  scheduleData.forEach((curso) => {
    const { cursoId, materiaId, color, horarios } = curso;

    // Buscar la materia para obtener su nombre
    const materia = materias.find(m => m.id === materiaId);
    const materiaNombre = materia?.nombre || `Materia ${materiaId || 'N/A'}`;

    // Usar el color del curso del backend, o generar uno por defecto si no existe
    const cursoColor = color || generateColorFromString(materiaNombre);

    // Transformar cada horario del curso
    if (Array.isArray(horarios)) {
      horarios.forEach((horarioItem) => {
        const { id, ordenSecuencia, horario, aula } = horarioItem;

        if (horario && horario.dia && horario.horaInicio && horario.horaFin) {
          // Mapear día del backend al formato del frontend
          const dayKey = DAY_MAPPING[horario.dia.toUpperCase()] || horario.dia.toLowerCase();

          const transformedItem = {
            id: id || `${cursoId}-${ordenSecuencia}`,
            cursoId,
            materiaId,
            materia: materiaNombre,
            aula: aula || null,
            day: dayKey,
            startTime: formatTimeString(horario.horaInicio),
            endTime: formatTimeString(horario.horaFin),
            color: cursoColor,
            ordenSecuencia,
          };
          transformedSchedule.push(transformedItem);
        }
      });
    }
  });

  // Calcular timeSlots y days dinámicamente
  const timeSlots = calculateDynamicTimeSlots(transformedSchedule);
  const days = calculateDynamicDays(transformedSchedule);

  return {
    schedule: transformedSchedule,
    timeSlots,
    days,
  };
};

/**
 * Enricher para el campo de horario de clases
 * Agrega los datos del horario (schedule, loading, config) al campo antes del renderizado
 * 
 * Flujo:
 * 1. Este enricher se ejecuta en useEnrichWizardSteps (antes del renderizado)
 * 2. Agrega schedule, loading, config al campo 'horarioClases' (tipo 'timetable')
 * 3. El campo enriquecido se pasa a FormField → FieldRenderer → TimetableSchedule
 * 4. TimetableSchedule renderiza el horario con los datos proporcionados
 * 
 * @param {Object} field - Configuración del campo (desde step3HorarioClases.js)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.horariosData - Objeto con schedule, loading, error (desde useInscripcionNuevaParaleloHorarios)
 * @param {Object} context.materiasData - Objeto con materias para obtener nombres de materias
 * @param {Object} context.paralelosData - Objeto con selectedParalelo para verificar si hay paralelo seleccionado
 * @returns {Object} Campo enriquecido con schedule, loading, config o el campo original
 */
export const enrichHorarioField = (field, context = {}) => {
  // Si es el campo de horario de clases, agregar los datos
  // El campo debe tener name='horarioClases' y type='timetable'
  if (field.name === 'horarioClases' && field.type === 'timetable') {
    const { horariosData, materiasData, paralelosData } = context;

    // Solo mostrar horarios si hay un paralelo seleccionado
    const hasParalelo = paralelosData?.selectedParalelo?.id;

    // Extraer el array de schedule
    // El hook puede retornar schedule directamente como array o como {schedule: [...]}
    let scheduleArray = null;
    if (horariosData?.schedule) {
      // Si schedule es un array, usarlo directamente
      if (Array.isArray(horariosData.schedule)) {
        scheduleArray = horariosData.schedule;
      }
      // Si schedule es un objeto con propiedad schedule, extraer el array
      else if (horariosData.schedule.schedule && Array.isArray(horariosData.schedule.schedule)) {
        scheduleArray = horariosData.schedule.schedule;
      }
    }

    // Transformar datos del backend al formato esperado por TimetableSchedule
    const transformedData = hasParalelo && scheduleArray
      ? transformScheduleData(scheduleArray, materiasData?.materias || [])
      : { schedule: [], timeSlots: [], days: [] };

    return {
      ...field,
      // Datos agregados por el enricher (consumidos por TimetableSchedule)
      schedule: transformedData.schedule || [], // Array de clases con horarios transformados
      loading: horariosData?.loading || false, // Estado de carga
      config: {
        // Configuración dinámica del horario basada en los datos reales
        // Los timeSlots y days se calculan automáticamente desde los horarios
        timeSlots: transformedData.timeSlots || [], // Slots calculados dinámicamente
        days: transformedData.days || [], // Días calculados dinámicamente
      },
      editable: false, // Por ahora no es editable
      onClassClick: null, // Callback opcional al hacer click en una clase
      onCellClick: null, // Callback opcional al hacer click en celda vacía
      // Ocultar si no hay paralelo seleccionado
      hidden: !hasParalelo,
    };
  }

  return field;
};

/**
 * Array de enrichers específicos para horarios
 * 
 * @type {Array<Function>}
 */
export const horarioEnrichers = [
  enrichHorarioField,
];
