/**
 * Paralelo Enrichers: Funciones específicas para enriquecer campos relacionados con paralelos
 * 
 * Single Responsibility: Definir cómo se enriquecen los campos de paralelos en el wizard
 * 
 * Clean Architecture:
 * - Application Layer: Lógica de enriquecimiento específica de paralelos
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
 * Enricher para el campo de lista de paralelos
 * Agrega los datos de paralelos (items, loading, error) y el callback onSelect al campo antes del renderizado
 * 
 * Flujo:
 * 1. Este enricher se ejecuta en useEnrichWizardSteps (antes del renderizado)
 * 2. Agrega items, loading, emptyMessage, onSelect al campo 'listaParalelos' (tipo 'list')
 * 3. El campo enriquecido se pasa a FormField → FieldRenderer → DataList
 * 4. Cuando el usuario selecciona un paralelo, se ejecuta onSelectParalelo que guarda el ID
 * 5. Solo muestra paralelos si hay una carrera seleccionada
 * 
 * @param {Object} field - Configuración del campo (desde step2SeleccionarParalelos.jsx)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.paralelosData - Objeto con paralelos, loading, error (desde useInscripcionNuevaParalelos)
 * @param {Function} context.onSelectParalelo - Callback para manejar la selección de un paralelo
 * @param {Object} context.carrerasData - Objeto con selectedCarrera para verificar si hay carrera seleccionada
 * @returns {Object} Campo enriquecido con items, loading, emptyMessage, onSelect o el campo original
 */
export const enrichParaleloListField = (field, context = {}) => {
    const { paralelosData, onSelectParalelo, carrerasData } = context;
    
    // Si es el campo de lista de paralelos, agregar los datos
    // El campo debe tener name='listaParalelos' y type='list'
    if (field.name === 'listaParalelos' && field.type === 'list' && paralelosData) {
        // Solo mostrar paralelos si hay una carrera seleccionada
        const hasCarrera = carrerasData?.selectedCarrera?.id;
        
        return {
            ...field,
            // Datos agregados por el enricher (consumidos por DataList)
            items: hasCarrera ? (paralelosData.paralelos || []) : [], // Array de paralelos encontrados
            loading: paralelosData.loading || false, // Estado de carga
            emptyMessage: hasCarrera 
                ? (field.emptyMessage || 'No hay paralelos disponibles para esta carrera en el período actual.')
                : 'Seleccione una carrera para ver los paralelos disponibles.',
            // OPTIMIZACIÓN: Usar directamente el callback memoizado del context
            // No crear una nueva función wrapper para evitar re-renders
            onSelect: hasCarrera ? (onSelectParalelo || null) : null,
            // Paralelo seleccionado para aplicar estado activo en DataList
            selectedItem: paralelosData.selectedParalelo || null,
            // Ocultar si no hay carrera seleccionada
            hidden: !hasCarrera,
            // renderItem ya está definido en step2SeleccionarParalelos.jsx
        };
    }
    
    return field;
};

/**
 * Array de enrichers específicos para paralelos
 * 
 * @type {Array<Function>}
 */
export const paraleloEnrichers = [
    enrichParaleloListField,
];
