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

/** Título de bloque según el modo de la lista (sugerencias iniciales o búsqueda). */
const buildListHeader = (isShowingSuggestions) =>
    isShowingSuggestions ? 'Estudiantes nuevos sin matrícula' : 'Resultados de la búsqueda';

/**
 * Contexto a la derecha de la cabecera: cuántos resultados hay y con qué criterio
 * están ordenados (los estudiantes nuevos en el sistema salen primero).
 */
const buildHeaderExtra = ({ total, disponibles, isShowingSuggestions }) => {
    if (total === 0) return null;
    if (isShowingSuggestions) {
        return { count: total, hint: 'Registro más reciente primero' };
    }
    const bloqueados = total - disponibles;
    const hint =
        bloqueados > 0
            ? `${disponibles} disponible${disponibles === 1 ? '' : 's'} · ${bloqueados} ya matriculado${bloqueados === 1 ? '' : 's'}`
            : 'Los estudiantes nuevos en el sistema aparecen primero';
    return { count: total, hint };
};

/**
 * Estados vacíos y de error del bloque de resultados (Empty explicado, sin Alerts).
 * Cada situación dice qué pasó y qué puede hacer el operador a continuación.
 */
const buildEmptyState = ({ hasError, isShowingSuggestions, searchTerm, fallbackMessage }) => {
    if (hasError) {
        return {
            emptyTitle: 'No se pudieron cargar los resultados',
            emptyMessage: 'Revise su conexión y vuelva a intentarlo.',
            status: 'error',
        };
    }
    if (isShowingSuggestions) {
        return {
            emptyTitle: 'No hay estudiantes nuevos sin matrícula',
            emptyMessage:
                'Todos los estudiantes registrados ya tienen al menos una matrícula. Busque por C.I., código o nombre para encontrar a cualquier estudiante.',
            status: 'default',
        };
    }
    return {
        emptyTitle: searchTerm ? `Sin resultados para «${searchTerm}»` : 'Sin resultados',
        emptyMessage:
            fallbackMessage ||
            'Revise la escritura o pruebe con la cédula de identidad o el código de estudiante.',
        status: 'default',
    };
};

/**
 * Anota cada fila con los datos de presentación que dependen del modo de la lista:
 * la pill «Nuevo en el sistema» solo aporta en una búsqueda (donde convive con
 * estudiantes con historial); en las sugerencias iniciales la cabecera ya lo dice.
 */
const decorarItems = ({ students, isShowingSuggestions }) =>
    students.map((student) =>
        isShowingSuggestions ? { ...student, destacarNuevo: false } : { ...student, destacarNuevo: student.esNuevoSistema === true },
    );

/**
 * Agrupa los resultados de una búsqueda separando a quienes pueden matricularse
 * de quienes ya tienen matrícula en la gestión vigente. Devuelve `null` cuando
 * no hace falta agrupar (todos del mismo tipo o modo sugerencias).
 */
const buildGroups = ({ students, isShowingSuggestions }) => {
    if (isShowingSuggestions) return null;
    const disponibles = students.filter((s) => !s.yaMatriculadoGestionActual);
    const matriculados = students.filter((s) => s.yaMatriculadoGestionActual);
    if (disponibles.length === 0 || matriculados.length === 0) return null;

    return [
        {
            key: 'disponibles',
            title: 'Disponibles para matricular',
            hint: 'Los estudiantes nuevos en el sistema aparecen primero',
            items: disponibles,
        },
        {
            key: 'ya-matriculados',
            title: 'Ya matriculados en esta gestión',
            hint: 'No pueden volver a matricularse',
            items: matriculados,
        },
    ];
};

/**
 * Enricher para el campo de lista de estudiantes
 * Agrega los datos de búsqueda (students, loading, error) y el callback onSelect al campo
 * antes del renderizado, junto con la cabecera de bloque, la agrupación por
 * disponibilidad y los estados de vacío/error propios (Empty, sin Alerts).
 *
 * @param {Object} field - Configuración del campo (desde step1BuscarEstudiante.jsx)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.studentSearch - students, loading, error, isShowingSuggestions, searchTerm, retry
 * @param {Function} context.onSelectStudent - Callback para manejar la selección de un estudiante
 * @returns {Object} Campo enriquecido o el campo original
 */
export const enrichStudentListField = (field, context = {}) => {
    const { studentSearch, onSelectStudent } = context;

    if (field.name === 'resultadosEstudiantes' && field.type === 'list' && studentSearch) {
        const isShowingSuggestions = studentSearch.isShowingSuggestions === true;
        const students = decorarItems({
            students: studentSearch.students || [],
            isShowingSuggestions,
        });
        const total = students.length;
        const disponibles = students.filter((s) => !s.yaMatriculadoGestionActual).length;

        const emptyState = buildEmptyState({
            hasError: !!studentSearch.error,
            isShowingSuggestions,
            searchTerm: studentSearch.searchTerm || '',
            fallbackMessage: field.emptyMessage,
        });

        return {
            ...field,
            // Datos agregados por el enricher (consumidos por DataList)
            items: students,
            groups: buildGroups({ students, isShowingSuggestions }),
            loading: studentSearch.loading || false,
            loadingText: 'Buscando estudiantes…',
            // Cabecera de bloque: título del modo + contador y criterio de orden
            header: total > 0 ? buildListHeader(isShowingSuggestions) : null,
            headerExtra: buildHeaderExtra({ total, disponibles, isShowingSuggestions }),
            // Estado vacío/error explicado (título + qué hacer) y acción de reintento
            ...emptyState,
            onRetry: studentSearch.error ? studentSearch.retry || null : null,
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
