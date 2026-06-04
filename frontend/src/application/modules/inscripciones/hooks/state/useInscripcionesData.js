/**
 * Hook: useInscripcionesData
 * 
 * Single Responsibility: Gestionar el estado global de datos de inscripciones en memoria
 * 
 * Clean Architecture:
 * - Application Layer: Maneja estado global para optimización de performance
 * - Proporciona datos y métodos para CRUD en memoria
 * 
 * Este hook:
 * - Carga inicial desde BD usando hooks de API (se implementará en pasos siguientes)
 * - Mantiene estado en memoria (actualización optimista)
 * - Proporciona métodos para CRUD en memoria (addInscripcion, updateInscripcion, removeInscripcion)
 * - Permite sincronización con BD (refetch)
 * 
 * Usado por: InscripcionesProvider (para exponer el estado global vía Context)
 * 
 * Nota: Esta es una versión base que se irá completando por pasos
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInscripcionesApi, inscripcionesListFetchParams } from '@application-inscripciones/hooks/api/useInscripcionesApi';
import { useDeleteInscripcion } from '@application-inscripciones/hooks/api/useDeleteInscripcion';

export const useInscripcionesData = () => {
    // Hook para cargar datos iniciales desde BD
    const { inscripciones: inscripcionesFromApi, loading, error, refetch: refetchFromApi } = useInscripcionesApi();

    // Hook para eliminar inscripciones (usa Use Case del Domain Layer)
    const { deleteInscripcion: deleteInscripcionApi, loading: deleting } = useDeleteInscripcion();

    // Estado local en memoria (puede ser actualizado sin recargar desde BD)
    const [inscripciones, setInscripciones] = useState([]);

    // Sincronizar estado local con datos de API cuando cambien
    useEffect(() => {
        setInscripciones((prev) => {
            if (prev === inscripcionesFromApi) return prev;
            if (
                prev.length === inscripcionesFromApi.length &&
                prev.every((row, i) => row?.id === inscripcionesFromApi[i]?.id)
            ) {
                return prev;
            }
            return inscripcionesFromApi;
        });
    }, [inscripcionesFromApi]);

    /**
     * Agrega una nueva inscripción al estado en memoria
     * Útil cuando se crea una inscripción y queremos actualizar la lista sin recargar
     */
    const addInscripcion = useCallback((newInscripcion) => {
        setInscripciones((prev) => {
            // Evitar duplicados por ID
            const exists = prev.some(ins => ins.id === newInscripcion.id);
            if (exists) {
                return prev;
            }
            // Agregar al inicio de la lista (más reciente primero)
            return [newInscripcion, ...prev];
        });
    }, []);

    /**
     * Actualiza una inscripción existente en el estado en memoria
     * Útil cuando se edita una inscripción
     */
    const updateInscripcion = useCallback((updatedInscripcion) => {
        setInscripciones((prev) =>
            prev.map(ins =>
                ins.id === updatedInscripcion.id ? updatedInscripcion : ins
            )
        );
    }, []);

    /**
     * Elimina una inscripción del estado en memoria
     * Solo actualiza el estado local, no hace llamada a la API
     */
    const removeInscripcion = useCallback((inscripcionId) => {
        setInscripciones((prev) => prev.filter(ins => ins.id !== inscripcionId));
    }, []);

    /**
     * Elimina una inscripción usando el hook de API (que usa el Use Case) y actualiza el estado en memoria
     * 
     * @param {string|number} inscripcionId - ID de la inscripción a eliminar
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const deleteInscripcion = useCallback(async (inscripcionId) => {
        // Llamar al hook de API que usa el Use Case del Domain Layer
        const result = await deleteInscripcionApi(inscripcionId);
        
        // Si la eliminación fue exitosa, actualizar el estado en memoria
        if (result.success) {
            removeInscripcion(inscripcionId);
        }
        
        return result;
    }, [deleteInscripcionApi, removeInscripcion]);

    /**
     * Sincroniza el estado local con la BD (recarga desde BD)
     * Útil cuando se necesita asegurar que los datos están actualizados
     */
    const refetch = useCallback(async (options = {}) => {
        const hasArgs = options && Object.keys(options).length > 0;
        await refetchFromApi(hasArgs ? options : inscripcionesListFetchParams());
    }, [refetchFromApi]);

    // Memoizar el objeto retornado para mantener referencia estable
    // Esto evita que InscripcionesProvider cause re-renders innecesarios en sus hijos
    return useMemo(() => ({
        // Datos
        inscripciones,
        loading: loading || deleting, // Combinar loading de carga y eliminación
        error,

        // Métodos para CRUD en memoria
        addInscripcion,
        updateInscripcion,
        removeInscripcion,
        deleteInscripcion, // Método que usa el hook de API (Use Case) y actualiza el estado

        // Método para sincronizar con BD
        refetch,
    }), [inscripciones, loading, deleting, error, addInscripcion, updateInscripcion, removeInscripcion, deleteInscripcion, refetch]);
};
