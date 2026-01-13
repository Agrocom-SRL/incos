/**
 * Hook: useEnrichWizardSteps
 * 
 * Single Responsibility: Enriquecer wizardSteps de forma genérica y extensible
 * 
 * Clean Architecture:
 * - Application Layer: Hook genérico que puede ser usado por cualquier módulo
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo orquesta el enriquecimiento, no define la lógica específica
 * - Open/Closed: Extensible mediante enrichers sin modificar el hook
 * - Dependency Inversion: Depende de funciones de enriquecimiento (abstracciones)
 * 
 * Este hook:
 * - Recibe wizardSteps base (configuración estática)
 * - Recibe un array de enrichers (funciones de enriquecimiento)
 * - Recibe un contexto con callbacks y datos disponibles
 * - Aplica todos los enrichers a cada campo
 * - Retorna wizardSteps enriquecidos
 * 
 * Ventajas:
 * - Extensible: Agregar nuevos enrichers sin modificar el hook
 * - Testeable: Cada enricher se puede testear independientemente
 * - Reutilizable: Los enrichers se pueden usar en otros contextos
 * - Mantenible: Lógica específica separada en archivos de enrichers
 * - Genérico: Puede ser usado por cualquier módulo que necesite enriquecer wizardSteps
 * 
 * Patrón: Strategy Pattern + Plugin Architecture
 * - Cada enricher es una estrategia de enriquecimiento
 * - El hook aplica todas las estrategias en orden
 * 
 * Ejemplo de uso:
 * ```javascript
 * const enrichers = [
 *   enrichStudentSearchField,
 *   enrichStudentListField,
 *   enrichParalelosField,
 * ];
 * 
 * const context = {
 *   onSearchStudent: studentSearch.searchStudent,
 *   studentSearch: studentSearch,
 *   paralelosData: paralelosData,
 * };
 * 
 * const enrichedSteps = useEnrichWizardSteps(
 *   wizardSteps,
 *   enrichers,
 *   context
 * );
 * ```
 */

import { useMemo } from 'react';

/**
 * Aplica todos los enrichers a un campo
 * 
 * @param {Object} field - Configuración del campo
 * @param {Array<Function>} enrichers - Array de funciones de enriquecimiento
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @returns {Object} Campo enriquecido después de aplicar todos los enrichers
 */
const applyEnrichers = (field, enrichers = [], context = {}) => {
    if (!enrichers || !Array.isArray(enrichers) || enrichers.length === 0) {
        return field;
    }
    
    // Aplicar cada enricher en orden
    // Cada enricher recibe el campo (ya enriquecido por los anteriores) y el contexto
    return enrichers.reduce((enrichedField, enricher) => {
        if (typeof enricher === 'function') {
            return enricher(enrichedField, context);
        }
        return enrichedField;
    }, field);
};

/**
 * Enriquece los campos de una sección aplicando todos los enrichers
 * 
 * @param {Array} fields - Array de campos de la sección
 * @param {Array<Function>} enrichers - Array de funciones de enriquecimiento
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @returns {Array} Campos enriquecidos
 */
const enrichSectionFields = (fields, enrichers = [], context = {}) => {
    if (!fields || !Array.isArray(fields)) {
        return [];
    }
    
    return fields.map((field) => applyEnrichers(field, enrichers, context));
};

/**
 * Enriquece un step del wizard aplicando todos los enrichers a sus campos
 * 
 * Esta función es genérica y puede enriquecer cualquier step basándose en su configuración.
 * Por defecto, busca campos en `step.config[sectionName].fields` para cada sección.
 * 
 * @param {Object} step - Configuración del step
 * @param {number} stepIndex - Índice del step (0 = primer paso)
 * @param {Array<Function>} enrichers - Array de funciones de enriquecimiento
 * @param {Object} context - Contexto con callbacks y datos disponibles
 * @param {Function} stepEnrichmentStrategy - Función opcional para definir cómo enriquecer el step
 * @returns {Object} Step enriquecido o el step original
 */
const enrichStep = (step, stepIndex, enrichers = [], context = {}, stepEnrichmentStrategy = null) => {
    // Si se proporciona una estrategia personalizada, usarla
    // Si retorna null, usar la estrategia por defecto
    if (stepEnrichmentStrategy && typeof stepEnrichmentStrategy === 'function') {
        const customResult = stepEnrichmentStrategy(step, stepIndex, enrichers, context);
        if (customResult !== null && customResult !== undefined) {
            return customResult;
        }
        // Si retorna null/undefined, continuar con estrategia por defecto
    }
    
    // Estrategia por defecto: enriquecer todas las secciones que tengan campos
    if (step.config && typeof step.config === 'object') {
        const enrichedConfig = {};
        let hasChanges = false;
        
        // Iterar sobre todas las secciones del step
        for (const [sectionName, sectionConfig] of Object.entries(step.config)) {
            if (sectionConfig && sectionConfig.fields && Array.isArray(sectionConfig.fields)) {
                const enrichedFields = enrichSectionFields(
                    sectionConfig.fields,
                    enrichers,
                    context
                );
                
                enrichedConfig[sectionName] = {
                    ...sectionConfig,
                    fields: enrichedFields,
                };
                
                hasChanges = true;
            } else {
                enrichedConfig[sectionName] = sectionConfig;
            }
        }
        
        if (hasChanges) {
            return {
                ...step,
                config: enrichedConfig,
            };
        }
    }
    
    return step;
};

/**
 * Hook para enriquecer wizardSteps de forma genérica y extensible
 * 
 * Los campos del wizard se definen estáticamente, pero los callbacks y datos se inyectan aquí
 * mediante funciones de enriquecimiento (enrichers).
 * 
 * Este hook es genérico y extensible:
 * - No conoce la lógica específica de enriquecimiento
 * - Aplica todas las funciones de enriquecimiento que recibe
 * - Cada módulo/feature puede definir sus propios enrichers
 * - Puede usar una estrategia personalizada para enriquecer steps específicos
 * 
 * @param {Array} wizardSteps - Configuración base de los pasos del wizard
 * @param {Array<Function>} enrichers - Array de funciones de enriquecimiento
 * @param {Object} context - Contexto con callbacks y datos disponibles para los enrichers
 * @param {Function} stepEnrichmentStrategy - Función opcional para definir cómo enriquecer cada step
 * @returns {Array} WizardSteps enriquecidos
 */
export const useEnrichWizardSteps = (wizardSteps, enrichers = [], context = {}, stepEnrichmentStrategy = null) => {
    // Enriquecer wizardSteps aplicando todos los enrichers
    const enrichedWizardSteps = useMemo(() => {
        if (!wizardSteps || !Array.isArray(wizardSteps)) {
            return [];
        }

        return wizardSteps.map((step, stepIndex) => 
            enrichStep(step, stepIndex, enrichers, context, stepEnrichmentStrategy)
        );
    }, [wizardSteps, enrichers, context, stepEnrichmentStrategy]);

    return enrichedWizardSteps;
};
