/**
 * Hook: useAsignarBecaData
 * 
 * Single Responsibility: Gestionar el estado del contexto de asignar beca
 * 
 * Clean Architecture:
 * - Application Layer: Hook que gestiona el estado del contexto orquestando hooks de feature
 * - Similar a useInscripcionNuevaData pero específico para la feature "asignar beca"
 * 
 * Este hook:
 * - Orquesta todos los hooks de feature (pageData, formHandlers, becasDescuentosData)
 * - Crea callbacks memoizados para las acciones
 * - Compone el objeto de contexto
 * - Retorna el valor completo del contexto para el Provider
 * 
 * Ventajas:
 * - Separación de responsabilidades: Provider solo expone, hook gestiona estado
 * - Testeable: Se puede testear el hook independientemente
 * - Reutilizable: Se puede usar el hook sin el Provider si es necesario
 * - Mantenible: Toda la lógica está centralizada en un solo lugar
 * - Optimizado: Usa useMemo y useCallback para evitar re-renders innecesarios
 * 
 * Nota: Este hook GESTIONA el estado del contexto (para el Provider).
 * Para CONSUMIR el contexto, usa useAsignarBecaContext en context/.
 */

import { useMemo, useCallback } from 'react';
import { useAsignarBecaPageData } from '@application-matricula/becas/hooks/features/useAsignarBecaPageData';
import { useAsignarBecaFormHandlers } from '@application-matricula/becas/hooks/features/useAsignarBecaFormHandlers';
import { useAsignarBecaBecasDescuentos } from '@application-matricula/becas/hooks/features/useAsignarBecaBecasDescuentos';

/**
 * Hook que gestiona el estado del contexto de asignar beca
 * 
 * @param {string|number} studentId - ID del estudiante al que se le asignará la beca
 * @param {Object} options - Opciones adicionales
 * @param {string} options.studentName - Nombre del estudiante (opcional, para título dinámico)
 * @returns {Object} Objeto con todo el contexto de asignar beca
 */
export const useAsignarBecaData = (studentId, options = {}) => {
    const { studentName, editBecaAsignada } = options;
    const isEditMode = Boolean(editBecaAsignada?.id);

    // 1. Hooks de feature
    const pageData = useAsignarBecaPageData({ studentName, studentId, isEditMode });
    
    // Crear formHandlers primero (crea el form)
    // selectedBecaDescuento se actualizará dinámicamente cuando se seleccione una beca
    const formHandlers = useAsignarBecaFormHandlers(studentId, {
        selectedBecaDescuento: null, // Se actualizará dinámicamente en handleFinish
        editBecaAsignada,
    });
    
    // Obtener becasDescuentosData con el form (para que handleSelectBeca pueda actualizar el form)
    const becasDescuentosData = useAsignarBecaBecasDescuentos({
        form: formHandlers.form,
        initialBecaDescuentoId: editBecaAsignada?.scholarshipId,
    });
    
    // Crear un wrapper para handleFinish que use selectedBecaDescuento actualizado
    const { handleFinish } = formHandlers;
    const { selectedBecaDescuento } = becasDescuentosData;
    const handleFinishWrapper = useCallback(async (values) => {
        return handleFinish(values, selectedBecaDescuento);
    }, [handleFinish, selectedBecaDescuento]);

    // 2. Componer value final del contexto (useMemo mantiene la referencia mientras no cambien las dependencias)
    return useMemo(() => ({
        // ID del estudiante
        studentId,
        isEditMode,

        // Datos de página (incluye handleVolver)
        ...pageData,

        // Handlers de formulario (usar wrapper para handleFinish)
        form: formHandlers.form,
        handleFinish: handleFinishWrapper,
        getFormValues: formHandlers.getFormValues,
        loading: formHandlers.loading,
        error: formHandlers.error,
        validationErrors: formHandlers.validationErrors,
        asignarBecaResult: formHandlers.asignarBecaResult,

        // Becas y descuentos (incluye handleSelectBeca)
        becasDescuentosData: {
            becasDescuentos: becasDescuentosData.becasDescuentos,
            loading: becasDescuentosData.loading,
            error: becasDescuentosData.error,
            refetch: becasDescuentosData.refetch,
            selectedBecaDescuento: becasDescuentosData.selectedBecaDescuento,
            handleSelectBeca: becasDescuentosData.handleSelectBeca,
        },
    }), [
        studentId,
        isEditMode,
        pageData,
        formHandlers.form,
        formHandlers.getFormValues,
        formHandlers.loading,
        formHandlers.error,
        formHandlers.validationErrors,
        formHandlers.asignarBecaResult,
        handleFinishWrapper,
        becasDescuentosData.becasDescuentos,
        becasDescuentosData.loading,
        becasDescuentosData.error,
        becasDescuentosData.refetch,
        becasDescuentosData.selectedBecaDescuento,
        becasDescuentosData.handleSelectBeca,
    ]);
};
