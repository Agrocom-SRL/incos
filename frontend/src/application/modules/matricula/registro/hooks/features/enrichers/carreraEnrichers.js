/**
 * Carrera Enrichers: Funciones específicas para enriquecer campos relacionados con carreras
 * 
 * Single Responsibility: Definir cómo se enriquecen los campos de carreras en el wizard
 * 
 * Clean Architecture:
 * - Application Layer: Lógica de enriquecimiento específica de carreras
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
 * Enricher para el campo de selección de carrera
 * Agrega las opciones de carreras y el callback onSelect al campo select
 * 
 * @param {Object} field - Configuración del campo
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.carrerasData - Objeto con carreras, loading, error (desde useInscripcionNuevaCarreras)
 * @param {Function} context.onSelectCarrera - Callback para manejar la selección de una carrera
 * @returns {Object} Campo enriquecido con options y onChange o el campo original
 */
export const enrichCarreraSelectField = (field, context = {}) => {
    const { carrerasData, onSelectCarrera } = context;
    
    // Si es el campo de selección de carrera, agregar las opciones y el callback
    if (field.name === 'carrera' && field.type === 'select' && carrerasData) {
        // Transformar carreras a opciones para el select
        const options = (carrerasData.carreras || []).map(carrera => ({
            value: carrera.id,
            label: carrera.nombre || carrera.codigo || `Carrera ${carrera.id}`,
        }));

        return {
            ...field,
            options: options,
            loading: carrerasData.loading || false,
            // OPTIMIZACIÓN: Usar directamente el callback memoizado del context
            // El callback ya viene con la lógica de buscar la carrera por ID
            // No crear una nueva función wrapper para evitar re-renders
            onChange: onSelectCarrera || undefined,
        };
    }
    
    return field;
};

/**
 * Array de enrichers específicos para carreras
 * 
 * @type {Array<Function>}
 */
export const carreraEnrichers = [
    enrichCarreraSelectField,
];
