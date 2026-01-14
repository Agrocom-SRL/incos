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
    // OPTIMIZACIÓN: Usar directamente el callback memoizado del context
    // No crear una nueva función wrapper para evitar re-renders
    if (field.name === 'buscarEstudiante' && field.type === 'search' && onSearchStudent) {
        return {
            ...field,
            // Usar directamente el callback memoizado (ya viene con la lógica de trim)
            onSearch: onSearchStudent,
        };
    }
    
    return field;
};

/**
 * Enricher para el campo de información de búsqueda
 * Oculta el campo infoBusqueda cuando hay estudiantes en la lista
 * Lo muestra cuando la lista está vacía o no hay resultados
 * 
 * Flujo:
 * 1. Este enricher se ejecuta en useEnrichWizardSteps (antes del renderizado)
 * 2. Verifica si hay estudiantes en la lista
 * 3. Si hay estudiantes, oculta el campo (hidden: true)
 * 4. Si no hay estudiantes, muestra el campo (hidden: false)
 * 
 * @param {Object} field - Configuración del campo (desde step1BuscarEstudiante.jsx)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.studentSearch - Objeto con students, loading, error (desde useInscripcionNuevaStudentSearch)
 * @returns {Object} Campo enriquecido con hidden o el campo original
 */
export const enrichStudentInfoField = (field, context = {}) => {
    const { studentSearch } = context;
    
    // Si es el campo de información de búsqueda
    if (field.name === 'infoBusqueda' && field.type === 'alert') {
        const hasStudents = studentSearch?.students && studentSearch.students.length > 0;
        const isLoading = studentSearch?.loading || false;
        
        // Ocultar si hay estudiantes o si está cargando (para evitar parpadeo)
        // Mostrar si no hay estudiantes y no está cargando
        return {
            ...field,
            hidden: hasStudents || isLoading,
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
            // OPTIMIZACIÓN: Usar directamente el callback memoizado del context
            // No crear una nueva función wrapper para evitar re-renders
            onSelect: onSelectStudent || null,
            // Estudiante seleccionado para aplicar estado activo en DataList
            selectedItem: studentSearch.selectedStudent || null,
            // renderItem ya está definido en step1BuscarEstudiante.jsx
        };
    }
    
    return field;
};

/**
 * Enricher para mostrar el estudiante seleccionado en el step 2
 * Enriquece el campo 'estudianteSeleccionado' con los datos del estudiante seleccionado
 * 
 * Flujo:
 * 1. Este enricher se ejecuta en useEnrichWizardSteps (antes del renderizado)
 * 2. Si hay un estudiante seleccionado, enriquece el campo con su información
 * 3. Si no hay estudiante seleccionado, oculta el campo (hidden: true)
 * 4. El campo se muestra arriba del select de carreras en el step 2
 * 
 * @param {Object} field - Configuración del campo (desde step2SeleccionarParalelos.js)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.studentSearch - Objeto con students, loading, error, selectedStudent
 * @returns {Object} Campo enriquecido con description y hidden o el campo original
 */
export const enrichStudentSelectedField = (field, context = {}) => {
    const { studentSearch } = context;
    const selectedStudent = studentSearch?.selectedStudent;
    
    // Si es el campo de estudiante seleccionado
    if (field.name === 'estudianteSeleccionado' && field.type === 'alert') {
        // Si hay un estudiante seleccionado, mostrar su información
        if (selectedStudent && selectedStudent.id) {
            const studentInfo = [];
            
            if (selectedStudent.nombreCompleto) {
                studentInfo.push(`Nombre: ${selectedStudent.nombreCompleto}`);
            }
            
            if (selectedStudent.codigoEstudiante) {
                studentInfo.push(`Código: ${selectedStudent.codigoEstudiante}`);
            }
            
            if (selectedStudent.ciCompleto) {
                studentInfo.push(`CI: ${selectedStudent.ciCompleto}`);
            }
            
            const description = studentInfo.length > 0 
                ? studentInfo.join(' | ')
                : 'Estudiante seleccionado';
            
            return {
                ...field,
                description,
                hidden: false, // Mostrar el campo
            };
        }
        
        // Si no hay estudiante seleccionado, ocultar el campo
        return {
            ...field,
            hidden: true, // Ocultar el campo
        };
    }
    
    return field;
};

/**
 * Array de enrichers específicos para estudiantes
 * Se aplican en orden: búsqueda, información, lista, estudiante seleccionado
 * 
 * @type {Array<Function>}
 */
export const studentEnrichers = [
    enrichStudentSearchField,
    enrichStudentInfoField,
    enrichStudentListField,
    enrichStudentSelectedField,
];
