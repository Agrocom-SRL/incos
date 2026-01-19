/**
 * Hook: usePagosData
 * 
 * Single Responsibility: Gestionar el estado global de datos de pagos en memoria
 * 
 * Clean Architecture:
 * - Application Layer: Maneja estado global para optimización de performance
 * - Proporciona datos y métodos para CRUD en memoria
 * 
 * Este hook:
 * - Carga inicial desde BD usando hooks de API (se implementará en pasos siguientes)
 * - Mantiene estado en memoria (actualización optimista)
 * - Proporciona métodos para CRUD en memoria (addPago, updatePago, removePago)
 * - Permite sincronización con BD (refetch)
 * 
 * Usado por: PagosProvider (para exponer el estado global vía Context)
 * 
 * Nota: Esta es una versión base que se irá completando por pasos
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePagosApi } from '@application-pagos/hooks/api/usePagosApi';

export const usePagosData = () => {
    // Hook para cargar datos iniciales desde BD
    const { pagos: pagosFromApi, loading, error, refetch: refetchFromApi } = usePagosApi();

    // Estado local en memoria (puede ser actualizado sin recargar desde BD)
    const [pagos, setPagos] = useState([]);

    // Sincronizar estado local con datos de API cuando cambien
    useEffect(() => {
        // Actualizar cuando hay datos de la API (carga inicial o refetch)
        if (pagosFromApi.length >= 0) {
            setPagos(pagosFromApi);
        }
    }, [pagosFromApi]);

    /**
     * Agrega un nuevo pago al estado en memoria
     * Útil cuando se crea un pago y queremos actualizar la lista sin recargar
     */
    const addPago = useCallback((newPago) => {
        setPagos((prev) => {
            // Evitar duplicados por ID
            const exists = prev.some(pago => pago.id === newPago.id);
            if (exists) {
                return prev;
            }
            // Agregar al inicio de la lista (más reciente primero)
            return [newPago, ...prev];
        });
    }, []);

    /**
     * Actualiza un pago existente en el estado en memoria
     * Útil cuando se edita un pago
     */
    const updatePago = useCallback((updatedPago) => {
        setPagos((prev) =>
            prev.map(pago =>
                pago.id === updatedPago.id ? updatedPago : pago
            )
        );
    }, []);

    /**
     * Elimina un pago del estado en memoria
     */
    const removePago = useCallback((pagoId) => {
        setPagos((prev) => prev.filter(pago => pago.id !== pagoId));
    }, []);

    /**
     * Sincroniza el estado local con la BD (recarga desde BD)
     * Útil cuando se necesita asegurar que los datos están actualizados
     */
    const refetch = useCallback(async (options = {}) => {
        await refetchFromApi(options);
    }, [refetchFromApi]);

    // Memoizar el objeto retornado para mantener referencia estable
    // Esto evita que PagosProvider cause re-renders innecesarios en sus hijos
    return useMemo(() => ({
        // Datos
        pagos,
        loading,
        error,

        // Métodos para CRUD en memoria
        addPago,
        updatePago,
        removePago,

        // Método para sincronizar con BD
        refetch,
    }), [pagos, loading, error, addPago, updatePago, removePago, refetch]);
};
