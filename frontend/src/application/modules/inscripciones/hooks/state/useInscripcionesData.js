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

import { useState, useCallback } from 'react';
// TODO: Importar hook de API cuando se implemente
// import { useInscripcionesApi } from '@application-inscripciones/hooks/api/useInscripcionesApi';

export const useInscripcionesData = () => {
    // TODO: Hook para cargar datos iniciales desde BD
    // const { inscripciones: inscripcionesFromApi, loading, error, refetch: refetchFromApi } = useInscripcionesApi();

    // Estado local en memoria (puede ser actualizado sin recargar desde BD)
    const [inscripciones, setInscripciones] = useState([]);
    const [loading] = useState(false); // TODO: Usar loading del API
    const [error] = useState(null); // TODO: Usar error del API

    // TODO: Sincronizar estado local con datos de API cuando cambien
    // useEffect(() => {
    //     if (inscripcionesFromApi.length >= 0) {
    //         setInscripciones(inscripcionesFromApi);
    //     }
    // }, [inscripcionesFromApi]);

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
     */
    const removeInscripcion = useCallback((inscripcionId) => {
        setInscripciones((prev) => prev.filter(ins => ins.id !== inscripcionId));
    }, []);

    /**
     * Sincroniza el estado local con la BD (recarga desde BD)
     * Útil cuando se necesita asegurar que los datos están actualizados
     */
    const refetch = useCallback(async (options = {}) => {
        // TODO: Implementar refetch cuando se tenga el hook de API
        // await refetchFromApi(options);
    }, []);

    return {
        // Datos
        inscripciones,
        loading,
        error,

        // Métodos para CRUD en memoria
        addInscripcion,
        updateInscripcion,
        removeInscripcion,

        // Método para sincronizar con BD
        refetch,
    };
};
