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
 * Enricher para el campo de lista/tarjetas de paralelos
 * Agrega los datos de paralelos (items, loading, error) y el callback onSelect al campo antes del renderizado
 * 
 * Flujo:
 * 1. Este enricher se ejecuta en useEnrichWizardSteps (antes del renderizado)
 * 2. Agrega items, loading, emptyMessage, onSelect al campo 'listaParalelos' (tipo 'list' o 'cards')
 * 3. El campo enriquecido se pasa a FormField → FieldRenderer → DataList o DataCards
 * 4. Cuando el usuario selecciona un paralelo, se ejecuta onSelectParalelo que guarda el ID
 * 5. Solo muestra paralelos si hay una carrera seleccionada
 * 
 * @param {Object} field - Configuración del campo (desde step2PeriodoYParalelos.jsx)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.paralelosData - Objeto con paralelos, loading, error (desde useInscripcionNuevaParalelos)
 * @param {Function} context.onSelectParalelo - Callback para manejar la selección de un paralelo
 * @param {Object} context.carrerasData - Objeto con selectedCarrera para verificar si hay carrera seleccionada
 * @returns {Object} Campo enriquecido con items, loading, emptyMessage, onSelect o el campo original
 */
export const enrichParaleloListField = (field, context = {}) => {
    const { paralelosData, onSelectParalelo, carrerasData, periodosData, carreraIdForParalelos } = context;

    if (field.name === 'listaParalelos' && (field.type === 'list' || field.type === 'cards') && paralelosData) {
        const hasCarrera = (carrerasData?.selectedCarrera?.id ?? carreraIdForParalelos) != null;
        const hasPeriodo = periodosData?.selectedPeriod?.id != null;
        const canShowParalelos = hasCarrera && hasPeriodo;
        
        // Enriquecer paralelos con el nombre de la carrera
        // El backend solo devuelve carreraId, necesitamos buscar el nombre en carrerasData.carreras
        const paralelosEnriquecidos = (paralelosData.paralelos || []).map(paralelo => {
            // Buscar la carrera correspondiente usando carreraId
            const carrera = carrerasData?.carreras?.find(c => c.id === paralelo.carreraId);
            
            return {
                ...paralelo,
                // Agregar el nombre de la carrera si se encuentra
                carreraNombre: carrera?.nombre || '',
            };
        });
        
        // Crear wrapper para el callback que recibe (item, index) de DataList
        // y lo convierte a solo el item para onSelectParalelo
        const handleSelect = canShowParalelos && onSelectParalelo
            ? (item, index) => {
                if (item && onSelectParalelo) {
                    onSelectParalelo(item);
                }
            }
            : null;

        let emptyMessage = 'Seleccione un periodo (paso anterior) y una carrera para ver los paralelos disponibles.';
        if (hasPeriodo && !hasCarrera) emptyMessage = 'Seleccione una carrera para ver los paralelos disponibles.';
        if (hasCarrera && hasPeriodo) emptyMessage = field.emptyMessage || 'No hay paralelos disponibles para esta carrera en el período seleccionado.';

        return {
            ...field,
            items: canShowParalelos ? paralelosEnriquecidos : [],
            loading: paralelosData.loading || false,
            emptyMessage,
            onSelect: handleSelect,
            selectedItem: paralelosData.selectedParalelo || null,
            hidden: !canShowParalelos,
            // renderItem ya está definido en step2PeriodoYParalelos.jsx
            // orientation ya está definido en step2PeriodoYParalelos.jsx
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
