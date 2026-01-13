/**
 * Hook: useInscripcionNuevaWizardSteps
 * 
 * Single Responsibility: Enriquecer wizardSteps con callbacks dinámicos y lógica de estado
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que maneja la lógica de enriquecimiento de wizardSteps
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja el enriquecimiento de wizardSteps con callbacks
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Este hook:
 * - Recibe wizardSteps base (configuración estática)
 * - Recibe callbacks y estados necesarios para enriquecer los campos
 * - Retorna wizardSteps enriquecidos con callbacks dinámicos
 * 
 * Ventajas:
 * - Separa la lógica de enriquecimiento del provider
 * - Facilita el testing
 * - Reutilizable si se necesita en otros lugares
 * 
 * Nota: Este hook es específico de la feature de inscripción nueva, no es estado global
 * Por eso está en features/, no en state/
 */

import { useMemo } from 'react';

/**
 * Enriquece un campo de búsqueda con el callback onSearch
 * 
 * @param {Object} field - Configuración del campo
 * @param {Function} onSearchStudent - Callback para ejecutar la búsqueda
 * @returns {Object} Campo enriquecido con onSearch o el campo original
 */
const enrichSearchField = (field, onSearchStudent) => {
    // Si es el campo de búsqueda de estudiante, agregar el callback
    if (field.name === 'buscarEstudiante' && field.type === 'search') {
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
 * Enriquece los campos de una sección con callbacks dinámicos
 * 
 * @param {Array} fields - Array de campos de la sección
 * @param {Object} callbacks - Callbacks disponibles para inyectar
 * @returns {Array} Campos enriquecidos
 */
const enrichSectionFields = (fields, callbacks) => {
    const { onSearchStudent } = callbacks;
    
    if (!fields || !Array.isArray(fields)) {
        return [];
    }
    
    return fields.map((field) => {
        // Enriquecer campo de búsqueda si existe el callback
        if (onSearchStudent) {
            return enrichSearchField(field, onSearchStudent);
        }
        return field;
    });
};

/**
 * Enriquece un step del wizard con callbacks dinámicos
 * 
 * @param {Object} step - Configuración del step
 * @param {number} stepIndex - Índice del step (0 = primer paso)
 * @param {Object} callbacks - Callbacks disponibles para inyectar
 * @returns {Object} Step enriquecido o el step original
 */
const enrichStep = (step, stepIndex, callbacks) => {
    // Solo enriquecer el step 1 (Buscar Estudiante) con el callback de búsqueda
    if (stepIndex === 0 && step.config?.buscarEstudiante?.fields) {
        const enrichedFields = enrichSectionFields(
            step.config.buscarEstudiante.fields,
            callbacks
        );
        
        return {
            ...step,
            config: {
                ...step.config,
                buscarEstudiante: {
                    ...step.config.buscarEstudiante,
                    fields: enrichedFields,
                },
            },
        };
    }
    
    return step;
};

/**
 * Hook para enriquecer wizardSteps con callbacks dinámicos
 * 
 * Los campos del wizard se definen estáticamente, pero los callbacks se inyectan aquí.
 * Esto permite mantener la configuración estática separada de la lógica dinámica.
 * 
 * @param {Array} wizardSteps - Configuración base de los pasos del wizard
 * @param {Object} callbacks - Callbacks para inyectar en los campos
 * @param {Function} callbacks.onSearchStudent - Callback para búsqueda de estudiantes
 * @returns {Array} WizardSteps enriquecidos con callbacks dinámicos
 */
export const useInscripcionNuevaWizardSteps = (wizardSteps, callbacks = {}) => {
    // Enriquecer wizardSteps con callbacks dinámicos
    const enrichedWizardSteps = useMemo(() => {
        if (!wizardSteps || !Array.isArray(wizardSteps)) {
            return [];
        }

        return wizardSteps.map((step, stepIndex) => 
            enrichStep(step, stepIndex, callbacks)
        );
    }, [wizardSteps, callbacks]);

    return enrichedWizardSteps;
};
