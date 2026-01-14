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
 * Calcula los timeSlots dinámicos basados en los horarios
 * Usa generateTimeSlots del helper para generar los slots
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

  const timesInMinutes = allTimes.map(parseTimeToMinutes).sort((a, b) => a - b);
  const minTimeMinutes = Math.floor(timesInMinutes[0] / 15) * 15; // Redondear hacia abajo a múltiplos de 15
  const maxTimeMinutes = Math.ceil(timesInMinutes[timesInMinutes.length - 1] / 15) * 15; // Redondear hacia arriba

  // Convertir de vuelta a formato HH:MM
  const startTime = formatMinutesToTime(minTimeMinutes);
  const endTime = formatMinutesToTime(maxTimeMinutes);

  // Usar generateTimeSlots del helper con duración de 15 minutos
  return generateTimeSlots(startTime, endTime, 15);
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
