/**
 * Provider: PagosListProvider
 *
 * Single Responsibility: Proporcionar estado de la lista de pagos (vista_pago_aporte_listado)
 *
 * - Usa usePagosApi: listado con paginación, búsqueda, filtros y orden en servidor
 * - Usa useDeletePagoAporte: eliminar y recargar lista al éxito
 * - searchText/setSearchText para el input; refetch({ params: { page, limit, search, ... } })
 */

import { useState, useCallback, useMemo } from 'react';
import { usePagosApi, useDeletePagoAporte } from '@application-pagos/hooks';
import { PagosListContext } from '@application-pagos/context/PagosListContext';

export const PagosListProvider = ({ children }) => {
    const { pagos, pagination, loading, error, refetch } = usePagosApi();
    const { deletePagoAporte, loading: deleting } = useDeletePagoAporte();

    const [searchText, setSearchText] = useState('');

    const deletePago = useCallback(
        async (pagoId) => {
            const result = await deletePagoAporte(pagoId);
            if (result.success) refetch();
            return result;
        },
        [deletePagoAporte, refetch]
    );

    const value = useMemo(
        () => ({
            pagos,
            pagination,
            loading: loading || deleting,
            error,
            refetch,
            deletePago,
            searchText,
            setSearchText,
        }),
        [pagos, pagination, loading, deleting, error, refetch, deletePago, searchText]
    );

    return <PagosListContext.Provider value={value}>{children}</PagosListContext.Provider>;
};
