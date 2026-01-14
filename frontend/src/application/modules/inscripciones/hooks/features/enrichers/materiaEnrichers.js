/**
 * Materia Enrichers: Funciones específicas para enriquecer campos relacionados con materias
 * 
 * Single Responsibility: Definir cómo se enriquecen los campos de materias en el wizard
 * 
 * Clean Architecture:
 * - Application Layer: Lógica de enriquecimiento específica de materias
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
 * Enricher para el campo de lista de actividades de materias
 * Agrega los datos de materias transformados al formato de ActivityList al campo antes del renderizado
 * 
 * Flujo:
 * 1. Este enricher se ejecuta en useEnrichWizardSteps (antes del renderizado)
 * 2. Transforma las materias al formato que espera ActivityList (name, action, avatarColor, avatarText)
 * 3. Agrega activities, loading, emptyMessage al campo 'listaMaterias' (tipo 'activity')
 * 4. El campo enriquecido se pasa a FormField → FieldRenderer → ActivityList
 * 5. Las materias se muestran solo como información visual (NO son clickeables)
 * 6. Las materias se cargan automáticamente cuando hay paralelos disponibles (usando periodoId del primer paralelo)
 * 7. Solo muestra materias si hay una carrera seleccionada Y hay paralelos disponibles
 * 
 * @param {Object} field - Configuración del campo (desde step2SeleccionarParalelos.jsx)
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Object} context.materiasData - Objeto con materias, loading, error (desde useInscripcionNuevaMaterias)
 * @param {Object} context.paralelosData - Objeto con paralelos para verificar si hay paralelos disponibles
 * @param {Object} context.carrerasData - Objeto con selectedCarrera para verificar si hay carrera seleccionada
 * @returns {Object} Campo enriquecido con activities, loading, emptyMessage o el campo original
 */
export const enrichMateriaListField = (field, context = {}) => {
    const { materiasData, paralelosData, carrerasData } = context;
    
    // Si es el campo de lista de actividades de materias, agregar los datos
    // El campo debe tener name='listaMaterias' y type='activity'
    if (field.name === 'listaMaterias' && field.type === 'activity' && materiasData) {
        // Mostrar materias si hay una carrera seleccionada Y hay paralelos disponibles
        // Las materias son las mismas para todos los paralelos del periodo 1,
        // así que se muestran cuando hay paralelos cargados (no es necesario seleccionar uno)
        const hasCarrera = carrerasData?.selectedCarrera?.id;
        const hasParalelos = paralelosData?.paralelos && paralelosData.paralelos.length > 0;
        const canShowMaterias = hasCarrera && hasParalelos;
        
        // Transformar materias al formato que espera ActivityList
        // Formato esperado: { id, name, action, timeAgo, avatarColor, avatarText }
        // Las materias NO son clickeables, solo se muestran como información
        const activities = canShowMaterias 
            ? (materiasData.materias || []).map((materia, index) => ({
                id: materia.id,
                name: materia.nombre || materia.codigo || 'Sin nombre',
                action: materia.sigla ? `Sigla: ${materia.sigla}` : materia.codigo ? `Código: ${materia.codigo}` : null,
                timeAgo: null, // No hay tiempo en materias, se puede agregar si es necesario
                avatarColor: null, // Se puede agregar colores personalizados si es necesario
                avatarText: materia.nombre?.[0]?.toUpperCase() || materia.codigo?.[0]?.toUpperCase() || 'M',
            }))
            : [];
        
        return {
            ...field,
            // Datos agregados por el enricher (consumidos por ActivityList)
            activities: activities, // Array de actividades transformadas
            loading: materiasData.loading || false, // Estado de carga
            emptyMessage: !hasCarrera
                ? 'Seleccione una carrera para ver las materias disponibles.'
                : !hasParalelos
                ? 'No hay paralelos disponibles para esta carrera en el período actual.'
                : (field.emptyMessage || 'No hay materias disponibles para este período.'),
            // NO se pasa onItemClick porque las materias NO son clickeables
            // Ocultar si no hay carrera o paralelo seleccionado
            hidden: !canShowMaterias,
            // Colores de acento para avatares (opcional, se puede personalizar)
            accentColors: field.accentColors || [],
        };
    }
    
    return field;
};

/**
 * Array de enrichers específicos para materias
 * 
 * @type {Array<Function>}
 */
export const materiaEnrichers = [
    enrichMateriaListField,
];
