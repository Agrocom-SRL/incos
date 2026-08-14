/**
 * Student Enrichers: Funciones específicas para enriquecer campos relacionados con estudiantes
 *
 * Single Responsibility: Definir cómo se enriquecen los campos de estudiantes en el wizard
 *
 * Clean Architecture:
 * - Application Layer: Lógica de enriquecimiento específica de estudiantes
 *
 * Patrón: Strategy Pattern (cada enricher es una estrategia; useEnrichWizardSteps las aplica).
 *
 * El paso Buscar no usa Alerts fijos: las instrucciones viven en la descripción
 * de la sección, las sugerencias iniciales («Estudiantes nuevos sin matrícula»)
 * se muestran como cabecera de la misma lista de resultados y la fila
 * seleccionada se resalta con el estado activo de DataList.
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
    // OPTIMIZACIÓN: Usar directamente el callback memoizado del context
    // No crear una nueva función wrapper para evitar re-renders
    if (field.name === 'buscarEstudiante' && field.type === 'search' && onSearchStudent) {
        return {
            ...field,
            // El hook maneja también el término vacío (vuelta a las sugerencias)
            onSearch: onSearchStudent,
        };
    }

    return field;
};

/**
 * Enricher para el campo de lista de estudiantes
 * Agrega los datos de búsqueda (students, loading, error) y el callback onSelect al campo
 * antes del renderizado. En modo sugerencias añade la cabecera de bloque
 * «Estudiantes nuevos sin matrícula» y mensajes de vacío/error propios (Empty, sin Alerts).
 *
 * @param {Object} field - Configuración del campo (desde step1BuscarEstudiante.jsx)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.studentSearch - students, loading, error, isShowingSuggestions
 * @param {Function} context.onSelectStudent - Callback para manejar la selección de un estudiante
 * @returns {Object} Campo enriquecido o el campo original
 */
export const enrichStudentListField = (field, context = {}) => {
    const { studentSearch, onSelectStudent } = context;

    if (field.name === 'resultadosEstudiantes' && field.type === 'list' && studentSearch) {
        const isShowingSuggestions = studentSearch.isShowingSuggestions === true;

        // Estado de error: mensaje neutro en el Empty de la lista (sin Alert).
        let emptyMessage = field.emptyMessage || 'No se encontraron estudiantes. Realice una búsqueda para ver resultados.';
        if (studentSearch.error) {
            emptyMessage = 'No se pudieron cargar los resultados. Intente nuevamente.';
        } else if (isShowingSuggestions) {
            emptyMessage = 'No hay estudiantes nuevos sin matrícula. Busque por C.I., código o nombre.';
        }

        return {
            ...field,
            // Datos agregados por el enricher (consumidos por DataList)
            items: studentSearch.students || [],
            loading: studentSearch.loading || false,
            emptyMessage,
            // Cabecera de bloque solo para las sugerencias iniciales
            header:
                isShowingSuggestions && (studentSearch.students?.length ?? 0) > 0
                    ? 'Estudiantes nuevos sin matrícula'
                    : null,
            // OPTIMIZACIÓN: Usar directamente el callback memoizado del context
            onSelect: onSelectStudent || null,
            // Estudiante seleccionado para resaltar la fila activa en DataList
            selectedItem: studentSearch.selectedStudent || null,
            // renderItem ya está definido en step1BuscarEstudiante.jsx
        };
    }

    return field;
};

/**
 * Array de enrichers específicos para estudiantes
 * Se aplican en orden: búsqueda, lista de resultados
 *
 * @type {Array<Function>}
 */
export const studentEnrichers = [
    enrichStudentSearchField,
    enrichStudentListField,
];
