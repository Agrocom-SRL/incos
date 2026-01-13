/**
 * Student Enrichers: Funciones específicas para enriquecer campos relacionados con estudiantes
 * 
 * Single Responsibility: Definir cómo se enriquecen los campos de estudiantes en el wizard
 * 
 * Clean Architecture:
 * - Application Layer: Lógica de enriquecimiento específica de estudiantes
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

/**
 * Enricher para el campo de búsqueda de estudiantes
 * Agrega el callback onSearch al campo
 * 
 * @param {Object} field - Configuración del campo
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Function} context.onSearchStudent - Callback para ejecutar la búsqueda
 * @returns {Object} Campo enriquecido o el campo original
 */
export const enrichStudentSearchField = (field, context = {}) => {
    const { onSearchStudent } = context;
    
    // Si es el campo de búsqueda de estudiante, agregar el callback
    if (field.name === 'buscarEstudiante' && field.type === 'search' && onSearchStudent) {
        return {
            ...field,
            onSearch: (value) => {
                if (value && value.trim()) {
                    onSearchStudent(value.trim());
                }
            },
        };
    }
    
    return field;
};

/**
 * Enricher para el campo de lista de estudiantes
 * Agrega los datos de búsqueda (students, loading, error) y el callback onSelect al campo antes del renderizado
 * 
 * Flujo:
 * 1. Este enricher se ejecuta en useEnrichWizardSteps (antes del renderizado)
 * 2. Agrega items, loading, emptyMessage, onSelect al campo 'resultadosEstudiantes' (tipo 'list')
 * 3. El campo enriquecido se pasa a FormField → FieldRenderer → DataList
 * 4. Cuando el usuario selecciona un estudiante, se ejecuta onSelectStudent que guarda el ID
 * 5. El ID guardado se puede usar en step2 para cargar datos académicos
 * 
 * @param {Object} field - Configuración del campo (desde step1BuscarEstudiante.js)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.studentSearch - Objeto con students, loading, error (desde useInscripcionNuevaStudentSearch)
 * @param {Function} context.onSelectStudent - Callback para manejar la selección de un estudiante
 * @returns {Object} Campo enriquecido con items, loading, emptyMessage, onSelect o el campo original
 */
export const enrichStudentListField = (field, context = {}) => {
    const { studentSearch, onSelectStudent } = context;
    
    // Si es el campo de lista de estudiantes, agregar los datos
    // El campo debe tener name='resultadosEstudiantes' y type='list'
    if (field.name === 'resultadosEstudiantes' && field.type === 'list' && studentSearch) {
        return {
            ...field,
            // Datos agregados por el enricher (consumidos por DataList)
            items: studentSearch.students || [], // Array de estudiantes encontrados
            loading: studentSearch.loading || false, // Estado de carga de la búsqueda
            emptyMessage: field.emptyMessage || 'No se encontraron estudiantes. Realice una búsqueda para ver resultados.',
            // Callback para manejar la selección de un estudiante
            // Guarda el ID del estudiante para usarlo en step2
            onSelect: onSelectStudent ? (student) => onSelectStudent(student) : null,
            // renderItem ya está definido en step1BuscarEstudiante.jsx
        };
    }
    
    return field;
};

/**
 * Array de enrichers específicos para estudiantes
 * Se aplican en orden: primero búsqueda, luego lista
 * 
 * @type {Array<Function>}
 */
export const studentEnrichers = [
    enrichStudentSearchField,
    enrichStudentListField,
];
