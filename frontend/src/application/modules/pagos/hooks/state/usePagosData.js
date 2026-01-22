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
 * - Carga inicial desde BD usando hooks de API
 * - Mantiene estado en memoria (actualización optimista)
 * - Proporciona métodos para CRUD en memoria (addPago, updatePago, removePago, deletePago)
 * - Permite sincronización con BD (refetch)
 * 
 * Usado por: PagosProvider (para exponer el estado global vía Context)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePagosApi } from '@application-pagos/hooks/api/usePagosApi';
import { useDeletePagoAporte } from '@application-pagos/hooks/api/useDeletePagoAporte';

export const usePagosData = () => {
    const { pagos: pagosFromApi, loading, error, refetch: refetchFromApi } = usePagosApi();
    const { deletePagoAporte: deletePagoAporteApi, loading: deleting } = useDeletePagoAporte();

    const [pagos, setPagos] = useState([]);

    useEffect(() => {
        if (pagosFromApi.length >= 0) {
            setPagos(pagosFromApi);
        }
    }, [pagosFromApi]);

    const addPago = useCallback((newPago) => {
        setPagos((prev) => {
            const exists = prev.some(pago => pago.id === newPago.id);
            if (exists) return prev;
            return [newPago, ...prev];
        });
    }, []);

    const updatePago = useCallback((updatedPago) => {
        setPagos((prev) =>
            prev.map(pago => (pago.id === updatedPago.id ? updatedPago : pago))
        );
    }, []);

    const removePago = useCallback((pagoId) => {
        setPagos((prev) => prev.filter(pago => pago.id !== pagoId));
    }, []);

    /**
     * Elimina un pago usando el Use Case y actualiza el estado en memoria.
     * Solo se pueden eliminar pagos no vinculados a inscripción (validado en backend).
     *
     * @param {string|number} pagoId - ID del pago a eliminar
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    const deletePago = useCallback(async (pagoId) => {
        const result = await deletePagoAporteApi(pagoId);
        if (result.success) {
            removePago(pagoId);
        }
        return result;
    }, [deletePagoAporteApi, removePago]);

    const refetch = useCallback(async (options = {}) => {
        await refetchFromApi(options);
    }, [refetchFromApi]);

    return useMemo(
        () => ({
            pagos,
            loading: loading || deleting,
            error,
            addPago,
            updatePago,
            removePago,
            deletePago,
            refetch,
        }),
        [pagos, loading, deleting, error, addPago, updatePago, removePago, deletePago, refetch]
    );
};
