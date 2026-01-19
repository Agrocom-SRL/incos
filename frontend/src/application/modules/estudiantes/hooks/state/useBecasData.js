/**
 * Hook: useBecasData
 * 
 * Single Responsibility: Gestionar el estado global de datos de becas en memoria
 * 
 * Clean Architecture:
 * - Application Layer: Maneja estado global para optimización de performance
 * - Proporciona datos y métodos para CRUD en memoria
 * 
 * Este hook:
 * - Carga inicial desde BD usando useBecasDescuentosApi
 * - Mantiene estado en memoria (actualización optimista)
 * - Proporciona métodos para CRUD en memoria (addBeca, updateBeca, removeBeca)
 * - Permite sincronización con BD (refetch)
 * 
 * Usado por: BecasProvider (para exponer el estado global vía Context)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBecasAsignadasApi } from '@application-estudiantes/hooks/api/useBecasAsignadasApi';

export const useBecasData = () => {
    // Hook para cargar datos iniciales desde BD (becas asignadas, no catálogo)
    const { becasAsignadas: becasDataFromApi, loading, error, refetch: refetchFromApi } = useBecasAsignadasApi();
    
    // Estado local en memoria (puede ser actualizado sin recargar desde BD)
    // becasDataFromApi tiene estructura: { becas: [...], total, page, limit, totalPages }
    const [becas, setBecas] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });

    // Sincronizar estado local con datos de API cuando cambien
    useEffect(() => {
        // Actualizar cuando hay datos de la API (carga inicial o refetch)
        // becasDataFromApi es un objeto con { becas: [...], total, page, limit, totalPages }
        if (becasDataFromApi) {
            if (Array.isArray(becasDataFromApi.becas)) {
                setBecas(becasDataFromApi.becas);
                setPagination({
                    total: becasDataFromApi.total || 0,
                    page: becasDataFromApi.page || 1,
                    limit: becasDataFromApi.limit || 50,
                    totalPages: becasDataFromApi.totalPages || 0,
                });
            } else if (Array.isArray(becasDataFromApi)) {
                // Por compatibilidad, si viene como array directo
                setBecas(becasDataFromApi);
            }
        }
    }, [becasDataFromApi]);

    /**
     * Agrega una nueva beca al estado en memoria
     * Útil cuando se crea una beca y queremos actualizar la lista sin recargar
     */
    const addBeca = useCallback((newBeca) => {
        setBecas((prev) => {
            // Evitar duplicados por ID
            const exists = prev.some(beca => beca.id === newBeca.id);
            if (exists) {
                return prev;
            }
            // Agregar al inicio de la lista (más reciente primero)
            return [newBeca, ...prev];
        });
    }, []);

    /**
     * Actualiza una beca existente en el estado en memoria
     * Útil cuando se edita una beca
     */
    const updateBeca = useCallback((updatedBeca) => {
        setBecas((prev) => 
            prev.map(beca => 
                beca.id === updatedBeca.id ? updatedBeca : beca
            )
        );
    }, []);

    /**
     * Elimina una beca del estado en memoria
     */
    const removeBeca = useCallback((becaId) => {
        setBecas((prev) => prev.filter(beca => beca.id !== becaId));
    }, []);

    /**
     * Sincroniza el estado local con la BD (recarga desde BD)
     * Útil cuando se necesita asegurar que los datos están actualizados
     */
    const refetch = useCallback(async (options = {}) => {
        await refetchFromApi(options);
    }, [refetchFromApi]);

    return useMemo(() => ({
        // Datos
        becas,
        pagination, // Información de paginación
        loading,
        error,
        
        // Métodos para CRUD en memoria
        addBeca,
        updateBeca,
        removeBeca,
        
        // Método para sincronizar con BD
        refetch,
    }), [becas, pagination, loading, error, addBeca, updateBeca, removeBeca, refetch]);
};
