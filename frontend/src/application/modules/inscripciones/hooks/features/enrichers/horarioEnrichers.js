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

// Importar la función helper para generar colores
// Usamos el alias @presentation configurado en vite.config.js
import { generateColorFromString } from '@organisms/TimetableSchedule/utils/timetableHelpers';

/**
 * Datos estáticos de ejemplo para el horario
 * TODO: Reemplazar con datos reales desde API cuando esté disponible
 */
const STATIC_SCHEDULE = [
  {
    id: 1,
    materia: 'Matemáticas I',
    paralelo: 'A',
    docente: 'Dr. Juan Pérez',
    aula: '101',
    day: 'monday',
    startTime: '08:00',
    endTime: '10:00',
    color: generateColorFromString('Matemáticas I'),
  },
  {
    id: 2,
    materia: 'Física I',
    paralelo: 'A',
    docente: 'Dra. María López',
    aula: '102',
    day: 'monday',
    startTime: '10:00',
    endTime: '12:00',
    color: generateColorFromString('Física I'),
  },
  {
    id: 3,
    materia: 'Programación',
    paralelo: 'B',
    docente: 'Ing. Carlos Gómez',
    aula: 'Lab 1',
    day: 'tuesday',
    startTime: '14:00',
    endTime: '16:00',
    color: generateColorFromString('Programación'),
  },
  {
    id: 4,
    materia: 'Química General',
    paralelo: 'A',
    docente: 'Dra. Ana Martínez',
    aula: '103',
    day: 'wednesday',
    startTime: '08:00',
    endTime: '10:00',
    color: generateColorFromString('Química General'),
  },
  {
    id: 5,
    materia: 'Álgebra Lineal',
    paralelo: 'A',
    docente: 'Dr. Luis Rodríguez',
    aula: '104',
    day: 'thursday',
    startTime: '10:00',
    endTime: '12:00',
    color: generateColorFromString('Álgebra Lineal'),
  },
  {
    id: 6,
    materia: 'Cálculo I',
    paralelo: 'A',
    docente: 'Dr. Pedro Sánchez',
    aula: '105',
    day: 'friday',
    startTime: '14:00',
    endTime: '16:00',
    color: generateColorFromString('Cálculo I'),
  },
  {
    id: 7,
    materia: 'Inglés Técnico',
    paralelo: 'B',
    docente: 'Prof. Laura Fernández',
    aula: '106',
    day: 'saturday',
    startTime: '08:00',
    endTime: '10:00',
    color: generateColorFromString('Inglés Técnico'),
  },
];

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
 * @returns {Object} Campo enriquecido con schedule, loading, config o el campo original
 */
export const enrichHorarioField = (field, context = {}) => {
    // Si es el campo de horario de clases, agregar los datos
    // El campo debe tener name='horarioClases' y type='timetable'
    if (field.name === 'horarioClases' && field.type === 'timetable') {
        // TODO: Reemplazar con datos reales desde el contexto cuando esté disponible
        // Por ahora usamos datos estáticos para visualizar el componente
        
        return {
            ...field,
            // Datos agregados por el enricher (consumidos por TimetableSchedule)
            schedule: STATIC_SCHEDULE, // Array de clases con horarios
            loading: false, // Estado de carga (por ahora false porque son datos estáticos)
            config: {
                // Configuración del horario (opcional, usa valores por defecto si no se proporciona)
                // days: DAYS_CONFIG (por defecto Lunes a Sábado)
                // timeSlots: DEFAULT_TIME_SLOTS (por defecto 7:00 AM - 9:00 PM)
                // O se puede personalizar:
                // startTime: '07:00',
                // endTime: '21:00',
                // slotDuration: 60, // minutos
            },
            editable: false, // Por ahora no es editable
            onClassClick: null, // Callback opcional al hacer click en una clase
            onCellClick: null, // Callback opcional al hacer click en celda vacía
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
