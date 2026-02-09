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
 * @param {Object} field - Configuración del campo (desde step0BuscarEstudiante.jsx)
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
 * @param {Object} field - Configuración del campo (desde step0BuscarEstudiante.jsx)
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
            // renderItem ya está definido en step0BuscarEstudiante.jsx
        };
    }
    
    return field;
};

/**
 * Construye la descripción del estudiante para mostrar en alertas (step 0 y step 1)
 *
 * @param {Object} student - Estudiante con nombreCompleto, codigoEstudiante, ciCompleto
 * @returns {string} Texto para description del alert
 */
export const buildStudentSelectedDescription = (student) => {
    if (!student || !student.id) return 'Estudiante seleccionado';
    const parts = [];
    if (student.nombreCompleto) parts.push(`Nombre: ${student.nombreCompleto}`);
    if (student.codigoEstudiante) parts.push(`Código: ${student.codigoEstudiante}`);
    if (student.ciCompleto) parts.push(`CI: ${student.ciCompleto}`);
    return parts.length > 0 ? parts.join(' | ') : 'Estudiante seleccionado';
};

/**
 * Descripción enriquecida para step 0 (desde detalle): incluye tipo NUEVO/ANTIGUO y carrera si aplica
 *
 * @param {Object} student - Estudiante con nombreCompleto, ciCompleto, codigoEstudiante, tipoAdmision, carreraNombre
 * @returns {string} Texto para description del alert en step 0
 */
export const buildStep0StudentDescription = (student) => {
    const base = buildStudentSelectedDescription(student);
    if (!student?.tipoAdmision) return base;
    const tipoLabel = student.tipoAdmision === 'ANTIGUO' ? 'Estudiante antiguo' : 'Estudiante nuevo';
    const carreraPart = student.tipoAdmision === 'ANTIGUO' && student.carreraNombre
        ? ` | Carrera: ${student.carreraNombre}`
        : '';
    return `${base}\n\nTipo: ${tipoLabel}${carreraPart}`;
};

/**
 * Enricher para mostrar el estudiante seleccionado (step 1 Carrera, step 2 Periodo)
 * Enriquece el campo 'estudianteSeleccionado' con los datos del estudiante seleccionado
 *
 * @param {Object} field - Configuración del campo
 * @param {Object} context - Contexto con studentSearch.selectedStudent
 * @returns {Object} Campo enriquecido con description y hidden o el campo original
 */
export const enrichStudentSelectedField = (field, context = {}) => {
    const { studentSearch } = context;
    const selectedStudent = studentSearch?.selectedStudent;

    if (field.name === 'estudianteSeleccionado' && field.type === 'alert') {
        if (selectedStudent && selectedStudent.id) {
            return {
                ...field,
                description: buildStudentSelectedDescription(selectedStudent),
                hidden: false,
            };
        }
        return { ...field, hidden: true };
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
